# Telefonda menyu (3 chiziq) — 25.11.2026

**Nima tuzatildi:** telefonda o'ng yuqoridagi 3 chiziq (menyu) ekrandan chiqib ketayotgan edi. Endi u har qanday telefonda ko'rinadi. Kompyuterda menyu avvalgidek yuqorida qatorda turadi.

## Menyuda nima bor (telefonda)
Bosh sahifa · Turlar · Gidlar · Transport · Mehmonxonalar · Xizmatlar ▾ · Tur yig'ish · Yana ▾ (Videolar, Guruh turlari, Sharhlar, Barcha mahalliy hamkorlar, Biz haqimizda, Agentlar uchun) · 👤 Kabinetim · oltin **🤝 Hamkor bo'lish** tugmasi. 10 tilda.

## Gid bo'lish — telefonda ketma-ketlik
1. Saytni oching → o'ng yuqoridagi **3 chiziq**.
2. Menyu pastidagi oltin **🤝 Hamkor bo'lish** → "Kim sifatida ariza berasiz?" oynasi darhol ochiladi → **Gid**.
3. Boshqa yo'l: 3 chiziq → **Gidlar** → sahifa boshidagi **Gid bo'lish** tugmasi.
4. Bosh sahifaning eng pastida (footer) ham "Hamkor bo'lish" havolasi bor.

Gidlarga yuboriladigan to'g'ridan-to'g'ri havola: https://moviy-travel.uz/uz/partners.html#join

## Texnik
- `assets/css/site.css` — telefon sarlavhasi siqiladi, menyu sarlavha ostida ochiladi va aylantiriladi; menyu ochiqligida suzuvchi tugmalar yashirinadi.
- `assets/js/site.js` — menyu joyi sarlavha balandligiga qarab o'rnatiladi.
- `build/pages.py` — menyuga Kabinetim va Hamkor bo'lish qo'shildi (faqat telefonda).
- `assets/js/partners.js` — `#join` kabi havolalar kartochkalar yuklanguncha joyida turadi.
- `vercel.json` — sayt fayllari keshlanmaydi; CSS havolasida versiya (`?v=`). Yangilanish telefonlarga darhol yetadi.
