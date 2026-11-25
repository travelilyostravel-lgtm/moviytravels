# Mijoz kabineti — asoschi uchun qo'llanma

*Qo'shilgan: 25.11.2026. Sayt: moviy-travel.uz*

## Bu nima?

Saytda har bir mijozning o'z shaxsiy sahifasi bor: **"👤 Kabinetim"**. Bu tugma bosh sahifada va saytning har bir sahifasining tepasida turadi.

Mijoz kabinetida faqat **o'zining** ma'lumotlarini ko'radi:
- so'rov va bronlari — holati oddiy so'zlar bilan ("Menejer ko'rib chiqmoqda", "To'lov kutilmoqda", "30% to'landi — qolgani 26.04 gacha" va h.k.);
- narx, to'langan summa, qolgan to'lov va to'lov muddati;
- hujjatlar: bron tasdig'i va vaucherlar (PDF) — oldindan to'lov tushgandan keyin ochiladi;
- siz yozgan izohlar va javob yozish oynasi;
- bekor qilingan so'rov bo'lsa — sababi va **"Tuzatib qayta yuborish"** tugmasi;
- o'z amaliyotlari tarixi va statistikasi (so'rovlar, sayohatlar, to'langan summa).

Mijoz **hech qachon** ko'rmaydi: ichki izoh, netto narx, komissiya, boshqa mijozlar.

## Mijoz qanday ro'yxatdan o'tadi

1. "Kabinetim" → "Kabinet ochish" → ism, e-mail, parol (yoki "Google orqali").
2. So'rov **admin panelga** keladi va mijozga "Tekshirilmoqda" deb yoziladi.
3. Siz tasdiqlaysiz → mijozga xat ketadi → kabineti ochiladi.

Kabinet mijozning e-mailiga bog'langan: shu e-mail bilan ilgari yuborgan barcha so'rovlari kabinetida o'zi chiqadi.

## Admin panelda nima qilasiz

**Kabinetni tasdiqlash**
- "Mijozlar bazasi" tabida tepada qizil ramkali **"Kabinet ochish so'rovlari"** bo'limi chiqadi → **✓ Tasdiqlash** yoki **Rad etish**.
- Yoki mijozning so'rov kartasida "✓ Kabinetni tasdiqlash" tugmasi.
- Kabinetni keyin yopish ham mumkin: mijoz kartasida "Kabinetni yopish".

**Mijozga yozish**
- So'rov kartasida **"💬 Mijozga izoh (saytda ko'rinadi)"** bo'limiga yozing → "Mijozga yuborish".
- Mijoz kabinetida 🔴 belgisi bilan ko'radi va e-mail oladi.
- **"🔒 Ichki izoh (mijoz KO'RMAYDI)"** — faqat jamoa uchun. Ikkalasini adashtirmang.
- "Mijozlar bazasi" → mijoz kartasida ham umumiy xabar yoki tanlangan so'rov bo'yicha yozish mumkin.

