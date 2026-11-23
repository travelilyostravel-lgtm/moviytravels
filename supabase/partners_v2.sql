-- 2026-11-24 (founder): competition between guides — TOP-4, views / likes / shares counters, age and home location.
alter table public.partners
  add column if not exists views_count int not null default 0,
  add column if not exists likes_count int not null default 0,
  add column if not exists shares_count int not null default 0,
  add column if not exists birth_year int,
  add column if not exists home_area text,      -- public: city and district where the partner lives
  add column if not exists home_address text;   -- private: full address (only founder / managers see it)

-- one view per visitor per day, one like per visitor, one share per visitor per day (no cheating with reloads)
create table if not exists public.partner_hits (
  partner_id uuid not null references public.partners(id) on delete cascade,
  vid text not null, kind text not null check (kind in ('view','like','share')),
  day date not null default current_date,
  primary key (partner_id, vid, kind, day));
alter table public.partner_hits enable row level security;

create or replace function public.partner_hit(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pid uuid; k text := coalesce(p->>'kind', ''); v text := left(coalesce(p->>'vid', ''), 64); n int; r public.partners;
begin
  begin pid := (p->>'id')::uuid; exception when others then raise exception 'bad id'; end;
  if length(v) < 8 then raise exception 'bad visitor'; end if;
  if k not in ('view', 'like', 'unlike', 'share', 'get') then raise exception 'bad kind'; end if;
  if not exists (select 1 from public.partners where id = pid and status = 'approved') then raise exception 'not found'; end if;
  if k = 'unlike' then
    delete from public.partner_hits where partner_id = pid and vid = v and kind = 'like';
    get diagnostics n = row_count;
    if n > 0 then update public.partners set likes_count = greatest(likes_count - 1, 0) where id = pid; end if;
  elsif k <> 'get' then
    insert into public.partner_hits (partner_id, vid, kind, day)
      values (pid, v, k, case when k = 'like' then date '2000-01-01' else current_date end) on conflict do nothing;
    get diagnostics n = row_count;
    if n > 0 then
      update public.partners set views_count = views_count + (k = 'view')::int, likes_count = likes_count + (k = 'like')::int,
             shares_count = shares_count + (k = 'share')::int where id = pid;
    end if;
  end if;
  select * into r from public.partners where id = pid;
  return jsonb_build_object('views', r.views_count, 'likes', r.likes_count, 'shares', r.shares_count,
    'liked', exists (select 1 from public.partner_hits where partner_id = pid and vid = v and kind = 'like'));
end $$;
grant execute on function public.partner_hit(jsonb) to anon, authenticated;

-- public card: new columns appended (age instead of birth year; full address never public)
create or replace view public.partners_public as
  select id, kind, name, city, cities, languages, specialties, bio, photo, photos, price_day, price_note,
         vehicle_type, vehicle_seats, vehicle_year, hotel_stars, hotel_rooms, experience_years,
         license_ok, rating, reviews_count, trips_count, featured, approved_at,
         views_count, likes_count, shares_count,
         case when birth_year is not null then extract(year from now())::int - birth_year end as age,
         home_area
    from public.partners where status = 'approved';
grant select on public.partners_public to anon, authenticated;

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
    birth_year = case when p ? 'birth_year' then (select y from (select nullif(p->>'birth_year', '')::int y) s where y between 1940 and extract(year from now())::int - 18) else birth_year end,
    home_area = case when p ? 'home_area' then left(p->>'home_area', 120) else home_area end,
    home_address = case when p ? 'home_address' then left(p->>'home_address', 250) else home_address end,
    updated_at = now()
  where id = me.id;
end $$;
grant execute on function public.partner_save(jsonb) to authenticated;
select 'ok' as result;
