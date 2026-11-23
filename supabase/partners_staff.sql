-- 2026-11-24 (founder): managers (admins) may also review and approve partners and their reviews.
-- Managers can UPDATE (approve / pause / reject / licence badge), but cannot delete partners.
drop policy if exists partners_manager_update on public.partners;
create policy partners_manager_update on public.partners for update to authenticated
  using (public.is_manager()) with check (public.is_manager());
drop policy if exists partner_reviews_manager_update on public.partner_reviews;
create policy partner_reviews_manager_update on public.partner_reviews for update to authenticated
  using (public.is_manager()) with check (public.is_manager());
-- managers can open partner documents and photos with travellers (signed links)
drop policy if exists partner_files_select on storage.objects;
create policy partner_files_select on storage.objects for select to authenticated using (
  bucket_id in ('partner-photos','partner-docs') and (public.is_admin() or public.is_manager() or (storage.foldername(name))[1] = public.my_partner()::text));
select 'ok' as result;
