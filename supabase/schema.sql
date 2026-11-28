-- =====================================================================
-- Moviy Nomad — B2B agent portal & admin: database schema for Supabase
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent where possible).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table if not exists public.agencies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  country         text not null,
  city            text,
  address         text,
  website         text,
  license_no      text,
  contact_name    text not null,
  phone           text,
  whatsapp        text,
  email           text not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected','blocked')),
  commission_pct  numeric(5,2) not null default 0 check (commission_pct >= 0 and commission_pct <= 50),
  admin_note      text,
  created_at      timestamptz not null default now(),
  approved_at     timestamptz,
  approved_by     uuid
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'agent' check (role in ('agent','admin')),
  agency_id   uuid references public.agencies(id) on delete set null,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.agency_documents (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  kind        text not null default 'other' check (kind in ('registration','license','id','other')),
  file_path   text not null,
  file_name   text,
  created_at  timestamptz not null default now()
);

create sequence if not exists public.booking_ref_seq start 1001;

create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  ref                 text unique not null default ('MN-' || to_char(now(), 'YY') || '-' || nextval('public.booking_ref_seq')),
  agency_id           uuid not null references public.agencies(id) on delete restrict,
  created_by          uuid references auth.users(id) default auth.uid(),
  tour_id             text,
  tour_title          text not null,
  config              jsonb not null default '{}'::jsonb,   -- route, hotel, transport, guide language, single rooms…
  start_date          date not null,
  pax                 int  not null check (pax between 1 and 60),
  currency            text not null default 'USD',
  brutto              numeric(12,2) not null check (brutto > 0),   -- public (B2C) price, total
  commission_pct      numeric(5,2) not null default 0,             -- copied from the agency at booking time
  netto               numeric(12,2) not null default 0,             -- what the agency pays us
  status              text not null default 'request'
                      check (status in ('request','awaiting_payment','payment_reported','paid','confirmed','cancelled')),
  agent_note          text,
  admin_note          text,
  payment_details     text,           -- bank account / invoice instructions shown to the agent
  payment_reported_at timestamptz,
  paid_at             timestamptz,
  confirmed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.travellers (
  id               uuid primary key default gen_random_uuid(),
  booking_id       uuid not null references public.bookings(id) on delete cascade,
  first_name       text not null,
  last_name        text not null,
  gender           text check (gender in ('M','F')),
  birth_date       date,
  nationality      text,
  passport_no      text not null,
  passport_expiry  date,
  passport_file    text,               -- storage path in bucket "passports"
  created_at       timestamptz not null default now()
);

create table if not exists public.booking_services (
  id               uuid primary key default gen_random_uuid(),
  booking_id       uuid not null references public.bookings(id) on delete cascade,
  kind             text not null check (kind in ('hotel','transport','guide','insurance','train','flight','other')),
  title            text not null,
  city             text,
  date_from        date,
  date_to          date,
  details          text,
  confirmation_no  text,
  contact          text,
  sort             int not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.vouchers (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  kind        text not null,
  title       text,
  file_path   text not null,            -- storage path in bucket "vouchers"
  created_at  timestamptz not null default now()
);

create index if not exists bookings_agency_idx on public.bookings(agency_id, created_at desc);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists travellers_booking_idx on public.travellers(booking_id);
create index if not exists services_booking_idx on public.booking_services(booking_id);
create index if not exists vouchers_booking_idx on public.vouchers(booking_id);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_agency() returns uuid
language sql stable security definer set search_path = public as $$
  select agency_id from public.profiles where id = auth.uid();
$$;

create or replace function public.my_agency_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p join public.agencies a on a.id = p.agency_id
                 where p.id = auth.uid() and a.status = 'approved');
$$;

-- New sign-up → profile (+ pending agency when the agent filled the agency form)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  ag uuid;
begin
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bookings: prices and status are guarded on the server
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
    end if;
    select commission_pct into c from public.agencies where id = new.agency_id;
    -- A commission set for this tour in the admin panel (Narxlar → 7) wins over the agency's own %
    begin
      select nullif(data->'tourComm'->>new.tour_id, '')::numeric into tc from public.price_config where id = 'public';
    exception when others then tc := null;
    end;
    new.commission_pct := coalesce(tc, c, 0);
    new.netto := round(new.brutto * (1 - new.commission_pct / 100), 2);
    return new;
  end if;

  -- UPDATE
  if public.is_admin() then
    if new.brutto is distinct from old.brutto or new.commission_pct is distinct from old.commission_pct then
      new.netto := round(new.brutto * (1 - new.commission_pct / 100), 2);
    end if;
    if new.status = 'paid' and old.status <> 'paid' then new.paid_at := now(); end if;
    if new.status = 'confirmed' and old.status <> 'confirmed' then new.confirmed_at := now(); end if;
    return new;
  end if;

  -- Agents: only a note, and two status moves
  if (new.agency_id, new.tour_id, new.tour_title, new.config, new.start_date, new.pax, new.currency, new.brutto,
      new.commission_pct, new.netto, new.admin_note, new.payment_details, new.paid_at, new.confirmed_at, new.ref, new.created_by)
     is distinct from
     (old.agency_id, old.tour_id, old.tour_title, old.config, old.start_date, old.pax, old.currency, old.brutto,
      old.commission_pct, old.netto, old.admin_note, old.payment_details, old.paid_at, old.confirmed_at, old.ref, old.created_by) then
    raise exception 'Only Moviy Nomad can change this booking';
  end if;
  if new.status is distinct from old.status then
    if old.status = 'awaiting_payment' and new.status = 'payment_reported' then
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

