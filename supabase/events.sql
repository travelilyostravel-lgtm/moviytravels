-- 2026-11-27 (founder): "Tadbirlar" — concerts, festivals, theatre, sport, official holidays in Uzbekistan.
-- Automatic source: iTicket.uz (the ticket platform Visit Uzbekistan itself links to) — read every 3 hours by the database
-- (pg_net + pg_cron), new events appear on the site by themselves. Admin can hide an event, add conditions / our price,
-- pin it, or add events by hand (festivals, official holidays). Visitors send a booking request (site_requests, service = event).

create extension if not exists pg_net;

create table if not exists public.events (
  id          bigserial primary key,
  source      text not null default 'manual',          -- iticket | manual
  ext_id      text,                                    -- id at the source
  slug        text,
  name        jsonb not null default '{}'::jsonb,      -- {"en": "...", "ru": "...", "uz": "..."}
  info        jsonb not null default '{}'::jsonb,      -- short description per language (manual events)
  category    text not null default 'other',           -- concert | festival | theatre | kids | sport | culture | official | exhibition | other
  starts_at   timestamptz,
  ends_at     timestamptz,
  date_tba    boolean not null default false,          -- only the month is known
  city        text,                                    -- tashkent | samarkand | bukhara | khiva | nukus | …
  venue       text,
  image       text,
  min_price   numeric,                                 -- in UZS (from the source)
  max_price   numeric,
  age         text,
  ticket_url  text,
  official    boolean not null default false,
  hidden      boolean not null default false,
  pinned      boolean not null default false,
  our_note    jsonb not null default '{}'::jsonb,      -- admin: conditions shown to visitors {"uz": "...", "en": "..."}
  our_price   numeric,                                 -- admin: our package price per person, USD (optional)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  seen_at     timestamptz                              -- last time the source still listed it
);
create unique index if not exists events_src_ext on public.events (source, ext_id) where ext_id is not null;
create index if not exists events_start on public.events (starts_at);

alter table public.events enable row level security;
drop policy if exists events_public on public.events;
create policy events_public on public.events for select to anon, authenticated
  using (not hidden and coalesce(ends_at, starts_at + interval '1 day', now() + interval '1 day') >= now() - interval '12 hours'
         and (source <> 'iticket' or seen_at >= now() - interval '2 days'));
drop policy if exists events_staff_all on public.events;
create policy events_staff_all on public.events for all to authenticated
  using (public.is_admin() or public.is_manager()) with check (public.is_admin() or public.is_manager());
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant usage, select on sequence public.events_id_seq to authenticated;

-- ---------------------------------------------------------------- iTicket.uz collector
create table if not exists public.events_fetch (
  request_id bigint primary key,
  lang       text not null,
  city       text,
  page       int not null,
  created_at timestamptz not null default now(),
  done       boolean not null default false
);
alter table public.events_fetch enable row level security;   -- no policies: internal only

-- step 1: ask iTicket for the lists (3 languages × 12 pages, + city lists for Samarkand / Bukhara / Karakalpakstan)
create or replace function public.events_fetch_start() returns int
language plpgsql security definer set search_path = public, net as $$
declare l text; p int; c record; n int := 0; rid bigint;
begin
  delete from public.events_fetch where created_at < now() - interval '1 day';
  foreach l in array array['en', 'ru', 'uz'] loop
    for p in 1..12 loop
      rid := net.http_get(url := format('https://api.iticket.uz/%s/v6/events?page=%s&client=web', l, p),
                          headers := '{"Accept":"application/json"}'::jsonb, timeout_milliseconds := 20000);
      insert into public.events_fetch (request_id, lang, city, page) values (rid, l, null, p); n := n + 1;
    end loop;
  end loop;
  for c in select * from (values (2, 'samarkand'), (3, 'bukhara'), (17, 'nukus')) t(id, name) loop
    for p in 1..4 loop
      rid := net.http_get(url := format('https://api.iticket.uz/en/v6/events?page=%s&client=web&city_id=%s', p, c.id),
                          headers := '{"Accept":"application/json"}'::jsonb, timeout_milliseconds := 20000);
      insert into public.events_fetch (request_id, lang, city, page) values (rid, 'en', c.name, p); n := n + 1;
    end loop;
  end loop;
  return n;
