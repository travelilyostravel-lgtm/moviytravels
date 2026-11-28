-- =====================================================================
-- Moviy Nomad — CLIENT CABINET ("Mening kabinetim") for B2C travellers (2026-11-25)
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- Simple words:
--   * every website request is linked to the client's card (site_customers) by e-mail; a card is created
--     automatically for a client who is not in the base yet; old requests are linked too
--   * a traveller can open a personal cabinet on the site (e-mail + password or Google). The registration
--     comes to the admin panel; the founder or a manager approves it, then the cabinet opens
--   * in the cabinet the client sees ONLY his own requests: status in plain words, cancel reason, paid / left,
--     due dates, documents and vouchers, and the conversation with us. Internal notes, netto prices,
--     commissions and other clients are never shown (all reading goes through the safe functions below)
--   * the conversation (request_messages): we write to the client, he answers; unread messages get a red mark
--     on the site and an e-mail; his answers come to the admin panel
--   * payment rules: less than 14 days before the trip → 100% at once; "30% paid" only when at least 30% arrived
-- =====================================================================

-- ---------------------------------------------------------------- client card: cabinet status
alter table public.site_customers add column if not exists account_status text not null default 'none';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'site_customers_account_status_chk') then
    alter table public.site_customers add constraint site_customers_account_status_chk
      check (account_status in ('none','pending','approved','blocked'));
  end if;
end $$;
alter table public.site_customers add column if not exists account_requested_at timestamptz;
alter table public.site_customers add column if not exists approved_at timestamptz;
alter table public.site_customers add column if not exists approved_by uuid;
create index if not exists site_customers_auth_idx on public.site_customers(auth_user_id);

-- ---------------------------------------------------------------- requests → client card
alter table public.site_requests add column if not exists customer_id uuid references public.site_customers(id) on delete set null;
alter table public.site_requests add column if not exists cancel_reason text;          -- shown to the client (admin_note never is)
create index if not exists site_requests_customer_idx on public.site_requests(customer_id, created_at desc);

-- find the card by e-mail or create it (internal helper)
create or replace function public.customer_for_email(p_email text, p_name text, p_phone text, p_lang text) returns uuid
language plpgsql security definer set search_path = public as $$
declare em text := lower(trim(coalesce(p_email, ''))); cid uuid;
begin
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return null; end if;
  insert into public.site_customers (email, name, phone, lang, provider)
  values (em, left(nullif(trim(p_name), ''), 120), left(nullif(trim(p_phone), ''), 40), left(p_lang, 5), 'email')
  on conflict (email) do update set
    name = coalesce(site_customers.name, excluded.name),
    phone = coalesce(site_customers.phone, excluded.phone),
    lang = coalesce(site_customers.lang, excluded.lang),
    last_seen = now()
  returning id into cid;
  return cid;
end $$;
revoke all on function public.customer_for_email(text, text, text, text) from public, anon, authenticated;

create or replace function public.site_requests_customer() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email like '%@%' and (tg_op = 'INSERT' or new.customer_id is null or new.email is distinct from old.email) then
    new.customer_id := public.customer_for_email(new.email, new.contact_name, new.phone, new.lang);
  end if;
  return new;
end $$;
drop trigger if exists a_site_requests_customer on public.site_requests;
create trigger a_site_requests_customer before insert or update of email, customer_id on public.site_requests
  for each row execute function public.site_requests_customer();

-- old requests: link by e-mail (creates missing cards)
update public.site_requests r set customer_id = public.customer_for_email(r.email, r.contact_name, r.phone, r.lang)
 where r.customer_id is null and r.email like '%@%';

-- ---------------------------------------------------------------- payment rules (30% / 70%, 14 days)
-- * fewer than 14 days before the trip: 100% at once (balance due = today, no "30% paid" step)
-- * "30% paid" (deposit_paid) only when at least 30% of the price has arrived
create or replace function public.site_requests_payrules() returns trigger
language plpgsql security definer set search_path = public as $$
declare full_now boolean;
begin
  if coalesce(new.price_total, 0) <= 0 then return new; end if;
  full_now := new.start_date is not null and new.start_date - 14 <= current_date;
  if tg_op = 'INSERT' or new.price_total is distinct from old.price_total or new.start_date is distinct from old.start_date
     or new.balance_due is distinct from old.balance_due then
    if new.start_date is null then null;
    elsif full_now then new.balance_due := current_date;
    elsif new.balance_due is null or new.balance_due > new.start_date - 14 then new.balance_due := new.start_date - 14;
    end if;
  end if;
  if new.status = 'deposit_paid' then
    if full_now and coalesce(new.paid_total, 0) < new.price_total - 0.5 then new.status := 'awaiting_payment';
    elsif coalesce(new.paid_total, 0) < round(new.price_total * 0.3, 2) - 0.5 then new.status := 'awaiting_payment';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists b_site_requests_payrules on public.site_requests;
