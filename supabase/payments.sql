-- =====================================================================
-- Moviy Nomad — payments (30% deposit / 70% balance), statuses and vouchers (2026-11-23)
-- Run once in Supabase → SQL Editor (after schema.sql, public_site.sql, commission.sql). Safe to re-run.
-- Simple words:
--   * every booking / website request gets: total price, paid so far, balance due date, voucher key
--   * new status "deposit_paid" = 30% received, waiting for the remaining 70%
--   * table "payments" = list of money received (admins only)
--   * get_voucher(ref, key) = the voucher page can show a voucher only with its secret key
-- =====================================================================

-- ---------------------------------------------------------------- website requests (B2C)
alter table public.site_requests add column if not exists price_total numeric(12,2);
alter table public.site_requests add column if not exists paid_total  numeric(12,2) not null default 0;
alter table public.site_requests add column if not exists balance_due date;
alter table public.site_requests add column if not exists voucher_key text;
alter table public.site_requests add column if not exists voucher_at  timestamptz;
alter table public.site_requests drop constraint if exists site_requests_status_check;
alter table public.site_requests add constraint site_requests_status_check
  check (status in ('new','in_progress','awaiting_payment','deposit_paid','paid','confirmed','closed','cancelled'));

-- ---------------------------------------------------------------- agent bookings (B2B)
alter table public.bookings add column if not exists paid_total  numeric(12,2) not null default 0;
alter table public.bookings add column if not exists balance_due date;
alter table public.bookings add column if not exists voucher_key text;
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('request','awaiting_payment','payment_reported','deposit_paid','paid','confirmed','cancelled'));

-- ---------------------------------------------------------------- money received (admins only)
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  ref_kind    text not null check (ref_kind in ('request','booking')),
  ref_id      uuid not null,
  amount      numeric(12,2) not null check (amount <> 0),
  currency    text not null default 'USD',
  paid_on     date not null default current_date,
  method      text,                -- bank / card / cash / other
  note        text,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
create index if not exists payments_ref_idx on public.payments(ref_kind, ref_id);
alter table public.payments enable row level security;
drop policy if exists payments_admin on public.payments;
create policy payments_admin on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.payments to authenticated;

-- ---------------------------------------------------------------- booking guard: agents may report a payment
-- also after the deposit, and may never touch the new money columns
create or replace function public.bookings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare c numeric; tc numeric;
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.agency_id := public.my_agency();
      new.status := 'request';
      new.payment_details := null; new.admin_note := null;
      new.paid_at := null; new.confirmed_at := null; new.payment_reported_at := null;
      new.paid_total := 0; new.balance_due := null; new.voucher_key := null;
    end if;
    select commission_pct into c from public.agencies where id = new.agency_id;
    begin
      select nullif(data->'tourComm'->>new.tour_id, '')::numeric into tc from public.price_config where id = 'public';
    exception when others then tc := null;
    end;
    new.commission_pct := coalesce(tc, c, 0);
    new.netto := round(new.brutto * (1 - new.commission_pct / 100), 2);
    return new;
  end if;

  if public.is_admin() then
    if new.brutto is distinct from old.brutto or new.commission_pct is distinct from old.commission_pct then
      new.netto := round(new.brutto * (1 - new.commission_pct / 100), 2);
    end if;
    if new.status = 'paid' and old.status <> 'paid' then new.paid_at := now(); end if;
    if new.status = 'confirmed' and old.status <> 'confirmed' then new.confirmed_at := now(); end if;
    return new;
  end if;

  if (new.agency_id, new.tour_id, new.tour_title, new.config, new.start_date, new.pax, new.currency, new.brutto,
      new.commission_pct, new.netto, new.admin_note, new.payment_details, new.paid_at, new.confirmed_at, new.ref, new.created_by,
      new.paid_total, new.balance_due, new.voucher_key)
     is distinct from
     (old.agency_id, old.tour_id, old.tour_title, old.config, old.start_date, old.pax, old.currency, old.brutto,
      old.commission_pct, old.netto, old.admin_note, old.payment_details, old.paid_at, old.confirmed_at, old.ref, old.created_by,
      old.paid_total, old.balance_due, old.voucher_key) then
    raise exception 'Only Moviy Nomad can change this booking';
  end if;
  if new.status is distinct from old.status then
    if old.status in ('awaiting_payment','deposit_paid') and new.status = 'payment_reported' then
      new.payment_reported_at := now();
    elsif old.status in ('request','awaiting_payment') and new.status = 'cancelled' then
      null;
    else
      raise exception 'Status change not allowed';
    end if;
  elsif new.payment_reported_at is distinct from old.payment_reported_at then
    raise exception 'Not allowed';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------- voucher for the public voucher page
-- Returns data only when the secret key matches and the trip is paid. No passport numbers in full.
create or replace function public.get_voucher(p_ref text, p_key text) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare r record; b record; out jsonb;
begin
  if p_ref is null or p_key is null or length(p_key) < 16 then return null; end if;
  if p_ref like 'MR-%' then
    select * into r from site_requests where ref = p_ref and voucher_key = p_key and status in ('paid','confirmed','closed');
    if not found then return null; end if;
    return jsonb_build_object('kind','b2c','ref',r.ref,'tour_id',r.tour_id,'tour_title',r.tour_title,'start_date',r.start_date,
      'pax',r.pax,'lead',r.contact_name,'citizenship',r.citizenship,'travellers',r.travellers,'details',r.details,
      'lang',r.lang,'issued',coalesce(r.voucher_at, now()),'paid',r.paid_total,'total',r.price_total,'currency','USD');
  elsif p_ref like 'MN-%' then
    select bk.*, ag.name as agency_name into b from bookings bk join agencies ag on ag.id = bk.agency_id
      where bk.ref = p_ref and bk.voucher_key = p_key and bk.status in ('paid','confirmed');
    if not found then return null; end if;
    out := jsonb_build_object('kind','b2b','ref',b.ref,'tour_id',b.tour_id,'tour_title',b.tour_title,'start_date',b.start_date,
      'pax',b.pax,'config',b.config,'agency',b.agency_name,'issued',coalesce(b.confirmed_at, now()),
      'travellers',(select coalesce(jsonb_agg(jsonb_build_object('first',t.first_name,'last',t.last_name,'nationality',t.nationality,
          'passport','***' || right(t.passport_no, 3)) order by t.created_at), '[]'::jsonb) from travellers t where t.booking_id = b.id),
      'services',(select coalesce(jsonb_agg(jsonb_build_object('kind',s.kind,'title',s.title,'city',s.city,'from',s.date_from,'to',s.date_to,
          'conf',s.confirmation_no,'contact',s.contact,'details',s.details) order by s.sort, s.date_from), '[]'::jsonb) from booking_services s where s.booking_id = b.id));
    return out;
  end if;
  return null;
end $$;
revoke all on function public.get_voucher(text, text) from public;
grant execute on function public.get_voucher(text, text) to anon, authenticated;
