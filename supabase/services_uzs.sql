-- =====================================================================
-- Moviy Nomad — service vouchers for website requests + payments in UZS (2026-11-23)
-- Simple words:
--   * site_requests.services = list of booked services (meeting, transfer, hotel, guide, train…) for separate vouchers
--   * payments: we keep the amount in the currency received (UZS or USD), the CBU rate, and the USD equivalent
--   * get_voucher returns the services (only when 100% paid) and payments with currency
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- =====================================================================
alter table public.site_requests add column if not exists services jsonb not null default '[]'::jsonb;
alter table public.payments add column if not exists amount_orig numeric(16,2);
alter table public.payments add column if not exists rate numeric(14,4);

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
      'services', case when r.paid_total >= coalesce(r.price_total, 0) - 0.5 and r.price_total > 0 then r.services else '[]'::jsonb end,
      'payments',(select coalesce(jsonb_agg(jsonb_build_object('on',p.paid_on,'amount',p.amount,'method',p.method,'currency',p.currency,
                    'orig',coalesce(p.amount_orig,p.amount),'rate',p.rate) order by p.paid_on, p.created_at), '[]'::jsonb)
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
