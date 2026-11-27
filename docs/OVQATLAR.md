# Ovqatlar bo'limi — restoranlar (27.11.2026)

**Maqsad:** turistlar oqimini saytga jalb qilish — «qayerda ovqatlanish», «restaurants in Samarkand», «halal food Tashkent» kabi qidiruvlarda sayt chiqsin va turist restoranni tanlab, Yandex Go taksini chaqirsin.

**Saytda:** tepadagi menyuda «Ovqatlar» → `/uz/food.html`
1. **Viloyatni tanlang** — 14 ta rasmli plitka (Toshkent shahri katta), har birida joylar soni.
2. Viloyat sahifasi `food-<viloyat>.html` (masalan `/uz/food-samarkand.html`, 10 tilda = 140 sahifa): **oshxona turi** — 🍲 Milliy, 🍝 Yevropa, 🍜 Osiyo (koreys, xitoy, yapon…), 🥙 Turk/Sharq, 🍔 Fast-fud, ☕ Kafe, 🍽 Boshqa (har birida soni); **☪ Halol** belgisi; nomi bo'yicha qidiruv.
3. Kartochkalar (24 ta + «Yana ko'rsatish»): rasm yoki chiroyli tematik muqova, nomi, oshxona turi, manzil, ish vaqti, sariq **🚕 Yandex Go** tugmasi.
4. Restoran ochilganda (kompyuterda o'ngdan, telefonda pastdan): rasmlar, **katta sariq «Yandex Go taksi chaqirish»** (ilova restoran manzili bilan ochiladi), Yandex Xarita, Google Maps, 2GIS, qo'ng'iroq, manzil, ish vaqti, telefon, sayt/Instagram, menyu (narx va rasm bilan), xarita.

**Halol:** «☪ Halol — Moviy Nomad tekshirgan» (admin belgilaydi), «Halol (joyning o'zi belgilagan)» (OpenStreetMap), milliy oshxona uchun «odatda halol — xodimlardan so'rang». Halol filtri shularning hammasini ko'rsatadi.

**Google uchun:** har viloyat sahifasining sarlavhasi va tavsifi 10 tilda («Samarqand restoranlari: halol, milliy va Yevropa taomlari»), mahalliy taomlar qatori, savol-javob (FAQPage), restoranlar ro'yxati (ItemList / Restaurant), sayt xaritasida 140 sahifa.

**Manba:** OpenStreetMap (ochiq ma'lumot, © OpenStreetMap ishtirokchilari) — baza Overpass API'dan har soatda bitta viloyatni o'zi oladi, har viloyat haftada yangilanadi (3 ta zaxira server). OSM'da rasm yo'q — rasm, menyu, tavsif, halol tasdig'ini **Admin → 🍽 Restoranlar** da qo'shasiz.

**Admin → 🍽 Restoranlar:** viloyat tanlash, qidiruv, filtrlar (rasmi bor, halol, tepadagilar, yashirin, qo'lda); tahrirlash: oshxona turi (yangilanishda saqlanadi), narx darajasi, ☪ halol tasdiq, 📌 tepada, ko'rinish, tavsif (3 tilda), rasmlar yuklash, menyu (taom, narx, rasm); yangi restoranni qo'lda qo'shish (Google Maps havolasi yoki koordinata).

**Fayllar:** `supabase/food.sql`, `build/food_page.py`, `assets/js/food.js`, `assets/js/admin-food.js`, `assets/css/site.css` (Food). Rasm ombori: `food-photos`.

## 27.11.2026 — tuzatish
- 6 ta viloyat bo'sh edi (xarita serveri band, bo'sh javob 0 deb saqlanib qolgan) → endi bo'sh javob saqlanmaydi, qayta so'raladi.
- Buxoro 278, Xorazm 532, Jizzax 327, Namangan 187, Sirdaryo 85 yuklandi; Qashqadaryo soatlik navbatda.
- Tur tugmasi yuklanish paytida bosilsa e'tiborsiz qolardi → tuzatildi (food.js v=2).
- `food_cat` endi joy nomidan ham tur aniqlaydi; admin tanlagan tur (`cat_fixed`) o'zgarmaydi.
- `admin_food_ingest(region, json)` — admin viloyatni qo'lda yuklashi uchun.

## 27.11.2026 — «Turistbop» ro'yxat va Yandex orqali rasm/menyu
- Har viloyatda faqat eng yaxshi joylar: Toshkent shahri 100, Samarqand 80, Buxoro 80, Xorazm 70, Toshkent vil. 50, qolganlari 40 (`tourist_rank`, `food_rank()`).
- Ball: mashhur joy nomi (+30), diqqatga sazovor joyga yaqinlik (`food_sights`), restoran turi, milliy/Yevropa oshxona, inglizcha/ruscha nomi, ma'lumot to'liqligi; umumiy nomlar ("Kafe", "Oshxona") pastga tushadi. 📌 admin belgilaganlar doim ro'yxatda.
- «Barcha joylarni ko'rsatish (N)» — hammasini ko'rish.
- «📷 Rasmlar, menyu va narxlar» — Yandex Xaritadagi joyning o'z kartochkasi (rasm, menyu, narx, reyting, sharhlar Yandexda yangilanadi). Rasm/menyu bizga ko'chirilmaydi — mualliflik huquqi.

## 27.11.2026 — Muqova rasmlari va kartochka tepasidagi asosiy tugmalar
- Har restoranga chiroyli muqova: 54 ta taom surati (Pexels — tijorat uchun bepul, muallif ko'rsatish shart emas), Supabase `food-photos/covers/<tur>-<n>.webp`.
- Rasm joy nomiga qarab tanlanadi: plov/osh → palov, shashlik/kabob → shashlik, lag'mon, somsa, manti, choyxona → non-choy, pizza, pasta, steak, sushi, koreys/xitoy → lag'mon-noodles, doner/kebab, turk/gruzin → meze, burger/lavash, kofe, tort/desert; nomdan topilmasa oshxona turi bo'yicha. Har joy o'z id raqami bo'yicha bitta rasmni doimiy oladi.
- Admin o'z rasmini yuklasa — o'sha birinchi chiqadi.
- Restoran oynasining tepasida katta rasm; rasm ustida: «📷 Rasmlar, menyu va narxlar» (Yandex kartochkasi), «📍 Manzil va xarita», «🚕 Yandex Go». Rasmni bosish ham Yandex kartochkasini ochadi. Burchakda kichik yozuv: «Taom surati namuna — haqiqiy rasmlar tugmada».
