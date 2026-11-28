-- Moviy Nomad — simpler staff login (2026-11-23, founder's decision):
-- no authenticator app and no device approval; a manager logs in with an e-mail code (or password) from any device.
create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = 'manager'
     and coalesce((select p.active from public.profiles p where p.id = auth.uid()), true);
$$;
create or replace function public.next_manager() returns uuid
language plpgsql security definer set search_path = public as $$
declare m uuid;
begin
  select p.id into m from public.profiles p
   where p.role = 'manager' and coalesce(p.active, true)
   order by p.last_assigned_at nulls first, p.created_at
   limit 1 for update skip locked;
  if m is not null then update public.profiles set last_assigned_at = clock_timestamp() where id = m; end if;
  return m;
end $$;
-- remove half-finished authenticator setups so nobody is asked for an app code
delete from auth.mfa_factors where status <> 'verified';
