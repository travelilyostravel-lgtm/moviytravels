# Vaucher — haqiqiy A4 sahifalar (26.11.2026)

**Muammo.** Vaucher bitta uzun varaq bo'lib chizilardi. PDF yuklanganda u har 297 mm da kesilardi: matn sahifa o'rtasidan bo'linib qolardi, milliy naqshli ramka esa faqat birinchi va oxirgi varaqda chiqardi. Telefonda varaq torayib, yanada uzun bo'lardi. A4 ga chiroyli chop etib bo'lmasdi.

**Endi:**
- Vaucher alohida **A4 sahifalarga** bo'linadi (210×297 mm). Har sahifada o'z ramkasi va pastda raqami bor («MR-26-1025 · 1 / 2»).
- Bloklar sahifa o'rtasida kesilmaydi. Sarlavha keyingi blokdan ajralib qolmaydi.
- Uzun jadval (kunma-kun dastur, sayohatchilar) keyingi sahifada sarlavhasi bilan davom etadi.
- 2-sahifadan boshlab tepada kichik sarlavha turadi: «MOVIY NOMAD · raqam · tur nomi».
- **PDF yuklab olish:** har sahifa alohida A4 bo'ladi (sinovda MR-26-1025 = 2 sahifa).
- **Chop etish:** har sahifa yangi A4 varaqdan boshlanadi.
- Telefonda sahifa ekranga sig'adigan qilib kichraytiriladi, lekin PDF baribir to'liq A4.
- Xizmat vaucherlari (`doc=services`) avvalgidek bitta A4 ga ikkitadan chiqadi va telefonda ham ekranga sig'adi.

Kod: `build/voucher_page.py` (paginate, fit, PDF).
