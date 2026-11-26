-- 2026-11-27 (founder): where visitors come from (Google, Yandex, Instagram, Telegram, VK, MAX, other sites…),
-- which country, and a public home counter: all visits · unique visitors · online now.
-- Only the country code is stored (from Vercel's geo header) — no IP addresses.

alter table public.site_visitors add column if not exists country text;
alter table public.site_visitors add column if not exists source  text;
alter table public.site_events   add column if not exists src      text;
alter table public.site_events   add column if not exists country  text;
alter table public.site_events   add column if not exists campaign text;
create index if not exists site_events_visit_time on public.site_events (created_at) where event = 'visit';

-- one short key per source: google, yandex, bing, search, google_ads, yandex_ads, instagram, facebook, telegram, vk, max, ok,
-- whatsapp, youtube, tiktok, twitter, linkedin, email, tripadvisor, site:<domain>, utm:<value>, direct
create or replace function public.classify_src(p_ref text, p_utm text, p_med text, p_clid text, p_ua text)
returns text language plpgsql immutable as $$
declare u text := lower(coalesce(p_utm, '')); m text := lower(coalesce(p_med, '')); c text := lower(coalesce(p_clid, ''));
        ua text := coalesce(p_ua, ''); h text;
begin
  if u <> '' then
    if u ~ '^(ig|insta|instagram)' then return 'instagram'; end if;
    if u ~ '^(fb|facebook|meta)' then return 'facebook'; end if;
    if u ~ '^(tg|telegram)' then return 'telegram'; end if;
    if u ~ '^(vk|vkontakte)' then return 'vk'; end if;
    if u ~ '^max' then return 'max'; end if;
    if u ~ '^(ok|odnoklassniki)' then return 'ok'; end if;
    if u ~ '^(wa|whatsapp)' then return 'whatsapp'; end if;
    if u ~ '^(yt|youtube)' then return 'youtube'; end if;
    if u ~ '^tiktok' then return 'tiktok'; end if;
    if u ~ '^google' then return case when m ~ '(cpc|ppc|paid|ads)' then 'google_ads' else 'google' end; end if;
    if u ~ '^(yandex|ya)$' or u ~ '^yandex' then return case when m ~ '(cpc|ppc|paid|ads)' then 'yandex_ads' else 'yandex' end; end if;
    if u ~ '^(email|mail|newsletter|rassilka)' then return 'email'; end if;
    return 'utm:' || left(u, 40);
  end if;
  if c = 'gclid' then return 'google_ads'; end if;
  if c = 'yclid' then return 'yandex_ads'; end if;
  if ua ~* 'Instagram' then return 'instagram'; end if;
  if ua ~* '(FBAN|FBAV|FB_IAB)' then return 'facebook'; end if;
  if ua ~* '(VKClient|vkontakte|com\.vk)' then return 'vk'; end if;
  if ua ~* '(musical_ly|BytedanceWebview|TikTok)' then return 'tiktok'; end if;
  if c = 'fbclid' then return 'facebook'; end if;
  h := lower(regexp_replace(coalesce(p_ref, ''), '^[a-z]+://(www\.|m\.|l\.|lm\.)?([^/:?#]+).*$', '\2', 'i'));
  if h = '' then return 'direct'; end if;
  if h ~ '(^|\.)moviy-travel\.uz$' or h ~ '(^|\.)vercel\.app$' then return 'direct'; end if;
  if h ~ '^mail\.google\.' or h ~ '(^|\.)(e\.mail\.ru|mail\.yandex\.|outlook\.|mail\.)' then return 'email'; end if;
  if h ~ '(^|\.)google\.' or h = 'googleusercontent.com' then return 'google'; end if;
  if h ~ '(^|\.)(yandex\.|ya\.ru$)' then return 'yandex'; end if;
  if h ~ '(^|\.)bing\.com$' then return 'bing'; end if;
  if h ~ '(duckduckgo|yahoo|baidu|naver|ecosia|go\.mail\.ru|seznam|qwant|brave)' then return 'search'; end if;
  if h ~ '(^|\.)(instagram\.com|ig\.me)$' then return 'instagram'; end if;
  if h ~ '(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$' then return 'facebook'; end if;
  if h ~ '(^|\.)(t\.me|telegram\.org|telegram\.me)$' then return 'telegram'; end if;
  if h ~ '(^|\.)(vk\.com|vk\.ru|vk\.me|vkontakte\.ru)$' then return 'vk'; end if;
  if h ~ '(^|\.)(max\.ru|oneme\.ru)$' then return 'max'; end if;
  if h ~ '(^|\.)ok\.ru$' then return 'ok'; end if;
  if h ~ '(^|\.)(wa\.me|whatsapp\.com)$' then return 'whatsapp'; end if;
  if h ~ '(^|\.)(youtube\.com|youtu\.be)$' then return 'youtube'; end if;
  if h ~ '(^|\.)tiktok\.com$' then return 'tiktok'; end if;
  if h ~ '(^|\.)(x\.com|twitter\.com|t\.co)$' then return 'twitter'; end if;
  if h ~ '(^|\.)(linkedin\.com|lnkd\.in)$' then return 'linkedin'; end if;
  if h ~ 'tripadvisor' then return 'tripadvisor'; end if;
  return 'site:' || left(h, 60);
end $$;

-- page view: as before, plus source / country / campaign on every new visit
create or replace function public.track_visit(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare vid text := left(coalesce(p->>'vid', ''), 64); v record; newvisit boolean := false; cid uuid;
        cc text := upper(left(nullif(p->>'country', ''), 2)); s text; camp text := left(nullif(p->>'camp', ''), 80);
begin
  if length(vid) < 12 then return 'bad'; end if;
  if cc !~ '^[A-Z]{2}$' then cc := null; end if;
  s := public.classify_src(p->>'ref', p->>'utm', p->>'umed', p->>'clid', p->>'dev');
  select * into v from public.site_visitors where id = vid;
  if not found then
    insert into public.site_visitors (id, lang, referrer, device, pageviews, country, source)
    values (vid, left(p->>'lang', 5), left(p->>'ref', 300), left(p->>'dev', 200), 1, cc, s);
    newvisit := true;
  else
    newvisit := v.last_seen < now() - interval '30 minutes';
    update public.site_visitors set last_seen = now(), pageviews = pageviews + 1, visits = visits + case when newvisit then 1 else 0 end,
           lang = coalesce(left(p->>'lang', 5), lang), country = coalesce(cc, country), source = coalesce(source, s) where id = vid;
    cid := v.customer_id;
    if cid is not null then update public.site_customers set last_seen = now() where id = cid; end if;
  end if;
  insert into public.site_events (visitor_id, customer_id, event, detail, page, src, country, campaign)
  values (vid, cid, case when newvisit then 'visit' else 'page' end, left(p->>'title', 200), left(p->>'page', 300),
          case when newvisit then s end, case when newvisit then cc end, case when newvisit then camp end);
  return case when cid is null then 'anon' else 'known' end;
end $$;

-- "still here" signal every minute from an open page (for "online now"); writes nothing else
create or replace function public.visitor_ping(p jsonb) returns void
language sql security definer set search_path = public as $$
  update public.site_visitors set last_seen = now() where id = left(coalesce(p->>'vid', ''), 64) and last_seen < now() - interval '40 seconds';
$$;
grant execute on function public.visitor_ping(jsonb) to anon, authenticated;

-- public home counter: all visits (every entry), unique visitors, online now (+ old keys for compatibility)
create or replace function public.site_counter() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'visits', (select coalesce(sum(visits), 0) from public.site_real_visitors),
    'unique', (select count(*) from public.site_real_visitors),
    'online', (select count(*) from public.site_real_visitors where last_seen >= now() - interval '3 minutes'),
    'total',  (select count(*) from public.site_real_visitors),
    'today',  (select count(distinct e.visitor_id) from public.site_events e join public.site_real_visitors v on v.id = e.visitor_id
                where e.created_at >= (date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent')));
$$;
grant execute on function public.site_counter() to anon, authenticated;

-- staff analytics: + visits, countries, sources, other sites, campaigns
create or replace function public.site_analytics(p_period text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare unit text; n int; t0 timestamptz; res jsonb;
begin
  if not (public.is_admin() or public.is_manager()) then return null; end if;
  unit := case when p_period in ('day', 'week', 'month', 'year') then p_period else 'day' end;
  n := case unit when 'day' then 30 when 'week' then 12 when 'month' then 12 else 5 end;
  t0 := (date_trunc(unit, now() at time zone 'Asia/Tashkent') - ((n - 1) || ' ' || unit)::interval) at time zone 'Asia/Tashkent';
  with ev as (
    select e.visitor_id, e.event, e.page, e.src, e.country, e.campaign, (e.created_at at time zone 'Asia/Tashkent') as t
      from public.site_events e join public.site_real_visitors v on v.id = e.visitor_id
     where e.created_at >= t0 and e.event in ('visit', 'page')),
  vis as (select * from ev where event = 'visit'),
  b as (select generate_series(date_trunc(unit, t0 at time zone 'Asia/Tashkent'), date_trunc(unit, now() at time zone 'Asia/Tashkent'), ('1 ' || unit)::interval) as k),
  s as (
    select b.k,
           (select count(distinct visitor_id) from ev where date_trunc(unit, ev.t) = b.k) as visitors,
           (select count(*) from ev where date_trunc(unit, ev.t) = b.k) as views,
           (select count(*) from vis where date_trunc(unit, vis.t) = b.k) as visits,
           (select count(*) from public.site_real_visitors v where date_trunc(unit, v.first_seen at time zone 'Asia/Tashkent') = b.k) as new_visitors
      from b)
  select jsonb_build_object(
    'unit', unit,
    'series', (select jsonb_agg(jsonb_build_object('k', to_char(k, case unit when 'day' then 'DD.MM' when 'week' then 'DD.MM' when 'month' then 'MM.YYYY' else 'YYYY' end),
                                                  'v', visitors, 'p', views, 's', visits, 'n', new_visitors) order by k) from s),
    'visitors', (select count(distinct visitor_id) from ev),
    'visits', (select count(*) from vis),
    'views', (select count(*) from ev),
    'new', (select count(*) from public.site_real_visitors where first_seen >= t0),
    'total', (select count(*) from public.site_real_visitors),
    'total_visits', (select coalesce(sum(visits), 0) from public.site_real_visitors),
    'online', (select count(*) from public.site_real_visitors where last_seen >= now() - interval '3 minutes'),
    'pages', (select jsonb_agg(x) from (select regexp_replace(page, '[?#].*$', '') as page, count(*) c from ev group by 1 order by 2 desc limit 10) x),
    'langs', (select jsonb_agg(x) from (select coalesce(v.lang, '?') as lang, count(*) c from public.site_real_visitors v
                                         where v.last_seen >= t0 group by 1 order by 2 desc limit 10) x),
    'countries', (select jsonb_agg(x) from (select coalesce(country, '?') as cc, count(*) c, count(distinct visitor_id) u from vis group by 1 order by 2 desc limit 40) x),
    'sources', (select jsonb_agg(x) from (select case when src like 'site:%' then 'sites' when src like 'utm:%' then src else coalesce(src, 'old') end as src,
                                                 count(*) c, count(distinct visitor_id) u from vis group by 1 order by 2 desc) x),
    'sites', (select jsonb_agg(x) from (select substr(src, 6) as site, count(*) c from vis where src like 'site:%' group by 1 order by 2 desc limit 15) x),
    'campaigns', (select jsonb_agg(x) from (select campaign, count(*) c from vis where campaign is not null group by 1 order by 2 desc limit 15) x),
    'refs', (select jsonb_agg(x) from (select coalesce(nullif(regexp_replace(coalesce(v.referrer, ''), '^https?://(www\.)?([^/]+).*$', '\2'), ''), '(to''g''ridan-to''g''ri)') as ref, count(*) c
                                        from public.site_real_visitors v where v.first_seen >= t0 group by 1 order by 2 desc limit 10) x),
    'devices', (select jsonb_build_object('mobile', count(*) filter (where device ~* '(mobile|android|iphone|ipad)'), 'desktop', count(*) filter (where not device ~* '(mobile|android|iphone|ipad)'))
                  from public.site_real_visitors v where v.last_seen >= t0)
  ) into res;
  return res;
end $$;
grant execute on function public.site_analytics(text) to authenticated;

-- old data: source of every visitor from the first referrer we saved; their first visit gets it too
update public.site_visitors set source = public.classify_src(referrer, null, null, null, device) where source is null;
update public.site_events e set src = v.source
  from public.site_visitors v
 where e.visitor_id = v.id and e.event = 'visit' and e.src is null
   and e.id = (select min(e2.id) from public.site_events e2 where e2.visitor_id = v.id and e2.event = 'visit');

select public.site_counter()::text as result;
