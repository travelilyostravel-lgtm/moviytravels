-- 2026-11-27 (founder): "Ovqatlar" — restaurants, cafés and tea-houses across Uzbekistan for travellers.
-- Base data: OpenStreetMap (open data, © OpenStreetMap contributors, ODbL) read by the database itself from the Overpass API,
-- one region per hour, every region refreshed weekly. Admin adds photos, menu, "halal confirmed", hides or pins places,
-- or adds a restaurant by hand. Visitors only read.

create extension if not exists pg_net;

create table if not exists public.restaurants (
  id          bigserial primary key,
  source      text not null default 'manual',          -- osm | manual
  ext_id      text,                                    -- node/123 | way/456
  region      text not null,                           -- tashkent_city | tashkent | samarkand | bukhara | khorezm | karakalpakstan | andijan | fergana | namangan | kashkadarya | surkhandarya | jizzakh | syrdarya | navoi
  city        text,
  name        jsonb not null default '{}'::jsonb,      -- {"default": "...", "en": "...", "ru": "...", "uz": "..."}
  kind        text,                                    -- restaurant | cafe | fast_food | food_court
  cuisine     text,                                    -- raw OSM value, e.g. "uzbek;regional"
  cat         text not null default 'other',           -- national | european | asian | middle | fastfood | cafe | other
  halal       text,                                    -- yes | no | null (unknown)
  halal_ok    boolean not null default false,          -- confirmed by Moviy Nomad (admin)
  lat         double precision,
  lon         double precision,
  address     text,
  phone       text,
  website     text,
  instagram   text,
  hours       text,
  photos      text[] not null default '{}',            -- admin uploads
  menu        jsonb not null default '[]'::jsonb,      -- [{"name": {...}, "price": 45000, "photo": "..."}]
  about       jsonb not null default '{}'::jsonb,      -- short text per language
  price_level int,                                     -- 1..4, admin
  pinned      boolean not null default false,
  hidden      boolean not null default false,
  score       int not null default 0,                  -- completeness, for ordering
  updated_at  timestamptz not null default now(),
  seen_at     timestamptz
);
create unique index if not exists restaurants_src_ext on public.restaurants (source, ext_id) where ext_id is not null;
create index if not exists restaurants_region on public.restaurants (region, cat);

alter table public.restaurants enable row level security;
drop policy if exists restaurants_public on public.restaurants;
create policy restaurants_public on public.restaurants for select to anon, authenticated using (not hidden);
drop policy if exists restaurants_staff on public.restaurants;
create policy restaurants_staff on public.restaurants for all to authenticated
  using (public.is_admin() or public.is_manager()) with check (public.is_admin() or public.is_manager());
grant select on public.restaurants to anon, authenticated;
grant insert, update, delete on public.restaurants to authenticated;
grant usage, select on sequence public.restaurants_id_seq to authenticated;

-- regions and their OSM codes
create table if not exists public.food_regions (
  region      text primary key,
  iso         text not null,
  fetched_at  timestamptz,
  request_id  bigint,
  last_count  int
);
alter table public.food_regions enable row level security;
insert into public.food_regions (region, iso) values
 ('tashkent_city','UZ-TK'),('tashkent','UZ-TO'),('samarkand','UZ-SA'),('bukhara','UZ-BU'),('khorezm','UZ-XO'),('karakalpakstan','UZ-QR'),
 ('andijan','UZ-AN'),('fergana','UZ-FA'),('namangan','UZ-NG'),('kashkadarya','UZ-QA'),('surkhandarya','UZ-SU'),('jizzakh','UZ-JI'),
 ('syrdarya','UZ-SI'),('navoi','UZ-NW')
on conflict (region) do nothing;

create or replace function public.food_cat(p_kind text, p_cuisine text) returns text language sql immutable as $$
  select case
    when coalesce(p_cuisine,'') ~* '(uzbek|regional|local|plov|pilaf|central_asian|uyghur|karakalpak|shashlik|tandoor|samsa|national|tea_house|chaikhana)' then 'national'
    when coalesce(p_cuisine,'') ~* '(korean|chinese|japanese|sushi|thai|vietnam|asian|indian|noodle|ramen|wok|pan_asian|dumpling)' then 'asian'
    when coalesce(p_cuisine,'') ~* '(turkish|arab|lebanese|middle_eastern|georgian|caucasian|azerbaijani|persian|iranian|syrian|kebab|doner|halal)' then 'middle'
    when coalesce(p_cuisine,'') ~* '(italian|pizza|french|european|steak|german|mediterranean|greek|spanish|russian|ukrainian|international|fish|seafood|grill|american)' then 'european'
    when p_kind = 'fast_food' or coalesce(p_cuisine,'') ~* '(burger|chicken|sandwich|shawarma|hot_dog|fast_food|fries)' then 'fastfood'
    when p_kind = 'cafe' or coalesce(p_cuisine,'') ~* '(coffee|cake|dessert|ice_cream|bakery|pastry|tea|crepe|waffle)' then 'cafe'
    else 'other' end;
$$;