create trigger b_site_requests_payrules before insert or update on public.site_requests
  for each row execute function public.site_requests_payrules();

-- ---------------------------------------------------------------- the conversation
create table if not exists public.request_messages (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.site_customers(id) on delete cascade,
  request_id   uuid references public.site_requests(id) on delete cascade,     -- empty = general message
  author       text not null check (author in ('admin','client')),
  author_id    uuid default auth.uid(),
  body         text not null check (length(body) between 1 and 3000),
  created_at   timestamptz not null default now(),
  read_at      timestamptz
);
create index if not exists request_messages_cust_idx on public.request_messages(customer_id, created_at);
create index if not exists request_messages_req_idx on public.request_messages(request_id);
create index if not exists request_messages_unread_idx on public.request_messages(author, read_at) where read_at is null;
alter table public.request_messages enable row level security;
-- staff only (clients read and write through the cabinet functions below)
create or replace function public.staff_sees_customer(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_manager() and exists (
    select 1 from public.site_requests r where r.customer_id = c and r.assigned_to = auth.uid()));
$$;
drop policy if exists request_messages_staff on public.request_messages;
create policy request_messages_staff on public.request_messages for all to authenticated
  using (public.staff_sees_customer(customer_id)) with check (public.staff_sees_customer(customer_id));
grant select, insert, update on public.request_messages to authenticated;

-- staff messages are always "admin"; the client's ones are written only by the cabinet function
create or replace function public.request_messages_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('mn.client_msg', true), '') = '1' then
    new.author := 'client';
  elsif public.is_admin() or public.is_manager() then
    new.author := 'admin'; new.author_id := auth.uid();
  else
    raise exception 'not allowed';
  end if;
  if new.request_id is not null and not exists (select 1 from public.site_requests r where r.id = new.request_id and r.customer_id = new.customer_id) then
    raise exception 'request belongs to another client';
  end if;
  return new;
end $$;
drop trigger if exists request_messages_guard on public.request_messages;
create trigger request_messages_guard before insert on public.request_messages
  for each row execute function public.request_messages_guard();

-- ---------------------------------------------------------------- letters (outbox) for the cabinet
alter table public.notify_outbox drop constraint if exists notify_outbox_ref_table_check;
alter table public.notify_outbox add constraint notify_outbox_ref_table_check
  check (ref_table in ('site_requests','bookings','site_customers'));

create or replace function public.request_messages_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare c record;
begin
  select * into c from public.site_customers where id = new.customer_id;
  if new.author = 'admin' then
    -- one letter "you have a new message" until the client reads it (no spam)
    perform public.notify_add('site_customers', c.id, 'message', c.email, c.lang);
  else
    perform public.notify_add('site_customers', c.id, 'admin_msg', public.notify_office(), 'uz');
  end if;
  return new;
end $$;
drop trigger if exists z_request_messages_notify on public.request_messages;
create trigger z_request_messages_notify after insert on public.request_messages
  for each row execute function public.request_messages_notify();

-- ---------------------------------------------------------------- sign-up for the cabinet
-- A traveller who signs up on account.html (e-mail + password, metadata kind = customer) must not become an agent.
create or replace function public.customer_auth_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb); cid uuid;
begin
  if coalesce(m->>'kind', '') <> 'customer' then return new; end if;
  delete from public.profiles where id = new.id and role = 'agent' and agency_id is null;
  cid := public.customer_for_email(new.email, m->>'name', m->>'phone', m->>'lang');
  update public.site_customers set auth_user_id = new.id,
         account_status = case when account_status in ('none') then 'pending' else account_status end,
         account_requested_at = coalesce(account_requested_at, now())
   where id = cid;
  perform public.notify_add('site_customers', cid, 'admin_reg', public.notify_office(), 'uz');
  return new;
end $$;
drop trigger if exists zz_customer_auth_cleanup on auth.users;
create trigger zz_customer_auth_cleanup after insert on auth.users
  for each row execute function public.customer_auth_cleanup();

-- the signed-in visitor's own card (links Google sign-ins too)
create or replace function public.my_customer() returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid; em text := lower(coalesce(auth.jwt()->>'email', ''));
begin
  if auth.uid() is null then return null; end if;
  select id into cid from public.site_customers where auth_user_id = auth.uid();
  if cid is null and em like '%@%' then
    select id into cid from public.site_customers where email = em and (auth_user_id is null or auth_user_id = auth.uid());
    if cid is not null then update public.site_customers set auth_user_id = auth.uid() where id = cid; end if;
  end if;
  return cid;
