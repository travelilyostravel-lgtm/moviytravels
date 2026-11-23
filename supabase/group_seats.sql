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
