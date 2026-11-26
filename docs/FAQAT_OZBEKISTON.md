# Saytda faqat O'zbekiston (26.11.2026)

**Asoschi qarori:** hozir butun e'tibor O'zbekistonga. Qozog'iston, Qirg'iziston, Tojikiston turlari va ular haqidagi ma'lumotlar saytdan olib tashlandi.

**Olib tashlandi:**
- 18 ta tur (Qozog'iston 6, Qirg'iziston 6, Tojikiston 6), «Markaziy Osiyo bo'ylab katta sayohat» (4 davlat) va «Klassik Qirg'iziston» — sahifalari 10 tilda o'chdi, sayt xaritasidan ham chiqdi (400 → 200 sahifa).
- Bosh sahifadagi davlat tugmalari (Qozog'iston / Qirg'iziston / Tojikiston «Tayyorlanmoqda»).
- Tur yig'ishda boshqa davlat shaharlari (endi 13 ta O'zbekiston shahri).
- Savol-javob: viza va mavsum javoblari faqat O'zbekiston haqida (10 tilda).
- Issiqko'l (Qirg'iziston) haqidagi sharh.
- Google uchun belgi: xizmat hududi — faqat Uzbekistan.

**Qolgan (o'zgarmagan):** O'zbekistonning 6 turi (Klassik, Ekspress, Buyuk Ipak yo'li, Ma'naviy meros, Tog' va cho'l, Farg'ona), videolar nomlari (rasmiy BBC/Euronews sarlavhalari).

**Qanday qaytariladi:** ma'lumotlar kodda saqlangan. `build/tours_data.py` → `SITE_COUNTRIES = ["UZ"]` ga "KZ", "KG", "TJ" qo'shiladi; `build/content.py` → `COUNTRIES` filtri; katta tur uchun "CA". Keyin build — sahifalar qaytadi.

Bazada bu turlarga bog'langan bron yoki so'rov yo'q (tekshirildi).