drop trigger if exists bookings_guard on public.bookings;
create trigger bookings_guard before insert or update on public.bookings
  for each row execute function public.bookings_guard();

-- Agencies: only admins change status / commission (agents can't update at all — see policies)
create or replace function public.agencies_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.approved_at := now(); new.approved_by := auth.uid();
  end if;
  return new;
end $$;
drop trigger if exists agencies_stamp on public.agencies;
create trigger agencies_stamp before update on public.agencies for each row execute function public.agencies_stamp();

-- Can the current agent still edit travellers of this booking?
create or replace function public.can_edit_booking(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.bookings where id = b and agency_id = public.my_agency()
      and status in ('request','awaiting_payment'));
$$;
create or replace function public.can_see_booking(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.bookings where id = b and agency_id = public.my_agency());
$$;

-- ---------------------------------------------------------------- row level security
alter table public.agencies          enable row level security;
alter table public.profiles          enable row level security;
alter table public.agency_documents  enable row level security;
alter table public.bookings          enable row level security;
alter table public.travellers        enable row level security;
alter table public.booking_services  enable row level security;
alter table public.vouchers          enable row level security;

drop policy if exists agencies_select on public.agencies;
create policy agencies_select on public.agencies for select to authenticated using (id = public.my_agency() or public.is_admin());
drop policy if exists agencies_admin on public.agencies;
create policy agencies_admin on public.agencies for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists docs_select on public.agency_documents;
create policy docs_select on public.agency_documents for select to authenticated using (agency_id = public.my_agency() or public.is_admin());
drop policy if exists docs_insert on public.agency_documents;
create policy docs_insert on public.agency_documents for insert to authenticated with check (agency_id = public.my_agency() or public.is_admin());
drop policy if exists docs_delete on public.agency_documents;
create policy docs_delete on public.agency_documents for delete to authenticated using (public.is_admin());

drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated using (agency_id = public.my_agency() or public.is_admin());
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated with check (public.is_admin() or public.my_agency_approved());
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (public.is_admin() or (agency_id = public.my_agency() and public.my_agency_approved()))
  with check (public.is_admin() or agency_id = public.my_agency());

drop policy if exists travellers_select on public.travellers;
create policy travellers_select on public.travellers for select to authenticated using (public.can_see_booking(booking_id));
drop policy if exists travellers_write on public.travellers;
create policy travellers_write on public.travellers for all to authenticated using (public.can_edit_booking(booking_id)) with check (public.can_edit_booking(booking_id));

drop policy if exists services_select on public.booking_services;
create policy services_select on public.booking_services for select to authenticated using (public.can_see_booking(booking_id));
drop policy if exists services_admin on public.booking_services;
create policy services_admin on public.booking_services for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists vouchers_select on public.vouchers;
create policy vouchers_select on public.vouchers for select to authenticated using (public.can_see_booking(booking_id));
drop policy if exists vouchers_admin on public.vouchers;
create policy vouchers_admin on public.vouchers for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on sequence public.booking_ref_seq to authenticated;
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------- file storage (private buckets)
-- Paths: agency-docs/<agency_id>/…, passports/<agency_id>/<booking_id>/…, vouchers/<agency_id>/<booking_id>/…
insert into storage.buckets (id, name, public) values
  ('agency-docs', 'agency-docs', false), ('passports', 'passports', false), ('vouchers', 'vouchers', false)
on conflict (id) do nothing;

drop policy if exists mn_files_select on storage.objects;
create policy mn_files_select on storage.objects for select to authenticated using (
  bucket_id in ('agency-docs','passports','vouchers')
  and (public.is_admin() or (storage.foldername(name))[1] = public.my_agency()::text));

drop policy if exists mn_files_insert on storage.objects;
create policy mn_files_insert on storage.objects for insert to authenticated with check (
  (bucket_id = 'vouchers' and public.is_admin())
  or (bucket_id in ('agency-docs','passports') and (public.is_admin() or (storage.foldername(name))[1] = public.my_agency()::text)));

drop policy if exists mn_files_delete on storage.objects;
create policy mn_files_delete on storage.objects for delete to authenticated using (
  bucket_id in ('agency-docs','passports','vouchers') and public.is_admin());

-- ---------------------------------------------------------------- make yourself admin (run once, with your e-mail):
-- update public.profiles set role = 'admin' where email = 'you@example.com';
