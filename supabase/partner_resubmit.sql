-- 2026-11-25 (founder): a REJECTED partner (guide, driver, hotel, any service) may correct the application and send it again,
-- as many times as needed. Every new sending puts the application back to "pending" (Admin → Hamkorlar → Tekshiruvda),
-- keeps the history of earlier rejections (date + our note + partner's comment) and counts the attempts.
-- Works from both places: the public "Become a partner" form (it calls partner_save) and the partner portal.

alter table public.partners add column if not exists resubmit_count int not null default 0;
alter table public.partners add column if not exists resubmitted_at timestamptz;
alter table public.partners add column if not exists reject_history jsonb not null default '[]'::jsonb;

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
  -- only an explicit sending counts (portal button "Tuzatib qayta yuborish" or the public form); uploading a document alone does not
  if me.status = 'rejected' and (p ? 'resubmit_comment' or coalesce(p->>'resubmit', '') = 'true') then
    -- corrected application sent again → back to the founder for a new decision
    update public.partners set
      status = 'pending',
      reject_history = coalesce(reject_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'rejected_note', admin_note, 'resent_at', now(), 'comment', nullif(left(trim(coalesce(p->>'resubmit_comment', '')), 500), ''))),
      resubmit_count = coalesce(resubmit_count, 0) + 1,
      resubmitted_at = now(),
      admin_note = null,
      updated_at = now()
    where id = me.id;
  end if;
end $$;
grant execute on function public.partner_save(jsonb) to authenticated;
