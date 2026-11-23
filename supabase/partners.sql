-- Moviy Nomad — PARTNERS (guides, drivers/transport, hotels, other services) — 2026-11-23
-- 1) A partner registers in the partner portal (/partner/) → status "pending".
-- 2) The founder checks documents in admin → "Hamkorlar" and approves (or rejects / pauses).
-- 3) Only approved partners fill/publish their profile and appear on the site (moviy-travel.uz/…/partners.html).
-- 4) Travellers ask for a partner's service THROUGH Moviy Nomad (a normal site request) — contacts are never public.
-- 5) Only real travellers leave reviews: booking number + the e-mail of that booking must match a paid trip.
-- 6) Ranking: featured first, then rating weighted by number of reviews, then verified trips.

create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('guide','driver','hotel','other')),
  status        text not null default 'pending' check (status in ('pending','approved','rejected','paused')),
  name          text not null,                 -- person or business name shown on the site
  company       text,                          -- legal name (if a company)
  inn           text,
  license_no    text,                          -- guide ID card / hotel certificate / transport licence
  license_ok    boolean not null default false,-- founder checked it in the state registry
  phone         text, whatsapp text, email text,
  city          text,
  cities        text[] not null default '{}',
  languages     text[] not null default '{}',
  specialties   text[] not null default '{}',
  bio           text,
  photo         text,                          -- public path in bucket partner-photos
  photos        text[] not null default '{}',
  price_day     numeric(10,2),                 -- USD per day (guide/driver) or per night (hotel)
  price_note    text,
  vehicle_type  text, vehicle_seats int, vehicle_year int,
  hotel_stars   int, hotel_rooms int,
  experience_years int,
  docs          jsonb not null default '[]'::jsonb,
  rating        numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  trips_count   int not null default 0,         -- trips done with Moviy Nomad (founder sets)
  featured      boolean not null default false,
  admin_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  approved_at   timestamptz
);
create index if not exists partners_status on public.partners (status, kind);

create table if not exists public.partner_reviews (
  id          bigserial primary key,
  partner_id  uuid not null references public.partners(id) on delete cascade,
  created_at  timestamptz not null default now(),
  name        text not null,
  country     text,
  rating      int not null check (rating between 1 and 5),
  body        text,
  trip_ref    text not null,
  email       text not null,
  status      text not null default 'pending' check (status in ('pending','approved','rejected'))
);
create index if not exists partner_reviews_p on public.partner_reviews (partner_id, status);

alter table public.partners enable row level security;
alter table public.partner_reviews enable row level security;
drop policy if exists partners_own_read on public.partners;
create policy partners_own_read on public.partners for select to authenticated using (user_id = auth.uid() or public.is_admin() or public.is_manager());
drop policy if exists partners_admin_all on public.partners;
create policy partners_admin_all on public.partners for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists partner_reviews_staff on public.partner_reviews;
create policy partner_reviews_staff on public.partner_reviews for select to authenticated using (public.is_admin() or public.is_manager());
drop policy if exists partner_reviews_admin on public.partner_reviews;
create policy partner_reviews_admin on public.partner_reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.partners, public.partner_reviews to authenticated;
grant usage, select on sequence public.partner_reviews_id_seq to authenticated;

-- what visitors may see: approved partners only, no contacts / documents
create or replace view public.partners_public as
  select id, kind, name, city, cities, languages, specialties, bio, photo, photos, price_day, price_note,
         vehicle_type, vehicle_seats, vehicle_year, hotel_stars, hotel_rooms, experience_years,
         license_ok, rating, reviews_count, trips_count, featured, approved_at
    from public.partners where status = 'approved';
create or replace view public.partner_reviews_public as
  select r.id, r.partner_id, r.created_at, r.name, r.country, r.rating, r.body
    from public.partner_reviews r join public.partners p on p.id = r.partner_id
   where r.status = 'approved' and p.status = 'approved';
grant select on public.partners_public, public.partner_reviews_public to anon, authenticated;

