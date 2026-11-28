-- 2026-11-24 (founder): partner calendar — the partner marks busy days (red), travellers see free days (green) and ask for a free day.
create table if not exists public.partner_busy (
  partner_id uuid not null references public.partners(id) on delete cascade,
  day date not null,
  note text,                              -- private: only the partner and Moviy Nomad staff see it
  created_at timestamptz not null default now(),
  primary key (partner_id, day));
alter table public.partner_busy enable row level security;
drop policy if exists partner_busy_own on public.partner_busy;
create policy partner_busy_own on public.partner_busy for all to authenticated
  using (partner_id = public.my_partner() or public.is_admin() or public.is_manager())
  with check (partner_id = public.my_partner() or public.is_admin() or public.is_manager());
grant select, insert, update, delete on public.partner_busy to authenticated;

-- public: only busy dates from today on (no notes), only approved partners
create or replace view public.partner_busy_public as
  select b.partner_id, b.day
    from public.partner_busy b join public.partners p on p.id = b.partner_id
   where p.status = 'approved' and b.day >= current_date and b.day < current_date + 400;
grant select on public.partner_busy_public to anon, authenticated;
select 'ok' as result;
