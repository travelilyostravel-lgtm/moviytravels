-- =====================================================================
-- Moviy Nomad — automatic seat holding for group departures (2026-11-23)
-- Simple words: when a group-tour request gets its 30% deposit confirmed (status "30% to'landi" or later),
-- its travellers are taken from the free seats of that departure automatically.
-- If the request is cancelled, the seats come back. The colour of the schedule changes by itself.
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- =====================================================================
alter table public.site_requests add column if not exists seats_held int not null default 0;
alter table public.site_requests add column if not exists seats_dep uuid;

create or replace function public.hold_group_seats() returns trigger
language plpgsql security definer set search_path = public as $$
declare dep uuid; target int; cap int; bk int;
begin
  new.seats_held := coalesce(old.seats_held, 0); new.seats_dep := old.seats_dep;   -- never trust values sent by a client
  if new.kind <> 'group' then return new; end if;
  begin dep := nullif(new.details->>'departure_id', '')::uuid; exception when others then dep := null; end;
  target := case when dep is not null and new.status in ('deposit_paid','paid','confirmed','closed') then greatest(coalesce(new.pax, 1), 1) else 0 end;
  -- give back seats held on an old departure (date changed or cancelled)
  if coalesce(old.seats_held, 0) > 0 and old.seats_dep is not null and (old.seats_dep is distinct from dep or target = 0) then
    update group_departures set booked = greatest(0, booked - old.seats_held),
           status = case when status = 'full' and booked - old.seats_held < capacity then 'guaranteed' else status end
     where id = old.seats_dep;
    new.seats_held := 0; new.seats_dep := null;
  end if;
  if target > 0 then
    if new.seats_dep is distinct from dep then new.seats_held := 0; end if;
    if target <> coalesce(new.seats_held, 0) then
      update group_departures set booked = greatest(0, booked + target - coalesce(new.seats_held, 0)) where id = dep
      returning capacity, booked into cap, bk;
      if found and bk >= cap then update group_departures set status = 'full' where id = dep and status <> 'cancelled'; end if;
      if found and bk < cap then update group_departures set status = 'guaranteed' where id = dep and status = 'full'; end if;
    end if;
    new.seats_held := target; new.seats_dep := dep;
  end if;
  return new;
end $$;
drop trigger if exists site_requests_seats on public.site_requests;
create trigger site_requests_seats before update on public.site_requests for each row execute function public.hold_group_seats();

-- =====================================================================
-- Agents (B2B) book seats on group departures too (2026-11-23)
-- * the agent picks a departure in the portal → booking with config.departure_id
-- * the price is set by the server: price per person × travellers (+ single supplement), agent commission applies
-- * when Moviy Nomad confirms the 30% deposit (status "deposit_paid" or later) the seats are taken from the schedule;
--   cancelled → seats come back
-- =====================================================================
alter table public.bookings add column if not exists seats_held int not null default 0;
alter table public.bookings add column if not exists seats_dep uuid;

create or replace function public.hold_booking_seats() returns trigger
language plpgsql security definer set search_path = public as $$
declare dep uuid; target int; cap int; bk int;
begin
  if tg_op = 'INSERT' then new.seats_held := 0; new.seats_dep := null; return new; end if;
  new.seats_held := coalesce(old.seats_held, 0); new.seats_dep := old.seats_dep;
  begin dep := nullif(new.config->>'departure_id', '')::uuid; exception when others then dep := null; end;
  target := case when dep is not null and new.status in ('deposit_paid','paid','confirmed') then greatest(coalesce(new.pax, 1), 1) else 0 end;
  if coalesce(old.seats_held, 0) > 0 and old.seats_dep is not null and (old.seats_dep is distinct from dep or target = 0) then
    update group_departures set booked = greatest(0, booked - old.seats_held),
           status = case when status = 'full' and booked - old.seats_held < capacity then 'guaranteed' else status end
     where id = old.seats_dep;
    new.seats_held := 0; new.seats_dep := null;
  end if;
  if target > 0 then
    if new.seats_dep is distinct from dep then new.seats_held := 0; end if;
    if target <> new.seats_held then
      update group_departures set booked = greatest(0, booked + target - new.seats_held) where id = dep returning capacity, booked into cap, bk;
      if found and bk >= cap then update group_departures set status = 'full' where id = dep and status <> 'cancelled'; end if;
      if found and bk < cap then update group_departures set status = 'guaranteed' where id = dep and status = 'full'; end if;
    end if;
    new.seats_held := target; new.seats_dep := dep;
  end if;
  return new;
end $$;
drop trigger if exists bookings_seats on public.bookings;
create trigger bookings_seats before insert or update on public.bookings for each row execute function public.hold_booking_seats();

-- server-side price for group seats (runs before bookings_guard, which then applies the commission)
create or replace function public.group_booking_price() returns trigger
language plpgsql security definer set search_path = public as $$
declare dep uuid; g record; n int;
begin
  begin dep := nullif(new.config->>'departure_id', '')::uuid; exception when others then dep := null; end;
  if dep is null then return new; end if;
  if tg_op = 'UPDATE' and public.is_admin() then return new; end if;
  select * into g from group_departures where id = dep;
  if not found or g.status = 'cancelled' or g.start_date < current_date then raise exception 'This departure is not available'; end if;
  n := greatest(coalesce(new.pax, 1), 1);
  if tg_op = 'INSERT' and g.booked + n > g.capacity then raise exception 'Not enough free seats on this departure'; end if;
  new.tour_id := g.tour_id; new.start_date := g.start_date; new.currency := 'USD';
  new.brutto := n * coalesce(g.price_pp, 0) + case when new.config->>'room' = 'single' then n * coalesce(g.single_supp, 0) else 0 end;
  return new;
end $$;
drop trigger if exists a_bookings_group_price on public.bookings;
create trigger a_bookings_group_price before insert or update of config, pax on public.bookings for each row execute function public.group_booking_price();
