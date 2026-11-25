-- 2026-11-25 (founder): partner prices and commissions
--   partner's price = NETTO (what we pay the guide / driver / hotel)
--   Moviy Nomad service fee (default 20%) -> BRUTTO = netto × 1.20, the same on the B2C site and in the B2B agent portal
--   agent commission = 10% of brutto.  Example: 100 -> 120 -> agent 12 -> Moviy Nomad 8.
-- Netto and the fee % are never exposed to visitors or agents: the public view shows only price_brutto,
-- brutto is calculated on the server, and the cost of every booking is kept in a staff-only table.

-- 1) settings (one row) ------------------------------------------------------------------------
create table if not exists public.partner_pricing (
  id          text primary key default 'main' check (id = 'main'),
  fee_guide   numeric(5,2) not null default 20 check (fee_guide  between 0 and 300),
  fee_driver  numeric(5,2) not null default 20 check (fee_driver between 0 and 300),
  fee_hotel   numeric(5,2) not null default 20 check (fee_hotel  between 0 and 300),
  fee_other   numeric(5,2) not null default 20 check (fee_other  between 0 and 300),
  agent_comm  numeric(5,2) not null default 10 check (agent_comm between 0 and 50),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);
insert into public.partner_pricing (id) values ('main') on conflict do nothing;
alter table public.partner_pricing enable row level security;
drop policy if exists partner_pricing_read on public.partner_pricing;
create policy partner_pricing_read on public.partner_pricing for select to authenticated using (public.is_admin() or public.is_manager());
drop policy if exists partner_pricing_write on public.partner_pricing;
create policy partner_pricing_write on public.partner_pricing for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.partner_pricing from anon;
grant select, update on public.partner_pricing to authenticated;

create or replace function public.partner_pricing_stamp() returns trigger language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
drop trigger if exists partner_pricing_stamp on public.partner_pricing;
create trigger partner_pricing_stamp before update on public.partner_pricing for each row execute function public.partner_pricing_stamp();

-- a separate fee for one partner (empty = the standard fee of his kind)
alter table public.partners add column if not exists fee_pct numeric(5,2) check (fee_pct is null or fee_pct between 0 and 300);

-- only the founder sets the fee of a partner (managers can edit partners, but not this)
create or replace function public.partners_fee_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.fee_pct is distinct from old.fee_pct and not public.is_admin() then raise exception 'Only the founder can change the service fee'; end if;
  return new;
end $$;
drop trigger if exists partners_fee_guard on public.partners;
create trigger partners_fee_guard before update of fee_pct on public.partners for each row execute function public.partners_fee_guard();

-- internal helpers (not callable from the browser)
create or replace function public.partner_fee_pct(p_kind text, p_fee numeric) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(p_fee, case p_kind when 'guide' then s.fee_guide when 'driver' then s.fee_driver
                                     when 'hotel' then s.fee_hotel else s.fee_other end, 20)
    from public.partner_pricing s where s.id = 'main'
$$;
create or replace function public.partner_unit_brutto(p_price numeric, p_kind text, p_fee numeric) returns numeric
language sql stable security definer set search_path = public as $$
  select case when coalesce(p_price, 0) > 0 then round(p_price * (1 + public.partner_fee_pct(p_kind, p_fee) / 100), 2) end
$$;
revoke all on function public.partner_fee_pct(text, numeric) from public, anon, authenticated;
revoke all on function public.partner_unit_brutto(numeric, text, numeric) from public, anon, authenticated;

-- 2) public view: brutto only (price_day = netto is removed) -----------------------------------
drop view if exists public.partners_public;
create view public.partners_public as
  select p.id, p.kind, p.name, p.city, p.cities, p.languages, p.specialties, p.bio, p.photo, p.photos,
         case when coalesce(p.price_day, 0) > 0
              then round(p.price_day * (1 + coalesce(p.fee_pct, case p.kind when 'guide' then s.fee_guide when 'driver' then s.fee_driver
                                                                         when 'hotel' then s.fee_hotel else s.fee_other end, 20) / 100), 2)
         end as price_brutto,
         p.price_note,
         p.vehicle_type, p.vehicle_seats, p.vehicle_year, p.hotel_stars, p.hotel_rooms, p.experience_years,
         p.license_ok, p.rating, p.reviews_count, p.trips_count, p.featured, p.approved_at,
         p.views_count, p.likes_count, p.shares_count,
         case when p.birth_year is not null then extract(year from now())::int - p.birth_year end as age,
         p.home_area
    from public.partners p cross join public.partner_pricing s
   where p.status = 'approved' and s.id = 'main';
