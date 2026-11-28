# 30 tilga o'tkazish — ish tartibi va holati (2026-11-28 boshlangan)

Asoschi topshirig'i (28.11): sayt 30 tilda; saytning HAMMA bo'limlari 30 tilda ishlasin.

## Qanday ishlaydi
- Eski 10 til (en ru uz tr ar de sv zh hi ko) — o'z modullarida.
- Yangi 20 til: kk ky tg tk az hy ka be uk · fr es it pt pl nl · fa ur · ja id ms (`build/content.py` → `NEW_LANGS`).
- Yangi til sahifalari avval inglizcha yig'iladi, keyin `build/i18n_tool.py apply` har bir inglizcha matnni
  `build/i18n/<til>.json` → `"S"` jadvalidagi tarjimaga almashtiradi (HTML matn, atributlar, ichki skriptdagi JSON matnlar).
- Til saytda faqat `"live": true` bo'lganda chiqadi (til tanlovi, sahifalar, sitemap). Chala tarjima Google'ga chiqmaydi.
- Manba ro'yxati: `build/i18n/_source.json` (958 matn, 39,5 ming belgi). Yangilash:
  `cp -r . /tmp/mtest && cd /tmp/mtest && MN_ALL_LANGS=1 python3 build/build.py && python3 <repo>/build/i18n_tool.py extract /tmp/mtest fr`
- Tarjima bo'laklari: `build/i18n/tsv/<til>_NN.tsv` (qator: `raqam<TAB>tarjima`) → `python3 build/i18n/merge_tsv.py <til> build/i18n/tsv/<til>_*.tsv`
- Qolganini ko'rish: `python3 build/i18n_tool.py missing <til>`
- Manba endi 1460 qator: 0–957 statik sahifalar, 958–1215 va 1440–1459 turlar dasturi (`assets/data/l10n/en.js`, `extract_js`),
  1216–1439 sahifa skriptlari va kabinet (`extract_js2`). Tarjima qilinmaydiganlar: `build/i18n/NO_TRANSLATE.md`.
- Yig'ishda har yangi til uchun `assets/data/l10n/<til>.js` avtomatik yaratiladi: turlar matni + kabinet (`MN_CAB_X`)
  + `MN_RT` jadvali va `build/i18n/runtime.js` — skriptlar keyin chizgan inglizcha matnlarni ham tarjima qiladi.
- Menyu uzun tillarda o'zi kichrayadi va sig'maganini «Yana» ichiga oladi (`assets/js/site.js`, fitNav).

## Keyingi qadamlar
1. Statik sahifalar (958 matn) — har bir til.
2. JS orqali chiqadigan matnlar: `assets/data/l10n/<til>.js` (turlar dasturi), formalar, kabinet, hamkor/agent portallari, xatlar (notify), voucher.
3. Til tayyor bo'lgach: `"live": true`, yig'ish, sinash, Yangiliklar + VAZIFALAR.

## Holat
| Til | Statik sahifalar | JS / portallar | Saytda |
|---|---|---|---|
| kk | 1202/1460 (qolgani video nomlari, kodlar) | ✓ turlar, kabinet, formalar | ✅ 28.11 |
| ky | 1201/1460 | ✓ | ✅ 28.11 |
| tg | 1200/1460 | ✓ | ✅ 28.11 |
| tk | 1200/1460 | ✓ | ✅ 28.11 |
| az | 1200/1460 | ✓ | ✅ 28.11 |
| uk | 1200/1460 | ✓ | ✅ 28.11 |
| fr | 1200/1460 | ✓ | ✅ 28.11 |
| es | 1200/1460 | ✓ | ✅ 28.11 |
| it | 1200/1460 | ✓ | ✅ 28.11 |
