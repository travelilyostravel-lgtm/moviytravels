-- 27.11.2026: leads can be moved out of the active list by managers and the sales agent:
--   closed  = Yopildi, other = Boshqa masala (not a tour question), spam = Soxta / spam (fake lead).
-- Managers already may update the status of their own leads (policy site_requests_mgr_upd).
-- Permanent delete: only the founder (admin), only leads marked spam, only if no payment was recorded.
alter table public.site_requests drop constraint if exists site_requests_status_check;
alter table public.site_requests add constraint site_requests_status_check
  check (status in ('new','in_progress','awaiting_payment','deposit_paid','paid','confirmed','closed','cancelled','other','spam'));

create or replace function public.admin_request_purge(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare s text;
begin
  if not public.is_admin() then raise exception 'Faqat asoschi butunlay o''chira oladi'; end if;
  select status into s from public.site_requests where id = p_id;
  if s is null then raise exception 'So''rov topilmadi'; end if;
  if s <> 'spam' then raise exception 'Avval «Soxta / spam» ga o''tkazing'; end if;
  if exists (select 1 from public.payments where ref_kind = 'request' and ref_id = p_id) then raise exception 'Bu so''rovda to''lov yozilgan — o''chirib bo''lmaydi'; end if;
  delete from public.notify_outbox where ref_table = 'site_requests' and ref_id = p_id;
  delete from public.site_requests where id = p_id;
  return 'ok';
end $$;
revoke all on function public.admin_request_purge(uuid) from public, anon;
grant execute on function public.admin_request_purge(uuid) to authenticated;
