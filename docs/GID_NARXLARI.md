# Gid narxlari — kartochkada, maxfiy, admin tasdig'i bilan (26.11.2026)

## Nima qilindi
Gidlar Google Sheets jadvalida to'ldiradigan narxlar endi saytdagi **gid arizasi** (moviy-travel.uz → Gidlar → «Gid bo'lish») va **hamkor kabineti**ga qo'shildi.

## Gid nimani to'ldiradi («💵 Narxlaringiz (NETTO, $) — saytda ko'rinmaydi»)
| Maydon | Izoh |
|---|---|
| Malaka toifasi | Havaskor / Ixtisoslashgan / Professional / «Oltin fond» (1.12.2026 dan Turizm qo'mitasi toifalari) |
| To'liq kun (8 soat) | majburiy |
| Yarim kun (4 soat) | ixtiyoriy |
| Qo'shimcha soat | ixtiyoriy |
| Aeroport/vokzalda kutib olish | ixtiyoriy |
| Shahar tashqarisiga safar kuni | ixtiyoriy |
| Butun tur bilan yurish (kunlik) | ixtiyoriy |
| Katta guruh (16+) qo'shimchasi | ixtiyoriy |

Narxlar 0–5000 $ oralig'ida bo'lishi kerak; boshqa noma'lum maydonlar baza tomonidan tashlab yuboriladi.

## Kim nimani ko'radi
- **Saytga kirgan mijoz:** gidning ismi, shahri, tillari, tajribasi, malaka toifasi (🎖), rasmlari — **narx ko'rinmaydi** (gid kartochkasidagi «dan $…» ham olib tashlandi).
- **B2B agent portali:** bron qilish uchun brutto narx (netto + 20%) avvalgidek ko'rinadi.
- **Admin / menejer:** Hamkorlar → gid → «💵 Gid narxlari (NETTO)» kartasi — barcha 7 ta narx.
- **Gidning o'zi:** kabinetda o'z narxlari.

## Tasdiqlash tartibi
1. Yangi gid ariza bilan narx yuboradi → narxlar darhol bazaga yoziladi (ariza bilan birga ko'rib chiqiladi).
2. Tasdiqlangan gid kabinetda narxini o'zgartirsa → yangi narxlar «⏳ tekshiruvda» bo'lib turadi, eski narx amalda qoladi.
3. Admin «Hamkorlar» bo'limida sariq «💵 Gid narxlari — tasdiq kutyapti» ro'yxatini ko'radi (tab yonidagi 🔴 soniga ham qo'shiladi).
4. Gid kartasida eski va yangi narx yonma-yon; o'zgargani qizg'ish. «✅ Yangi narxlarni tasdiqlash» yoki «❌ Rad etish».
5. Tasdiqlangan «To'liq kun» narxi avtomatik `price_day` ga ham yoziladi (buyurtma hisobi shu narxdan).

## Texnik
- SQL: `supabase/guide_rates.sql` — `partners.rates`, `rates_new`, `rates_at`, `rates_ok_at`; `rates_clean()`, `partner_save_rates()`, `admin_rates_decide()`; `partner_save_extra` ga `guide_cat`.
- JS: `partner-join.js` (ariza), `partner.js` (kabinet), `admin-partner-units.js` (admin kartasi), `partners.js` (ommaviy: toifa belgisi, narx yashirilgan).
- Tarjimalar: ariza uz/ru/en; toifa nomlari 10 tilda (`build/units_i18n.py`).
- Xavfsizlik tekshirildi: anonim foydalanuvchi `partners` jadvalini o'qiy olmaydi (401), `partners_public`da narx ustunlari yo'q, RPC'larni chaqira olmaydi; gid o'z narxini o'zi tasdiqlay olmaydi.

## Google Sheets jadvali
Saytda ro'yxatdan o'tgan gidlar uchun jadval endi shart emas. Avval ro'yxatdan o'tgan yoki saytga kirmaydigan gidlar jadvalni to'ldirsa — Claude narxlarni admin portalga kiritib beradi.