end $$;
revoke all on function public.my_customer() from public, anon;

-- ask for a cabinet (called after Google sign-in or e-mail sign-up)
create or replace function public.cabinet_register(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare cid uuid; st text; em text := lower(coalesce(auth.jwt()->>'email', ''));
begin
  if auth.uid() is null or em !~ '@' then raise exception 'not signed in'; end if;
  cid := public.my_customer();
  if cid is null then
    cid := public.customer_for_email(em, p->>'name', p->>'phone', p->>'lang');
    update public.site_customers set auth_user_id = auth.uid() where id = cid;
  end if;
  delete from public.profiles where id = auth.uid() and role = 'agent' and agency_id is null;
  update public.site_customers set
      name = coalesce(nullif(left(trim(p->>'name'), 120), ''), name),
      phone = coalesce(nullif(left(trim(p->>'phone'), 40), ''), phone),
      lang = coalesce(nullif(left(p->>'lang', 5), ''), lang),
      provider = case when coalesce(auth.jwt()->'app_metadata'->>'provider', 'email') = 'google' then 'google' else provider end,
      account_status = case when account_status = 'none' then 'pending' else account_status end,
      account_requested_at = coalesce(account_requested_at, now()), last_seen = now()
   where id = cid returning account_status into st;
  if st = 'pending' then perform public.notify_add('site_customers', cid, 'admin_reg', public.notify_office(), 'uz'); end if;
  return st;
end $$;

-- founder / manager: approve or block a cabinet
create or replace function public.cabinet_set_status(p_customer uuid, p_status text) returns text
language plpgsql security definer set search_path = public as $$
declare c record;
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not allowed'; end if;
  if p_status not in ('approved','blocked','pending') then raise exception 'bad status'; end if;
  update public.site_customers set account_status = p_status,
         approved_at = case when p_status = 'approved' then now() else approved_at end,
         approved_by = case when p_status = 'approved' then auth.uid() else approved_by end
   where id = p_customer returning * into c;
  if not found then raise exception 'not found'; end if;
  if p_status = 'approved' then
    if c.auth_user_id is not null then
      update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = c.auth_user_id;
    end if;
    perform public.notify_add('site_customers', c.id, 'account_ok', c.email, c.lang);
  end if;
  return p_status;
end $$;

-- ---------------------------------------------------------------- what the client sees (only his own data)
create or replace function public.my_cabinet() returns jsonb
language plpgsql security definer set search_path = public as $$
declare cid uuid; c record; reqs jsonb; msgs jsonb; hist jsonb; stats jsonb;
begin
  cid := public.my_customer();
  if cid is null then return jsonb_build_object('status', 'none', 'email', auth.jwt()->>'email'); end if;
  select * into c from public.site_customers where id = cid;
  update public.site_customers set last_seen = now() where id = cid;
  if c.account_status <> 'approved' then
    return jsonb_build_object('status', c.account_status, 'email', c.email, 'name', c.name);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id, 'ref', r.ref, 'kind', r.kind, 'service', r.service, 'tour_id', r.tour_id, 'tour_title', r.tour_title,
      'start_date', r.start_date, 'end_date', r.end_date, 'pax', r.pax, 'status', r.status, 'cancel_reason', r.cancel_reason,
      'price', r.price_total, 'paid', r.paid_total, 'balance_due', r.balance_due, 'created_at', r.created_at,
      'full_now', (r.start_date is not null and r.start_date - 14 <= current_date),
      'deposit', case when r.price_total is null then null
                      when r.start_date is not null and r.start_date - 14 <= current_date then r.price_total
                      else round(r.price_total * 0.3) end,
      'voucher_key', case when r.status in ('deposit_paid','paid','confirmed','closed') then r.voucher_key end,
      'services', jsonb_array_length(coalesce(r.services, '[]'::jsonb)),
      'travellers', r.travellers, 'contact_name', r.contact_name, 'citizenship', r.citizenship, 'phone', r.phone,
      'message', r.message,
      'details', jsonb_strip_nulls(jsonb_build_object('adults', r.details->'adults', 'children', r.details->'children',
                 'hotel', r.details->'hotel', 'room', r.details->'room', 'guide_lang', r.details->'guide_lang', 'city', r.details->'city'))
    ) order by r.created_at desc), '[]'::jsonb)
    into reqs from public.site_requests r where r.customer_id = cid;
  select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'request_id', m.request_id, 'author', m.author, 'body', m.body,
      'at', m.created_at, 'read', m.read_at is not null) order by m.created_at), '[]'::jsonb)
    into msgs from public.request_messages m where m.customer_id = cid;
  select coalesce(jsonb_agg(x order by (x->>'at') desc), '[]'::jsonb) into hist from (
    select jsonb_build_object('event', e.event, 'detail', left(e.detail, 160), 'at', e.created_at) as x
      from public.site_events e where e.customer_id = cid and e.event not in ('page','visit','subscribe_prompt')
     order by e.created_at desc limit 40) h;
  select jsonb_build_object(
      'requests', (select count(*) from public.site_requests where customer_id = cid),
      'trips', (select count(*) from public.site_requests where customer_id = cid and status in ('paid','confirmed','closed')),
      'paid', (select coalesce(sum(paid_total), 0) from public.site_requests where customer_id = cid),
      'unread', (select count(*) from public.request_messages where customer_id = cid and author = 'admin' and read_at is null))
    into stats;
  return jsonb_build_object('status', 'approved',
    'customer', jsonb_build_object('name', c.name, 'email', c.email, 'phone', c.phone, 'lang', c.lang, 'since', c.first_seen, 'approved_at', c.approved_at),
    'stats', stats, 'requests', reqs, 'messages', msgs, 'history', hist);