grant select on public.partners_public to anon, authenticated;

-- the only public number: agent commission % (the fee % stays secret, otherwise netto could be worked out)
create or replace function public.partner_terms() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('agent_comm', agent_comm) from public.partner_pricing where id = 'main'
$$;
grant execute on function public.partner_terms() to anon, authenticated;

-- 3) cost of every partner booking / request — staff only ---------------------------------------
create table if not exists public.partner_costs (
  id            bigserial primary key,
  partner_id    uuid not null references public.partners(id) on delete cascade,
  booking_id    uuid unique references public.bookings(id) on delete cascade,        -- B2B (agent)
  request_id    uuid unique references public.site_requests(id) on delete cascade,   -- B2C (site)
  source        text not null check (source in ('b2b', 'b2c')),
  ref           text,
  start_date    date,
  units         numeric(6,1) not null default 1,   -- days (guide, driver) or nights (hotel)
  qty           int not null default 1,            -- cars / rooms
  unit_cost     numeric(12,2) not null,            -- partner's price (netto) per day / night
  cost          numeric(12,2) not null,            -- what we pay the partner
  fee_pct       numeric(5,2) not null,
  brutto        numeric(12,2) not null,            -- client / agent price
  agent_comm_pct numeric(5,2) not null default 0,
  agent_comm    numeric(12,2) not null default 0,
  profit        numeric(12,2) not null,            -- Moviy Nomad: brutto − agent commission − cost
  status        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists partner_costs_partner on public.partner_costs (partner_id, start_date);
alter table public.partner_costs enable row level security;
drop policy if exists partner_costs_staff on public.partner_costs;
create policy partner_costs_staff on public.partner_costs for select to authenticated using (public.is_admin() or public.is_manager());
revoke all on public.partner_costs from anon;
grant select on public.partner_costs to authenticated;

-- 4) B2B: an agent books a partner service -------------------------------------------------------
-- config: {partner_id, units, qty}. The price is set here from the partner's netto + fee — whatever the browser sends.
create or replace function public.bookings_partner_price() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid; p public.partners; u numeric; q int; ub numeric;
begin
  begin pid := nullif(new.config->>'partner_id', '')::uuid; exception when others then pid := null; end;
  if pid is null then return new; end if;
  if tg_op = 'UPDATE' and (public.is_admin() or new.config is not distinct from old.config and new.pax is not distinct from old.pax) then return new; end if;
  select * into p from public.partners where id = pid and status = 'approved';
  if not found then raise exception 'This service is not available'; end if;
  if coalesce(p.price_day, 0) <= 0 then raise exception 'Price on request — please write to our manager'; end if;
  begin u := least(greatest(coalesce((new.config->>'units')::numeric, 1), 1), 60); exception when others then u := 1; end;
  begin q := least(greatest(coalesce((new.config->>'qty')::int, 1), 1), 20); exception when others then q := 1; end;
  ub := public.partner_unit_brutto(p.price_day, p.kind, p.fee_pct);
  new.brutto := round(ub * u * q, 2);
  new.tour_id := 'partner:' || p.kind;
  new.tour_title := (case p.kind when 'guide' then 'Guide' when 'driver' then 'Car with driver' when 'hotel' then 'Hotel' else 'Service' end)
                    || ': ' || p.name || ' — ' || trim(to_char(u, 'FM999.0')) || case p.kind when 'hotel' then ' night(s)' else ' day(s)' end
                    || case when q > 1 then ' × ' || q else '' end;
  new.currency := 'USD';
  new.config := new.config || jsonb_build_object('units', u, 'qty', q, 'partner_kind', p.kind, 'partner_name', p.name, 'unit_brutto', ub);
  return new;
end $$;
drop trigger if exists a_bookings_partner_price on public.bookings;
create trigger a_bookings_partner_price before insert or update of config, pax on public.bookings
  for each row execute function public.bookings_partner_price();

-- runs after bookings_guard (names are run in alphabetical order): agent commission from the partner settings
create or replace function public.bookings_partner_comm() returns trigger
language plpgsql security definer set search_path = public as $$
declare c numeric;
begin
  if coalesce(new.config->>'partner_id', '') = '' then return new; end if;
  -- only when the booking is created: later the commission of a booking never changes by itself
  select agent_comm into c from public.partner_pricing where id = 'main';
  new.commission_pct := coalesce(c, 10);
  new.netto := round(new.brutto * (1 - new.commission_pct / 100), 2);
  return new;
end $$;
drop trigger if exists c_bookings_partner_comm on public.bookings;
create trigger c_bookings_partner_comm before insert on public.bookings
  for each row execute function public.bookings_partner_comm();

