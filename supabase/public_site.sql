-- =====================================================================
-- Moviy Nomad — public website: B2C bookings, service requests, traveller posts
-- Run once in Supabase → SQL Editor (after schema.sql). Safe to re-run.
-- Visitors never read or write tables directly: they call the two
-- functions below, which validate input and always save as "new"/"pending".
-- =====================================================================

-- ---------------------------------------------------------------- requests
create sequence if not exists public.request_ref_seq start 1001;

create table if not exists public.site_requests (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique not null default ('MR-' || to_char(now(), 'YY') || '-' || nextval('public.request_ref_seq')),
  kind          text not null check (kind in ('tour','service')),
  service       text,                         -- airport, transfer, car, hotel, train, guide, mice
  tour_id       text,
  tour_title    text,
  start_date    date,
  end_date      date,
  pax           int check (pax between 1 and 500),
  contact_name  text not null,
  email         text,
  phone         text not null,
  messenger     text,
  citizenship   text,
  travellers    jsonb not null default '[]'::jsonb,   -- names, birth dates, citizenship (no passport numbers)
  details       jsonb not null default '{}'::jsonb,
  message       text,
  pay_method    text check (pay_method in ('bank','card','contact')),
  lang          text,
  status        text not null default 'new'
                check (status in ('new','in_progress','awaiting_payment','paid','confirmed','closed','cancelled')),
  admin_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists site_requests_created_idx on public.site_requests(created_at desc);
create index if not exists site_requests_phone_idx on public.site_requests(phone, created_at desc);

alter table public.site_requests enable row level security;
drop policy if exists site_requests_admin on public.site_requests;
create policy site_requests_admin on public.site_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

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
  if v_kind not in ('tour','service') then raise exception 'bad_kind'; end if;
  if length(v_name) < 2 or length(v_phone) < 6 then raise exception 'contact_required'; end if;
  if jsonb_typeof(v_tr) <> 'array' or jsonb_array_length(v_tr) > 60 then raise exception 'bad_travellers'; end if;
  if length(coalesce(p->>'message', '')) > 3000 or length(p::text) > 30000 then raise exception 'too_long'; end if;
  -- simple flood protection: max 5 requests from one phone in 10 minutes
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

-- ---------------------------------------------------------------- traveller posts
create table if not exists public.traveller_posts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(name) between 2 and 60),
  country      text check (length(country) <= 60),
  trip         text check (length(trip) <= 120),
  body         text not null check (length(body) between 10 and 1500),
  rating       int check (rating between 1 and 5),
  photos       text[] not null default '{}',
  lang         text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);
create index if not exists traveller_posts_status_idx on public.traveller_posts(status, created_at desc);

alter table public.traveller_posts enable row level security;
drop policy if exists traveller_posts_public_read on public.traveller_posts;
create policy traveller_posts_public_read on public.traveller_posts for select to anon, authenticated
  using (status = 'approved');
drop policy if exists traveller_posts_admin on public.traveller_posts;
create policy traveller_posts_admin on public.traveller_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_traveller_post(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_photos text[] := coalesce(array(select jsonb_array_elements_text(coalesce(p->'photos', '[]'::jsonb))), '{}');
  ph text;
begin
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'consent_required'; end if;
  if array_length(v_photos, 1) > 6 then raise exception 'too_many_photos'; end if;
  foreach ph in array v_photos loop
    if ph !~ '^u/[A-Za-z0-9_.\-]+$' then raise exception 'bad_photo'; end if;
  end loop;
  if (select count(*) from traveller_posts where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'too_many_requests';
  end if;
  insert into traveller_posts (name, country, trip, body, rating, photos, lang)
  values (left(trim(p->>'name'), 60), left(trim(p->>'country'), 60), left(trim(p->>'trip'), 120),
          left(trim(p->>'body'), 1500), nullif(p->>'rating', '')::int, v_photos, left(p->>'lang', 5))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_traveller_post(jsonb) from public;
grant execute on function public.submit_traveller_post(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------- photo storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('traveller-photos', 'traveller-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "traveller photos upload" on storage.objects;
create policy "traveller photos upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'traveller-photos' and (storage.foldername(name))[1] = 'u');
drop policy if exists "traveller photos admin" on storage.objects;
create policy "traveller photos admin" on storage.objects for delete to authenticated
  using (bucket_id = 'traveller-photos' and public.is_admin());

-- ---------------------------------------------------------------- privileges
-- Visitors (anon) may only read stories; RLS above limits them to approved ones.
grant select on public.traveller_posts to anon;
-- Staff (authenticated) — RLS above limits this to admins.
grant select, insert, update, delete on public.site_requests, public.traveller_posts to authenticated;
-- Storage needs SELECT as well as DELETE for remove() to work.
drop policy if exists "traveller photos admin read" on storage.objects;
create policy "traveller photos admin read" on storage.objects for select to authenticated
  using (bucket_id = 'traveller-photos' and public.is_admin());
