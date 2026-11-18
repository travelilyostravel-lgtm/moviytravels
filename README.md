# Moviy Nomad — inbound tours website

Static site (HTML/CSS/JS, no framework) in 10 languages:

| Language | URL |
|---|---|
| English (default) | `/` |
| Русский | `/ru/` |
| O'zbekcha | `/uz/` |
| Türkçe | `/tr/` |
| العربية (RTL) | `/ar/` |
| Deutsch | `/de/` |
| Svenska | `/sv/` |
| 中文 | `/zh/` |
| हिन्दी | `/hi/` |
| 한국어 | `/ko/` |

`indexen.html` and `indexru.html` only redirect to the new pages so old links keep working.

## Editing content

All texts, tours, prices and contacts live in **`build/content.py`**:

- `CONFIG` — WhatsApp number, Telegram username, Instagram username, site URL
- `TOURS` — duration (`days`), price in USD (`price`, `None` = "Price on request"), photo, countries
- `T["<lang>"]` (en, ru, uz, tr, ar, de, sv, zh, hi, ko) — page text per language

After editing, rebuild the pages:

```bash
python3 build/build.py
```

This regenerates `index.html` and `<lang>/index.html` for every language.

## Contacts

There is no form and no server code. Every button opens a choice: **WhatsApp** (pre-filled message in the visitor's language with the tour name), **Telegram**, or **Instagram**.

## Assets

- `assets/img/` — photos (WebP, compressed)
- `assets/icons/` — Moviy Nomad city badges
- `assets/css/site.css`, `assets/js/site.js`

## Tour presentations & tour builder

- `tours/<id>.html` — slide presentation for each ready tour: cover with price, route map (km / hours / transport), included / not included, day-by-day program with photos, options (hotels, transport, guide language, travellers) with live price, packing list, booking via WhatsApp/Telegram.
- `builder.html` — "Build your own tour": choose places and nights, hotels, transport, guide; map + instant estimate, sent to WhatsApp in one message.
- `assets/data/catalog.js` — cities, transfers (km/hours/mode), hotel classes, transport, guide rates, fixed costs, margin. **Prices are samples (`sample: true`) until real partner prices are entered.**
- `assets/data/tours.js` — the ready tours (days, stops, photos, included/excluded, packing).
- `assets/js/engine.js` — price calculation and route map; `deck.js` — presentation; `builder.js` — tour builder.
