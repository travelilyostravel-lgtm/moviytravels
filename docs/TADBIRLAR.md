# Tadbirlar bo'limi (27.11.2026)

**Saytda:** tepadagi menyuda «Tadbirlar» → `/uz/events.html` (10 tilda).
- Konsertlar, teatr, festivallar, davlat bayramlari, madaniyat, ko'rgazmalar, bolalar, sport.
- Bir qatorda 4 ta kartochka, 3 qator (12 ta), «Yana ko'rsatish» tugmasi; turkum, shahar, oy bo'yicha saralash.
- Kartochkada: sana (kun/oy belgisi), turkum, yosh chegarasi, joy, narx (dollarda taxminiy + so'mda), «Biz orqali bron» va «iTicket'da chipta».
- «Biz orqali bron»: chiptalar soni, transfer/mehmonxona/gid belgilari, ism, e-mail, telefon → admin → 🧳 B2C so'rovlar («🎟 Tadbir chiptasi», tadbir nomi, joyi, narxi, iTicket havolasi).

**Manba (avtomatik):** iTicket.uz (Visit Uzbekistan ham chiptalarni shu yerdan oladi) — baza har 3 soatda o'zi so'raydi (pg_net + pg_cron: `events_fetch_start` :07, `events_fetch_process` :11), 3 tilda nom. iTicket'dan olib tashlangan tadbir 2 kundan keyin saytdan yo'qoladi; o'tgan tadbirlar ko'rinmaydi; muzey chiptalari ko'rsatilmaydi.
**Qo'lda:** davlat bayramlari va festivallar (Konstitutsiya kuni, Navro'z, Boysun bahori, Ipak va ziravorlar, Mustaqillik kuni, Buxoro biennalesi 2027) — admin qo'shadi/o'zgartiradi.
**Afisha.uz** — yozma ruxsatsiz ko'chirish taqiqlangan, ishlatilmaydi.

**Admin → 🎟 Tadbirlar:** ko'rinadi/yashirish, 📌 tepada, bizning narx ($/kishi) va shartlar (3 tilda), yangi tadbir qo'shish, «iTicket'dan hozir yangilash».

**Fayllar:** `supabase/events.sql`, `build/events_page.py`, `assets/js/events.js`, `assets/js/admin-events.js`, `assets/css/site.css` (Events page).
