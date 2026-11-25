# Har o'zgarishdan keyin — ma'lumotni qayerga yozish kerak

*Asoschi qarori, 25.11.2026: saytga kiritilgan har bir o'zgarish bittasi ham qolmasdan hamma joyga yoziladi — kelajakda xuddi shunday saytni qayta yaratish uchun.*

| # | Joy | Nima yoziladi |
|---|-----|---------------|
| 1 | Google qo'llanma → **Yangiliklar** varag'i (`17ARrKgKUka5x8LkNs9oBVAoeMkfQJlmhZ2Ger3Ccy-s`) | 2-qatorga yangi qator: sana, nom, batafsil, izoh |
| 2 | Google qo'llanma → **tegishli varaq** | Boshlash (manzil, havola), B2C mijoz, B2B agent, Hamkor portali, Admin (A–O bo'limlar), Bron holatlari — qaysi biriga tegsa, o'sha qadamni yangilash yoki qo'shish |
| 3 | Google qo'llanma → **EN — Guide** va **RU — Инструкция** | Qisqa tarjima ("UPDATE …" bo'limi) |
| 4 | Asoschi jadvali → **Qilinishi kerak** (`1nhBtEgRMLrqX2QKiR-ZIbtmASogEL2PCEBBvgpU8ZdQ`) | Nima qilindi, asoschi nima qilishi kerak; maxfiy ma'lumot faqat shu yerda |
| 5 | Kompyuter: `Desktop/moviy nomad kantent /SAYT_VA_BAZA/YANGILIKLAR.md` | Birinchi `## ` dan oldin yangi bo'lim |
| 6 | Kompyuter: `04_Baza_Supabase/` | Har yangi yoki o'zgargan `supabase/*.sql` va `notify` funksiyasi (`notify_funksiya_index.ts`) |
| 7 | Kompyuter: `03_Sayt_kodi/` | Katta o'zgarishdan keyin yangi `.zip` va `.bundle` (eskisi `_eski` ga), `KOD_HAQIDA.txt` |
| 8 | Kompyuter: `01_Qollanma/`, `02_ASOSCHI_MAXFIY/` | Google jadvallarning yangi `.xlsx` nusxasi (eskisi `_eski` ga); alohida qo'llanma `.md` fayllari |
| 9 | Kompyuter: `00_AVVAL_OQING.txt` | Yangi papka yoki fayl qo'shilsa — tavsifi va sanasi |
| 10 | GitHub: `docs/` | Asoschi uchun qo'llanmalar (`.md`) |
| 11 | Claude loyihasi (MOVIY NOMAD) hujjatlari | Muhim qo'llanma va qarorlar |

**Qoidalar**
- Maxfiy narsalar (parol, kalit, service_role, DB parol) faqat asoschi jadvaliga — qo'llanmaga, GitHub'ga, saytga hech qachon.
- Sinov ma'lumotlari ishlatilgach o'chiriladi.
- Google jadvalga yozganda: `append_values` oxiriga emas, jadval tepasiga qo'shib yuborishi mumkin — aniq qator manzili bilan (`update_values`) yozing va keyin tekshiring. Birlashtirilgan (merge) kataklarga yozilgan matn ko'rinmaydi — avval ajrating.
