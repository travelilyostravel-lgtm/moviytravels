-- 26.11.2026 (founder): guides fill their full price list in the partner card (same columns as the Google Sheet).
-- Prices are NETTO and private: never in partners_public / partner_extra_public. Staff approve them; orders use them.
alter table public.partners add column if not exists rates jsonb not null default '{}'::jsonb;      -- approved price list
alter table public.partners add column if not exists rates_new jsonb;                              -- submitted, waiting for review
alter table public.partners add column if not exists rates_at timestamptz;                         -- last submit
alter table public.partners add column if not exists rates_ok_at timestamptz;                      -- last approval

-- whitelist + numbers only (0..5000 $)
create or replace function public.rates_clean(p jsonb) returns jsonb
language sql immutable as $fn$
  select coalesce(jsonb_object_agg(k, to_jsonb(round(least(greatest((p->>k)::numeric, 0), 5000), 2))), '{}'::jsonb)
    from unnest(array['full_day','half_day','extra_hour','meet','out_of_town','tour_day','big_group']) k
   where p ? k and (p->>k) ~ '^[0-9]+(\.[0-9]+)?$';
$fn$;

-- partner saves own list → waits for review (before approval of the card it is applied right away too)
create or replace function public.partner_save_rates(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me public.partners; r jsonb;
begin
  select * into me from public.partners where user_id = auth.uid() limit 1;
  if me.id is null then raise exception 'not a partner'; end if;
  r := public.rates_clean(p);
  if me.status = 'approved' then
    update public.partners set rates_new = r, rates_at = now() where id = me.id;
  else
    update public.partners set rates = r, rates_new = null, rates_at = now(),
           price_day = coalesce((r->>'full_day')::numeric, price_day) where id = me.id;
  end if;
  return r;
end $$;

-- staff approve submitted list (full_day also becomes the card's day price)
create or replace function public.admin_rates_decide(p_partner uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not allowed'; end if;
  if p_ok then
    update public.partners set rates = coalesce(rates_new, rates), rates_new = null, rates_ok_at = now(),
           price_day = coalesce((coalesce(rates_new, rates)->>'full_day')::numeric, price_day)
     where id = p_partner;
  else
    update public.partners set rates_new = null where id = p_partner;
  end if;
end $$;

revoke all on function public.partner_save_rates(jsonb) from public, anon;
revoke all on function public.admin_rates_decide(uuid, boolean) from public, anon;
grant execute on function public.partner_save_rates(jsonb), public.admin_rates_decide(uuid, boolean) to authenticated;

-- guide qualification category (havaskor / ixtisoslashgan / professional / oltin_fond) is public: kept in extra
create or replace function public.partner_save_extra(p jsonb) returns void
language sql security definer set search_path = public as $fn$
  update public.partners set extra = jsonb_strip_nulls(jsonb_build_object(
      'amenities', (select coalesce(jsonb_agg(left(x, 40)), '[]'::jsonb) from (select x from jsonb_array_elements_text(coalesce(p->'amenities', '[]'::jsonb)) x limit 30) s),
      'check_in', left(p->>'check_in', 10),
      'check_out', left(p->>'check_out', 10),
      'map_url', (case when left(p->>'map_url', 8) = 'https://' then left(p->>'map_url', 400) end),
      'policies', left(p->>'policies', 800),
      'company_type', left(p->>'company_type', 20),
      'registry_no', left(p->>'registry_no', 80),
      'guide_cat', (case when p->>'guide_cat' in ('havaskor','ixtisoslashgan','professional','oltin_fond') then p->>'guide_cat' end))),
    updated_at = now()
   where id = public.my_partner() and public.my_partner() is not null;
$fn$;
grant execute on function public.partner_save_extra(jsonb) to authenticated;

select 'ok' as result;
