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
alter table public.restaurants add column if not exists cat_fixed boolean not null default false;
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
  last_count  int,
  tries       int not null default 0
);
alter table public.food_regions add column if not exists tries int not null default 0;
alter table public.food_regions enable row level security;
drop policy if exists food_regions_staff on public.food_regions;
create policy food_regions_staff on public.food_regions for select to authenticated using (public.is_admin() or public.is_manager());
grant select on public.food_regions to authenticated;
insert into public.food_regions (region, iso) values
 ('tashkent_city','UZ-TK'),('tashkent','UZ-TO'),('samarkand','UZ-SA'),('bukhara','UZ-BU'),('khorezm','UZ-XO'),('karakalpakstan','UZ-QR'),
 ('andijan','UZ-AN'),('fergana','UZ-FA'),('namangan','UZ-NG'),('kashkadarya','UZ-QA'),('surkhandarya','UZ-SU'),('jizzakh','UZ-JI'),
 ('syrdarya','UZ-SI'),('navoi','UZ-NW')
on conflict (region) do nothing;

drop function if exists public.food_cat(text, text);
create or replace function public.food_cat(p_kind text, p_cuisine text, p_name text default null) returns text language sql immutable as $$
  select case
    when coalesce(p_cuisine,'') ~* '(uzbek|regional|local|plov|pilaf|central_asian|uyghur|karakalpak|shashlik|tandoor|samsa|national|tea_house|chaikhana)' then 'national'
    when coalesce(p_cuisine,'') ~* '(korean|chinese|japanese|sushi|thai|vietnam|asian|indian|noodle|ramen|wok|pan_asian|dumpling)' then 'asian'
    when coalesce(p_cuisine,'') ~* '(turkish|arab|lebanese|middle_eastern|georgian|caucasian|azerbaijani|persian|iranian|syrian|kebab|doner|halal)' then 'middle'
    when coalesce(p_cuisine,'') ~* '(italian|pizza|french|european|steak|german|mediterranean|greek|spanish|russian|ukrainian|international|fish|seafood|grill|american)' then 'european'
    when coalesce(p_cuisine,'') ~* '(burger|chicken|sandwich|shawarma|hot_dog|fast_food|fries)' then 'fastfood'
    -- no cuisine tag: guess from the name (most local places have no tag)
    when coalesce(p_name,'') ~* '(oshxona|choyxona|osh markaz|palov|plov|milliy|somsa|samsa|tandir|shashlik|kabob|lag.?mon|norin|чайхан|ошхон|плов|самса|шашлык|национал|узбек|o.zbek)' then 'national'
    when coalesce(p_name,'') ~* '(sushi|суши|korea|корей|kimchi|china|китай|chinese|japan|япон|wok|вок|ramen|рамен|thai|asia|ази)' then 'asian'
    when coalesce(p_name,'') ~* '(turk|тур[ец]|türk|istanbul|стамбул|doner|донер|kebab|кебаб|arab|араб|lebanon|ливан|georgia|грузи|хинкал|xinkal|khinkal|baku|баку)' then 'middle'
    when coalesce(p_name,'') ~* '(pizza|пицц|italia|итали|pasta|паста|steak|стейк|grill|гриль|bistro|бистро|trattoria|europe|европ|french|франц)' then 'european'
    when p_kind = 'fast_food' or coalesce(p_name,'') ~* '(burger|бургер|lavash|лаваш|shawarma|шаурм|hot.?dog|хот.?дог|kfc|evos|oqtepa|chicken|чикен|fast.?food|фаст)' then 'fastfood'
    when p_kind = 'cafe' or coalesce(p_cuisine,'') ~* '(coffee|cake|dessert|ice_cream|bakery|pastry|tea|crepe|waffle)'
         or coalesce(p_name,'') ~* '(coffee|кофе|kofe|cafe|кафе|kafe|bakery|пекарн|desert|десерт|cake|торт|tort)' then 'cafe'
    else 'other' end;
$$;

