-- =====================================================================
-- Moviy Nomad — team of managers (2026-11-23)
-- Simple words:
--   * role 'admin' = the founder (sees everything). role 'manager' = a manager (sees only own clients).
--   * The founder adds a manager by e-mail (staff_invites); the manager signs up with that e-mail.
--   * Managers must log in with a 2-step code (authenticator app) and from an approved device.
--     First device is approved automatically; every new device waits for the founder's approval.
--   * New website requests and new agencies go to managers automatically in turn (round robin).
-- Run once in Supabase → SQL Editor (after the other files). Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------- roles and team columns
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('agent','admin','manager'));
alter table public.profiles add column if not exists active boolean not null default true;
alter table public.profiles add column if not exists last_assigned_at timestamptz;
alter table public.site_requests add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
alter table public.agencies add column if not exists manager_id uuid references public.profiles(id) on delete set null;
create index if not exists site_requests_assigned_idx on public.site_requests(assigned_to);
create index if not exists agencies_manager_idx on public.agencies(manager_id);

create table if not exists public.staff_invites (
  email      text primary key,
  full_name  text,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
create table if not exists public.admin_devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  device_id   text not null,
  label       text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now(),
  approved_at timestamptz,
  last_seen   timestamptz,
  unique (user_id, device_id)
);

-- ---------------------------------------------------------------- helper functions
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active;
$$;
create or replace function public.req_device() returns text
language sql stable as $$
  select nullif(coalesce(current_setting('request.headers', true), '{}')::json->>'x-device-id', '');
$$;
-- A manager counts only with 2-step login (aal2) and an approved device
create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = 'manager'
     and coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
     and exists (select 1 from public.admin_devices d where d.user_id = auth.uid() and d.device_id = public.req_device() and d.approved);
