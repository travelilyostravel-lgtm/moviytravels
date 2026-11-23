-- =====================================================================
-- Moviy Nomad — AUTOMATIC E-MAILS (2026-11-23)
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- Simple words:
--   * every important step (new request, booking confirmed, payment received, fully paid / voucher,
--     cancelled, payment reminders) puts a letter into the "notify_outbox" table
--   * the "notify" Edge Function sends these letters by e-mail (Resend) every minute
--   * the client (B2C) or the agent (B2B) gets the letter in his language; the office gets a short alert
--   * WhatsApp stays manual for now (admin → "Mijozga xabar")
-- =====================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- agents: remember the portal language of each booking (letters go in that language)
alter table public.bookings add column if not exists lang text;

-- ---------------------------------------------------------------- outbox
create table if not exists public.notify_outbox (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  ref_table   text not null check (ref_table in ('site_requests','bookings')),
  ref_id      uuid not null,
  event       text not null,          -- request_new, booking_new, confirm, received, voucher, cancel, reminder, final, admin_new, admin_paid
  to_email    text not null,
  lang        text not null default 'en',
  status      text not null default 'pending' check (status in ('pending','sent','error','expired')),
  attempts    int  not null default 0,
  subject     text,
  error       text,
  sent_at     timestamptz
);
create unique index if not exists notify_outbox_once on public.notify_outbox(ref_table, ref_id, event, to_email);
create index if not exists notify_outbox_pending on public.notify_outbox(status, id);
create index if not exists notify_outbox_ref on public.notify_outbox(ref_id);
alter table public.notify_outbox enable row level security;
drop policy if exists notify_outbox_staff on public.notify_outbox;
create policy notify_outbox_staff on public.notify_outbox for select to authenticated
  using (public.is_admin() or (public.is_manager() and (
    (ref_table = 'site_requests' and public.mgr_request(ref_id)) or (ref_table = 'bookings' and public.mgr_booking(ref_id)))));
grant select on public.notify_outbox to authenticated;

-- office address for short alerts
create or replace function public.notify_office() returns text language sql immutable as $$ select 'moviynomad4214@gmail.com'::text $$;

create or replace function public.notify_add(t text, id uuid, ev text, mail text, lng text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if mail is null or position('@' in mail) = 0 then return; end if;
  insert into public.notify_outbox(ref_table, ref_id, event, to_email, lang)
  values (t, id, ev, lower(trim(mail)), coalesce(nullif(lng, ''), 'en'))
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------- B2C website requests
create or replace function public.notify_site_request() returns trigger
language plpgsql security definer set search_path = public as $$
declare ev text;
begin
  if tg_op = 'INSERT' then
    perform public.notify_add('site_requests', new.id, 'request_new', new.email, new.lang);
    perform public.notify_add('site_requests', new.id, 'admin_new', public.notify_office(), 'uz');
    return new;
  end if;
  if new.status is distinct from old.status then
    ev := case new.status when 'awaiting_payment' then 'confirm' when 'deposit_paid' then 'received'
                          when 'paid' then 'voucher' when 'cancelled' then 'cancel' else null end;
    if ev is not null then perform public.notify_add('site_requests', new.id, ev, new.email, new.lang); end if;
  end if;
  return new;
end $$;
drop trigger if exists z_notify_site_request on public.site_requests;
create trigger z_notify_site_request after insert or update of status on public.site_requests
  for each row execute function public.notify_site_request();

-- ---------------------------------------------------------------- B2B agent bookings
create or replace function public.notify_booking() returns trigger
language plpgsql security definer set search_path = public as $$
declare ev text; mail text;
begin
  select a.email into mail from public.agencies a where a.id = new.agency_id;
  if tg_op = 'INSERT' then
    perform public.notify_add('bookings', new.id, 'booking_new', mail, new.lang);
    perform public.notify_add('bookings', new.id, 'admin_new', public.notify_office(), 'uz');
    return new;
  end if;
  if new.status is distinct from old.status then
    ev := case new.status when 'awaiting_payment' then 'confirm' when 'deposit_paid' then 'received'
                          when 'paid' then 'voucher' when 'cancelled' then 'cancel' else null end;
    if ev is not null then perform public.notify_add('bookings', new.id, ev, mail, new.lang); end if;
    if new.status = 'payment_reported' then
      perform public.notify_add('bookings', new.id, 'admin_paid', public.notify_office(), 'uz');
    end if;
  end if;
  return new;
end $$;
drop trigger if exists z_notify_booking on public.bookings;
create trigger z_notify_booking after insert or update of status on public.bookings
  for each row execute function public.notify_booking();

-- ---------------------------------------------------------------- payment reminders (every morning)
create or replace function public.notify_reminders() returns void
language plpgsql security definer set search_path = public as $$
begin
  -- balance due within 10 days → one friendly reminder
  insert into public.notify_outbox(ref_table, ref_id, event, to_email, lang)
  select 'site_requests', r.id, 'reminder', lower(r.email), coalesce(r.lang, 'en') from public.site_requests r
   where r.status = 'deposit_paid' and r.email like '%@%' and r.balance_due between current_date and current_date + 10
  on conflict do nothing;
  insert into public.notify_outbox(ref_table, ref_id, event, to_email, lang)
  select 'bookings', b.id, 'reminder', lower(a.email), coalesce(b.lang, 'en') from public.bookings b join public.agencies a on a.id = b.agency_id
   where b.status = 'deposit_paid' and b.balance_due between current_date and current_date + 10
  on conflict do nothing;
  -- balance overdue → one final notice (48 hours)
  insert into public.notify_outbox(ref_table, ref_id, event, to_email, lang)
  select 'site_requests', r.id, 'final', lower(r.email), coalesce(r.lang, 'en') from public.site_requests r
   where r.status = 'deposit_paid' and r.email like '%@%' and r.balance_due < current_date
  on conflict do nothing;
  insert into public.notify_outbox(ref_table, ref_id, event, to_email, lang)
  select 'bookings', b.id, 'final', lower(a.email), coalesce(b.lang, 'en') from public.bookings b join public.agencies a on a.id = b.agency_id
   where b.status = 'deposit_paid' and b.balance_due < current_date
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------- schedules
-- 09:00 Tashkent (04:00 UTC): reminders.  Every minute: send pending letters.
select cron.unschedule(jobid) from cron.job where jobname in ('mn_notify_reminders', 'mn_notify_send');
select cron.schedule('mn_notify_reminders', '0 4 * * *', $$ select public.notify_reminders(); $$);
select cron.schedule('mn_notify_send', '* * * * *', $$
  select net.http_post(
    url := 'https://qlytfxwxauvlrbfnwzod.supabase.co/functions/v1/notify',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb)
  where exists (select 1 from public.notify_outbox where status = 'pending');
$$);
