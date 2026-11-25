-- 2026-11-25 (founder): every partner (guide, driver, hotel, any new service) has his own card.
--   * The partner sees and edits ONLY his own card (other partners never see it).
--   * After approval some fields are LOCKED — only Moviy Nomad changes them:
--       kind, name, birth year, licence / diploma number, company, INN (and status, rating, fee, checks).
--     Everything else (photos, bio, languages, cities, price, vehicle / hotel data, contacts, home area)
--     the partner changes through a change request that the admin approves.
--   * Works automatically for every new partner — nothing to set up per partner.

create or replace function public.partner_request_change(p jsonb, comment text) returns bigint
language plpgsql security definer set search_path = public as $$
declare me public.partners; nid bigint;
begin
  select * into me from public.partners where user_id = auth.uid();
  if not found then raise exception 'not a partner'; end if;
  if length(trim(coalesce(comment, ''))) < 3 then raise exception 'comment required'; end if;
  -- locked fields keep their current values whatever the browser sends
  p := (p - 'docs' - 'fee_pct' - 'status' - 'kind')
       || jsonb_build_object('name', me.name, 'license_no', me.license_no, 'company', me.company, 'inn', me.inn,
                             'birth_year', coalesce(me.birth_year::text, ''));
  delete from public.partner_changes where partner_id = me.id and status = 'pending';   -- one open request at a time: the newest wins
  insert into public.partner_changes (partner_id, data, comment) values (me.id, p, left(trim(comment), 1000)) returning id into nid;
  return nid;
end $$;
grant execute on function public.partner_request_change(jsonb, text) to authenticated;

-- admin card: history and money of one partner in one call (founder and managers)
create or replace function public.partner_history(p_partner uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.partners; r jsonb;
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not allowed'; end if;
  select * into p from public.partners where id = p_partner;
  if not found then return null; end if;
  select jsonb_build_object(
    'dates', jsonb_build_object('created', p.created_at, 'approved', p.approved_at, 'resubmitted', p.resubmitted_at, 'updated', p.updated_at),
    'resubmits', p.resubmit_count,
    'rejects', coalesce(p.reject_history, '[]'::jsonb),
    'totals', (select jsonb_build_object(
        'count', count(*), 'b2b', count(*) filter (where source = 'b2b'), 'b2c', count(*) filter (where source = 'b2c'),
        'done', count(*) filter (where status in ('paid', 'confirmed', 'closed', 'deposit_paid')),
        'cost', coalesce(sum(cost) filter (where coalesce(status, '') <> 'cancelled'), 0),
        'brutto', coalesce(sum(brutto) filter (where coalesce(status, '') <> 'cancelled'), 0),
        'agent', coalesce(sum(agent_comm) filter (where coalesce(status, '') <> 'cancelled'), 0),
        'profit', coalesce(sum(profit) filter (where coalesce(status, '') <> 'cancelled'), 0))
      from public.partner_costs where partner_id = p_partner),
    'items', coalesce((select jsonb_agg(jsonb_build_object('source', c.source, 'ref', c.ref, 'booking_id', c.booking_id, 'request_id', c.request_id,
        'start_date', c.start_date, 'units', c.units, 'qty', c.qty, 'cost', c.cost, 'brutto', c.brutto, 'agent', c.agent_comm, 'profit', c.profit,
        'status', c.status, 'created', c.created_at) order by c.created_at desc)
      from public.partner_costs c where c.partner_id = p_partner), '[]'::jsonb),
    'changes', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'created', created_at, 'comment', comment, 'status', status,
        'note', admin_note, 'decided', decided_at) order by created_at desc)
      from public.partner_changes where partner_id = p_partner), '[]'::jsonb),
    'busy_days', (select count(*) from public.partner_busy where partner_id = p_partner and day >= current_date),
    'reviews', jsonb_build_object('approved', (select count(*) from public.partner_reviews where partner_id = p_partner and status = 'approved'),
                                  'pending',  (select count(*) from public.partner_reviews where partner_id = p_partner and status = 'pending'))
  ) into r;
  return r;
end $$;
revoke all on function public.partner_history(uuid) from public, anon;
grant execute on function public.partner_history(uuid) to authenticated;
