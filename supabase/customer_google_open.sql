-- 26.11.2026 — B2C clients: Google sign-in opens the cabinet at once (Google has already verified the e-mail).
-- E-mail + password registrations still wait for approval in admin → "Mijozlar bazasi". Blocked clients stay blocked.
create or replace function public.cabinet_register(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare cid uuid; st text; em text := lower(coalesce(auth.jwt()->>'email', ''));
        g boolean := coalesce(auth.jwt()->'app_metadata'->>'provider', '') = 'google'
                     or coalesce(auth.jwt()->'app_metadata'->'providers', '[]'::jsonb) ? 'google';
begin
  if auth.uid() is null or em !~ '@' then raise exception 'not signed in'; end if;
  cid := public.my_customer();
  if cid is null then
    cid := public.customer_for_email(em, p->>'name', p->>'phone', p->>'lang');
    update public.site_customers set auth_user_id = auth.uid() where id = cid;
  end if;
  delete from public.profiles where id = auth.uid() and role = 'agent' and agency_id is null;
  update public.site_customers set
      name = coalesce(nullif(left(trim(p->>'name'), 120), ''), name, nullif(left(trim(auth.jwt()->'user_metadata'->>'full_name'), 120), '')),
      phone = coalesce(nullif(left(trim(p->>'phone'), 40), ''), phone),
      lang = coalesce(nullif(left(p->>'lang', 5), ''), lang),
      provider = case when g then 'google' else provider end,
      account_status = case when account_status = 'blocked' then 'blocked'
                            when g then 'approved'
                            when account_status = 'none' then 'pending' else account_status end,
      account_requested_at = coalesce(account_requested_at, now()), last_seen = now()
   where id = cid returning account_status into st;
  if st = 'pending' then perform public.notify_add('site_customers', cid, 'admin_reg', public.notify_office(), 'uz'); end if;
  return st;
end $$;
revoke all on function public.cabinet_register(jsonb) from public, anon;
grant execute on function public.cabinet_register(jsonb) to authenticated;
select 'ok' as natija;