$$;
create or replace function public.mgr_agency(a uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_manager() and exists (select 1 from public.agencies where id = a and manager_id = auth.uid());
$$;
create or replace function public.mgr_agency_txt(a text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_manager() and exists (select 1 from public.agencies where id::text = a and manager_id = auth.uid());
$$;
create or replace function public.mgr_booking(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_manager() and exists (select 1 from public.bookings bk join public.agencies ag on ag.id = bk.agency_id
                                         where bk.id = b and ag.manager_id = auth.uid());
$$;
create or replace function public.mgr_request(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_manager() and exists (select 1 from public.site_requests where id = r and assigned_to = auth.uid());
$$;

-- next manager in turn (active, approved at least one device); null when there is none
create or replace function public.next_manager() returns uuid
language plpgsql security definer set search_path = public as $$
declare m uuid;
begin
  select p.id into m from public.profiles p
   where p.role = 'manager' and p.active
     and exists (select 1 from public.admin_devices d where d.user_id = p.id and d.approved)
   order by p.last_assigned_at nulls first, p.created_at
   limit 1 for update skip locked;
  if m is not null then update public.profiles set last_assigned_at = clock_timestamp() where id = m; end if;
  return m;
end $$;

create or replace function public.auto_assign_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.assigned_to is null then new.assigned_to := public.next_manager(); end if;
  if tg_op = 'UPDATE' and new.assigned_to is distinct from old.assigned_to and not public.is_admin() then
    raise exception 'Only the founder can reassign a client';
  end if;
  return new;
end $$;
drop trigger if exists site_requests_assign on public.site_requests;
create trigger site_requests_assign before insert or update on public.site_requests for each row execute function public.auto_assign_request();

create or replace function public.auto_assign_agency() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.manager_id is null then new.manager_id := public.next_manager(); end if;
  if tg_op = 'UPDATE' and new.manager_id is distinct from old.manager_id and not public.is_admin() then
    raise exception 'Only the founder can reassign an agency';
  end if;
  return new;
end $$;
drop trigger if exists agencies_assign on public.agencies;
create trigger agencies_assign before insert or update on public.agencies for each row execute function public.auto_assign_agency();

-- sign-up: an invited e-mail becomes a manager
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  ag uuid;
  inv record;
begin
  select * into inv from public.staff_invites where lower(email) = lower(new.email) and used_at is null;
  if found then
    insert into public.profiles (id, role, full_name, email) values (new.id, 'manager', coalesce(inv.full_name, m->>'contact_name'), new.email)
    on conflict (id) do update set role = 'manager', full_name = excluded.full_name;
    update public.staff_invites set used_at = now() where email = inv.email;
    return new;
  end if;
  if coalesce(m->>'agency_name', '') <> '' then
    insert into public.agencies (name, country, city, address, website, license_no, contact_name, phone, whatsapp, email)
    values (m->>'agency_name', coalesce(m->>'country', ''), m->>'city', m->>'address', m->>'website', m->>'license_no',
            coalesce(m->>'contact_name', ''), m->>'phone', m->>'whatsapp', new.email)
    returning id into ag;
  end if;
  insert into public.profiles (id, role, agency_id, full_name, email)
  values (new.id, 'agent', ag, m->>'contact_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;

-- device check-in: first device approved automatically, others wait for the founder
create or replace function public.register_device(p_label text) returns text
language plpgsql security definer set search_path = public as $$
declare dev text := public.req_device(); st boolean; n int;
begin
  if auth.uid() is null or dev is null or length(dev) < 16 then return 'bad'; end if;
  if public.my_role() is distinct from 'manager' then return 'not_manager'; end if;
  select approved into st from public.admin_devices where user_id = auth.uid() and device_id = dev;
  if found then
    update public.admin_devices set last_seen = now() where user_id = auth.uid() and device_id = dev;
    return case when st then 'approved' else 'pending' end;
  end if;
  select count(*) into n from public.admin_devices where user_id = auth.uid();
  insert into public.admin_devices (user_id, device_id, label, approved, approved_at, last_seen)
  values (auth.uid(), dev, left(p_label, 200), n = 0, case when n = 0 then now() end, now());
  return case when n = 0 then 'approved' else 'pending' end;
end $$;
grant execute on function public.register_device(text) to authenticated;

-- founder's e-mail for "ask for approval" button
create or replace function public.founder_emails() returns text
language sql stable security definer set search_path = public as $$
  select string_agg(email, ',') from public.profiles where role = 'admin' and active;
$$;
grant execute on function public.founder_emails() to authenticated;

-- ---------------------------------------------------------------- policies
alter table public.staff_invites enable row level security;
drop policy if exists staff_invites_admin on public.staff_invites;
create policy staff_invites_admin on public.staff_invites for all to authenticated using (public.is_admin()) with check (public.is_admin());
alter table public.admin_devices enable row level security;
drop policy if exists admin_devices_admin on public.admin_devices;
create policy admin_devices_admin on public.admin_devices for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_devices_own on public.admin_devices;
create policy admin_devices_own on public.admin_devices for select to authenticated using (user_id = auth.uid());
grant select, insert, update, delete on public.staff_invites, public.admin_devices to authenticated;

-- profiles: managers see the team (names) and agents of their agencies
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_admin()
  or (public.is_manager() and (role in ('admin','manager') or public.mgr_agency(agency_id))));

-- website requests and payments
drop policy if exists site_requests_admin on public.site_requests;
create policy site_requests_admin on public.site_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists site_requests_mgr on public.site_requests;
create policy site_requests_mgr on public.site_requests for select to authenticated using (public.is_manager() and assigned_to = auth.uid());
drop policy if exists site_requests_mgr_upd on public.site_requests;
create policy site_requests_mgr_upd on public.site_requests for update to authenticated
  using (public.is_manager() and assigned_to = auth.uid()) with check (public.is_manager() and assigned_to = auth.uid());

drop policy if exists payments_mgr on public.payments;
create policy payments_mgr on public.payments for all to authenticated
  using ((ref_kind = 'request' and public.mgr_request(ref_id)) or (ref_kind = 'booking' and public.mgr_booking(ref_id)))
  with check ((ref_kind = 'request' and public.mgr_request(ref_id)) or (ref_kind = 'booking' and public.mgr_booking(ref_id)));

-- agencies and agent bookings
drop policy if exists agencies_select on public.agencies;
create policy agencies_select on public.agencies for select to authenticated using (id = public.my_agency() or public.is_admin() or public.mgr_agency(id));

create or replace function public.can_see_booking(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.mgr_booking(b) or exists (select 1 from public.bookings where id = b and agency_id = public.my_agency());
$$;
create or replace function public.can_edit_booking(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.mgr_booking(b) or exists (
    select 1 from public.bookings where id = b and agency_id = public.my_agency()
      and status in ('request','awaiting_payment'));
$$;
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated using (agency_id = public.my_agency() or public.is_admin() or public.mgr_agency(agency_id));
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (public.is_admin() or public.mgr_agency(agency_id) or (agency_id = public.my_agency() and public.my_agency_approved()))
  with check (public.is_admin() or public.mgr_agency(agency_id) or agency_id = public.my_agency());
drop policy if exists services_admin on public.booking_services;
create policy services_admin on public.booking_services for all to authenticated using (public.is_admin() or public.mgr_booking(booking_id)) with check (public.is_admin() or public.mgr_booking(booking_id));
drop policy if exists vouchers_admin on public.vouchers;
create policy vouchers_admin on public.vouchers for all to authenticated using (public.is_admin() or public.mgr_booking(booking_id)) with check (public.is_admin() or public.mgr_booking(booking_id));

-- the booking guard treats the client's manager like the founder (except reassigning)
create or replace function public.bookings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare c numeric; tc numeric; staff boolean;
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

  staff := public.is_admin() or (public.mgr_agency(old.agency_id) and new.agency_id = old.agency_id);
  if staff then
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

-- files: managers read/write vouchers and read documents of their agencies
drop policy if exists mn_files_select on storage.objects;
create policy mn_files_select on storage.objects for select to authenticated using (
  bucket_id in ('agency-docs','passports','vouchers')
  and (public.is_admin() or (storage.foldername(name))[1] = public.my_agency()::text
       or public.mgr_agency_txt((storage.foldername(name))[1])));
drop policy if exists mn_files_insert on storage.objects;
create policy mn_files_insert on storage.objects for insert to authenticated with check (
  (bucket_id = 'vouchers' and (public.is_admin() or public.mgr_agency_txt((storage.foldername(name))[1])))
  or (bucket_id in ('agency-docs','passports') and (public.is_admin() or (storage.foldername(name))[1] = public.my_agency()::text)));

-- ---------------------------------------------------------------- give existing unassigned clients to nobody (founder keeps them)
-- (nothing to do: old requests stay "Tayinlanmagan" until the founder assigns them)

-- ---------------------------------------------------------------- managers may VIEW prices and group dates (not change them)
drop policy if exists price_mgr_read on public.price_config;
create policy price_mgr_read on public.price_config for select to authenticated using (public.is_manager());
drop policy if exists price_log_mgr on public.price_config_log;
create policy price_log_mgr on public.price_config_log for select to authenticated using (public.is_manager());
drop policy if exists group_departures_mgr_read on public.group_departures;
create policy group_departures_mgr_read on public.group_departures for select to authenticated using (public.is_manager());