-- partner saves his own profile (status / rating / checks stay with the founder)
create or replace function public.partner_save(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare me public.partners;
begin
  select * into me from public.partners where user_id = auth.uid();
  if not found then raise exception 'not a partner'; end if;
  update public.partners set
    name = coalesce(nullif(left(trim(p->>'name'), 120), ''), name),
    company = left(p->>'company', 160), inn = left(p->>'inn', 30), license_no = left(p->>'license_no', 80),
    phone = left(p->>'phone', 40), whatsapp = left(p->>'whatsapp', 40),
    city = left(p->>'city', 80),
    cities = coalesce((select array_agg(left(x, 60)) from jsonb_array_elements_text(coalesce(p->'cities', '[]')) x), '{}'),
    languages = coalesce((select array_agg(left(x, 30)) from jsonb_array_elements_text(coalesce(p->'languages', '[]')) x), '{}'),
    specialties = coalesce((select array_agg(left(x, 40)) from jsonb_array_elements_text(coalesce(p->'specialties', '[]')) x), '{}'),
    bio = left(p->>'bio', 1500),
    photo = left(p->>'photo', 300),
    photos = coalesce((select array_agg(left(x, 300)) from (select x from jsonb_array_elements_text(coalesce(p->'photos', '[]')) x limit 8) s), '{}'),
    price_day = nullif(p->>'price_day', '')::numeric, price_note = left(p->>'price_note', 200),
    vehicle_type = left(p->>'vehicle_type', 60), vehicle_seats = nullif(p->>'vehicle_seats', '')::int, vehicle_year = nullif(p->>'vehicle_year', '')::int,
    hotel_stars = nullif(p->>'hotel_stars', '')::int, hotel_rooms = nullif(p->>'hotel_rooms', '')::int,
    experience_years = nullif(p->>'experience_years', '')::int,
    docs = coalesce(p->'docs', docs),
    updated_at = now()
  where id = me.id;
end $$;
grant execute on function public.partner_save(jsonb) to authenticated;

-- a real traveller reviews a partner (booking number + e-mail of a paid trip)
create or replace function public.submit_partner_review(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare em text := lower(trim(p->>'email')); rf text := upper(trim(p->>'trip_ref')); pid uuid := (p->>'partner_id')::uuid; r int := (p->>'rating')::int;
begin
  if r is null or r < 1 or r > 5 then raise exception 'bad_rating'; end if;
  if not exists (select 1 from public.partners where id = pid and status = 'approved') then raise exception 'bad_partner'; end if;
  if not exists (select 1 from public.site_requests where upper(ref) = rf and lower(email) = em
                 and status in ('deposit_paid','paid','confirmed','closed')) then
    raise exception 'not_verified';
  end if;
  if exists (select 1 from public.partner_reviews where partner_id = pid and upper(trip_ref) = rf) then raise exception 'already'; end if;
  insert into public.partner_reviews (partner_id, name, country, rating, body, trip_ref, email)
  values (pid, left(coalesce(nullif(trim(p->>'name'), ''), 'Traveller'), 80), left(p->>'country', 60), r, left(p->>'body', 1500), rf, em);
  return 'ok';
end $$;
grant execute on function public.submit_partner_review(jsonb) to anon, authenticated;

-- keep rating up to date when the founder approves / rejects reviews
create or replace function public.partner_rating_refresh() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.partner_id, old.partner_id);
begin
  update public.partners set
    rating = coalesce((select round(avg(rating)::numeric, 2) from public.partner_reviews where partner_id = pid and status = 'approved'), 0),
    reviews_count = (select count(*) from public.partner_reviews where partner_id = pid and status = 'approved')
  where id = pid;
  return null;
end $$;
drop trigger if exists partner_reviews_rating on public.partner_reviews;
create trigger partner_reviews_rating after insert or update or delete on public.partner_reviews
  for each row execute function public.partner_rating_refresh();

-- sign-up: a partner gets a partners row (no agent profile)
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
  if coalesce(m->>'partner_kind', '') in ('guide','driver','hotel','other') then
    insert into public.partners (user_id, kind, name, company, phone, whatsapp, email, city, license_no, inn)
    values (new.id, m->>'partner_kind', left(coalesce(nullif(m->>'partner_name', ''), new.email), 120), left(m->>'company', 160),
            left(m->>'phone', 40), left(m->>'whatsapp', 40), new.email, left(m->>'city', 80), left(m->>'license_no', 80), left(m->>'inn', 30))
    on conflict (user_id) do nothing;
    return new;
  end if;
  if coalesce(m->>'agency_name', '') <> '' then
    insert into public.agencies (name, country, city, address, website, license_no, tax_id, contact_name, phone, whatsapp, email)
    values (m->>'agency_name', coalesce(m->>'country', ''), m->>'city', m->>'address', m->>'website', m->>'license_no', m->>'tax_id',
            coalesce(m->>'contact_name', ''), m->>'phone', m->>'whatsapp', new.email)
    returning id into ag;
  end if;
  if ag is null and coalesce(new.raw_app_meta_data->>'provider', 'email') <> 'email' then return new; end if;
  insert into public.profiles (id, role, agency_id, full_name, email)
  values (new.id, 'agent', ag, m->>'contact_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;

-- photos (public) and documents (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partner-photos', 'partner-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('partner-docs', 'partner-docs', false) on conflict (id) do nothing;

create or replace function public.my_partner() returns uuid
language sql stable security definer set search_path = public as $$ select id from public.partners where user_id = auth.uid() $$;
grant execute on function public.my_partner() to authenticated;

drop policy if exists partner_files_insert on storage.objects;
create policy partner_files_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('partner-photos','partner-docs') and (public.is_admin() or (storage.foldername(name))[1] = public.my_partner()::text));
drop policy if exists partner_files_select on storage.objects;
create policy partner_files_select on storage.objects for select to authenticated using (
  bucket_id in ('partner-photos','partner-docs') and (public.is_admin() or (storage.foldername(name))[1] = public.my_partner()::text));
drop policy if exists partner_files_delete on storage.objects;
create policy partner_files_delete on storage.objects for delete to authenticated using (
  bucket_id in ('partner-photos','partner-docs') and (public.is_admin() or (storage.foldername(name))[1] = public.my_partner()::text));