-- one step every hour: save any finished answer, then ask Overpass for the next region that is older than 7 days
-- save one Overpass answer for a region (used by the hourly step and by a manual load)
create or replace function public.food_ingest(p_region text, j jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare e jsonb; t jsonb; n int := 0; v_name jsonb; v_cui text; v_kind text; v_id text;
begin
  for e in select * from jsonb_array_elements(coalesce(j->'elements', '[]'::jsonb)) loop
    t := coalesce(e->'tags', '{}'::jsonb);
    if coalesce(t->>'name', '') = '' then continue; end if;
    v_id := (e->>'type') || '/' || (e->>'id'); v_kind := t->>'amenity'; v_cui := lower(t->>'cuisine');
    v_name := jsonb_strip_nulls(jsonb_build_object('default', t->>'name', 'en', t->>'name:en', 'ru', t->>'name:ru', 'uz', t->>'name:uz'));
    insert into public.restaurants as x (source, ext_id, region, city, name, kind, cuisine, cat, halal, lat, lon, address, phone, website, instagram, hours, score, seen_at, updated_at)
    values ('osm', v_id, p_region, nullif(coalesce(t->>'addr:city', t->>'addr:place'), ''), v_name, v_kind, v_cui, public.food_cat(v_kind, v_cui, t->>'name'),
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
      region = excluded.region, city = coalesce(excluded.city, x.city), name = excluded.name, kind = excluded.kind, cuisine = excluded.cuisine, cat = case when x.cat_fixed then x.cat else excluded.cat end,
      halal = coalesce(excluded.halal, x.halal), lat = excluded.lat, lon = excluded.lon, address = coalesce(excluded.address, x.address),
      phone = coalesce(excluded.phone, x.phone), website = coalesce(excluded.website, x.website), instagram = coalesce(excluded.instagram, x.instagram),
      hours = coalesce(excluded.hours, x.hours), score = excluded.score, seen_at = now();
    n := n + 1;
  end loop;
  update public.food_regions set fetched_at = now(), last_count = n, tries = 0, request_id = null where region = p_region;
  update public.restaurants set hidden = true where source = 'osm' and region = p_region and seen_at < now() - interval '20 days' and not hidden;
  perform public.food_rank(p_region);
  return n;
end $$;
revoke all on function public.food_ingest(text, jsonb) from public, anon, authenticated;

-- one step every hour: save any finished answer, then ask Overpass for the next region that is older than 7 days
create or replace function public.food_fetch_tick() returns text
language plpgsql security definer set search_path = public, net as $$
declare r record; j jsonb; nxt record;
begin
  for r in select fr.*, hr.status_code, hr.content from public.food_regions fr join net._http_response hr on hr.id = fr.request_id loop
    update public.food_regions set request_id = null where region = r.region;
    if r.status_code <> 200 or r.content is null then update public.food_regions set tries = tries + 1 where region = r.region; continue; end if;
    begin j := r.content::jsonb; exception when others then update public.food_regions set tries = tries + 1 where region = r.region; continue; end;
    -- a busy server answers 200 with a "remark" and no places: try again later instead of saving an empty region
    if jsonb_array_length(coalesce(j->'elements', '[]'::jsonb)) = 0 then update public.food_regions set tries = tries + 1 where region = r.region; continue; end if;
    perform public.food_ingest(r.region, j);
  end loop;
  if exists (select 1 from public.food_regions where request_id is not null) then return 'waiting'; end if;
  select * into nxt from public.food_regions where fetched_at is null or fetched_at < now() - interval '7 days' order by fetched_at nulls first, tries, region limit 1;
  if not found then return 'all fresh'; end if;
  update public.food_regions set request_id = net.http_get(
      url := (array['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'])[1 + nxt.tries % 3] || '?data=' || replace('%5Bout%3Ajson%5D%5Btimeout%3A170%5D%3Barea%5B%22ISO3166-2%22%3D%22{R}%22%5D-%3E.a%3B%28node%5B%22amenity%22~%22%5E%28restaurant%7Ccafe%7Cfast_food%7Cfood_court%29%24%22%5D%5B%22name%22%5D%28area.a%29%3Bway%5B%22amenity%22~%22%5E%28restaurant%7Ccafe%7Cfast_food%7Cfood_court%29%24%22%5D%5B%22name%22%5D%28area.a%29%3B%29%3Bout%20center%20tags%3B', '{R}', nxt.iso),
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

-- photos and menu pictures uploaded by staff
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('food-photos', 'food-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;
drop policy if exists food_photos_staff_ins on storage.objects;
create policy food_photos_staff_ins on storage.objects for insert to authenticated with check (bucket_id = 'food-photos' and (public.is_admin() or public.is_manager()));
drop policy if exists food_photos_staff_del on storage.objects;
create policy food_photos_staff_del on storage.objects for delete to authenticated using (bucket_id = 'food-photos' and (public.is_admin() or public.is_manager()));

select public.food_fetch_tick() as result;

-- re-sort places that had no cuisine tag, using their name (admin choices are kept)
update public.restaurants set cat = public.food_cat(kind, cuisine, name->>'default') where source = 'osm' and not cat_fixed;

-- admin can load a region by hand (the admin page asks the map server itself when it is busy for the database)
create or replace function public.admin_food_ingest(p_region text, j jsonb) returns int
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if not exists (select 1 from public.food_regions where region = p_region) then raise exception 'unknown region'; end if;
  if jsonb_array_length(coalesce(j->'elements', '[]'::jsonb)) = 0 then raise exception 'empty answer'; end if;
  return public.food_ingest(p_region, j);
end $$;
revoke all on function public.admin_food_ingest(text, jsonb) from public, anon;
grant execute on function public.admin_food_ingest(text, jsonb) to authenticated;

-- 27.11: «Turistbop» — the best 40–100 places per region for travellers (the rest stay behind «Show all places»)
alter table public.restaurants add column if not exists tourist_rank int;
create index if not exists restaurants_tourist_idx on public.restaurants (region, tourist_rank);

create table if not exists public.food_sights (region text not null, name text not null, lat float8 not null, lon float8 not null, primary key (region, name));
alter table public.food_sights enable row level security;
insert into public.food_sights values
 ('tashkent_city','Amir Temur square',41.3111,69.2797),('tashkent_city','Chorsu',41.3262,69.2370),('tashkent_city','Hazrati Imam',41.3385,69.2398),('tashkent_city','Independence square',41.3040,69.2710),('tashkent_city','Tashkent City',41.3160,69.2480),
 ('tashkent','Chimgan',41.5530,70.0120),('tashkent','Charvak',41.6219,69.9637),('tashkent','Amirsoy',41.4917,69.9958),
 ('samarkand','Registan',39.6547,66.9758),('samarkand','Gur-e Amir',39.6485,66.9690),('samarkand','Shah-i-Zinda',39.6630,66.9880),('samarkand','Siab bazaar',39.6610,66.9800),
 ('bukhara','Lyabi-Hauz',39.7747,64.4229),('bukhara','Ark',39.7775,64.4106),('bukhara','Poi-Kalon',39.7759,64.4150),
 ('khorezm','Ichan-Kala',41.3783,60.3639),('khorezm','Urgench centre',41.5500,60.6310),
 ('karakalpakstan','Savitsky museum, Nukus',42.4619,59.6100),
 ('kashkadarya','Ak-Saray, Shahrisabz',39.0577,66.8302),('kashkadarya','Karshi centre',38.8600,65.7900),
 ('surkhandarya','Termez centre',37.2242,67.2783),
 ('fergana','Fergana centre',40.3864,71.7864),('fergana','Khudayar Khan palace, Kokand',40.5286,70.9425),('fergana','Yodgorlik, Margilan',40.4718,71.7247),('fergana','Rishtan',40.3570,71.2840),
 ('andijan','Andijan centre',40.7821,72.3442),('namangan','Namangan centre',40.9983,71.6726),
 ('navoi','Navoi centre',40.0844,65.3792),('navoi','Nurata',40.5600,65.6880),
 ('jizzakh','Jizzakh centre',40.1158,67.8422),('syrdarya','Gulistan centre',40.4897,68.7842)
on conflict do nothing;

create or replace function public.food_rank(p_region text default null) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0;
begin
  update public.restaurants set tourist_rank = null where (p_region is null or region = p_region) and tourist_rank is not null;
  with s as (
    select r.id, r.region,
      coalesce(r.score,0)
      + case r.kind when 'restaurant' then 4 when 'cafe' then 1 when 'fast_food' then -6 else -2 end
      + case when r.name ? 'en' or r.name ? 'ru' then 2 else 0 end
      + case r.cat when 'national' then 3 when 'european' then 2 when 'middle' then 2 when 'asian' then 1 when 'fastfood' then -5 else 0 end
      + case when d.km < 1 then 9 when d.km < 2.5 then 6 when d.km < 6 then 3 when d.km < 15 then 1 else -3 end
      + case when (r.name->>'default') ~* (case r.region
          when 'tashkent_city' then '(besh ?qozon|бешкозон|plov cent|плов центр|central asian plov|caravan|караван|afsona|афсона|national food|milliy taom|navvat|наввот|tandiriy|city grill|khan ?chapan|хан чапан|gruzin|грузинск|raj kapoor|chigatoy|чигатой|bukhara cafe|tarnovboshi|april verdant|tanovar|karimbek|каримбек|affresco|uzbegim|o.zbegim|ўзбегим|zafarobod|rayhon|райхон|kamolon|камолон|labi ?g.or|sim ?sim|choyxona|чайхана)'
          when 'samarkand' then '(platan|платан|karimbek|каримбек|samarkand restaurant|ресторан самарканд|old city|bibi.?khan|бибиханум|registan|регистан|magistr|магистр|merosi|мероси|zargaron|заргарон|siyob|siab|сиаб|emirxan|emirkhan|эмирхан|labsar|1001|samarqand osh|osh markaz)'
          when 'bukhara' then '(old bukhara|старая бухара|minzifa|минзифа|ayvan|айван|\mjoy\M|lyabi|labi|ляби|лаби|dolon|долон|doston|достон|caravan|караван|the plov|zolotaya|золотая|chinor|чинор|wishbone|silk road|bella italia|nodir|нодир)'
          when 'khorezm' then '(terras|террас|khiva moon|хива мун|sofra|bir gumbaz|бир гумбаз|zarafsh|зарафш|allakul|zaynab|sultan|султан|tokhir|toxir|тохир|art restaurant|mirza|khorezm art|хорезм)'
          else '(osh markaz|plov|плов|milliy taom|национальн)' end) then 30 else 0 end
      + case when length(coalesce(r.name->>'default','')) < 4 or (r.name->>'default') ~* '^(kafe|cafe|кафе|oshxona|ошхона|choyxona|чайхана|restoran|ресторан|restaurant|fast ?food)$' then -12 else 0 end
      as ts
    from public.restaurants r
    cross join lateral (select min(sqrt(power((r.lat - f.lat) * 111, 2) + power((r.lon - f.lon) * 111 * cos(radians(r.lat)), 2))) km
                          from public.food_sights f where f.region = r.region) d
    where not r.hidden and r.lat is not null and (p_region is null or r.region = p_region)
  ), ranked as (
    select id, region, row_number() over (partition by region order by ts desc, id) rn from s
  )
  update public.restaurants x set tourist_rank = ranked.rn
    from ranked
   where x.id = ranked.id
     and ranked.rn <= case ranked.region when 'tashkent_city' then 100 when 'samarkand' then 80 when 'bukhara' then 80 when 'khorezm' then 70 when 'tashkent' then 50 else 40 end;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.food_rank(text) from public, anon, authenticated;

-- counts: top places per category, plus _total = every place in the region (for «Show all places»)
create or replace function public.food_counts() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(region, cats), '{}'::jsonb) from (
    select region, jsonb_object_agg(cat, c) || jsonb_build_object('_all', sum(c), '_total', max(tot)) as cats
      from (select region, cat, count(*) filter (where tourist_rank is not null or pinned) c, sum(count(*)) over (partition by region) tot
              from public.restaurants where not hidden group by 1, 2) z group by region) y;
$$;
grant execute on function public.food_counts() to anon, authenticated;

select public.food_rank(null);
