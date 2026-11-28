-- Moviy Nomad — agency tax number (INN / TIN / VAT) required at sign-up (2026-11-23)
alter table public.agencies add column if not exists tax_id text;
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  ag uuid;
  inv record;
begin
  select * into inv from public.staff_invites where lower(email) = lower(new.email) and used_at is null;
  if found then
    insert into public.profiles (id, role, full_name, email) values (new.id, 'manager', coalesce(inv.full_name, m->>'contact_name'), new.email)
    on conflict (id) do update set role = 'manager', full_name = excluded.full_name;
    update public.staff_invites set used_at = now() where email = inv.email;
    return new;
  end if;
  if coalesce(m->>'agency_name', '') <> '' then
    insert into public.agencies (name, country, city, address, website, license_no, tax_id, contact_name, phone, whatsapp, email)
    values (m->>'agency_name', coalesce(m->>'country', ''), m->>'city', m->>'address', m->>'website', m->>'license_no', m->>'tax_id',
            coalesce(m->>'contact_name', ''), m->>'phone', m->>'whatsapp', new.email)
    returning id into ag;
  end if;
  insert into public.profiles (id, role, agency_id, full_name, email)
  values (new.id, 'agent', ag, m->>'contact_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;
