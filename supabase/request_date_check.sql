-- 26.11.2026 — a trip date must be real (a typo like year 275760 broke the admin card).
-- NOT VALID: existing rows are not checked, every new or edited row is.
alter table public.site_requests drop constraint if exists site_requests_dates_chk;
alter table public.site_requests add constraint site_requests_dates_chk
  check ((start_date is null or start_date between date '2024-01-01' and date '2040-12-31')
     and (end_date is null or end_date between date '2024-01-01' and date '2040-12-31')) not valid;
select 'ok' as natija;