**Mijoz javob yozsa**
- "🧳 B2C" va "Mijozlar bazasi" tablarida qizil raqam chiqadi.
- Ro'yxatda so'rov yonida **"🔴 xabar"** yoziladi va u ro'yxat tepasiga chiqadi.
- Ofis e-mailiga ham xat keladi.
- Kartani ochsangiz — xabar "o'qildi" bo'ladi va qizil belgi yo'qoladi.
- Sizning xabaringiz yonida: "✓ yuborildi" yoki "✓✓ o'qidi" (mijoz ochgan bo'lsa).

**Bekor qilish**
- Holatni "Bekor" qilsangiz, **sababini yozish majburiy**. Masalan: "sanada joy qolmadi — boshqa sana tanlang".
- Mijoz sababni ko'radi va bir tugma bilan formani tuzatib qayta yuboradi. Ma'lumotlari o'zi to'ldiriladi.

## To'lov qoidalari (avtomatik)

- Sayohatgacha **14 kundan ko'p** qolgan bo'lsa: avval 30%, qolgan 70% sayohatdan 14 kun oldin.
- Sayohatgacha **14 kundan kam** qolgan bo'lsa: **100% birdaniga**. Admin panelda ⚠ ogohlantirish chiqadi, mijozga ham shunday yoziladi.
- "30% to'landi" holati faqat haqiqatan 30% (yoki kerakli 100%) tushganda qo'yiladi. Kam tushsa, tizim "To'lov kutilmoqda"da qoldiradi.
- "Oxirgi eslatma" xati faqat oldindan to'lov to'liq tushgandan keyin taklif qilinadi.

## Formalardagi tekshiruvlar

Bron formasida endi:
- fuqarolik ro'yxatdan tanlanadi;
- har bir sayohatchining ismi, familiyasi va tug'ilgan sanasi majburiy (sana 1920 yildan bugungacha);
- bir xil sayohatchini ikki marta yozib bo'lmaydi;
- sana 14 kundan yaqin bo'lsa, "butun summa birdaniga to'lanadi" degan ogohlantirish chiqadi.

## Avtomatik xatlar — MUHIM

"Mijozlar bazasi" tabining pastida **"✉ Avtomatik xatlar"** jadvali bor: qaysi xat ketdi, qaysi biri navbatda turibdi, qaysi biri xato berdi.

Hozir xatlar **ketmayapti**, chunki pochta xizmati (Resend) moviy-travel.uz domenini hali tasdiqlamagan. Buni tuzatish uchun:
1. Eskiz.uz → domen sozlamalari (DNS) → 3 ta yozuv qo'shish: 1 ta TXT va 2 ta CNAME. Aniq qiymatlar asoschi jadvalida.
2. Resend.com → Domains → "Verify".

Shundan keyin navbatdagi xatlar o'zi ketadi. Bu ishni o'zingiz qilasiz yoki menga aniq ruxsat berasiz.

Xat ketmasa ham, saytdagi kabinet va 🔴 belgilar to'liq ishlaydi.

## Texnik joylar (dasturchi uchun)

- **Baza:** `supabase/customer_cabinet.sql`. Nusxasi: `SAYT_VA_BAZA/04_Baza_Supabase`.
- **Sayt fayllari:**
  - `account.html` — 10 tilda;
  - `assets/js/account.js`, `account-i18n.js`, `cabdot.js` (qizil belgi);
  - `forms.js` (tekshiruvlar).
- **Admin fayllari:** `assets/js/admin-site.js` (so'rov kartasi), `admin-customers.js` (kabinetlar, xatlar jurnali).
- **Xat matnlari:** `build/notify_texts.py`; edge function `notify`.
- **PR:** github.com/travelilyostravel-lgtm/moviytravels/pull/2

---

# Hamkorlar: rad etilgan arizani qayta yuborish

*Qo'shilgan: 25.11.2026*

Gid, haydovchi, mehmonxona yoki boshqa xizmat egasi rad etilsa ham, arizasini tuzatib, qayta yubora oladi. Buni **necha marta bo'lsa ham** qilishi mumkin.

**Siz rad etganda**
- Admin → Hamkorlar → hamkor kartasi → "Hamkorga izoh" maydoniga **sababini** yozing (nimani tuzatish kerak) → "❌ Rad etish".
- Sababsiz rad etib bo'lmaydi, chunki hamkor nimani tuzatishni bilishi kerak.

**Hamkor nima qiladi**
- Kabinetiga kiradi (moviy-travel.uz/partner/) va sababni qizil ramkada ko'radi.
- Ma'lumot, rasm va hujjatlarni tuzatadi, "nimani tuzatdim" deb yozadi va **"↻ Tuzatib qayta yuborish"** tugmasini bosadi.
- Yoki saytdagi "Hamkor bo'lish" formasini o'sha e-mail va parol bilan qayta to'ldiradi.
- Faqat hujjat yuklash arizani qayta yubormaydi. Shunda chala ariza sizga kelib qolmaydi.

**Sizga qanday ko'rinadi**
- Ariza yana "Tekshiruvda" ro'yxatiga tushadi, yonida "↻ qayta yuborilgan: N-marta" yoziladi.
- Hamkor kartasida jadval bor: har safargi sizning sababingiz va hamkor nimani tuzatgani.
- Talablarni qayta tekshirib, tasdiqlaysiz yoki yana sabab yozib rad etasiz.

**Texnik ma'lumot:** baza fayli `supabase/partner_resubmit.sql`; sayt fayllari `assets/js/partner.js`, `partner-join.js`, `admin-partners.js`.
