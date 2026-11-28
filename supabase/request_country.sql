-- 2026-11-24 (founder): the site is a B2C portal — no "agent" choice in the partner form, every request is B2C.
-- Country from the list: Uzbekistan → Telegram + phone number required (e-mail optional); any other country → WhatsApp + e-mail required.

create or replace function public.submit_site_request(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_ref   text;
  v_kind  text := p->>'kind';
  v_phone text := nullif(left(trim(coalesce(p->>'phone', '')), 40), '');
  v_email text := lower(left(trim(coalesce(p->>'email', '')), 160));
  v_name  text := left(trim(coalesce(p->>'contact_name', '')), 120);
  v_tr    jsonb := coalesce(p->'travellers', '[]'::jsonb);
begin
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'consent_required'; end if;
  if v_kind not in ('tour','service','group') then raise exception 'bad_kind'; end if;
  -- e-mail is required, except for visitors from Uzbekistan in the partner form (they leave Telegram + phone instead)
  if length(v_name) < 2 then raise exception 'contact_required'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    if coalesce(p->'details'->>'country_code', '') = 'UZ' and v_email = '' then v_email := null;
    else raise exception 'contact_required'; end if;
  end if;
  if v_phone is not null and length(regexp_replace(v_phone, '\D', '', 'g')) < 6 then v_phone := null; end if;
  if jsonb_typeof(v_tr) <> 'array' or jsonb_array_length(v_tr) > 60 then raise exception 'bad_travellers'; end if;
  if length(coalesce(p->>'message', '')) > 3000 or length(p::text) > 30000 then raise exception 'too_long'; end if;
  if (select count(*) from site_requests where (email = v_email or (v_email is null and phone = v_phone)) and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'too_many_requests';
  end if;
  insert into site_requests (kind, service, tour_id, tour_title, start_date, end_date, pax, contact_name, email, phone,
                             messenger, citizenship, travellers, details, message, pay_method, lang)
  values (v_kind,
          left(p->>'service', 30), left(p->>'tour_id', 40), left(p->>'tour_title', 200),
          nullif(p->>'start_date', '')::date, nullif(p->>'end_date', '')::date,
          nullif(p->>'pax', '')::int,
          v_name, v_email, v_phone,
          left(p->>'messenger', 40), left(p->>'citizenship', 80),
          v_tr, coalesce(p->'details', '{}'::jsonb), left(p->>'message', 3000),
          case when p->>'pay_method' in ('bank','card','contact') then p->>'pay_method' end,
          left(p->>'lang', 5))
  returning ref into v_ref;
  return v_ref;
end $$;
revoke all on function public.submit_site_request(jsonb) from public;
grant execute on function public.submit_site_request(jsonb) to anon, authenticated;

create or replace function public.site_requests_segment() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.details ? 'country_code' then
    new.segment := 'b2c';
    if new.details->>'country_code' = '' then raise exception 'country_required'; end if;
    if new.details->>'country_code' = 'UZ' then
      if length(trim(coalesce(new.details->>'telegram', ''))) < 5 then raise exception 'telegram_required'; end if;
      if new.phone is null or length(regexp_replace(new.phone, '\D', '', 'g')) < 7 then raise exception 'phone_required'; end if;
    else
      if new.phone is null or length(regexp_replace(new.phone, '\D', '', 'g')) < 7 then raise exception 'whatsapp_required'; end if;
      if coalesce(new.email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'email_required'; end if;
    end if;
  end if;
  return new;
end $$;
select 'ok' as result;
