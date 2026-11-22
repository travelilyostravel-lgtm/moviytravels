-- =====================================================================
-- Moviy Nomad — agent commission per tour (2026-11-23)
-- Admin → Narxlar → 7: "Agent komissiyasi %" for a tour. When a booking is created
-- for that tour, this % is used instead of the agency's own commission.
-- Run once in Supabase → SQL Editor. Safe to re-run. (Replaces bookings_guard from schema.sql.)
-- =====================================================================

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
