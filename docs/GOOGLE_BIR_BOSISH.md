# Mijozlar uchun Google orqali bir bosishda kirish (26.11.2026)

## Muammo
«Google orqali davom etish» hech kim uchun ishlamagan: bazada birorta ham Google kirishi yo'q edi.
Supabase jurnalida «500: Unable to exchange external code» xatosi bor edi. Sabab: Supabase'ga yozilgan Google Client Secret noto'g'ri (72 belgi, odatda ~35).

## Yechim
Google'ning o'z kirish oynasi (Google Identity Services) ishlatiladi:
- Mijoz saytda birinchi marta biror amal qilsa (tur ochish, WhatsApp, so'rov), oyna chiqadi: **«Google orqali kirish»** tugmasi.
- Tugma bosilganda Google'ning oynasi ochiladi: «Choose an account — to continue to **moviy-travel.uz**», ya'ni telefondagi yoki kompyuterdagi Gmail ro'yxati.
- Mijoz akkauntini tanlaydi va Google o'zi tasdiqlaydi: bir bosish yoki Face ID / barmoq izi / passkey. Gmail avtomatik yoziladi.
- Ism, telefon va parol so'ralmaydi.
- Google'ga kirgan qurilmada «One Tap» ro'yxati ham chiqishi mumkin (burchakda yoki pastda).
- Google bilan kirgan mijozning **kabineti darhol ochiladi**, admin tasdig'i shart emas. Bloklangan mijoz bloklangan bo'lib qoladi.
- Zaxira yo'l «yoki e-mail orqali» kichik havola ortida: faqat e-mail so'raladi (ism va telefonsiz).
- «Mening kabinetim» sahifasida ham avval Google tugmasi turadi. E-mail va parol bilan kirish «yoki e-mail orqali» havolasi ortida; eski mijozlar uchun qoldirildi va admin tasdig'ini kutadi.

## Texnik
- `assets/js/gsi.js` (yangi): Google Identity Services. id_token → Supabase `/auth/v1/token?grant_type=id_token` (nonce SHA-256 bilan). Sessiya `localStorage.mn_cab`da (kabinet bilan umumiy). Keyin `register_customer` va `cabinet_register` chaqiriladi.
- `assets/js/sb-config.js`: `gid` — Google Client ID (ochiq qiymat, maxfiy emas).
- `assets/js/visitor.js`: kirish oynasi soddalashtirildi; yangi xato matni 10 tilda.
- `assets/js/account.js`: Google tugmasi birinchi o'rinda.
- SQL: `supabase/customer_google_open.sql` — `cabinet_register`: Google bilan kirgan mijoz `approved` holatiga o'tadi.
- Google Cloud (loyiha «Moviy Nomad Sayt»): JavaScript origin `https://moviy-travel.uz` bor, holati «In production» (hamma kira oladi). Client secret kerak emas.
- Eski yo'naltirish usuli (Client Secret bilan) ishlatilmaydi. Uni tiklash kerak bo'lsa, Supabase → Authentication → Providers → Google ga to'g'ri secret yozilishi kerak (asoschi o'zi yozadi).
