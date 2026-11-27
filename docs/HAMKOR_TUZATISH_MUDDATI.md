# Hamkor kartochkasi: 3 ish kuni ichida tuzatish (27.11.2026)

**Qanday ishlaydi**
1. Admin → Hamkorlar → arizani oching. «Talablar tekshiruvi»da ❌ bo'lsa — **«⚠ Tasdiqlash + 3 ish kuni ichida tuzatish»** tugmasi (saytdagi hamkor uchun: «Kamchiliklar uchun 3 ish kuni muhlat berish»).
2. Birinchi bosishda hamkorga izoh avtomatik yoziladi (nima yetishmasligi ro'yxati) — tekshirib, ikkinchi marta bosasiz. Kartochka darhol saytga chiqadi.
3. Muddat: **3 ish kuni** (shanba-yakshanba hisoblanmaydi), oxirgi kun soat 23:59 (Toshkent).
4. **Sayt har soatda tekshiradi** (bazadagi `partner_fix_tick`, har soat :17 da):
   - 100% to'ldirilgan → muddat olib tashlanadi, kartochka saytda qoladi;
   - muddat o'tib kamchilik qolsa → kartochka **saytdan avtomatik olib tashlanadi** (holat «paused», belgisi «avtomatik»);
   - avtomatik olib tashlangan hamkor keyin 100% to'ldirsa → sayt **o'zi qaytaradi**.
   - Hamkor tasdiqqa yuborgan o'zgarishlar ham hisobga olinadi (biz hali tasdiqlamagan bo'lsak ham).
5. **Hamkor kabineti** (o'zbek/rus): sariq ogohlantirish — «Kartochkangiz N kundan keyin saytdan o'chadi», muddat sanasi va yetishmayotgan narsalar ro'yxati; oxirgi kuni — «BUGUN 23:59 da o'chadi»; o'chirilgach — qizil xabar va nima to'ldirish kerakligi.
6. Adminda hamkor sahifasida: muddat, qolgan kun, kamchiliklar ro'yxati, tarix (`fix_log`).

**Tekshiriladigan talablar** (admin «Talablar tekshiruvi» bilan bir xil): asosiy rasm; kartochka rasmlari (gid 3, haydovchi 6, mehmonxona 8); sayyohlar bilan rasmlar (mehmonxonadan tashqari 10); guvohnoma raqami va rasmi (gid, haydovchi); tillar va shaharlar (gid); tug'ilgan yil (mehmonxonadan tashqari); Telegram; yashash joyi va manzil.

**Fayllar:** `supabase/partner_fix.sql`, `assets/js/admin-partners.js`, `assets/js/partner.js`.

## 📲 Telegram bot xabarnomalari (27.11.2026)
- Hamkor ro'yxatdan o'tgach kabinetida birinchi bo'lib ko'k blok: **«Telegram'ga ulanish — 1 bosish»** → bot ochiladi (shaxsiy kod bilan) → «Start» → ulandi.
- Bot xabarlari (o'zbek + rus): muddat berildi (ro'yxat bilan) · har kuni 10:00 «N kundan keyin o'chadi» · oxirgi kuni «BUGUN 23:59 da o'chadi» · olib tashlandi · 100% to'ldirildi / qaytarildi. Har xabarda «Kabinet» tugmasi.
- Telegram ulangan bo'lsa, «Telegram» talabi bajarilgan hisoblanadi.
- Admin → Hamkorlar ro'yxati: 📲 (ulangan), ⏳ (muddat), 🚫 (avtomatik olib tashlangan); pastda «📲 Telegram bot» sozlamalari: bot manzili, kalit, «Botni saytga ulash», statistika.
- Texnik: `supabase/partner_tg.sql` (navbat `partner_tg_outbox`, `partner_fix_daily` cron 05:00 UTC, `partner_tg_send` har 2 daqiqada navbat bo'lsa), `api/tg-bot.js` (Telegram webhook + yuboruvchi). Vercel maxfiylari: `TELEGRAM_BOT_TOKEN`, `TG_DB_KEY` (asoschi qo'yadi).
