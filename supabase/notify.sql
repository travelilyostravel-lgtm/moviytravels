-- =====================================================================
-- Moviy Nomad — e-mail required, WhatsApp optional; message log; richer voucher (2026-11-23)
-- Simple words:
--   * website forms: e-mail is now required, WhatsApp number is optional
--   * every message the admin sends (e-mail / WhatsApp) is written into "messages" of the request
--   * get_voucher also returns the client's contacts and the payments (for the confirmation document)
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- =====================================================================
alter table public.site_requests alter column phone drop not null;
alter table public.site_requests add column if not exists messages jsonb not null default '[]'::jsonb;

create or replace function public.submit_site_request(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_ref   text;
  v_kind  text := p->>'kind';
  v_phone text := nullif(left(trim(coalesce(p->>'phone', '')), 40), '');
  v_email text := lower(left(trim(coalesce(p->>'email', '')), 160));
  v_name  text := left(trim(coalesce(p->>'contact_name', '')), 120);
  v_tr    jsonb := coalesce(p->'travellers', '[]'::jsonb);
begin
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'consent_required'; end if;
  if v_kind not in ('tour','service','group') then raise exception 'bad_kind'; end if;
  if length(v_name) < 2 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'contact_required'; end if;
  if v_phone is not null and length(regexp_replace(v_phone, '\D', '', 'g')) < 6 then v_phone := null; end if;
  if jsonb_typeof(v_tr) <> 'array' or jsonb_array_length(v_tr) > 60 then raise exception 'bad_travellers'; end if;
  if length(coalesce(p->>'message', '')) > 3000 or length(p::text) > 30000 then raise exception 'too_long'; end if;
  if (select count(*) from site_requests where email = v_email and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'too_many_requests';
  end if;
  insert into site_requests (kind, service, tour_id, tour_title, start_date, end_date, pax, contact_name, email, phone,
                             messenger, citizenship, travellers, details, message, pay_method, lang)
  values (v_kind,
          left(p->>'service', 30), left(p->>'tour_id', 40), left(p->>'tour_title', 200),
          nullif(p->>'start_date', '')::date, nullif(p->>'end_date', '')::date,
          nullif(p->>'pax', '')::int,
          v_name, v_email, v_phone,
          left(p->>'messenger', 40), left(p->>'citizenship', 80),
          v_tr, coalesce(p->'details', '{}'::jsonb), left(p->>'message', 3000),
          case when p->>'pay_method' in ('bank','card','contact') then p->>'pay_method' end,
          left(p->>'lang', 5))
  returning ref into v_ref;
  return v_ref;
end $$;
revoke all on function public.submit_site_request(jsonb) from public;
grant execute on function public.submit_site_request(jsonb) to anon, authenticated;

create or replace function public.get_voucher(p_ref text, p_key text) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare r record; b record;
begin
  if p_ref is null or p_key is null or length(p_key) < 16 then return null; end if;
  if p_ref like 'MR-%' then
    select * into r from site_requests where ref = p_ref and voucher_key = p_key and status in ('deposit_paid','paid','confirmed','closed');
    if not found then return null; end if;
    return jsonb_build_object('kind','b2c','ref',r.ref,'status',r.status,'tour_id',r.tour_id,'tour_title',r.tour_title,'start_date',r.start_date,
      'end_date',r.end_date,'pax',r.pax,'lead',r.contact_name,'email',r.email,'phone',r.phone,'citizenship',r.citizenship,
      'travellers',r.travellers,'details',r.details,'lang',r.lang,'issued',coalesce(r.voucher_at, now()),
      'paid',r.paid_total,'total',r.price_total,'balance_due',r.balance_due,'currency','USD',
      'payments',(select coalesce(jsonb_agg(jsonb_build_object('on',p.paid_on,'amount',p.amount,'method',p.method) order by p.paid_on, p.created_at), '[]'::jsonb)
                  from payments p where p.ref_kind = 'request' and p.ref_id = r.id));
  elsif p_ref like 'MN-%' then
    select bk.*, ag.name as agency_name into b from bookings bk join agencies ag on ag.id = bk.agency_id
      where bk.ref = p_ref and bk.voucher_key = p_key and bk.status in ('paid','confirmed');
    if not found then return null; end if;
    return jsonb_build_object('kind','b2b','ref',b.ref,'status',b.status,'tour_id',b.tour_id,'tour_title',b.tour_title,'start_date',b.start_date,
      'pax',b.pax,'config',b.config,'agency',b.agency_name,'issued',coalesce(b.confirmed_at, now()),
      'travellers',(select coalesce(jsonb_agg(jsonb_build_object('first',t.first_name,'last',t.last_name,'nationality',t.nationality,
          'passport','***' || right(t.passport_no, 3)) order by t.created_at), '[]'::jsonb) from travellers t where t.booking_id = b.id),
      'services',(select coalesce(jsonb_agg(jsonb_build_object('kind',s.kind,'title',s.title,'city',s.city,'from',s.date_from,'to',s.date_to,
          'conf',s.confirmation_no,'contact',s.contact,'details',s.details) order by s.sort, s.date_from), '[]'::jsonb) from booking_services s where s.booking_id = b.id));
  end if;
  return null;
end $$;
revoke all on function public.get_voucher(text, text) from public;
grant execute on function public.get_voucher(text, text) to anon, authenticated;
