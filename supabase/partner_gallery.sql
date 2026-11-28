-- 2026-11-24 (founder): open portfolio — all partner photos (also photos with travellers) are public in the profile gallery,
-- up to 30 photos; every photo can be liked by visitors; the most liked photos come first.

create or replace function public.partner_apply(pid uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
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
    photos = coalesce((select array_agg(left(x, 300)) from (select x from jsonb_array_elements_text(coalesce(p->'photos', '[]')) x limit 30) s), '{}'),
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
  where id = pid;
end $$;
revoke all on function public.partner_apply(uuid, jsonb) from public, anon, authenticated;

create table if not exists public.partner_photo_likes (
  partner_id uuid not null references public.partners(id) on delete cascade,
  path text not null,
  vid text not null,
  created_at timestamptz not null default now(),
  primary key (path, vid));
alter table public.partner_photo_likes enable row level security;

create or replace view public.partner_photo_likes_public as
  select l.partner_id, l.path, count(*)::int as likes
    from public.partner_photo_likes l join public.partners p on p.id = l.partner_id
   where p.status = 'approved' group by l.partner_id, l.path;
grant select on public.partner_photo_likes_public to anon, authenticated;

create or replace function public.partner_photo_like(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pid uuid; ph text := left(coalesce(p->>'path', ''), 300); v text := left(coalesce(p->>'vid', ''), 64); n int;
begin
  begin pid := (p->>'id')::uuid; exception when others then raise exception 'bad id'; end;
  if length(v) < 8 then raise exception 'bad visitor'; end if;
  if not exists (select 1 from public.partners where id = pid and status = 'approved' and (ph = any(photos) or ph = photo)) then raise exception 'not found'; end if;
  if coalesce((p->>'on')::boolean, true) then
    insert into public.partner_photo_likes (partner_id, path, vid) values (pid, ph, v) on conflict do nothing;
  else
    delete from public.partner_photo_likes where path = ph and vid = v;
  end if;
  select count(*) into n from public.partner_photo_likes where path = ph;
  return jsonb_build_object('likes', n, 'liked', exists (select 1 from public.partner_photo_likes where path = ph and vid = v));
end $$;
grant execute on function public.partner_photo_like(jsonb) to anon, authenticated;
select 'ok' as result;
