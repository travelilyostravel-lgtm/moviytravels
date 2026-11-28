# Agent ro'yxatdan o'tishi — parolsiz (25.11.2026)

## Agent nima qiladi
B2B portal (https://moviy-travel.uz/agent/ → "Register your agency") formasida faqat:
agentlik nomi, davlat, shahar, yuridik manzil, INN, mas'ul shaxs, WhatsApp, e-mail (login) va ixtiyoriy ravishda
firma guvohnomasi / turizm litsenziyasi (PDF yoki rasm, 10 MB gacha). **Parol yozilmaydi.**
"Send application" → "Arizangiz yuborildi, 1–2 ish kunida parolni e-mail yoki WhatsApp'ga yuboramiz".

## Biz nima qilamiz (Admin → Agentliklar)
1. Arizani oching, hujjatlarni tekshiring (yo'q bo'lsa agentdan WhatsApp/e-mail orqali so'rang).
2. Komissiya 10% → **Tasdiqlash**.
3. **🔑 Kirish paroli** → "Parol yaratish" (yoki o'zingiz yozing, kamida 8 belgi) → "Parolni o'rnatish".
4. "📋 Nusxalash" → agentga WhatsApp yoki e-mail orqali yuboring (portal havolasi, login, parol).
5. Agent parolni unutsa — shu yerda yangisini bering yoki u "Forgot password" bosadi.

## Xavfsizlik
- Ariza paytida agentga ko'rinmaydigan tasodifiy uzun parol qo'yiladi — u bilan hech kim kira olmaydi.
- Parolni faqat admin o'rnata oladi: `admin_agent_password` funksiyasi (supabase/agent_password.sql). Agent o'zi chaqirsa — rad etiladi (sinovdan o'tgan).
- Parol bazada shifrlangan holda saqlanadi; asoschi faylidan boshqa joyga yozmang.
