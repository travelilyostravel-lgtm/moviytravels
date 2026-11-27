-- Moviy Nomad — partner registration through the Telegram bot (2026-11-28).
-- The bot (api/tg-bot.js on Vercel) asks the questions one by one and keeps the answers here.
-- Only the server (service key) touches these tables: RLS is on and there are no policies.
-- When the partner presses «Yuborish», the bot creates the account + partner card (status 'pending'),
-- uploads the photos to storage and adds the rooms / vehicles — the founder then approves it in the admin.

create table if not exists public.tg_reg (
  chat        bigint primary key,                  -- Telegram chat id (private chat)
  lang        text not null default 'uz',
  kind        text check (kind in ('guide', 'driver', 'hotel', 'other')),
  step        int not null default 0,              -- index in the question list
  sub         int not null default 0,              -- index inside the room / vehicle questions
  data        jsonb not null default '{}'::jsonb,  -- answers
  units       jsonb not null default '[]'::jsonb,  -- finished rooms / vehicles
  cur         jsonb,                               -- room / vehicle being filled now
  username    text,
  status      text not null default 'active' check (status in ('active', 'sending', 'done', 'cancelled')),
  partner_id  uuid references public.partners(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.tg_reg enable row level security;

-- photos / documents sent to the bot: kept as Telegram file ids until «Yuborish»
-- (one row per file, so an album of 10 photos arriving at once never overwrites itself)
create table if not exists public.tg_reg_files (
  id          bigserial primary key,
  chat        bigint not null,
  slot        text not null,                       -- main / solo / trip / lic / tech / car / rooms / unit
  unit_idx    int,                                 -- for unit photos: which room / vehicle
  file_id     text not null,
  file_uid    text not null,
  mime        text,
  created_at  timestamptz not null default now(),
  unique (chat, slot, unit_idx, file_uid)
);
create index if not exists tg_reg_files_chat on public.tg_reg_files(chat, slot, unit_idx);
alter table public.tg_reg_files enable row level security;

-- rooms / vehicles: the bot (server, service key) may add them for the partner it has just created
create or replace function public.partner_units_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if coalesce(auth.role(), '') = 'service_role' then
    if tg_op = 'INSERT' then new.status := 'pending'; new.approved_at := null; end if;
    if coalesce(new.price_netto, 0) < 0 or coalesce(new.price_netto, 0) > 20000 then raise exception 'price'; end if;
    return new;
  end if;
  if public.is_admin() or public.is_manager() then
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then new.approved_at := now(); end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.admin_note := null; new.approved_at := null;
    new.partner_id := public.my_partner();
    if new.partner_id is null then raise exception 'not a partner'; end if;
  else
    if new.partner_id <> old.partner_id then raise exception 'not allowed'; end if;
    new.admin_note := old.admin_note;
    if new.status = 'hidden' and old.status = 'approved'
       and (new.name, new.class, new.capacity, new.beds, new.qty, new.luggage, new.year, new.plate, new.ac, new.breakfast, new.features, new.price_netto, new.price_transfer, new.photos, new.docs)
           is not distinct from
           (old.name, old.class, old.capacity, old.beds, old.qty, old.luggage, old.year, old.plate, old.ac, old.breakfast, old.features, old.price_netto, old.price_transfer, old.photos, old.docs) then
      return new;
    end if;
    if new.status = 'approved' and old.status = 'hidden'
       and (new.name, new.class, new.capacity, new.beds, new.qty, new.luggage, new.year, new.plate, new.ac, new.breakfast, new.features, new.price_netto, new.price_transfer, new.photos, new.docs)
           is not distinct from
           (old.name, old.class, old.capacity, old.beds, old.qty, old.luggage, old.year, old.plate, old.ac, old.breakfast, old.features, old.price_netto, old.price_transfer, old.photos, old.docs)
       and old.approved_at is not null then
      return new;
    end if;
    new.status := 'pending'; new.approved_at := null;
  end if;
  new.name := left(trim(new.name), 120); new.plate := left(new.plate, 20);
  if coalesce(new.price_netto, 0) < 0 or coalesce(new.price_netto, 0) > 20000 then raise exception 'price'; end if;
  if coalesce(new.qty, 1) < 1 or new.qty > 999 then raise exception 'qty'; end if;
  if coalesce(array_length(new.photos, 1), 0) > 15 then new.photos := new.photos[1:15]; end if;
  return new;
end $$;

-- unfinished registrations are cleaned after 30 days
create or replace function public.tg_reg_cleanup() returns void
language sql security definer set search_path = public as $$
  delete from public.tg_reg_files f where f.created_at < now() - interval '30 days';
  delete from public.tg_reg r where r.status <> 'done' and r.updated_at < now() - interval '30 days';
$$;
revoke all on function public.tg_reg_cleanup() from public, anon, authenticated;
select cron.unschedule(jobid) from cron.job where jobname = 'tg_reg_cleanup';
select cron.schedule('tg_reg_cleanup', '23 3 * * *', 'select public.tg_reg_cleanup()');
