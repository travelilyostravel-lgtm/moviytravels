-- 27.11.2026 — Telegram notifications for partners (guides, drivers, hotels).
-- After registration the partner taps «📲 Telegram» → our bot opens with a personal code → the bot links the chat.
-- The site then writes to the partner's phone even when they never open the site:
--   fix deadline given · every morning «N days left» · last day · card hidden · card back.
-- Pieces: tg_settings (bot name + fingerprint of the server key) · partners.tg_* · partner_tg_outbox (messages waiting)
-- /api/tg-bot (Telegram webhook + sender) uses TELEGRAM_BOT_TOKEN and TG_DB_KEY from Vercel; the database never stores either.

create extension if not exists pgcrypto;

create table if not exists public.tg_settings (
  id int primary key default 1 check (id = 1),
  bot_username text,
  key_hash text,
  updated_at timestamptz not null default now()
);
insert into public.tg_settings (id) values (1) on conflict do nothing;
alter table public.tg_settings enable row level security;
drop policy if exists tg_settings_admin on public.tg_settings;
create policy tg_settings_admin on public.tg_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, update on public.tg_settings to authenticated;

alter table public.partners add column if not exists tg_chat_id bigint;
alter table public.partners add column if not exists tg_code text;
alter table public.partners add column if not exists tg_linked_at timestamptz;
create unique index if not exists partners_tg_code on public.partners (tg_code) where tg_code is not null;

create table if not exists public.partner_tg_outbox (
  id          bigserial primary key,
  partner_id  uuid references public.partners(id) on delete cascade,
  chat_id     bigint,
  body        text not null,
  button      text,
  status      text not null default 'pending' check (status in ('pending','sending','sent','error','skipped')),
  tries       int not null default 0,
  error       text,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);
create index if not exists partner_tg_outbox_pending on public.partner_tg_outbox (status, id);
alter table public.partner_tg_outbox enable row level security;
drop policy if exists partner_tg_outbox_admin on public.partner_tg_outbox;
create policy partner_tg_outbox_admin on public.partner_tg_outbox for select to authenticated using (public.is_admin());
grant select on public.partner_tg_outbox to authenticated;

