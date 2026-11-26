# Bosh sahifa: arzon turlar birinchi, premium dizayn (27.11.2026)

**Asoschi talabi:** bosh sahifani pastga tortsa darhol turlar chiqsin; boshida 4 ta arzon dastur (turist «tur arzon ekan» degan taassurot olsin), pastga qarab qimmatlashadi; kartochkalar kuchli dizaynerdek premium.

**Nima qilindi:**
- «Yo'nalishlar» (O'zbekiston — Ipak yo'lining yuragi, 4 shahar belgisi) bo'limi olib tashlandi. Hero'dan keyin darhol turlar.
- **1-qator «Qisqa va hamyonbop»** (yashil «Eng arzon» lentasi) — 4 ta yangi dastur:
  1. Toshkent bo'ylab sayohat — 1 kun (Hazrati Imom, Chorsu, metro, Amir Temur xiyoboni), mehmonxonasiz — ~$175
  2. Toshkent va Samarqand — 3 kun, «Afrosiyob» poyezdi — ~$590
  3. Toshkent, Samarqand va Buxoro — 4 kun — ~$840
  4. Toshkent, Samarqand va tog'lar — 4 kun (Chimyon, Amirsoy, Chorvoq bir kunlik sayohat) — ~$795
- **2-qator «Asosiy turlarimiz»** (oltin «Premium» lentasi, to'q ko'k kartochka, oltin ramka): Klassik ($1,690), Ekspress ($1,090), Buyuk Ipak yo'li ($2,125), Ma'naviy meros ($1,490).
- Dizayn: katta rasm, sarlavha rasm ustida (Playfair Display shrifti), kunlar soni, marshrut, narx, «Turni ko'rish». Telefonda kartochkalar yonga suriladi. Tungi rejimga moslangan.
- Har bir yangi tur uchun to'liq prezentatsiya sahifasi (10 tilda), narx kalkulyatori, bron.
- Narxlar avtomatik (comfort mehmonxona, 2 kishi); admin → Narxlar → 7 da qo'lda o'zgartirsa bo'ladi.
- Qo'shimcha tuzatishlar: tepadagi «Kabinetim» tugmasi skrolldan keyin ham oq; 1 kunlik tur sahifasida «0 tun / 0 km» ko'rsatilmaydi.

**Fayllar:** `build/tours_data.py` (_START), `build/l10n/*.py` (nomlar 10 tilda), `build/build.py` (MT_TXT, mt_card), `assets/css/site.css` («Home tours — premium cards»), `assets/js/deck.js`.
