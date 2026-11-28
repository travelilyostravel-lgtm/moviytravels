-- =====================================================================
-- Moviy Nomad — price control from the admin panel. Run once (safe to re-run).
-- Two rows in one table:
--   id = 'costs'  : real costs + margin (admins only)
--   id = 'public' : ready selling prices the website reads (no costs, no margin)
-- Every save keeps the previous version in price_config_log.
-- =====================================================================
create table if not exists public.price_config (
  id          text primary key check (id in ('costs','public')),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create table if not exists public.price_config_log (
  id          bigserial primary key,
  config_id   text not null,
  data        jsonb not null,
  saved_at    timestamptz not null,
  saved_by    uuid,
  replaced_at timestamptz not null default now()
);

create or replace function public.price_config_keep_history() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into price_config_log (config_id, data, saved_at, saved_by) values (old.id, old.data, old.updated_at, old.updated_by);
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists price_config_history on public.price_config;
create trigger price_config_history before update on public.price_config
  for each row execute function public.price_config_keep_history();

alter table public.price_config enable row level security;
alter table public.price_config_log enable row level security;

drop policy if exists price_public_read on public.price_config;
create policy price_public_read on public.price_config for select to anon, authenticated using (id = 'public');
drop policy if exists price_admin_all on public.price_config;
create policy price_admin_all on public.price_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists price_log_admin on public.price_config_log;
create policy price_log_admin on public.price_config_log for select to authenticated using (public.is_admin());

grant select on public.price_config to anon;
grant select, insert, update on public.price_config to authenticated;
grant select on public.price_config_log to authenticated;
