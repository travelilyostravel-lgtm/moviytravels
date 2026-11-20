# Agent portal & admin panel — setup

The site stays static. Logins, agencies, bookings, passports and vouchers live in **Supabase** (Postgres + Auth + Storage).

| Page | Who | What |
|---|---|---|
| `/agent/` | Partner agencies | Register (agency details), upload documents, after approval: quote any tour with **brutto / commission / netto**, book with travellers' passports, see payment details, report payment, download PDF vouchers |
| `/admin/` | Moviy Nomad staff | Approve / reject / block agencies and set each agency's commission %, process bookings: send payment details → confirm payment → enter hotels/transport/guide/insurance → generate PDF vouchers |

## 1. Create the project
1. supabase.com → New project `moviy-nomad`, region **Central EU (Frankfurt)**.
2. **SQL Editor** → paste all of `supabase/schema.sql` → Run. (Safe to run again after updates.)
3. **Authentication → URL Configuration**: Site URL = your domain (e.g. `https://moviytravel.uz`); add `https://<domain>/agent/` to Redirect URLs.
4. **Project Settings → API**: copy *Project URL* and the *anon public* key into `assets/js/sb-config.js`. Never put the `service_role` key in the site.

## 2. Make the first admin
1. Open `/agent/` → Register (any agency name, e.g. "Moviy Nomad staff") with your e-mail → confirm the e-mail.
2. SQL Editor: `update public.profiles set role = 'admin' where email = 'you@example.com';`
3. Log in at `/admin/`.

## Booking flow & statuses
`request` (agent booked) → `awaiting_payment` (admin sent payment details) → `payment_reported` (agent says “I have paid”) → `paid` (admin confirmed the money) → `confirmed` (vouchers issued). `cancelled` from the first two steps.

## Prices
- The client price (**brutto**) is the same for travellers on the website and for agents' clients.
- **Netto = brutto × (1 − commission %)**, computed on the server from the agency's commission at booking time. Agents cannot change prices, commission or status (except “I have paid” and cancel) — enforced by the database (`bookings_guard`).

## Security
- Row Level Security: an agent only sees its own agency, bookings, travellers and files; admins see everything; anonymous visitors see nothing.
- Files are in private buckets (`agency-docs`, `passports`, `vouchers`) and open only through short-lived signed links.
- Passport data is personal data: keep a privacy policy on the site, and delete passport scans after trips according to your retention rules.
