-- 2026-11-24 (founder): partners leave their Telegram (most people in Uzbekistan use Telegram). Private: only Moviy Nomad staff see it.
alter table public.partners add column if not exists telegram text;

create or replace function public.partner_save(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare me public.partners;
begin
  select * into me from public.partners where user_id = auth.uid();
  if not found then raise exception 'not a partner'; end if;
  update public.partners set
    name = coalesce(nullif(left(trim(p->>'name'), 120), ''), name),
    company = left(p->>'company', 160), inn = left(p->>'inn', 30), license_no = left(p->>'license_no', 80),
    phone = left(p->>'phone', 40), whatsapp = left(p->>'whatsapp', 40),
    city = left(p->>'city', 80),
    cities = coalesce((select array_agg(left(x, 60)) from jsonb_array_elements_text(coalesce(p->'cities', '[]')) x), '{}'),
    languages = coalesce((select array_agg(left(x, 30)) from jsonb_array_elements_text(coalesce(p->'languages', '[]')) x), '{}'),
    specialties = coalesce((select array_agg(left(x, 40)) from jsonb_array_elements_text(coalesce(p->'specialties', '[]')) x), '{}'),
    bio = left(p->>'bio', 1500),
    photo = left(p->>'photo', 300),
    photos = coalesce((select array_agg(left(x, 300)) from (select x from jsonb_array_elements_text(coalesce(p->'photos', '[]')) x limit 8) s), '{}'),
    price_day = nullif(p->>'price_day', '')::numeric, price_note = left(p->>'price_note', 200),
    vehicle_type = left(p->>'vehicle_type', 60), vehicle_seats = nullif(p->>'vehicle_seats', '')::int, vehicle_year = nullif(p->>'vehicle_year', '')::int,
    hotel_stars = nullif(p->>'hotel_stars', '')::int, hotel_rooms = nullif(p->>'hotel_rooms', '')::int,
    experience_years = nullif(p->>'experience_years', '')::int,
    docs = coalesce(p->'docs', docs),
    birth_year = case when p ? 'birth_year' then (select y from (select nullif(p->>'birth_year', '')::int y) s where y between 1940 and extract(year from now())::int - 18) else birth_year end,
    home_area = case when p ? 'home_area' then left(p->>'home_area', 120) else home_area end,
    home_address = case when p ? 'home_address' then left(p->>'home_address', 250) else home_address end,
    telegram = case when p ? 'telegram' then left(p->>'telegram', 64) else telegram end,
    updated_at = now()
  where id = me.id;
end $$;
grant execute on function public.partner_save(jsonb) to authenticated;
select 'ok' as result;
