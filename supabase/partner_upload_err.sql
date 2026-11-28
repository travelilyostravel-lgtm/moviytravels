-- 2026-11-28: when photos fail to upload from a partner's phone, the form writes the reason here
-- so the founder / Claude can see it in the admin (extra.upload_err). Only the partner's own card.
create or replace function public.partner_upload_error(msg text) returns void
language sql security definer set search_path = public as $$
  update public.partners
     set extra = coalesce(extra, '{}'::jsonb) || jsonb_build_object('upload_err', left(coalesce(msg, ''), 600), 'upload_err_at', now())
   where id = public.my_partner() and public.my_partner() is not null;
$$;
revoke all on function public.partner_upload_error(text) from public, anon;
grant execute on function public.partner_upload_error(text) to authenticated;