create or replace function public.tg_key_ok(p_key text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select coalesce((select key_hash from public.tg_settings where id = 1) = encode(digest(coalesce(p_key, ''), 'sha256'), 'hex'), false);
$$;
revoke all on function public.tg_key_ok(text) from public, anon, authenticated;

-- partner cabinet: bot name, my personal start code, linked or not
create or replace function public.partner_tg_info() returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare p record; c text; b text;
begin
  select id, tg_code, tg_chat_id, tg_linked_at into p from public.partners where user_id = auth.uid();
  if p.id is null then return null; end if;
  c := p.tg_code;
  if c is null then
    c := 'p' || encode(gen_random_bytes(9), 'hex');
    update public.partners set tg_code = c where id = p.id;
  end if;
  select bot_username into b from public.tg_settings where id = 1;
  return jsonb_build_object('bot', b, 'code', c, 'linked', p.tg_chat_id is not null, 'linked_at', p.tg_linked_at);
end $$;
revoke all on function public.partner_tg_info() from public, anon;
grant execute on function public.partner_tg_info() to authenticated;

-- text of the «what is missing» list (Uzbek + Russian in one message)
create or replace function public.partner_fix_text(m text[], lang text) returns text
language sql immutable as $$
  select string_agg('• ' || case
      when x like 'pub:%' then (case when lang = 'ru' then 'Фото для карточки: ' else 'Kartochka rasmlari: ' end) || split_part(substr(x, 5), '/', 1) || ' / ' || (case when lang = 'ru' then 'минимум ' else 'kamida ' end) || split_part(x, '/', 2)
      when x like 'trip:%' then (case when lang = 'ru' then 'Фото с туристами: ' else 'Sayyohlar bilan rasmlar: ' end) || split_part(substr(x, 6), '/', 1) || ' / ' || (case when lang = 'ru' then 'минимум ' else 'kamida ' end) || split_part(x, '/', 2)
      when lang = 'ru' then case x when 'photo' then 'Главное фото' when 'license_no' then 'Номер удостоверения / диплома' when 'license_doc' then 'Фото удостоверения / диплома'
        when 'languages' then 'Языки' when 'cities' then 'Города работы' when 'birth_year' then 'Год рождения' when 'telegram' then 'Telegram' when 'home' then 'Место проживания и адрес' else x end
      else case x when 'photo' then 'Asosiy rasm' when 'license_no' then 'Guvohnoma / diplom raqami' when 'license_doc' then 'Guvohnoma / diplom rasmi'
        when 'languages' then 'Tillar' when 'cities' then 'Gidlik qiladigan shaharlar' when 'birth_year' then 'Tug''ilgan yil' when 'telegram' then 'Telegram' when 'home' then 'Yashash joyi va manzil' else x end
    end, E'\n')
  from unnest(m) x;
$$;

-- put a message in the queue for a partner (skipped silently if Telegram is not linked)
create or replace function public.partner_tg_notify(pid uuid, kind text, days_left int default null) returns void
language plpgsql security definer set search_path = public as $$
declare p record; m text[]; uz text; ru text; dl text;
begin
  select id, name, tg_chat_id, fix_deadline into p from public.partners where id = pid;
  if p.id is null or p.tg_chat_id is null then return; end if;
  m := public.partner_missing(pid);
  dl := to_char(p.fix_deadline at time zone 'Asia/Tashkent', 'DD.MM.YYYY');
  if kind = 'given' then
    uz := '✅ Kartochkangiz Moviy Nomad saytiga chiqarildi!' || E'\n\n' || '⚠ ' || dl || ' soat 23:59 gacha quyidagilarni to''ldiring, aks holda kartochka saytdan avtomatik olib tashlanadi:' || E'\n' || public.partner_fix_text(m, 'uz');
    ru := '✅ Ваша карточка опубликована на сайте Moviy Nomad!' || E'\n\n' || '⚠ До ' || dl || ' 23:59 заполните следующее, иначе карточка будет автоматически снята с сайта:' || E'\n' || public.partner_fix_text(m, 'ru');
  elsif kind = 'left' then
    if days_left <= 0 then
      uz := '⏰ Kartochkangiz BUGUN soat 23:59 da saytdan o''chadi!' || E'\n' || 'Hali to''ldirilmagan:' || E'\n' || public.partner_fix_text(m, 'uz');
      ru := '⏰ Ваша карточка будет снята с сайта СЕГОДНЯ в 23:59!' || E'\n' || 'Ещё не заполнено:' || E'\n' || public.partner_fix_text(m, 'ru');
    else
      uz := '⚠ Kartochkangiz ' || days_left || ' kundan keyin (' || dl || ' 23:59) saytdan o''chadi.' || E'\n' || 'Hali to''ldirilmagan:' || E'\n' || public.partner_fix_text(m, 'uz');
      ru := '⚠ Ваша карточка будет снята с сайта через ' || days_left || ' дн. (' || dl || ' 23:59).' || E'\n' || 'Ещё не заполнено:' || E'\n' || public.partner_fix_text(m, 'ru');
    end if;
  elsif kind = 'hidden' then
    uz := '🚫 Kartochkangiz saytdan olib tashlandi — kamchiliklar o''z vaqtida tuzatilmadi.' || E'\n' || 'To''ldiring — kartochka 100% bo''lishi bilan sayt uni o''zi qaytaradi:' || E'\n' || public.partner_fix_text(m, 'uz');
    ru := '🚫 Ваша карточка снята с сайта — недочёты не исправлены вовремя.' || E'\n' || 'Заполните — как только карточка будет на 100%, сайт вернёт её сам:' || E'\n' || public.partner_fix_text(m, 'ru');
  elsif kind = 'ok' then
    uz := '🎉 Rahmat! Kartochkangiz 100% to''ldirildi va saytda qoladi.';
    ru := '🎉 Спасибо! Карточка заполнена на 100% и остаётся на сайте.';
  elsif kind = 'back' then
    uz := '🎉 Kartochkangiz 100% to''ldirildi va saytga qaytarildi!';
    ru := '🎉 Карточка заполнена на 100% и снова на сайте!';
  else return; end if;
  insert into public.partner_tg_outbox (partner_id, chat_id, body, button)
  values (pid, p.tg_chat_id, uz || E'\n\n— — —\n\n' || ru, 'https://moviy-travel.uz/partner/');
end $$;
revoke all on function public.partner_tg_notify(uuid, text, int) from public, anon, authenticated;

-- bot webhook: /start <code> links the chat to the partner
create or replace function public.tg_link(p_key text, p_code text, p_chat bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pid uuid; nm text;
begin
  if not public.tg_key_ok(p_key) then raise exception 'bad key'; end if;
  select id, name into pid, nm from public.partners where tg_code = p_code;
  if pid is null then return jsonb_build_object('ok', false); end if;
  update public.partners set tg_chat_id = null where tg_chat_id = p_chat and id <> pid;
  update public.partners set tg_chat_id = p_chat, tg_linked_at = now() where id = pid;
  -- if a deadline is running, tell them right away what to fix
  if exists (select 1 from public.partners where id = pid and (fix_deadline is not null or auto_paused)) then
    perform public.partner_tg_notify(pid, case when (select auto_paused from public.partners where id = pid) then 'hidden' else 'given' end);
  end if;
  return jsonb_build_object('ok', true, 'name', nm);
end $$;
revoke all on function public.tg_link(text, text, bigint) from public;
grant execute on function public.tg_link(text, text, bigint) to anon;

-- sender: take a few waiting messages / report the result
create or replace function public.tg_outbox_take(p_key text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.tg_key_ok(p_key) then raise exception 'bad key'; end if;
  update public.partner_tg_outbox set status = 'pending' where status = 'sending' and sent_at is null and created_at < now() - interval '10 minutes';
  with t as (select id from public.partner_tg_outbox where status = 'pending' and tries < 5 order by id limit 25 for update skip locked)
  update public.partner_tg_outbox o set status = 'sending', tries = tries + 1 from t where o.id = t.id;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'chat', chat_id, 'text', body, 'button', button)), '[]') into r
    from public.partner_tg_outbox where status = 'sending' and sent_at is null;
  return r;
