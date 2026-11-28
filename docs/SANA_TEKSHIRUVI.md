# Sayohat sanasi tekshiruvi (26.11.2026)

**Muammo.** MR-26-1025 so'rovida mijoz yilni xato yozgan: 275760-07-25. Admin panelda so'rov kartasi bo'sh qolardi (JS xatosi «Invalid time value»).

**Tuzatish:**
- `forms.js`: sayohat sanasi faqat bugundan +3 yilgacha qabul qilinadi. Boshqa sana yozilsa, maydon qizil bo'ladi.
- `admin-site.js`, `admin-roster.js`: noto'g'ri sanada ham karta ochiladi va «⚠ SANA NOTO'G'RI YOZILGAN — mijozdan aniq sanani so'rang» yozuvi chiqadi.
- `supabase/request_date_check.sql`: bazada start_date va end_date 2024–2040 oralig'ida bo'lishi shart (yangi va o'zgartirilgan so'rovlar uchun).
- MR-26-1025 dagi sana tozalandi va ichki izohga yozildi.
