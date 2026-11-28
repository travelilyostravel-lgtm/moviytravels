-- 27.11.2026 — eSIM for tourists through the partner Qulay SIM (referral model).
-- The tourist chooses a plan on our site and buys it on Qulay SIM's page: Qulay SIM is the seller and keeps
-- payments, support and refunds. Our share (commission) is reported back to us for every sale and top-up.
--   esim_settings  one row: on/off, partner link template, promo code, commission %, hash of the postback key
--   esim_plans     plans shown on the site (typed by the admin now; filled from Qulay SIM's API later)
--   esim_clicks    every «Buy» click gets its own number (sub) that travels to Qulay SIM and comes back with the sale
--   esim_events    sales / top-ups / refunds reported by Qulay SIM (through /api/esim-postback)

create extension if not exists pgcrypto;

create table if not exists public.esim_settings (
  id              int primary key default 1 check (id = 1),
  enabled         boolean not null default false,
  partner_url     text,           -- e.g. https://partner.example/esim?ref=MOVIY&sub={sub}&plan={plan}&lang={lang}
  promo_code      text,
  commission_pct  numeric(5,2),   -- our share, as agreed in the contract
  ingest_key_hash text,           -- sha256 of the key that /api/esim-postback sends; the key itself is never stored
  updated_at      timestamptz not null default now()
);
insert into public.esim_settings (id) values (1) on conflict do nothing;
alter table public.esim_settings enable row level security;
drop policy if exists esim_settings_admin on public.esim_settings;
create policy esim_settings_admin on public.esim_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.esim_plans (
  id            bigserial primary key,
  name          text not null,
  gb            numeric(8,2),             -- null = unlimited
  days          int not null,
  price         numeric(10,2) not null,   -- what the tourist pays at Qulay SIM
  currency      text not null default 'USD',
  partner_plan  text,                     -- Qulay SIM plan id (goes into the link as {plan})
  popular       boolean not null default false,
  active        boolean not null default true,
  sort          int not null default 100,
  updated_at    timestamptz not null default now()
);
alter table public.esim_plans enable row level security;
drop policy if exists esim_plans_read on public.esim_plans;
create policy esim_plans_read on public.esim_plans for select to anon, authenticated using (active or public.is_admin());
drop policy if exists esim_plans_admin on public.esim_plans;
create policy esim_plans_admin on public.esim_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.esim_plans to anon, authenticated;

create table if not exists public.esim_clicks (
  sub         text primary key,
  plan_id     bigint references public.esim_plans(id) on delete set null,
  lang        text,
  country     text,
  src         text,
  created_at  timestamptz not null default now()
);
create index if not exists esim_clicks_created on public.esim_clicks (created_at);
alter table public.esim_clicks enable row level security;
drop policy if exists esim_clicks_admin on public.esim_clicks;
create policy esim_clicks_admin on public.esim_clicks for select to authenticated using (public.is_admin());

create table if not exists public.esim_events (
  id          bigserial primary key,
  sub         text,
  order_id    text not null,
  kind        text not null default 'sale' check (kind in ('sale','topup','refund')),
  plan_name   text,
  gb          numeric(8,2),
  days        int,
  amount      numeric(12,2),
  currency    text,
  commission  numeric(12,2),
  status      text,
  country     text,
  raw         jsonb,
  created_at  timestamptz not null default now(),
  unique (order_id, kind)
);
create index if not exists esim_events_created on public.esim_events (created_at);
alter table public.esim_events enable row level security;
drop policy if exists esim_events_admin on public.esim_events;
create policy esim_events_admin on public.esim_events for select to authenticated using (public.is_admin());

-- the site page asks: is eSIM on, where to send the tourist, which promo code
create or replace function public.esim_public() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('enabled', enabled and partner_url is not null, 'url', case when enabled then partner_url end, 'promo', case when enabled then promo_code end)
    from public.esim_settings where id = 1;
$$;
grant execute on function public.esim_public() to anon, authenticated;

-- «Buy» click: remember it and give back the number that goes to Qulay SIM
create or replace function public.esim_click(p_plan bigint, p_lang text, p_country text, p_src text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare s text;
begin
  if not exists (select 1 from public.esim_settings where id = 1 and enabled) then return null; end if;
  s := 'MN' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 9));
  insert into public.esim_clicks (sub, plan_id, lang, country, src)
  values (s, (select id from public.esim_plans where id = p_plan and active), left(p_lang, 5), left(upper(p_country), 2), left(p_src, 60));
  return s;
end $$;
grant execute on function public.esim_click(bigint, text, text, text) to anon, authenticated;

