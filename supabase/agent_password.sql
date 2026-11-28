-- Agents register without a password (25.11.2026). Moviy Nomad checks the documents and then
-- gives the agent a password: login = the e-mail from the application.
-- admin_agent_password(agency, password): admins only; sets the password of the agency's login account
-- and marks its e-mail as confirmed.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_agent_password(p_agency uuid, p_password text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid; em text;
begin
  if not public.is_admin() then raise exception 'Only Moviy Nomad can set agent passwords'; end if;
  if p_password is null or length(p_password) < 8 then raise exception 'Password must be at least 8 characters'; end if;
  select a.email into em from public.agencies a where a.id = p_agency;
  if em is null then raise exception 'Agency not found'; end if;
  select p.id into uid from public.profiles p
    where p.agency_id = p_agency order by (lower(p.email) = lower(em)) desc, p.id limit 1;
  if uid is null then raise exception 'This agency has no login account'; end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at = now()
   where id = uid
  returning email into em;
  update public.agencies set password_set_at = now() where id = p_agency;
  return em;
end $$;

alter table public.agencies add column if not exists password_set_at timestamptz;

revoke all on function public.admin_agent_password(uuid, text) from public, anon;
grant execute on function public.admin_agent_password(uuid, text) to authenticated;
