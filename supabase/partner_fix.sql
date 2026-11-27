-- 27.11.2026 — «Approve with fixes»: the founder approves a partner whose card has gaps and gives 3 working days.
-- Every hour the database re-checks the card (the same rules as «Talablar tekshiruvi» in the admin).
--   card 100% complete  → deadline cleared, the card stays on the site
--   deadline passed and still gaps → the card is hidden from the site automatically (status 'paused', auto_paused)
--   an auto-hidden card that becomes complete → comes back to the site by itself
-- What the partner sent for approval (pending change) counts too, so a partner who fixed in time is never removed.

alter table public.partners add column if not exists fix_deadline timestamptz;
alter table public.partners add column if not exists fix_items text[] not null default '{}';
alter table public.partners add column if not exists auto_paused boolean not null default false;
alter table public.partners add column if not exists fix_log jsonb not null default '[]'::jsonb;

-- add N working days (Mon–Fri), deadline at 23:59 Tashkent time
create or replace function public.add_workdays(t timestamptz, n int) returns timestamptz
language plpgsql immutable as $$
declare d date := (t at time zone 'Asia/Tashkent')::date; k int := 0;
begin
  while k < n loop d := d + 1; if extract(isodow from d) < 6 then k := k + 1; end if; end loop;
  return (d::timestamp + interval '23 hours 59 minutes') at time zone 'Asia/Tashkent';
end $$;

-- what is still missing on a card (codes; the cabinet and the admin show them in words)
create or replace function public.partner_missing(pid uuid) returns text[]
language plpgsql stable security definer set search_path = public as $$
declare p jsonb; pend jsonb; k text; need_pub int; need_trip int; m text[] := '{}';
        photos jsonb; docs jsonb; npub int; ntrip int; nlic int; ln text;
begin
  select to_jsonb(x) into p from public.partners x where id = pid;
  if p is null then return null; end if;
  -- the newest change the partner sent and we have not decided yet counts as already done
  select data into pend from public.partner_changes where partner_id = pid and status = 'pending' order by created_at desc limit 1;
  if pend is not null then p := p || (pend - 'docs' - 'status' - 'id' - 'user_id'); end if;
  k := p->>'kind';
  need_pub := case k when 'driver' then 6 when 'hotel' then 8 else 3 end;
  need_trip := case k when 'hotel' then 0 else 10 end;
  photos := coalesce(p->'photos', '[]'::jsonb); docs := coalesce(p->'docs', '[]'::jsonb);
  select count(*) into npub from jsonb_array_elements_text(photos) v where v not like '%/trip-%';
  npub := npub + (select count(*) from jsonb_array_elements(docs) d where d->>'kind' = 'extra');
  select count(*) into ntrip from jsonb_array_elements_text(photos) v where v like '%/trip-%';
  ntrip := ntrip + (select count(*) from jsonb_array_elements(docs) d where d->>'kind' = 'trip');
  select count(*) into nlic from jsonb_array_elements(docs) d where d->>'kind' = 'license';
  ln := trim(coalesce(p->>'license_no', ''));
  if coalesce(p->>'photo', '') = '' then m := array_append(m, 'photo'); end if;
  if npub < need_pub then m := array_append(m, ('pub:' || npub || '/' || need_pub)); end if;
  if need_trip > 0 and ntrip < need_trip then m := array_append(m, ('trip:' || ntrip || '/' || need_trip)); end if;
  if k in ('guide','driver') then
    if ln = '' or ln ~ '^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$' or length(regexp_replace(ln, '\W', '', 'g')) < 4 then m := array_append(m, 'license_no'); end if;
    if nlic = 0 then m := array_append(m, 'license_doc'); end if;
  end if;
  if k = 'guide' and jsonb_array_length(coalesce(p->'languages', '[]'::jsonb)) = 0 then m := array_append(m, 'languages'); end if;
  if k = 'guide' and jsonb_array_length(coalesce(p->'cities', '[]'::jsonb)) = 0 and coalesce(p->>'city', '') = '' then m := array_append(m, 'cities'); end if;
  if k <> 'hotel' and coalesce(p->>'birth_year', '') = '' then m := array_append(m, 'birth_year'); end if;
  if coalesce(p->>'telegram', '') = '' and coalesce(p->>'tg_chat_id', '') = '' then m := array_append(m, 'telegram'); end if;
  if coalesce(p->>'home_area', '') = '' or coalesce(p->>'home_address', '') = '' then m := array_append(m, 'home'); end if;
  return m;
