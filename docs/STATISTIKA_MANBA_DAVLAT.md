# Statistika: tashriflar, noyob, onlayn; davlat va manba (27.11.2026)

## Bosh sahifada (hammaga ko'rinadi)
Hero ostida 3 ko'rsatkich (10 tilda), har daqiqada yangilanadi:
- **Tashrif** — har safar saytga kirish sanaladi (bitta odam 3 marta kirsa — 3). 30 daqiqa ichida qayta ochish bitta tashrif.
- **Noyob tashrifchi** — bitta qurilma/brauzer bir marta sanaladi.
- **🟢 Hozir saytda** — so'nggi 3 daqiqada sahifasi ochiq turganlar (ochiq sahifa har daqiqada «shu yerdaman» signalini yuboradi).
Robotlar, asoschi va menejerlar sanalmaydi.

## Admin → 📈 Statistika
- KPI: tashriflar (davrda), noyob (davrda), sahifa ko'rishlar, yangi, jami tashriflar, jami noyob, hozir saytda.
- **📣 Qayerdan kelishdi**: Google qidiruv, Yandex, Bing, boshqa qidiruv, Google/Yandex reklama, Instagram, Facebook, Telegram, VK, MAX, Odnoklassniki, WhatsApp, YouTube, TikTok, X, LinkedIn, e-mail, TripAdvisor, boshqa saytlar, belgili havolalar, to'g'ridan-to'g'ri. Soni va foizi.
- **🌍 Qaysi davlatdan** — bayroq va o'zbekcha nom bilan (27.11.2026 dan; eski tashriflarda davlat yo'q).
- **🌐 Qaysi saytlardan** — boshqa saytlardagi havolalar (domen).
- **🏷 Kampaniyalar** — utm_campaign bo'yicha.
- **🔗 Kuzatiladigan havolalar** — Instagram bio/stories, Telegram kanal, VK, MAX, Facebook, YouTube, TikTok, WhatsApp status, rassilka uchun tayyor havolalar («Nusxa» tugmasi). Telegram, MAX, WhatsApp ilovalari manbani aytmaydi — shu havolalar bilan joylansa aniq bo'ladi.

## Qanday aniqlanadi
- Manba: brauzer aytgan oldingi sahifa (referrer), havoladagi `utm_source/utm_medium/utm_campaign`, reklama belgilari (gclid → Google reklama, yclid → Yandex reklama, fbclid), ilova ichidagi brauzer (Instagram, Facebook, VK, TikTok), Android ilovalar (android-app://org.telegram… → Telegram).
- Davlat: Vercel'ning `/api/geo` funksiyasi faqat 2 harfli davlat kodini qaytaradi (IP saqlanmaydi), brauzerda 7 kun eslab qolinadi.
- Eski ma'lumot: 27.11 gacha bo'lgan tashrifchilarning manbasi saqlangan birinchi referrer bo'yicha qayta hisoblandi (to'g'ridan-to'g'ri 80, Telegram 7, Google 7, Facebook 7, Yandex 1, Instagram 1).

## Fayllar
`supabase/visit_sources.sql` (bazada bajarildi), `api/geo.js`, `assets/js/visitor.js`, `assets/js/admin-stats.js`, `build/build.py` (HC), `assets/css/site.css`, `assets/css/portal.css`.
