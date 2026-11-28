-- 2026-11-24 (founder): a partner already on the site (approved / paused) can change the card — languages, cities, photos, bio, price…
-- but the change goes to Admin → Hamkorlar as a request with the partner's comment; the founder or a manager approves it, then the card updates.
-- Partners still under review (pending) keep saving directly.

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
  where id = pid;
end $$;
revoke all on function public.partner_apply(uuid, jsonb) from public, anon, authenticated;

create or replace function public.partner_save(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare me public.partners;
begin
  select * into me from public.partners where user_id = auth.uid();
  if not found then raise exception 'not a partner'; end if;
  if me.status in ('approved', 'paused') then
    -- on the site: only private documents are saved directly; everything else needs approval (partner_request_change)
    update public.partners set docs = coalesce(p->'docs', docs), updated_at = now() where id = me.id;
    return;
  end if;
  perform public.partner_apply(me.id, p);
end $$;
grant execute on function public.partner_save(jsonb) to authenticated;

create table if not exists public.partner_changes (
  id bigserial primary key,
  partner_id uuid not null references public.partners(id) on delete cascade,
  data jsonb not null,            -- the full new card (same fields as partner_save)
  comment text not null,          -- what the partner changed and why (required)
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid);
create index if not exists partner_changes_open on public.partner_changes (status, created_at);
alter table public.partner_changes enable row level security;
drop policy if exists partner_changes_read on public.partner_changes;
create policy partner_changes_read on public.partner_changes for select to authenticated
  using (partner_id = public.my_partner() or public.is_admin() or public.is_manager());
grant select on public.partner_changes to authenticated;
grant usage, select on sequence public.partner_changes_id_seq to authenticated;

create or replace function public.partner_request_change(p jsonb, comment text) returns bigint
language plpgsql security definer set search_path = public as $$
declare me public.partners; nid bigint;
begin
  select * into me from public.partners where user_id = auth.uid();
  if not found then raise exception 'not a partner'; end if;
  if length(trim(coalesce(comment, ''))) < 3 then raise exception 'comment required'; end if;
  delete from public.partner_changes where partner_id = me.id and status = 'pending';   -- one open request at a time: the newest wins
  insert into public.partner_changes (partner_id, data, comment) values (me.id, p - 'docs', left(trim(comment), 1000)) returning id into nid;
  return nid;
end $$;
grant execute on function public.partner_request_change(jsonb, text) to authenticated;

create or replace function public.partner_change_decide(cid bigint, ok boolean, note text) returns void
language plpgsql security definer set search_path = public as $$
declare c public.partner_changes;
begin
  if not (public.is_admin() or public.is_manager()) then raise exception 'not allowed'; end if;
  select * into c from public.partner_changes where id = cid and status = 'pending';
  if not found then raise exception 'not found'; end if;
  if ok then perform public.partner_apply(c.partner_id, c.data); end if;
  update public.partner_changes set status = case when ok then 'approved' else 'rejected' end, admin_note = nullif(left(trim(coalesce(note, '')), 500), ''),
         decided_at = now(), decided_by = auth.uid() where id = cid;
end $$;
grant execute on function public.partner_change_decide(bigint, boolean, text) to authenticated;
select 'ok' as result;
