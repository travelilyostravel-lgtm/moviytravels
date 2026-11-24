-- 2026-11-24 (founder): visitor analytics — daily / weekly / monthly / yearly; robots and our own staff are not counted;
-- a public counter for the home page.
alter table public.site_visitors add column if not exists staff boolean not null default false;
create index if not exists site_events_created_idx on public.site_events (created_at);
create index if not exists site_events_visitor_idx on public.site_events (visitor_id);

-- robots (search engines, previews, test tools)
create or replace function public.is_bot_ua(ua text) returns boolean language sql immutable as $$
  select coalesce(ua, '') ~* '(bot|spider|crawl|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegrambot|python|curl|wget|httpclient|monitor|pingdom|vercel)';
$$;

-- staff browsers are marked when they open the admin panel, so the founder and managers are not counted as visitors
create or replace function public.mark_staff_visitor(p_vid text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.is_manager()) then return; end if;
  update public.site_visitors set staff = true where id = left(coalesce(p_vid, ''), 64);
end $$;
grant execute on function public.mark_staff_visitor(text) to authenticated;

-- real visitors = not robots, not staff
create or replace view public.site_real_visitors as
  select * from public.site_visitors where not staff and not public.is_bot_ua(device);

-- public counter for the home page (only totals, nothing personal)
create or replace function public.site_counter() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total', (select count(*) from public.site_real_visitors),
    'today', (select count(distinct e.visitor_id) from public.site_events e join public.site_real_visitors v on v.id = e.visitor_id
               where e.created_at >= (date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent')),
    'month', (select count(distinct e.visitor_id) from public.site_events e join public.site_real_visitors v on v.id = e.visitor_id
               where e.created_at >= now() - interval '30 days'));
$$;
grant execute on function public.site_counter() to anon, authenticated;

-- staff analytics: p_period = day (last 30 days) | week (12 weeks) | month (12 months) | year (5 years)
create or replace function public.site_analytics(p_period text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare unit text; n int; t0 timestamptz; res jsonb;
begin
  if not (public.is_admin() or public.is_manager()) then return null; end if;
  unit := case when p_period in ('day', 'week', 'month', 'year') then p_period else 'day' end;
  n := case unit when 'day' then 30 when 'week' then 12 when 'month' then 12 else 5 end;
  t0 := (date_trunc(unit, now() at time zone 'Asia/Tashkent') - ((n - 1) || ' ' || unit)::interval) at time zone 'Asia/Tashkent';
  with ev as (
    select e.visitor_id, e.event, e.page, (e.created_at at time zone 'Asia/Tashkent') as t
      from public.site_events e join public.site_real_visitors v on v.id = e.visitor_id
     where e.created_at >= t0 and e.event in ('visit', 'page')),
  b as (select generate_series(date_trunc(unit, t0 at time zone 'Asia/Tashkent'), date_trunc(unit, now() at time zone 'Asia/Tashkent'), ('1 ' || unit)::interval) as k),
  s as (
    select b.k,
           (select count(distinct visitor_id) from ev where date_trunc(unit, ev.t) = b.k) as visitors,
           (select count(*) from ev where date_trunc(unit, ev.t) = b.k) as views,
           (select count(*) from public.site_real_visitors v where date_trunc(unit, v.first_seen at time zone 'Asia/Tashkent') = b.k) as new_visitors
      from b)
  select jsonb_build_object(
    'unit', unit,
    'series', (select jsonb_agg(jsonb_build_object('k', to_char(k, case unit when 'day' then 'DD.MM' when 'week' then 'DD.MM' when 'month' then 'MM.YYYY' else 'YYYY' end),
                                                  'v', visitors, 'p', views, 'n', new_visitors) order by k) from s),
    'visitors', (select count(distinct visitor_id) from ev),
    'views', (select count(*) from ev),
    'new', (select count(*) from public.site_real_visitors where first_seen >= t0),
    'total', (select count(*) from public.site_real_visitors),
    'online', (select count(*) from public.site_real_visitors where last_seen >= now() - interval '5 minutes'),
    'pages', (select jsonb_agg(x) from (select regexp_replace(page, '[?#].*$', '') as page, count(*) c from ev group by 1 order by 2 desc limit 10) x),
    'langs', (select jsonb_agg(x) from (select coalesce(v.lang, '?') as lang, count(*) c from public.site_real_visitors v
                                         where v.last_seen >= t0 group by 1 order by 2 desc limit 10) x),
    'refs', (select jsonb_agg(x) from (select coalesce(nullif(regexp_replace(coalesce(v.referrer, ''), '^https?://(www\.)?([^/]+).*$', '\2'), ''), '(to''g''ridan-to''g''ri)') as ref, count(*) c
                                        from public.site_real_visitors v where v.first_seen >= t0 group by 1 order by 2 desc limit 10) x),
    'devices', (select jsonb_build_object('mobile', count(*) filter (where device ~* '(mobile|android|iphone|ipad)'), 'desktop', count(*) filter (where not device ~* '(mobile|android|iphone|ipad)'))
                  from public.site_real_visitors v where v.last_seen >= t0)
  ) into res;
  return res;
end $$;
grant execute on function public.site_analytics(text) to authenticated;
select public.site_counter()::text as result;
