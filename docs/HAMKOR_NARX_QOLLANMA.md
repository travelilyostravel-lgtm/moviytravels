# Hamkor narxi va komissiya — asoschi uchun qo'llanma

*Qo'shilgan: 25.11.2026. Sayt: moviy-travel.uz*

## Qoida

| | Kim ko'radi | Misol (gid, 1 kun) |
|---|---|---|
| **Hamkor narxi (netto)** — gid, haydovchi yoki mehmonxona o'zi yozgan narx; unga aynan shu to'lanadi | Asoschi, menejer, hamkorning o'zi | **100 $** |
| **Moviy Nomad xizmat haqi** — standart 20% | Faqat asoschi va menejer | +20 $ |
| **Brutto** = netto × 1,20 — saytda ham, agent portalida ham bir xil | Hamma | **120 $** |
| **Agent komissiyasi** — bruttodan 10% (faqat agent orqali kelgan bronda) | Agent o'zi, admin | 12 $ |
| **Bizning foyda** | Asoschi va menejer | agent orqali **8 $**, saytdan to'g'ridan-to'g'ri **20 $** |

Netto narxni va xizmat haqi foizini mijoz ham, agent ham hech qanday yo'l bilan ko'ra olmaydi:
- bazadagi ochiq ma'lumotlarda faqat brutto turadi;
- brutto server tomonda hisoblanadi;
- agent narxni o'zgartirib yuborsa ham, server uni qayta to'g'ri hisoblaydi.

## Foizlarni qayerda o'zgartiraman

**Admin → Narxlar → "🤝 Hamkor xizmatlari"** (sahifaning eng tepasida):
- xizmat haqi % — gid, transport (haydovchi), mehmonxona va boshqa xizmatlar uchun alohida;
- agent komissiyasi % (bruttodan);
- pastda jonli misol: "100 $ → 120 $ → agent 12 $ → bizga 8 $".

Keyin **"Hamkor narx qoidalarini saqlash"** tugmasini bosasiz — saytdagi va agent portalidagi narxlar darhol yangilanadi. Bu yerni faqat asoschi o'zgartiradi, menejer faqat ko'radi.

Agent komissiyasi xizmat haqidan katta bo'lib, biz zarar qiladigan bo'lsak, tizim saqlashga ruxsat bermaydi.

**Bitta hamkorga alohida foiz:** Admin → Hamkorlar → hamkor kartasi → **"Alohida xizmat haqi %"**.
- Bo'sh qoldirilsa — standart foiz amal qiladi.
- Yonida 1 kun uchun hisob ko'rinadi: hamkor narxi → brutto → agent → bizga.
- Buni ham faqat asoschi o'zgartira oladi (bazada himoyalangan).

## Har bronda hisob

B2B bron yoki B2C so'rov kartasida **"🤝 Hamkor hisobi"** bloki chiqadi:
- hamkor narxi va kun/kecha soni;
- hamkorga to'lanadigan summa;
- brutto;
- agent komissiyasi;
- **bizning foyda**.

Saytdan kelgan so'rovda kun sonini mijozning o'zi yozadi. Siz so'rovga narx qo'ysangiz, hisob shu narx bo'yicha qayta chiqadi.

## Agent portalida

Yangi bo'lim: **"Services / Guides"** (10 tilda). Unda:
- gidlar, haydovchili mashinalar va mehmonxonalar ro'yxati, saytdagi brutto narx bilan;
- **"% Commission"** tugmasi — komissiya foizi, agent daromadi va bizga to'lanadigan netto;
- sana, kun soni va odamlar sonini tanlab **"Send booking"** — bron "B2B — agent bronlari"ga tushadi, komissiya bronga yoziladi.

## Saytda (B2C)

Gid, haydovchi va mehmonxona kartochkalarida **faqat brutto** ko'rinadi ("120 $ / kun").

So'rov formasida endi "Kunlar soni (mehmonxona: kechalar)" maydoni va taxminiy narx bor.

## Hamkor kabinetida

Hamkor faqat:
- **o'z narxini** ko'radi;
- **"Sizga to'lanadigan summalar"** jadvalini ko'radi: bron, sana, kun, narxi, to'lanadigan summa, holat.

Brutto, xizmat haqi va agent komissiyasi unga ko'rinmaydi.

Hamkor narxini o'zgartirsa, bu "kartochka o'zgarishi" bo'lib keladi va admin tasdiqlamaguncha saytda eski narx turadi.

## Sinov natijasi (25.11.2026, test yozuvlari o'chirilgan)

- Hamkor narxi 100 → saytda **120** → agent portalida **120**, komissiya **12**, agent to'laydi **108** → admin hisobida foyda **8** ✅
- Agent narxni "1 $" va komissiyani "50%" deb buzib yubordi → server baribir 120 / 10% / 108 qo'ydi ✅
- Saytdan 2 kunlik so'rov → hamkorga 200, brutto 240, bizga 40 ✅
- Bitta hamkorga 25% → saytda 125 ✅
- Mehmon va agent netto narxni, foizni, hisoblar jadvalini va yordamchi funksiyalarni ochib ko'ra olmadi ✅

## Yo'l-yo'lakay topilgan xato

**Agent saytda ro'yxatdan o'ta olmayotgan edi** (23-noyabrdan beri xato 500). Sababi: bazada "firma INN" ustuni yo'q edi. Ustun qo'shildi, ro'yxatdan o'tish yana ishlayapti.

23–25-noyabr orasida ro'yxatdan o'tmoqchi bo'lgan agentlar bo'lsa, ulardan qayta urinib ko'rishni so'rang.

## Texnik ma'lumot

- **Baza:** `supabase/partner_pricing.sql`
- **Sayt fayllari:**
  - `assets/js/partners.js` (sayt);
  - `agent.js` (agent portali);
  - `admin-partner-pricing.js` (admin);
  - `partner.js` (hamkor kabineti).
- **PR:** github.com/travelilyostravel-lgtm/moviytravels/pull/3
