-- =====================================================================
-- Moviy Nomad — guaranteed group departures (join-in tours for solo travellers)
-- Run once in Supabase → SQL Editor (after public_site.sql). Safe to re-run.
-- Visitors read only published, upcoming departures (no costs). They request
-- a seat through submit_site_request(kind = 'group'); admins confirm manually.
-- =====================================================================

create table if not exists public.group_departures (
  id           uuid primary key default gen_random_uuid(),
  tour_id      text not null,                       -- id from assets/data/tours.js (e.g. 'classic')
  start_date   date not null,
  capacity     int  not null default 50 check (capacity between 1 and 200),
  booked       int  not null default 0  check (booked >= 0),
  price_pp     numeric(10,2),                       -- public price per person, twin share (USD)
  single_supp  numeric(10,2),                       -- public single-room supplement (USD)
  guides       int  not null default 2 check (guides between 1 and 10),
  guide_lang   text not null default 'English',
  status       text not null default 'open' check (status in ('open','guaranteed','full','cancelled')),
  published    boolean not null default false,      -- false = draft, visible to admins only
  note         text,                                -- short public note (optional)
  admin_note   text,                                -- internal
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists group_departures_date_idx on public.group_departures(start_date);

alter table public.group_departures enable row level security;

drop policy if exists group_departures_public_read on public.group_departures;
create policy group_departures_public_read on public.group_departures for select to anon, authenticated
  using (published and start_date >= current_date and status <> 'cancelled');

drop policy if exists group_departures_admin on public.group_departures;
create policy group_departures_admin on public.group_departures for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Visitors may read only these columns (never the internal note)
revoke all on public.group_departures from anon;
grant select (id, tour_id, start_date, capacity, booked, price_pp, single_supp, guides, guide_lang, status, published, note)
  on public.group_departures to anon;
grant select, insert, update, delete on public.group_departures to authenticated;

-- ---------------------------------------------------------------- seat requests
alter table public.site_requests drop constraint if exists site_requests_kind_check;
alter table public.site_requests add constraint site_requests_kind_check check (kind in ('tour','service','group'));

create or replace function public.submit_site_request(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_ref   text;
  v_kind  text := p->>'kind';
  v_phone text := left(trim(coalesce(p->>'phone', '')), 40);
  v_name  text := left(trim(coalesce(p->>'contact_name', '')), 120);
  v_tr    jsonb := coalesce(p->'travellers', '[]'::jsonb);
begin
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'consent_required'; end if;
  if v_kind not in ('tour','service','group') then raise exception 'bad_kind'; end if;
  if length(v_name) < 2 or length(v_phone) < 6 then raise exception 'contact_required'; end if;
  if jsonb_typeof(v_tr) <> 'array' or jsonb_array_length(v_tr) > 60 then raise exception 'bad_travellers'; end if;
  if length(coalesce(p->>'message', '')) > 3000 or length(p::text) > 30000 then raise exception 'too_long'; end if;
  if (select count(*) from site_requests where phone = v_phone and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'too_many_requests';
  end if;
  insert into site_requests (kind, service, tour_id, tour_title, start_date, end_date, pax, contact_name, email, phone,
                             messenger, citizenship, travellers, details, message, pay_method, lang)
  values (v_kind,
          left(p->>'service', 30), left(p->>'tour_id', 40), left(p->>'tour_title', 200),
          nullif(p->>'start_date', '')::date, nullif(p->>'end_date', '')::date,
          nullif(p->>'pax', '')::int,
          v_name, left(nullif(trim(coalesce(p->>'email', '')), ''), 160), v_phone,
          left(p->>'messenger', 40), left(p->>'citizenship', 80),
          v_tr, coalesce(p->'details', '{}'::jsonb), left(p->>'message', 3000),
          case when p->>'pay_method' in ('bank','card','contact') then p->>'pay_method' end,
          left(p->>'lang', 5))
  returning ref into v_ref;
  return v_ref;
end $$;
revoke all on function public.submit_site_request(jsonb) from public;
grant execute on function public.submit_site_request(jsonb) to anon, authenticated;
