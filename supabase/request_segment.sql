-- 2026-11-24 (founder): requests from the guide/partner form — the visitor says if they are a tourist (B2C) or a travel agent (B2B);
-- country comes from a list (ISO code). Uzbekistan → Telegram required, WhatsApp optional; any other country → WhatsApp required.
alter table public.site_requests add column if not exists segment text not null default 'b2c';
alter table public.site_requests add column if not exists company text;
do $$ begin
  alter table public.site_requests add constraint site_requests_segment_chk check (segment in ('b2c', 'b2b'));
exception when duplicate_object then null; end $$;

create or replace function public.site_requests_segment() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.details ? 'segment' then
    new.segment := case when new.details->>'segment' = 'b2b' then 'b2b' else 'b2c' end;
    new.company := nullif(left(trim(coalesce(new.details->>'company', '')), 160), '');
    if new.segment = 'b2b' and new.company is null then raise exception 'company_required'; end if;
    if coalesce(new.details->>'country_code', '') = '' then raise exception 'country_required'; end if;
    if new.details->>'country_code' = 'UZ' then
      if length(trim(coalesce(new.details->>'telegram', ''))) < 5 then raise exception 'telegram_required'; end if;
    elsif new.phone is null or length(regexp_replace(new.phone, '\D', '', 'g')) < 7 then
      raise exception 'whatsapp_required';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists site_requests_segment on public.site_requests;
create trigger site_requests_segment before insert on public.site_requests for each row execute function public.site_requests_segment();
create index if not exists site_requests_segment_idx on public.site_requests (segment, created_at desc);
select 'ok' as result;