-- after save: keep the cost line (netto to the partner, brutto, commission, our profit)
create or replace function public.bookings_partner_cost() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid; p public.partners; u numeric; q int; uc numeric; f numeric;
begin
  begin pid := nullif(new.config->>'partner_id', '')::uuid; exception when others then pid := null; end;
  if pid is null then return null; end if;
  u := coalesce((new.config->>'units')::numeric, 1); q := coalesce((new.config->>'qty')::int, 1);
  select unit_cost, fee_pct into uc, f from public.partner_costs where booking_id = new.id;
  if uc is null or (tg_op = 'UPDATE' and new.config is distinct from old.config) then
    select * into p from public.partners where id = pid;
    uc := p.price_day; f := public.partner_fee_pct(p.kind, p.fee_pct);
  end if;
  insert into public.partner_costs (partner_id, booking_id, source, ref, start_date, units, qty, unit_cost, cost, fee_pct, brutto,
                                    agent_comm_pct, agent_comm, profit, status, updated_at)
  values (pid, new.id, 'b2b', new.ref, new.start_date, u, q, uc, round(uc * u * q, 2), f, new.brutto,
          new.commission_pct, round(new.brutto - new.netto, 2), round(new.netto - uc * u * q, 2), new.status, now())
  on conflict (booking_id) do update set partner_id = excluded.partner_id, ref = excluded.ref, start_date = excluded.start_date,
     units = excluded.units, qty = excluded.qty, unit_cost = excluded.unit_cost, cost = excluded.cost, fee_pct = excluded.fee_pct,
     brutto = excluded.brutto, agent_comm_pct = excluded.agent_comm_pct, agent_comm = excluded.agent_comm, profit = excluded.profit,
     status = excluded.status, updated_at = now();
  return null;
end $$;
drop trigger if exists z_bookings_partner_cost on public.bookings;
create trigger z_bookings_partner_cost after insert or update on public.bookings
  for each row execute function public.bookings_partner_cost();

-- 5) B2C: a site request to a partner (no agent commission) --------------------------------------
create or replace function public.site_requests_partner_cost() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid; p public.partners; u numeric; q int; uc numeric; f numeric; br numeric;
begin
  begin pid := nullif(new.details->>'partner_id', '')::uuid; exception when others then pid := null; end;
  if pid is null then return null; end if;
  begin u := least(greatest(coalesce((new.details->>'units')::numeric, 1), 1), 60); exception when others then u := 1; end;
  begin q := least(greatest(coalesce((new.details->>'qty')::int, 1), 1), 20); exception when others then q := 1; end;
  select unit_cost, fee_pct into uc, f from public.partner_costs where request_id = new.id;
  if uc is null then
    select * into p from public.partners where id = pid;
    if not found or coalesce(p.price_day, 0) <= 0 then return null; end if;
    uc := p.price_day; f := public.partner_fee_pct(p.kind, p.fee_pct);
  end if;
  br := coalesce(nullif(new.price_total, 0), round(round(uc * (1 + f / 100), 2) * u * q, 2));
  insert into public.partner_costs (partner_id, request_id, source, ref, start_date, units, qty, unit_cost, cost, fee_pct, brutto,
                                    agent_comm_pct, agent_comm, profit, status, updated_at)
  values (pid, new.id, 'b2c', new.ref, new.start_date, u, q, uc, round(uc * u * q, 2), f, br, 0, 0, round(br - uc * u * q, 2), new.status, now())
  on conflict (request_id) do update set ref = excluded.ref, start_date = excluded.start_date, units = excluded.units, qty = excluded.qty,
     cost = excluded.cost, brutto = excluded.brutto, profit = excluded.profit, status = excluded.status, updated_at = now();
  return null;
end $$;
drop trigger if exists z_site_requests_partner_cost on public.site_requests;
create trigger z_site_requests_partner_cost after insert or update on public.site_requests
  for each row execute function public.site_requests_partner_cost();

-- 6) partner cabinet: only his own price and what he will be paid -------------------------------
create or replace function public.my_partner_payouts() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('ref', c.ref, 'start_date', c.start_date, 'units', c.units, 'qty', c.qty,
           'unit_price', c.unit_cost, 'amount', c.cost, 'status', c.status) order by c.start_date desc nulls last), '[]'::jsonb)
    from public.partner_costs c
   where c.partner_id = public.my_partner() and coalesce(c.status, '') <> 'cancelled'
$$;
grant execute on function public.my_partner_payouts() to authenticated;

-- backfill cost lines for partner requests that already exist
update public.site_requests set updated_at = updated_at where details ? 'partner_id';