-- Qulay SIM reports a sale / top-up / refund. Called only by /api/esim-postback with the secret key.
-- Field names are matched loosely until Qulay SIM's API document is in hand.
create or replace function public.esim_ingest(p_key text, p jsonb) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare h text; v_kind text; v_order text; v_sub text;
begin
  select ingest_key_hash into h from public.esim_settings where id = 1;
  if h is null or p_key is null or encode(digest(p_key, 'sha256'), 'hex') <> h then raise exception 'bad key'; end if;
  v_order := coalesce(p->>'order_id', p->>'orderId', p->>'transaction_id', p->>'id');
  if v_order is null then raise exception 'no order id'; end if;
  v_sub := coalesce(p->>'sub', p->>'sub_id', p->>'subid', p->>'click_id', p->>'clickId');
  v_kind := lower(coalesce(p->>'event', p->>'type', p->>'kind', 'sale'));
  v_kind := case when v_kind ~ '(top|refill|recharge)' then 'topup' when v_kind ~ '(refund|cancel|chargeback)' then 'refund' else 'sale' end;
  insert into public.esim_events (sub, order_id, kind, plan_name, gb, days, amount, currency, commission, status, country, raw)
  values (v_sub, v_order, v_kind, coalesce(p->>'plan', p->>'plan_name', p->>'package'),
          nullif(regexp_replace(coalesce(p->>'gb', p->>'data_gb', ''), '[^0-9.]', '', 'g'), '')::numeric,
          nullif(regexp_replace(coalesce(p->>'days', p->>'validity', ''), '[^0-9]', '', 'g'), '')::int,
          nullif(regexp_replace(coalesce(p->>'amount', p->>'price', p->>'total', ''), '[^0-9.]', '', 'g'), '')::numeric,
          upper(coalesce(p->>'currency', 'USD')),
          nullif(regexp_replace(coalesce(p->>'commission', p->>'payout', ''), '[^0-9.]', '', 'g'), '')::numeric,
          coalesce(p->>'status', 'paid'),
          coalesce((select country from public.esim_clicks where sub = v_sub), upper(left(p->>'country', 2))),
          p)
  on conflict (order_id, kind) do update set status = excluded.status, amount = coalesce(excluded.amount, esim_events.amount),
    commission = coalesce(excluded.commission, esim_events.commission), raw = excluded.raw;
  return 'ok';
end $$;
revoke all on function public.esim_ingest(text, jsonb) from public;
grant execute on function public.esim_ingest(text, jsonb) to anon;

-- the founder types the postback key once in the admin; only its fingerprint is kept
create or replace function public.admin_esim_set_key(p_key text) returns text
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if length(coalesce(p_key, '')) < 24 then raise exception 'Kalit kamida 24 belgi bo''lsin'; end if;
  update public.esim_settings set ingest_key_hash = encode(digest(p_key, 'sha256'), 'hex'), updated_at = now() where id = 1;
  return 'ok';
end $$;
revoke all on function public.admin_esim_set_key(text) from public, anon;
grant execute on function public.admin_esim_set_key(text) to authenticated;

-- numbers for the admin: clicks, sales, top-ups, money and our share, by month / plan / country
create or replace function public.admin_esim_stats(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb; pct numeric;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select commission_pct into pct from public.esim_settings where id = 1;
  with c as (select * from public.esim_clicks where created_at >= p_from and created_at < p_to + 1),
       e as (select *, coalesce(commission, round(amount * coalesce(pct, 0) / 100, 2)) as share,
                    case when kind = 'refund' then -1 else 1 end as sg
               from public.esim_events where created_at >= p_from and created_at < p_to + 1)
  select jsonb_build_object(
    'clicks', (select count(*) from c),
    'sales', (select count(*) from e where kind = 'sale'),
    'topups', (select count(*) from e where kind = 'topup'),
    'refunds', (select count(*) from e where kind = 'refund'),
    'revenue', (select coalesce(sum(sg * amount), 0) from e),
    'share', (select coalesce(sum(sg * share), 0) from e),
    'gb', (select coalesce(sum(gb), 0) from e where kind <> 'refund'),
    'months', (select coalesce(jsonb_agg(m order by m->>'m' desc), '[]') from (
        select jsonb_build_object('m', to_char(date_trunc('month', created_at), 'YYYY-MM'),
          'sales', count(*) filter (where kind = 'sale'), 'topups', count(*) filter (where kind = 'topup'),
          'revenue', sum(sg * amount), 'share', sum(sg * share)) m from e group by date_trunc('month', created_at)) x),
    'plans', (select coalesce(jsonb_agg(x order by (x->>'n')::int desc), '[]') from (
        select jsonb_build_object('plan', coalesce(plan_name, '—'), 'n', count(*), 'revenue', sum(sg * amount), 'share', sum(sg * share)) x
          from e where kind <> 'refund' group by plan_name) y),
    'countries', (select coalesce(jsonb_agg(x order by (x->>'n')::int desc), '[]') from (
        select jsonb_build_object('c', coalesce(country, '—'), 'n', count(*)) x from e where kind = 'sale' group by country) y),
    'click_plans', (select coalesce(jsonb_agg(x order by (x->>'n')::int desc), '[]') from (
        select jsonb_build_object('plan', coalesce(p.name, '—'), 'n', count(*)) x from c left join public.esim_plans p on p.id = c.plan_id group by p.name) y),
    'recent', (select coalesce(jsonb_agg(x order by x->>'t' desc), '[]') from (
        select jsonb_build_object('t', created_at, 'kind', kind, 'order', order_id, 'sub', sub, 'plan', plan_name, 'gb', gb, 'days', days,
          'amount', amount, 'cur', currency, 'share', share, 'status', status, 'country', country) x
          from e order by created_at desc limit 50) y)
  ) into r;
  return r;
end $$;
revoke all on function public.admin_esim_stats(date, date) from public, anon;
grant execute on function public.admin_esim_stats(date, date) to authenticated;

-- table rights for the admin page (row rules above still decide who sees what)
grant select, update on public.esim_settings to authenticated;
grant insert, update, delete on public.esim_plans to authenticated;
grant usage, select on sequence public.esim_plans_id_seq to authenticated;
grant select on public.esim_clicks, public.esim_events to authenticated;
