-- Moviy Nomad — staff login set by the founder (2026-11-23, founder's decision)
-- * The founder creates a manager in "Jamoa": e-mail + name + password. No e-mail confirmation, no codes, no app.
-- * The manager logs in with that e-mail + password from any computer/phone.
-- * Every NEW device waits for the founder's "Tasdiqlash" in Jamoa (red badge); after that it goes straight in.

-- every new device waits for the founder (no automatic first device)
create or replace function public.register_device(p_label text) returns text
language plpgsql security definer set search_path = public as $$
declare dev text := public.req_device(); st boolean;
begin
  if auth.uid() is null or dev is null or length(dev) < 16 then return 'bad'; end if;
  if public.my_role() is distinct from 'manager' then return 'not_manager'; end if;
  select approved into st from public.admin_devices where user_id = auth.uid() and device_id = dev;
  if found then
    update public.admin_devices set last_seen = now() where user_id = auth.uid() and device_id = dev;
    return case when st then 'approved' else 'pending' end;
  end if;
  insert into public.admin_devices (user_id, device_id, label, approved, last_seen) values (auth.uid(), dev, left(p_label, 200), false, now());
  return 'pending';
end $$;
grant execute on function public.register_device(text) to authenticated;

-- a manager counts only when active and on an approved device (no authenticator app any more)
create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = 'manager'
     and coalesce((select p.active from public.profiles p where p.id = auth.uid()), true)
     and exists (select 1 from public.admin_devices d where d.user_id = auth.uid() and d.device_id = public.req_device() and d.approved);
$$;

-- founder creates a staff account with a password (no e-mail is sent)
create or replace function public.admin_create_staff(p_email text, p_password text, p_name text) returns uuid
language plpgsql security definer set search_path = public, extensions, auth as $$
declare uid uuid := gen_random_uuid(); em text := lower(trim(p_email));
begin
  if not public.is_admin() then raise exception 'Faqat asoschi xodim qo''sha oladi'; end if;
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail noto''g''ri'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'Parol kamida 8 belgi bo''lsin'; end if;
  if exists (select 1 from auth.users where lower(email) = em) then raise exception 'Bu e-mail bilan akkaunt allaqachon bor'; end if;
  insert into public.staff_invites (email, full_name, used_at) values (em, nullif(trim(p_name), ''), null)
    on conflict (email) do update set full_name = excluded.full_name, used_at = null;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change,
                          email_change_token_current, phone_change, phone_change_token, reauthentication_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
          crypt(p_password, gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('contact_name', nullif(trim(p_name), '')),
          now(), now(), '', '', '', '', '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true), 'email', now(), now(), now());
  update public.profiles set role = 'manager', active = true, full_name = coalesce(nullif(trim(p_name), ''), full_name), email = em where id = uid;
  return uid;
end $$;
revoke all on function public.admin_create_staff(text, text, text) from public, anon;
grant execute on function public.admin_create_staff(text, text, text) to authenticated;

-- founder sets a new password for a manager
create or replace function public.admin_set_staff_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if not public.is_admin() then raise exception 'Faqat asoschi parol qo''ya oladi'; end if;
  if (select role from public.profiles where id = p_user) is distinct from 'manager' then raise exception 'Faqat menejer paroli'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'Parol kamida 8 belgi bo''lsin'; end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() where id = p_user;
end $$;
revoke all on function public.admin_set_staff_password(uuid, text) from public, anon;
grant execute on function public.admin_set_staff_password(uuid, text) to authenticated;

-- founder removes a manager completely (clients/agencies become "unassigned")
create or replace function public.admin_delete_staff(p_user uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
declare em text;
begin
  if not public.is_admin() then raise exception 'Faqat asoschi'; end if;
  if (select role from public.profiles where id = p_user) is distinct from 'manager' then raise exception 'Faqat menejerni o''chirish mumkin'; end if;
  select email into em from auth.users where id = p_user;
  delete from public.profiles where id = p_user;
  delete from auth.users where id = p_user;
  delete from public.staff_invites where lower(email) = lower(em);
end $$;
revoke all on function public.admin_delete_staff(uuid) from public, anon;
grant execute on function public.admin_delete_staff(uuid) to authenticated;
