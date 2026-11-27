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
