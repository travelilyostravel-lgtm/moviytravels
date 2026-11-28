# Mehmonxona va transport hamkorlari (25.11.2026)

Booking.com (mehmonxona) va Kiwitaxi (transport) andozasida.

## Ariza (saytda "Hamkor bo'lish")
- **Mehmonxona** (hotels.html#join): nom, INN, reyestr raqami, yulduz, check-in/out, xarita havolasi, qoidalar, qulayliklar (Wi-Fi, nonushta, avtoturargoh, konditsioner, transfer, restoran, basseyn, kir yuvish, 24 soat qabulxona, oilaviy xonalar, milliy hovli, lift, terassa, chekilmaydigan xonalar).
  **Xona turlari** (bir nechta): turi (standart / deluxe / lyuks / oilaviy / bir kishilik / hostel), nomi, necha kishi, karavot, shunday xonalar soni, nonushta, **netto $/kecha**. Rasmlar: asosiy + kamida 10 ta.
- **Transport** (transport.html#join): shaxsiy haydovchi yoki transport kompaniyasi; haydovchilik guvohnomasi.
  **Mashinalar** (bir nechta): klass (ekonom, komfort, biznes, premium, miniven, mikroavtobus, avtobus), marka/model, o'rinlar, chamadon, yil, davlat raqami (faqat bizga), konditsioner, **netto $/kun**, **netto aeroport transferi**. Rasmlar + **texpasport** (faqat bizga).
- **Parol ixtiyoriy.** Kabinetga e-mail kodi bilan kiradi; xohlasa parol qo'yadi (arizada yoki kabinetda).

## Hamkor kabineti (moviy-travel.uz/partner/)
- Kirish: "✉️ E-mail kodi" yoki "🔒 Parol".
- "🛏 Xona turlari" / "🚐 Mashinalar": qo'shish, o'zgartirish, 15 tagacha rasm, o'chirish, "Vaqtincha yopish / Qayta ochish" (tasdiqsiz).
- Har yangi yoki o'zgartirilgan xona/mashina → ⏳ tekshiruv → admin tasdiqlagach saytda.
- Mehmonxona: "🏨 Mehmonxona ma'lumotlari" (qulayliklar, check-in/out, xarita, qoidalar).
- "🔒 Kabinet paroli (ixtiyoriy)".

## Admin → Hamkorlar
- Tepada "🛏🚐 Xona / mashinalar — tasdiq kutyapti", qizil raqamga qo'shiladi.
- Hamkor kartasida har xona/mashina: netto, transfer, davlat raqami, rasmlar → ✅ Tasdiqlash / ❌ Rad etish (sabab) / ⏸ Yopish, "Barchasini tasdiqlash".

## Saytda
- Faqat tasdiqlangan hamkorning tasdiqlangan xona/mashinalari, **brutto** narxda (netto + xizmat haqi, standart 20%: 50 → $60), 10 tilda.
- Netto, davlat raqami, hujjatlar saytda ko'rinmaydi (sinovdan o'tgan: mehmon jadvalni o'qiy olmaydi).

## Texnik
- Baza: `supabase/partner_units.sql` — `partner_units` jadvali (himoya: hamkor o'zi tasdiqlay olmaydi), `partners.extra`, `partner_save_extra`, `partner_units_public`, `partner_extra_public`.
- Kod: `assets/js/partner-join.js`, `partner.js`, `partners.js`, `admin-partner-units.js`; tarjimalar `build/join_i18n.py`, `build/units_i18n.py`.

## Muhim
E-mail kodi hamkorlarga **Resend SMTP** ulangandan keyin yetib boradi (Supabase standart pochtasi faqat jamoa a'zolariga yuboradi). Resend DNS tasdiqlangach Supabase → Authentication → SMTP'ga Resend ulanadi. Ungacha hamkor arizada parol qo'ysa, parol bilan kiradi.

## Oxirgi qadam: «Moviy Nomad» Telegram guruhi (25.11.2026)
Har qanday hamkor (gid, transport, mehmonxona, boshqa) arizani yuborgach oxirgi ekranda ko'k blok chiqadi:
"Oxirgi qadam: «Moviy Nomad» Telegram guruhiga qo'shiling" va "Telegram guruhga qo'shilish" tugmasi (uz/ru/en).
Hamkor kabinetida ham shu blok doim turadi. Guruh yopiq — hamkorlar va turizm sohasidagi odamlar uchun networking.
- Havola: https://t.me/moviy_nomad_uz
- Almashtirish: `build/content.py` → `partner_group`, keyin saytni qayta qurish.
- Guruh sozlamasida "qo'shilish so'rovi bilan" yoqilgan bo'lsin — har kirganni admin tasdiqlaydi.
