-- Moviy Nomad — visitors, customer base and their actions (2026-11-23, founder's request)
-- * every browser gets a random visitor id; each visit/page and important click is logged
-- * on the first action beyond looking at the page the visitor is asked to sign in (Google or e-mail)
-- * founder/managers see visitor numbers, the customer list and each customer's card with actions in admin → "Mijozlar"

create table if not exists public.site_customers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  phone         text,
  provider      text not null default 'email',      -- google | email | facebook
  auth_user_id  uuid,
  lang          text,
  country       text,
  marketing_ok  boolean not null default true,
  first_seen    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  notes         text
);
create table if not exists public.site_visitors (
  id           text primary key,                      -- random id stored in the browser
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  visits       int not null default 1,
  pageviews    int not null default 0,
  lang         text,
  referrer     text,
  device       text,
  customer_id  uuid references public.site_customers(id) on delete set null
);
create table if not exists public.site_events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  visitor_id   text,
  customer_id  uuid references public.site_customers(id) on delete cascade,
  event        text not null,                         -- visit | page | click | signin | request | booking | contact | post
  detail       text,
  page         text
);
create index if not exists site_events_cust on public.site_events (customer_id, created_at desc);
create index if not exists site_events_vis on public.site_events (visitor_id, created_at desc);
create index if not exists site_events_time on public.site_events (created_at desc);
create index if not exists site_visitors_seen on public.site_visitors (last_seen desc);

alter table public.site_customers enable row level security;
alter table public.site_visitors enable row level security;
alter table public.site_events enable row level security;
drop policy if exists site_customers_staff on public.site_customers;
create policy site_customers_staff on public.site_customers for select to authenticated using (public.is_admin() or public.is_manager());
drop policy if exists site_customers_admin_upd on public.site_customers;
create policy site_customers_admin_upd on public.site_customers for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists site_visitors_staff on public.site_visitors;
create policy site_visitors_staff on public.site_visitors for select to authenticated using (public.is_admin() or public.is_manager());
drop policy if exists site_events_staff on public.site_events;
create policy site_events_staff on public.site_events for select to authenticated using (public.is_admin() or public.is_manager());
grant select on public.site_customers, public.site_visitors, public.site_events to authenticated;
grant update (name, phone, notes, marketing_ok) on public.site_customers to authenticated;

-- a page view (new "visit" when the last one was more than 30 minutes ago)
create or replace function public.track_visit(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare vid text := left(coalesce(p->>'vid', ''), 64); v record; newvisit boolean := false; cid uuid;
begin
  if length(vid) < 12 then return 'bad'; end if;
  select * into v from public.site_visitors where id = vid;
  if not found then
    insert into public.site_visitors (id, lang, referrer, device, pageviews) values (vid, left(p->>'lang', 5), left(p->>'ref', 300), left(p->>'dev', 200), 1);
    newvisit := true;
  else
    newvisit := v.last_seen < now() - interval '30 minutes';
    update public.site_visitors set last_seen = now(), pageviews = pageviews + 1, visits = visits + case when newvisit then 1 else 0 end,
           lang = coalesce(left(p->>'lang', 5), lang) where id = vid;
    cid := v.customer_id;
    if cid is not null then update public.site_customers set last_seen = now() where id = cid; end if;
  end if;
  insert into public.site_events (visitor_id, customer_id, event, detail, page)
  values (vid, cid, case when newvisit then 'visit' else 'page' end, left(p->>'title', 200), left(p->>'page', 300));
  return case when cid is null then 'anon' else 'known' end;
end $$;

-- an action (click on a tour, WhatsApp, request sent, …)
create or replace function public.track_event(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare vid text := left(coalesce(p->>'vid', ''), 64); cid uuid;
begin
  if length(vid) < 12 then return; end if;
  select customer_id into cid from public.site_visitors where id = vid;
  insert into public.site_events (visitor_id, customer_id, event, detail, page)
  values (vid, cid, left(coalesce(p->>'event', 'click'), 30), left(p->>'detail', 300), left(p->>'page', 300));
  update public.site_visitors set last_seen = now() where id = vid;
end $$;

-- sign-in: Google (e-mail taken from the verified login) or e-mail typed by the visitor
create or replace function public.register_customer(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare vid text := left(coalesce(p->>'vid', ''), 64); em text; prov text := coalesce(p->>'provider', 'email'); cid uuid; nm text;
begin
  if prov = 'google' or prov = 'facebook' then
    em := lower(auth.jwt()->>'email');
    if em is null then raise exception 'not signed in'; end if;
    nm := coalesce(nullif(p->>'name', ''), auth.jwt()->'user_metadata'->>'full_name', auth.jwt()->'user_metadata'->>'name');
  else
    prov := 'email';
    em := lower(trim(p->>'email'));
    nm := nullif(trim(p->>'name'), '');
  end if;
  if em is null or em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad e-mail'; end if;
  insert into public.site_customers (email, name, phone, provider, auth_user_id, lang)
  values (em, left(nm, 120), left(nullif(trim(p->>'phone'), ''), 40), prov, case when prov <> 'email' then auth.uid() end, left(p->>'lang', 5))
  on conflict (email) do update set
    name = coalesce(excluded.name, site_customers.name),
    phone = coalesce(excluded.phone, site_customers.phone),
    provider = case when excluded.provider <> 'email' then excluded.provider else site_customers.provider end,
    auth_user_id = coalesce(excluded.auth_user_id, site_customers.auth_user_id),
    last_seen = now()
  returning id into cid;
  if length(vid) >= 12 then
    insert into public.site_visitors (id, customer_id) values (vid, cid) on conflict (id) do update set customer_id = cid, last_seen = now();
    update public.site_events set customer_id = cid where visitor_id = vid and customer_id is null;   -- earlier actions of this browser
  end if;
  insert into public.site_events (visitor_id, customer_id, event, detail, page) values (nullif(vid, ''), cid, 'signin', prov, left(p->>'page', 300));
  return cid;
end $$;

grant execute on function public.track_visit(jsonb), public.track_event(jsonb), public.register_customer(jsonb) to anon, authenticated;

-- numbers for the admin overview
create or replace function public.visitor_stats() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not (public.is_admin() or public.is_manager()) then null else jsonb_build_object(
    'today',   (select count(distinct visitor_id) from public.site_events where created_at >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent'),
    'd7',      (select count(distinct visitor_id) from public.site_events where created_at >= now() - interval '7 days'),
    'd30',     (select count(distinct visitor_id) from public.site_events where created_at >= now() - interval '30 days'),
    'all',     (select count(*) from public.site_visitors),
    'views30', (select count(*) from public.site_events where event in ('visit','page') and created_at >= now() - interval '30 days'),
    'cust',    (select count(*) from public.site_customers),
    'cust7',   (select count(*) from public.site_customers where first_seen >= now() - interval '7 days'),
    'google',  (select count(*) from public.site_customers where provider = 'google'),
    'online',  (select count(*) from public.site_visitors where last_seen >= now() - interval '5 minutes')
  ) end;
$$;
grant execute on function public.visitor_stats() to authenticated;