end $$;

-- red mark on every page: number of unread messages from us (0 when not approved)
create or replace function public.my_unread() returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select count(*)::int from public.request_messages m join public.site_customers c on c.id = m.customer_id
                    where c.auth_user_id = auth.uid() and c.account_status = 'approved' and m.author = 'admin' and m.read_at is null), 0);
$$;

-- the client writes to us (about one request or in general)
create or replace function public.cabinet_send(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid; rid uuid := nullif(p->>'request_id', '')::uuid; b text := trim(coalesce(p->>'body', '')); mid uuid;
begin
  cid := public.my_customer();
  if cid is null or not exists (select 1 from public.site_customers where id = cid and account_status = 'approved') then raise exception 'cabinet not approved'; end if;
  if length(b) < 1 or length(b) > 3000 then raise exception 'bad message'; end if;
  if (select count(*) from public.request_messages where customer_id = cid and author = 'client' and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'too_many_requests';
  end if;
  perform set_config('mn.client_msg', '1', true);
  insert into public.request_messages (customer_id, request_id, author, author_id, body) values (cid, rid, 'client', auth.uid(), b) returning id into mid;
  perform set_config('mn.client_msg', '', true);
  return mid;
end $$;

-- the client opened the cabinet: our messages are read; the next new message may send a letter again
create or replace function public.cabinet_read() returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  cid := public.my_customer(); if cid is null then return; end if;
  update public.request_messages set read_at = now() where customer_id = cid and author = 'admin' and read_at is null;
  delete from public.notify_outbox where ref_table = 'site_customers' and ref_id = cid and event = 'message' and status <> 'pending';
end $$;

-- the client corrects his name / phone / language
create or replace function public.cabinet_update(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  cid := public.my_customer(); if cid is null then raise exception 'not signed in'; end if;
  update public.site_customers set name = coalesce(nullif(left(trim(p->>'name'), 120), ''), name),
         phone = coalesce(nullif(left(trim(p->>'phone'), 40), ''), phone), lang = coalesce(nullif(left(p->>'lang', 5), ''), lang)
   where id = cid;
end $$;

-- staff opened a client's conversation: his messages are read
create or replace function public.staff_read(p_customer uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.staff_sees_customer(p_customer) then return; end if;
  update public.request_messages set read_at = now() where customer_id = p_customer and author = 'client' and read_at is null;
  delete from public.notify_outbox where ref_table = 'site_customers' and ref_id = p_customer and event = 'admin_msg' and status <> 'pending';
end $$;

-- admin badge: unread client messages + registrations waiting for approval
create or replace function public.staff_inbox() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'unread', (select count(*) from public.request_messages m where m.author = 'client' and m.read_at is null and public.staff_sees_customer(m.customer_id)),
    'pending', (select count(*) from public.site_customers where account_status = 'pending' and (public.is_admin() or public.is_manager())));
$$;

revoke all on function public.my_cabinet(), public.my_unread(), public.cabinet_send(jsonb), public.cabinet_read(), public.cabinet_update(jsonb),
  public.cabinet_register(jsonb), public.cabinet_set_status(uuid, text), public.staff_read(uuid), public.staff_inbox() from public, anon;
grant execute on function public.my_cabinet(), public.my_unread(), public.cabinet_send(jsonb), public.cabinet_read(), public.cabinet_update(jsonb),
  public.cabinet_register(jsonb), public.cabinet_set_status(uuid, text), public.staff_read(uuid), public.staff_inbox() to authenticated;

-- the mail function may read the client cards and messages
grant select on public.site_customers, public.request_messages to service_role;

-- staff may edit the new columns
grant update (cancel_reason, customer_id) on public.site_requests to authenticated;
