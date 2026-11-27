# eSIM — Qulay SIM hamkorligi (27.11.2026)

**Model: referal (hamkorlik).** Turist saytda tarif tanlaydi → «eSIM sotib olish» → Qulay SIM sahifasiga o'tadi va o'sha yerda to'laydi. Sotuvchi, to'lov, QR-kod, yordam, pulni qaytarish, litsenziya va SIM identifikatsiyasi — **Qulay SIM**. Biz faqat turistni yuboramiz va har bir sotuv/to'ldirishdan ulush olamiz. Turistning karta/pasport ma'lumoti bizga kelmaydi.

## Qanday ishlaydi
1. Sahifa: `/uz/esim.html` (10 tilda). Hozir **yashirin** (`build/esim_page.py` → `LIVE = False`: menyuda yo'q, Google'ga ko'rsatilmaydi). Ishga tushganda `LIVE = True` qilinadi — «Xizmatlar» menyusida «📶 eSIM internet» chiqadi.
2. «Sotib olish» bosilganda baza har bosishga raqam beradi (masalan `MN5667A34D2`) va turistni hamkor havolasiga yuboradi: havoladagi `{sub}` o'rniga shu raqam, `{plan}` — Qulay SIM tarif ID, `{lang}` — til, `{promo}` — promo-kod.
3. Qulay SIM har sotuv/to'ldirish/qaytarishda `https://moviy-travel.uz/api/esim-postback` ga xabar yuboradi (POST JSON yoki GET). Maydonlar: `order_id`, `sub`, `event` (sale/topup/refund), `plan`, `gb`, `days`, `amount`, `currency`, `commission`, `status`.
4. Xavfsizlik: xabar maxfiy kalit bilan qabul qilinadi (`ESIM_INGEST_KEY` — Vercel'da; bazada faqat izi). Ixtiyoriy: Qulay SIM imzosi — `ESIM_WEBHOOK_SECRET` (HMAC-SHA256, `X-Signature` sarlavhasi). Shaxsiy ma'lumot qabul qilinmaydi.
5. Admin → **📶 eSIM** (faqat asoschi): bosishlar, sotuvlar, to'ldirishlar, konversiya, sotuv summasi, **bizning ulush** (Qulay SIM yuborgan komissiya, bo'lmasa shartnoma foizi bo'yicha), oylar/tariflar/davlatlar, oxirgi sotuvlar, CSV solishtirish hisoboti; tariflarni qo'shish/tahrirlash; hamkor havolasi, promo-kod, komissiya %, «Saytda yoqilgan»; maxfiy kalitni o'rnatish.

## Ishga tushirish uchun kerak (Qulay SIM'dan)
- Hamkor havolasi formati (`{sub}` bilan) va tarif ID'lari
- Sotuv xabari (webhook) — yuqoridagi manzilga; maydon nomlari (kerak bo'lsa moslashtiraman)
- Komissiya foizi, to'ldirishlardan ham olinadimi, to'lov tartibi — shartnomada
- Tariflar API'si (bo'lsa — ro'yxat avtomatik yangilanadi)

## Fayllar
`supabase/esim.sql`, `api/esim-postback.js`, `build/esim_page.py`, `assets/js/esim.js`, `assets/js/admin-esim.js`, CSS «eSIM page».