-- one step every hour: save any finished answer, then ask Overpass for the next region that is older than 7 days
create or replace function public.food_fetch_tick() returns text
language plpgsql security definer set search_path = public, net as $$
declare r record; j jsonb; e jsonb; t jsonb; n int; nxt record; v_name jsonb; v_cui text; v_kind text; v_id text;
begin
  for r in select fr.*, hr.status_code, hr.content from public.food_regions fr join net._http_response hr on hr.id = fr.request_id loop
    update public.food_regions set request_id = null where region = r.region;
    if r.status_code <> 200 or r.content is null then continue; end if;
    begin j := r.content::jsonb; exception when others then continue; end;
    n := 0;
    for e in select * from jsonb_array_elements(coalesce(j->'elements', '[]'::jsonb)) loop
      t := coalesce(e->'tags', '{}'::jsonb);
      if coalesce(t->>'name', '') = '' then continue; end if;
      v_id := (e->>'type') || '/' || (e->>'id'); v_kind := t->>'amenity'; v_cui := lower(t->>'cuisine');
      v_name := jsonb_strip_nulls(jsonb_build_object('default', t->>'name', 'en', t->>'name:en', 'ru', t->>'name:ru', 'uz', t->>'name:uz'));
      insert into public.restaurants as x (source, ext_id, region, city, name, kind, cuisine, cat, halal, lat, lon, address, phone, website, instagram, hours, score, seen_at, updated_at)
      values ('osm', v_id, r.region, nullif(coalesce(t->>'addr:city', t->>'addr:place'), ''), v_name, v_kind, v_cui, public.food_cat(v_kind, v_cui),
              case when t->>'diet:halal' in ('yes','only') then 'yes' when t->>'diet:halal' = 'no' then 'no' end,
              coalesce((e->>'lat')::float8, (e#>>'{center,lat}')::float8), coalesce((e->>'lon')::float8, (e#>>'{center,lon}')::float8),
              nullif(trim(concat_ws(', ', t->>'addr:street', t->>'addr:housenumber')), ''),
              left(coalesce(t->>'phone', t->>'contact:phone'), 60), left(coalesce(t->>'website', t->>'contact:website'), 300),
              left(coalesce(t->>'contact:instagram', t->>'instagram'), 200), left(t->>'opening_hours', 200),
              (case when v_cui is not null then 3 else 0 end) + (case when coalesce(t->>'phone', t->>'contact:phone') is not null then 2 else 0 end)
              + (case when t ? 'opening_hours' then 2 else 0 end) + (case when t ? 'addr:street' then 1 else 0 end)
              + (case when coalesce(t->>'website', t->>'contact:website', t->>'contact:instagram') is not null then 1 else 0 end) + (case when v_kind = 'restaurant' then 1 else 0 end),
              now(), now())
      on conflict (source, ext_id) where ext_id is not null do update set
        region = excluded.region, city = coalesce(excluded.city, x.city), name = excluded.name, kind = excluded.kind, cuisine = excluded.cuisine, cat = excluded.cat,
        halal = coalesce(excluded.halal, x.halal), lat = excluded.lat, lon = excluded.lon, address = coalesce(excluded.address, x.address),
        phone = coalesce(excluded.phone, x.phone), website = coalesce(excluded.website, x.website), instagram = coalesce(excluded.instagram, x.instagram),
        hours = coalesce(excluded.hours, x.hours), score = excluded.score, seen_at = now();
      n := n + 1;
    end loop;
    update public.food_regions set fetched_at = now(), last_count = n where region = r.region;
    -- places that OSM no longer lists for this region (closed) disappear after the next refresh
    update public.restaurants set hidden = true where source = 'osm' and region = r.region and seen_at < now() - interval '20 days' and not hidden;
  end loop;
  if exists (select 1 from public.food_regions where request_id is not null) then return 'waiting'; end if;
  select * into nxt from public.food_regions where fetched_at is null or fetched_at < now() - interval '7 days' order by fetched_at nulls first limit 1;
  if not found then return 'all fresh'; end if;
  update public.food_regions set request_id = net.http_get(
      url := 'https://overpass-api.de/api/interpreter?data=' || replace('%5Bout%3Ajson%5D%5Btimeout%3A170%5D%3Barea%5B%22ISO3166-2%22%3D%22{R}%22%5D-%3E.a%3B%28node%5B%22amenity%22~%22%5E%28restaurant%7Ccafe%7Cfast_food%7Cfood_court%29%24%22%5D%5B%22name%22%5D%28area.a%29%3Bway%5B%22amenity%22~%22%5E%28restaurant%7Ccafe%7Cfast_food%7Cfood_court%29%24%22%5D%5B%22name%22%5D%28area.a%29%3B%29%3Bout%20center%20tags%3B', '{R}', nxt.iso),
      headers := '{"User-Agent":"MoviyNomad/1.0 (moviy-travel.uz)"}'::jsonb, timeout_milliseconds := 180000)
   where region = nxt.region;
  return 'asked ' || nxt.region;
end $$;
revoke all on function public.food_fetch_tick() from public, anon, authenticated;

do $$ begin perform cron.unschedule(jobid) from cron.job where jobname = 'food_fetch_tick'; exception when others then null; end $$;
select cron.schedule('food_fetch_tick', '23 * * * *', $$select public.food_fetch_tick()$$);

-- counts per region and category for the page (no need to download every row for the overview)
create or replace function public.food_counts() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(region, cats), '{}'::jsonb) from (
    select region, jsonb_object_agg(cat, c) || jsonb_build_object('_all', sum(c)) as cats
      from (select region, cat, count(*) c from public.restaurants where not hidden group by 1, 2) z group by region) y;
$$;
grant execute on function public.food_counts() to anon, authenticated;

-- admin "update now"
create or replace function public.admin_food_tick() returns text
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not_allowed'; end if;
  return public.food_fetch_tick();
end $$;
grant execute on function public.admin_food_tick() to authenticated;

select public.food_fetch_tick() as result;
