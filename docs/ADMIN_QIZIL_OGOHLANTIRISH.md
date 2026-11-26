# Admin: qizil ogohlantirish qatori (26.11.2026)

Admin panelning tepasida, menyu ostida qizil miltillovchi qator chiqadi:
- «🔴 Mijozdan N ta yangi xabar: Ism — «xabar boshi»». Bu kabinetdagi B2C mijozlarning o'qilmagan xabarlari.
- «🆕 Yangi B2C so'rov: MR-…». Bu holati «Yangi» bo'lgan so'rovlar.

Ism yoki raqam bosilsa, o'sha so'rov kartasi ochiladi va xabar o'qilgan deb belgilanadi. Qator har 15 soniyada o'zi yangilanadi, sahifani qayta yuklash shart emas. Brauzer yorlig'ida «(N) 🔴» chiqadi. Yangi xabar kelganda qisqa ovoz eshitiladi. Xabarga javob berilib, holat o'zgartirilgach, qator o'zi yo'qoladi.

Menejer faqat o'z mijozlarining xabarlarini ko'radi (baza qoidalari bo'yicha).
Kod: `assets/js/admin-customers.js` → `A.alertBar`.
