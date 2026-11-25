-- 25.11.2026 (founder): hotels and transport register like on Booking.com / Kiwitaxi.
-- Hotel  -> room types (name, class, guests, beds, how many such rooms, breakfast, netto $ per night, photos).
-- Transport -> vehicles (class, make/model, seats, luggage, year, plate, A/C, netto $ per day and per airport transfer, photos, papers).
-- Every new or changed room/vehicle waits for Moviy Nomad's approval; the public sees only approved ones and only the brutto price.

create table if not exists public.partner_units (
  id            uuid primary key default gen_random_uuid(),
  partner_id    uuid not null references public.partners(id) on delete cascade,
  unit_kind     text not null check (unit_kind in ('room', 'vehicle')),
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  name          text not null,                    -- "Deluxe double" / "Mercedes V-Class"
  class         text,                             -- room: standard/deluxe/suite/family/dorm · vehicle: economy/comfort/business/minivan/minibus/bus
  capacity      int,                              -- guests in the room / passenger seats
  beds          text,                             -- room: "1 double" / "2 single"
  qty           int not null default 1,           -- how many such rooms / vehicles
  luggage       int,                              -- vehicle: suitcases
  year          int,                              -- vehicle year
  plate         text,                             -- vehicle plate: private (partner + staff)
  ac            boolean not null default true,
  breakfast     boolean not null default false,   -- room: breakfast included
  features      text[] not null default '{}',     -- room: bathroom, balcony, view … · vehicle: wifi, water, child seat …
  price_netto   numeric(10,2),                    -- $ per night (room) / per day (vehicle): what the partner gets
  price_transfer numeric(10,2),                   -- vehicle: airport transfer within the city, netto
  photos        text[] not null default '{}',     -- public paths in bucket partner-photos
  docs          jsonb not null default '[]'::jsonb, -- vehicle papers (bucket partner-docs): private
  note          text,
  admin_note    text,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  approved_at   timestamptz
);
create index if not exists partner_units_p on public.partner_units (partner_id, unit_kind, status);
alter table public.partner_units enable row level security;

drop policy if exists partner_units_own on public.partner_units;
create policy partner_units_own on public.partner_units for all to authenticated
  using (partner_id = public.my_partner() or public.is_admin() or public.is_manager())
  with check (partner_id = public.my_partner() or public.is_admin() or public.is_manager());
grant select, insert, update, delete on public.partner_units to authenticated;

-- Partners cannot approve their own rooms/vehicles: any change by the partner sends the unit back to review.
create or replace function public.partner_units_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
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
      return new;                         -- partner may hide (e.g. car in repair) without review
    end if;
    if new.status = 'approved' and old.status = 'hidden'
       and (new.name, new.class, new.capacity, new.beds, new.qty, new.luggage, new.year, new.plate, new.ac, new.breakfast, new.features, new.price_netto, new.price_transfer, new.photos, new.docs)
           is not distinct from
           (old.name, old.class, old.capacity, old.beds, old.qty, old.luggage, old.year, old.plate, old.ac, old.breakfast, old.features, old.price_netto, old.price_transfer, old.photos, old.docs)
       and old.approved_at is not null then
      return new;                         -- … and show it again
    end if;
    new.status := 'pending'; new.approved_at := null;
  end if;
  new.name := left(trim(new.name), 120); new.plate := left(new.plate, 20);
  if coalesce(new.price_netto, 0) < 0 or coalesce(new.price_netto, 0) > 20000 then raise exception 'price'; end if;
  if coalesce(new.qty, 1) < 1 or new.qty > 999 then raise exception 'qty'; end if;
  if coalesce(array_length(new.photos, 1), 0) > 15 then new.photos := new.photos[1:15]; end if;
  return new;
end $$;
drop trigger if exists partner_units_guard on public.partner_units;
create trigger partner_units_guard before insert or update on public.partner_units
  for each row execute function public.partner_units_guard();

-- Hotel / transport extras on the partner card (amenities, check-in, map, policies).
alter table public.partners add column if not exists extra jsonb not null default '{}'::jsonb;
create or replace function public.partner_save_extra(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := public.my_partner();
begin
  if me is null then raise exception 'not a partner'; end if;
  update public.partners set extra = jsonb_strip_nulls(jsonb_build_object(
      'amenities', (select coalesce(jsonb_agg(left(x, 40)), '[]'::jsonb) from (select x from jsonb_array_elements_text(coalesce(p->'amenities', '[]')) x limit 30) s),
      'check_in', left(p->>'check_in', 10), 'check_out', left(p->>'check_out', 10),
      'map_url', case when p->>'map_url' ~* '^https://' then left(p->>'map_url', 400) end,
      'policies', left(p->>'policies', 800),
      'company_type', left(p->>'company_type', 20),            -- transport: person / company
      'registry_no', left(p->>'registry_no', 80)),            -- hotel: state registry (Turizm qo'mitasi)
    updated_at = now()
   where id = me;
end $$;
grant execute on function public.partner_save_extra(jsonb) to authenticated;

-- Public views: approved partners and approved units only, brutto price only (no plate, papers, netto).
create or replace view public.partner_extra_public as
  select p.id as partner_id, p.extra - 'registry_no' - 'company_type' as extra
    from public.partners p where p.status = 'approved';
grant select on public.partner_extra_public to anon, authenticated;

create or replace view public.partner_units_public as
  select u.id, u.partner_id, u.unit_kind, u.name, u.class, u.capacity, u.beds, u.qty, u.luggage, u.year, u.ac, u.breakfast, u.features, u.photos, u.sort,
         case when coalesce(u.price_netto, 0) > 0 then round(u.price_netto * (1 + coalesce(p.fee_pct,
              case p.kind when 'guide' then s.fee_guide when 'driver' then s.fee_driver when 'hotel' then s.fee_hotel else s.fee_other end, 20) / 100), 2) end as price_brutto,
         case when coalesce(u.price_transfer, 0) > 0 then round(u.price_transfer * (1 + coalesce(p.fee_pct,
              case p.kind when 'guide' then s.fee_guide when 'driver' then s.fee_driver when 'hotel' then s.fee_hotel else s.fee_other end, 20) / 100), 2) end as transfer_brutto
    from public.partner_units u
    join public.partners p on p.id = u.partner_id and p.status = 'approved'
    left join public.partner_pricing s on s.id = 'main'
   where u.status = 'approved';
grant select on public.partner_units_public to anon, authenticated;

select 'ok' as result;