end $$;

create or replace function public.events_cat(s text) returns text language sql immutable as $$
  select case
    when s ~ 'concert' then 'concert'
    when s ~ 'theat' then 'theatre'
    when s ~ 'kid' then 'kids'
    when s ~ 'sport' then 'sport'
    when s ~ 'festival' then 'festival'
    when s ~ 'exhib' then 'exhibition'
    when s ~ 'cultur' then 'culture'
    when s ~ '^(samarkand|bukhara|khiva|museum)' then 'museum'
    else 'other' end;
$$;

-- step 2 (a few minutes later): read the answers and save new / changed events
create or replace function public.events_fetch_process() returns int
language plpgsql security definer set search_path = public, net as $$
declare f record; r record; j jsonb; e jsonb; n int := 0; v_ext text; v_cat text;
begin
  for f in select ef.*, hr.status_code, hr.content from public.events_fetch ef join net._http_response hr on hr.id = ef.request_id
            where not ef.done order by ef.city nulls first, ef.lang loop
    update public.events_fetch set done = true where request_id = f.request_id;
    if f.status_code <> 200 or f.content is null then continue; end if;
    begin j := f.content::jsonb; exception when others then continue; end;
    for e in select * from jsonb_array_elements(coalesce(j #> '{response,events,data}', '[]'::jsonb)) loop
      v_ext := e->>'id'; v_cat := public.events_cat(coalesce(e->>'category_slug', ''));
      if v_ext is null then continue; end if;
      if f.city is not null then
        update public.events set city = f.city where source = 'iticket' and ext_id = v_ext and (city is null or city = 'tashkent');
        continue;
      end if;
      insert into public.events as ev (source, ext_id, slug, name, category, starts_at, venue, image, min_price, max_price, age, ticket_url, city, seen_at)
      values ('iticket', v_ext, e->>'slug', jsonb_build_object(f.lang, e->>'name'), v_cat,
              nullif(e->>'event_starts_at', '')::timestamptz,
              left(e #>> '{venues,0,name}', 200), left(e->>'square_card_url', 500),
              nullif(e->>'min_price', '')::numeric, nullif(e->>'max_price', '')::numeric, left(e->>'age_limit', 10),
              format('https://iticket.uz/%s/events/%s/%s', 'en', coalesce(e->>'category_slug', 'events'), e->>'slug'),
              'tashkent', now())
      on conflict (source, ext_id) where ext_id is not null do update set
        name = ev.name || jsonb_build_object(f.lang, excluded.name->>f.lang),
        category = excluded.category, starts_at = excluded.starts_at, venue = coalesce(excluded.venue, ev.venue),
        image = coalesce(excluded.image, ev.image), min_price = excluded.min_price, max_price = excluded.max_price,
        age = excluded.age, ticket_url = excluded.ticket_url, slug = excluded.slug, seen_at = now(),
        updated_at = case when ev.starts_at is distinct from excluded.starts_at or ev.min_price is distinct from excluded.min_price then now() else ev.updated_at end;
      n := n + 1;
    end loop;
  end loop;
  -- venues outside Tashkent that the city lists did not catch
  update public.events set city = 'samarkand' where source = 'iticket' and city = 'tashkent' and venue ~* '(samarkand|samarqand|самарканд|registan)';
  update public.events set city = 'bukhara'   where source = 'iticket' and city = 'tashkent' and venue ~* '(bukhara|buxoro|бухар)';
  update public.events set city = 'khiva'     where source = 'iticket' and city = 'tashkent' and venue ~* '(khiva|xiva|хива|ichan)';
  return n;
end $$;

-- run now and then every 3 hours (process 4 minutes after each start)
do $$ begin
  perform cron.unschedule(jobid) from cron.job where jobname in ('events_fetch_start', 'events_fetch_process');
exception when others then null; end $$;
select cron.schedule('events_fetch_start', '7 */3 * * *', $$select public.events_fetch_start()$$);
select cron.schedule('events_fetch_process', '11 */3 * * *', $$select public.events_fetch_process()$$);

-- ---------------------------------------------------------------- hand-made: festivals and official holidays (admin can edit / add)
insert into public.events (source, ext_id, name, info, category, starts_at, ends_at, date_tba, city, venue, official) values
 ('manual', 'constitution-2026', '{"en":"Constitution Day","ru":"День Конституции","uz":"Konstitutsiya kuni"}',
  '{"en":"National holiday: official ceremonies and concerts across the country.","ru":"Государственный праздник: торжественные мероприятия и концерты по всей стране.","uz":"Davlat bayrami: butun mamlakatda tantanali tadbirlar va konsertlar."}',
  'official', '2026-12-08 10:00+05', '2026-12-08 23:00+05', false, 'tashkent', null, true),
 ('manual', 'navruz-2027', '{"en":"Navruz — spring festival","ru":"Навруз — праздник весны","uz":"Navro''z bayrami"}',
  '{"en":"The biggest holiday of the year: sumalak, folk games, concerts and fairs in every city.","ru":"Главный праздник года: сумаляк, народные игры, концерты и ярмарки во всех городах.","uz":"Yilning eng katta bayrami: sumalak, xalq o''yinlari, konsertlar va sayllar har bir shaharda."}',
  'official', '2027-03-21 09:00+05', '2027-03-21 23:00+05', false, 'tashkent', null, true),
 ('manual', 'boysun-2027', '{"en":"Boysun Bahori folk festival","ru":"Фестиваль «Бойсун бахори»","uz":"«Boysun bahori» folklor festivali"}',
  '{"en":"UNESCO-listed folklore of Boysun: songs, crafts, kupkari. Usually in early May — exact dates are announced in spring.","ru":"Фольклор Бойсуна из списка ЮНЕСКО: песни, ремёсла, купкари. Обычно в начале мая — точные даты объявят весной.","uz":"YUNESKO ro''yxatidagi Boysun folklori: qo''shiqlar, hunarmandchilik, ko''pkari. Odatda may boshida — aniq sanalar bahorda e''lon qilinadi."}',
  'festival', '2027-05-01 10:00+05', null, true, 'boysun', 'Boysun, Surxondaryo', true),
 ('manual', 'silk-spices-2027', '{"en":"Silk and Spices Festival","ru":"Фестиваль «Шёлк и специи»","uz":"«Ipak va ziravorlar» festivali"}',
  '{"en":"Annual festival in Bukhara: silk, ikat, spice fairs, music and fashion shows. Usually in early June — dates are announced in spring.","ru":"Ежегодный фестиваль в Бухаре: шёлк, икат, ярмарки специй, музыка и показы. Обычно в начале июня — даты объявят весной.","uz":"Buxorodagi yillik festival: ipak, adras, ziravorlar yarmarkasi, musiqa va moda ko''rgazmalari. Odatda iyun boshida — sanalar bahorda e''lon qilinadi."}',
  'festival', '2027-06-01 10:00+05', null, true, 'bukhara', 'Bukhara', true),
 ('manual', 'independence-2027', '{"en":"Independence Day","ru":"День независимости","uz":"Mustaqillik kuni"}',
  '{"en":"The main national holiday: festive concerts, fireworks and celebrations.","ru":"Главный государственный праздник: праздничные концерты, салют и гуляния.","uz":"Asosiy davlat bayrami: bayram konsertlari, mushakbozlik va sayllar."}',
  'official', '2027-09-01 10:00+05', '2027-09-01 23:59+05', false, 'tashkent', null, true),
 ('manual', 'bukhara-biennial-2027', '{"en":"Bukhara Biennial 2027","ru":"Бухарская биеннале 2027","uz":"Buxoro biennalesi 2027"}',
  '{"en":"International contemporary art biennial in historic Bukhara (artistic director Kulapat Yantrasast).","ru":"Международная биеннале современного искусства в исторической Бухаре (худ. руководитель — Кулапат Янтрасаст).","uz":"Tarixiy Buxoroda zamonaviy san''at xalqaro biennalesi (badiiy rahbar — Kulapat Yantrasast)."}',
  'exhibition', '2027-09-03 10:00+05', '2027-11-21 20:00+05', false, 'bukhara', 'Bukhara', true)
on conflict (source, ext_id) where ext_id is not null do nothing;

-- first run right away
select public.events_fetch_start()::text as result;