end $$;
revoke all on function public.tg_outbox_take(text) from public;
grant execute on function public.tg_outbox_take(text) to anon;

create or replace function public.tg_outbox_done(p_key text, p_id bigint, p_ok boolean, p_err text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.tg_key_ok(p_key) then raise exception 'bad key'; end if;
  update public.partner_tg_outbox set status = case when p_ok then 'sent' when tries >= 5 then 'error' else 'pending' end,
         sent_at = case when p_ok then now() end, error = left(p_err, 300) where id = p_id;
  -- the partner blocked the bot: forget the chat so we stop writing
  if not p_ok and p_err ~* '(blocked|chat not found|deactivated)' then
    update public.partners set tg_chat_id = null where id = (select partner_id from public.partner_tg_outbox where id = p_id);
    update public.partner_tg_outbox set status = 'skipped' where id = p_id;
  end if;
end $$;
revoke all on function public.tg_outbox_done(text, bigint, boolean, text) from public;
grant execute on function public.tg_outbox_done(text, bigint, boolean, text) to anon;

-- admin: save the server key (only its fingerprint) and see how many partners linked
create or replace function public.admin_tg_set_key(p_key text) returns text
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if length(coalesce(p_key, '')) < 24 then raise exception 'Kalit kamida 24 belgi bo''lsin'; end if;
  update public.tg_settings set key_hash = encode(digest(p_key, 'sha256'), 'hex'), updated_at = now() where id = 1;
  return 'ok';
end $$;
revoke all on function public.admin_tg_set_key(text) from public, anon;
grant execute on function public.admin_tg_set_key(text) to authenticated;

create or replace function public.admin_tg_stats() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.is_admin() then jsonb_build_object(
    'linked', (select count(*) from public.partners where tg_chat_id is not null),
    'partners', (select count(*) from public.partners),
    'sent', (select count(*) from public.partner_tg_outbox where status = 'sent'),
    'waiting', (select count(*) from public.partner_tg_outbox where status in ('pending','sending')),
    'errors', (select count(*) from public.partner_tg_outbox where status = 'error'),
    'bot', (select bot_username from public.tg_settings where id = 1),
    'key', (select key_hash is not null from public.tg_settings where id = 1)) end;
$$;
revoke all on function public.admin_tg_stats() from public, anon;
grant execute on function public.admin_tg_stats() to authenticated;

-- every morning 10:00 Tashkent: «N days left» to everyone with a running deadline
create or replace function public.partner_fix_daily() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; d int;
begin
  for r in select id, fix_deadline from public.partners where fix_deadline is not null and tg_chat_id is not null and status = 'approved' loop
    if coalesce(array_length(public.partner_missing(r.id), 1), 0) = 0 then continue; end if;
    d := (r.fix_deadline at time zone 'Asia/Tashkent')::date - (now() at time zone 'Asia/Tashkent')::date;
    perform public.partner_tg_notify(r.id, 'left', d); n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.partner_fix_daily() from public, anon, authenticated;

do $$ begin perform cron.unschedule(jobid) from cron.job where jobname in ('partner_fix_daily', 'partner_tg_send'); exception when others then null; end $$;
select cron.schedule('partner_fix_daily', '0 5 * * *', $$select public.partner_fix_daily()$$);
-- the sender lives on our site; the database only knocks on its door every 2 minutes when something is waiting
select cron.schedule('partner_tg_send', '*/2 * * * *', $$select net.http_get('https://moviy-travel.uz/api/tg-bot?send=1') where exists (select 1 from public.partner_tg_outbox where status = 'pending')$$);
