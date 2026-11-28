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

## Keyingi qadamlar
1. Statik sahifalar (958 matn) — har bir til.
2. JS orqali chiqadigan matnlar: `assets/data/l10n/<til>.js` (turlar dasturi), formalar, kabinet, hamkor/agent portallari, xatlar (notify), voucher.
3. Til tayyor bo'lgach: `"live": true`, yig'ish, sinash, Yangiliklar + VAZIFALAR.

## Holat
| Til | Statik sahifalar | JS / portallar | Saytda |
|---|---|---|---|
| kk | 150/958 | — | yo'q |