end $$;
revoke all on function public.partner_missing(uuid) from public, anon;
grant execute on function public.partner_missing(uuid) to authenticated;

-- founder: approve now, 3 working days to fix
create or replace function public.admin_partner_approve_fix(pid uuid, note text, days int default 3) returns jsonb
language plpgsql security definer set search_path = public as $$
declare m text[]; dl timestamptz;
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not allowed'; end if;
  m := public.partner_missing(pid);
  if m is null then raise exception 'partner not found'; end if;
  dl := case when coalesce(array_length(m, 1), 0) = 0 then null else public.add_workdays(now(), greatest(coalesce(days, 3), 1)) end;
  update public.partners set status = 'approved', approved_at = coalesce(approved_at, now()), admin_note = nullif(trim(coalesce(note, '')), ''),
         fix_deadline = dl, fix_items = m, auto_paused = false, updated_at = now(),
         fix_log = fix_log || jsonb_build_array(jsonb_build_object('t', now(), 'e', case when dl is null then 'approved_complete' else 'approved_with_fixes' end, 'missing', m, 'deadline', dl))
   where id = pid;
  if dl is not null then perform public.partner_tg_notify(pid, 'given'); end if;
  return jsonb_build_object('deadline', dl, 'missing', m);
end $$;
revoke all on function public.admin_partner_approve_fix(uuid, text, int) from public, anon;
grant execute on function public.admin_partner_approve_fix(uuid, text, int) to authenticated;

-- partner cabinet: my deadline and what is missing
create or replace function public.partner_my_fix() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p record;
begin
  select id, fix_deadline, auto_paused, status into p from public.partners where user_id = auth.uid();
  if p.id is null then return null; end if;
  if p.fix_deadline is null and not p.auto_paused then return null; end if;
  return jsonb_build_object('deadline', p.fix_deadline, 'auto_paused', p.auto_paused, 'missing', public.partner_missing(p.id), 'now', now());
end $$;
revoke all on function public.partner_my_fix() from public, anon;
grant execute on function public.partner_my_fix() to authenticated;

-- every hour: keep, hide or bring back
create or replace function public.partner_fix_tick() returns text
language plpgsql security definer set search_path = public as $$
declare r record; m text[]; kept int := 0; hidden int := 0; back int := 0;
begin
  for r in select id, fix_deadline, auto_paused, status from public.partners where fix_deadline is not null or auto_paused loop
    m := public.partner_missing(r.id);
    if coalesce(array_length(m, 1), 0) = 0 then
      update public.partners set fix_deadline = null, fix_items = '{}', auto_paused = false,
             status = case when r.auto_paused and status = 'paused' then 'approved' else status end, updated_at = now(),
             fix_log = fix_log || jsonb_build_array(jsonb_build_object('t', now(), 'e', case when r.auto_paused then 'restored_complete' else 'fixed_in_time' end))
       where id = r.id;
      if r.auto_paused then back := back + 1; perform public.partner_tg_notify(r.id, 'back'); else kept := kept + 1; perform public.partner_tg_notify(r.id, 'ok'); end if;
    elsif r.fix_deadline is not null and now() > r.fix_deadline and r.status = 'approved' then
      update public.partners set status = 'paused', auto_paused = true, fix_deadline = null, fix_items = m, updated_at = now(),
             fix_log = fix_log || jsonb_build_array(jsonb_build_object('t', now(), 'e', 'auto_hidden', 'missing', m))
       where id = r.id;
      hidden := hidden + 1; perform public.partner_tg_notify(r.id, 'hidden');
    else
      update public.partners set fix_items = m where id = r.id and fix_items is distinct from m;
    end if;
  end loop;
  return format('kept %s, hidden %s, restored %s', kept, hidden, back);
end $$;
revoke all on function public.partner_fix_tick() from public, anon, authenticated;

do $$ begin perform cron.unschedule(jobid) from cron.job where jobname = 'partner_fix_tick'; exception when others then null; end $$;
select cron.schedule('partner_fix_tick', '17 * * * *', $$select public.partner_fix_tick()$$);
