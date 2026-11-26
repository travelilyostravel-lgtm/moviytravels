/* Moviy Nomad — admin: price control ("Narxlar").
 * Admins enter real COSTS + margin. On save two rows are written to price_config:
 *   costs  — what was entered (admins only)
 *   public — ready selling prices (every amount × (1 + margin), margin 0) that the website reads.
 * Visitors never see costs or the margin. Every save keeps the previous version (price_config_log). */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  var E = window.MN_ENGINE, C = window.MN_CATALOG, TOURS = window.MN_TOURS || {};
  if (!sb || !E) return;

  var COUNTRY = { UZ: "O'zbekiston", KZ: "Qozog'iston", KG: "Qirg'iziston", TJ: "Tojikiston", CA: "Markaziy Osiyo katta turi (4 davlat)" };
  var ORDER = ["UZ", "CA", "KZ", "KG", "TJ"];
  // Entry fees catalogue (25.11.2026): paid sights that are not (yet) in tour programs — the founder fills the prices
  var ENTRY_SEED = [
    { r: "tashkent", n: "Temuriylar tarixi davlat muzeyi" }, { r: "tashkent", n: "O\'zbekiston tarixi davlat muzeyi" }, { r: "tashkent", n: "Amaliy san\'at muzeyi" }, { r: "tashkent", n: "Toshkent teleminorasi" },
    { r: "samarkand", n: "Abadiy shahar (Eternal City)" }, { r: "samarkand", n: "Konigil qog\'oz fabrikasi" },
    { r: "bukhara", n: "Chor Minor" }, { r: "bukhara", n: "Bolo Hovuz masjidi" }, { r: "bukhara", n: "Ulug\'bek va Abdulazizxon madrasalari" },
    { r: "khiva", n: "Ichan Qal\'a yagona chiptasi" }, { r: "khiva", n: "Kuhna Ark (minoraga chiqish bilan)" }, { r: "khiva", n: "Juma masjidi" }, { r: "khiva", n: "Pahlavon Mahmud maqbarasi" }, { r: "khiva", n: "Islom Xo\'ja minorasiga chiqish" },
    { r: "nukus", n: "Mizdahkan majmuasi" }, { r: "nukus", n: "Chilpiq qal\'asi" }, { r: "nukus", n: "Qoraqalpog\'iston tarixi muzeyi" }, { r: "nukus", n: "Tuproqqal\'a" }, { r: "nukus", n: "Mo\'ynoq: Orol dengizi muzeyi" }];
  // Separate services (services.html) — price per unit
  var SVC = [["guide", "Gid (alohida)", "1 kun"], ["car", "Haydovchili transport (transfer, shahar, safar)", "1 kun / 1 yo'nalish"], ["hotel", "Mehmonxona (bron)", "1 kecha"],
    ["airport", "Aeroportda haydovchi kutib oladi (transport bilan)", "mashina, 1 tomon"], ["airport_guide", "Aeroportda gid kutib oladi", "1 marta"],
    ["mice", "Guruh / MICE tashkil qilish", "1 kishi"], ["esim", "eSIM (mobil internet)", "1 paket"]];
  var CLS = C.hotelClasses.map(function (h) { return h.id; });
  var CLS_NAME = { comfort: "Komfort 3★", superior: "Superior 4★", boutique: "Butik" };
  var TR_NAME = { sedan: "Sedan", minivan: "Miniven", premium: "Premium miniven", minibus: "Mikroavtobus", bus: "Avtobus" };
  var LANG_NAME = { en: "Ingliz", ru: "Rus", tr: "Turk", ar: "Arab", de: "Nemis", zh: "Xitoy", ko: "Koreys", hi: "Hind", sv: "Shved" };
  var MODE = { train: "🚆 poyezd", flight: "✈️ avia", car: "🚗 mashina", border: "🛂 chegara" };

  // Defaults taken from catalog.js before anything is applied
  var DEF = {
    openCountries: (C.openCountries || ["UZ"]).slice(),
    markup: C.markup, singleSupplement: C.singleSupplement, roundTo: C.roundTo || 5, defaultPax: C.defaultPax,
    hotelClasses: {}, transport: {}, guide: { day: C.guide.day, languages: JSON.parse(JSON.stringify(C.guide.languages)) },
    fixed: { train: C.fixed.train, flight: C.fixed.flight, entryPerDay: C.fixed.entryPerDay, entryDefault: 5, welcomeDinner: C.fixed.welcomeDinner }
  };
  C.hotelClasses.forEach(function (h) { DEF.hotelClasses[h.id] = h.room; });
  C.transport.forEach(function (x) { DEF.transport[x.id] = x.day; });

  // What the tours use, grouped by country
  // Each city / route / sight is listed once (under the first country that uses it), so one value = one input
  var used = {}, seen = { cities: {}, legs: {}, sights: {} };  // country -> {cities:{}, legs:{}, sights:{}, tours:[]}
  ORDER.concat(Object.keys(TOURS).map(function (id) { return TOURS[id].country; })).forEach(function (cc) {
    Object.keys(TOURS).forEach(function (id) {
      var T = TOURS[id]; if (T.country !== cc) return;
      var g = used[cc] = used[cc] || { cities: {}, legs: {}, sights: {}, tours: [] };
      if (g.tours.indexOf(id) < 0) g.tours.push(id);
      T.days.forEach(function (d) {
        if (d.sleep && !seen.cities[d.sleep]) { seen.cities[d.sleep] = 1; g.cities[d.sleep] = 1; }
        (d.move || []).forEach(function (m) { var k = m[0] + ">" + m[1]; if (!seen.legs[k]) { seen.legs[k] = 1; g.legs[k] = m; } });
        (d.stops || []).forEach(function (st) { if (st.id && !seen.sights[st.id]) { seen.sights[st.id] = 1; g.sights[st.id] = st.city || d.sleep; } });
      });
    });
  });
  function cname(id) { return (C.cities[id] || {}).name || id; }
  function sname(id) { var x = (E.L.sights || {})[id]; return x ? x[0] : id; }
  function money(v) { return "$" + (Math.round(v * 100) / 100).toLocaleString("en", { maximumFractionDigits: 2 }); }

  var saved = null, savedAt = null;

  function inp(path, val, ph, extra) {
    return '<input class="np-in" type="number" min="0" step="any" data-p="' + path + '" value="' + (val === undefined || val === null || val === "" ? "" : esc(val)) + '" placeholder="' + esc(ph === undefined ? "" : ph) + '"' + (extra || "") + '>';
  }
  var MKC = [["guide", "Gid (aeroportda gid kutib olishi ham)"], ["transport", "Transport (haydovchili mashina, aeroportda haydovchi kutib olishi)"], ["hotel", "Mehmonxona"], ["mice", "Guruh / MICE tashkil qilish"], ["esim", "eSIM"]];
  var SVC_CAT = { airport: "transport", car: "transport", hotel: "hotel", guide: "guide", airport_guide: "guide", mice: "mice", esim: "esim" };
  var ALLCAT = ["hotel", "transport", "guide", "train", "entries", "dinner", "extra", "mice", "esim"];
  // Separate services: one % for all (mode "one") or the per-service list
  function svcMk(c, cat) { return c && c.mkMode === "one" && isFinite(parseFloat(c.mkAll)) ? parseFloat(c.mkAll) : mkOf(c, cat); }
  // Full packages / ready tours: own single % when switched on, otherwise the same % as the separate services
  function pkgMk(c, cat) { return c && c.pkgOn && isFinite(parseFloat(c.pkgPct)) ? parseFloat(c.pkgPct) : svcMk(c, cat); }
  function pkgBase(c) { return c && c.pkgOn && isFinite(parseFloat(c.pkgPct)) ? parseFloat(c.pkgPct) : c && c.mkMode === "one" && isFinite(parseFloat(c.mkAll)) ? parseFloat(c.mkAll) : (c && c.markup !== undefined ? c.markup : DEF.markup); }
  function mkOf(c, cat) { var m = c && c.markups; return m && isFinite(parseFloat(m[cat])) ? parseFloat(m[cat]) : (c && c.markup !== undefined ? c.markup : DEF.markup); }
  function num(x, d) { var n = parseFloat(x); return isFinite(n) ? n : d; }
  function get(o, path) { return path.split(".").reduce(function (a, k) { return a && a[k] !== undefined ? a[k] : undefined; }, o); }

  function render(cfg) {
    var box = $("#np-body");
    var c = cfg || {};
    var v = function (path, def) { var x = get(c, path); return x === undefined ? def : x; };
    var h = '';
    // 1. General
    h += '<details open class="np-sec"><summary>1. Umumiy sozlamalar</summary><div class="np-grid">' +
      '<label>Standart xizmat haqi (ustama), %' + inp("markup_pct", Math.round(v("markup", DEF.markup) * 1000) / 10, "", "") + '<small>Pastdagi "1a" bo\'limida foizi yozilmagan xizmatlarga qo\'shiladi.</small></label>' +
      '<label>Single xona qo\'shimchasi, %' + inp("single_pct", Math.round(v("singleSupplement", DEF.singleSupplement) * 100), "") + '<small>1 kishilik xona uchun mehmonxona narxiga qo\'shimcha.</small></label>' +
      '<label>Narxni yaxlitlash, $' + inp("roundTo", v("roundTo", DEF.roundTo), "5") + '<small>1 kishi narxi shu songa karrali qilib yuqoriga yaxlitlanadi.</small></label>' +
      '<label>"…dan" narx necha kishi uchun' + inp("defaultPax", v("defaultPax", DEF.defaultPax), "2") + '<small>Bosh sahifadagi kartochkalar narxi.</small></label>' +
      '<label class="np-check"><input type="checkbox" data-p="booking_online"' + (c.booking_online ? " checked" : "") + '> Onlayn bron va to\'lov yoqilgan<small>O\'chiq bo\'lsa saytda "Tez orada" ko\'rinadi, mijoz faqat so\'rov qoldiradi.</small></label>' +
      '<div class="np-check np-open"><b>Narxi ochiq davlatlar</b>' + ORDER.map(function (cc) {
        var on = (c.openCountries || DEF.openCountries).indexOf(cc) > -1;
        return '<label><input type="checkbox" data-p="open.' + cc + '"' + (on ? " checked" : "") + '> ' + COUNTRY[cc] + '</label>'; }).join("") +
        '<small>Belgilanmagan davlat saytda "Tayyorlanmoqda" bo\'lib turadi: tur taqdimotlari ko\'rinadi, lekin narx va o\'zi hisoblash (B2C va B2B) yopiq, mijoz menejerga yo\'naltiriladi.</small></div>' +
      '</div></details>';
    // 1a. Service fee per kind of service
    h += '<details open class="np-sec"><summary>1a. Kampaniya xizmat haqi (foiz) — qanday qo\'shilsin</summary>' +
      '<div class="np-mk">' +
      '<p class="np-note"><b>3 xil yo\'l bor.</b> Siz har doim netto (tan narx) yozasiz — sayt mijozga netto + foizni ko\'rsatadi. Foiz mijozga ko\'rinmaydi.</p>' +
      '<label class="np-mk__opt"><input type="radio" name="mk_mode" data-p="mk_mode" value="each"' + (c.mkMode !== "one" ? " checked" : "") + '> <span><b>1) Har bir xizmatga alohida %</b><small>Pastdagi ro\'yxatda gid, transport, mehmonxona, MICE, eSIM uchun har biriga o\'z foizini yozasiz.</small></span></label>' +
      '<label class="np-mk__opt"><input type="radio" name="mk_mode" data-p="mk_mode" value="one"' + (c.mkMode === "one" ? " checked" : "") + '> <span><b>2) Bitta % — barcha alohida xizmatlarga</b><small>Shu bitta foiz hamma alohida xizmatlarga qo\'shiladi, pastdagi alohida foizlar e\'tiborga olinmaydi (o\'chmaydi, keyin yana qaytishingiz mumkin).</small></span>' + inp("mk_all", c.mkAll === undefined ? "" : Math.round(c.mkAll * 1000) / 10, "%") + '</label>' +
      '<label class="np-mk__opt"><input type="checkbox" data-p="pkg_on"' + (c.pkgOn ? " checked" : "") + '> <span><b>3) Full paket va tayyor turlar uchun alohida bitta %</b><small>Yoqilsa: tayyor turlar va mijoz o\'zi yig\'gan to\'liq paket narxi = barcha qismlar netto + shu foiz. O\'chiq bo\'lsa: paket har bir qismning yuqoridagi foizi bilan yig\'iladi (alohida sotib olgandek bir xil narx).</small></span>' + inp("pkg_pct", c.pkgPct === undefined ? "" : Math.round(c.pkgPct * 1000) / 10, "%") + '</label>' +
      '</div><div class="np-grid" data-mkgrid>' +
      MKC.map(function (m) { var x = get(c, "markups." + m[0]); return '<label>' + m[1] + inp("mk." + m[0], x === undefined ? "" : Math.round(x * 1000) / 10, "standart") + '</label>'; }).join("") +
      '</div><p class="np-note">Siz netto (tan narx) yozasiz, sayt mijozga <b>netto + shu foiz</b>ni ko\'rsatadi (B2C va B2B uchun bir xil brutto; agent komissiyasi bruttodan). Foiz mijozga ko\'rinmaydi — faqat sizga va adminlarga. To\'liq paket narxi har bir qismning o\'z foizi bilan yig\'iladi, shuning uchun alohida yig\'ilgan xizmatlar yig\'indisi bilan paket narxi bir xil chiqadi. Bo\'sh qolsa — standart foiz. Turlar ichidagi poyezd chiptalari, obidalarga kirish va kechki ovqat alohida sotilmaydi — ularga standart foiz qo\'shiladi.</p></details>';
    // 2. Hotels
    h += '<details open class="np-sec"><summary>2. Mehmonxonalar — xona narxi bir kechaga (2 kishilik xona), $</summary>' +
      '<p class="np-note">Shahar bo\'yicha bo\'sh qoldirilsa, "Standart" narx olinadi. Mijozdan 1 kishi uchun xona narxining yarmi olinadi.</p>' +
      '<table class="tbl np-tbl"><thead><tr><th>Shahar</th>' + CLS.map(function (k) { return '<th>' + CLS_NAME[k] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      '<tr class="np-def"><td><b>Standart (boshqa shaharlar)</b></td>' + CLS.map(function (k) { return '<td>' + inp("hotelClasses." + k, v("hotelClasses." + k, DEF.hotelClasses[k])) + '</td>'; }).join("") + '</tr>';
    ORDER.forEach(function (cc) {
      if (!used[cc] || !Object.keys(used[cc].cities).length) return;
      h += '<tr class="np-grp"><td colspan="' + (CLS.length + 1) + '">' + COUNTRY[cc] + '</td></tr>';
      Object.keys(used[cc].cities).forEach(function (city) {
        h += '<tr><td>' + esc(cname(city)) + '</td>' + CLS.map(function (k) { return '<td>' + inp("hotelCity." + city + "." + k, v("hotelCity." + city + "." + k, ""), "standart") + '</td>'; }).join("") + '</tr>';
      });
    });
    h += '</tbody></table></details>';
    // 3. Transport
    h += '<details open class="np-sec"><summary>3. Transport — bir mashina, bir kunga, $</summary><div class="np-grid">' +
      C.transport.map(function (x) { return '<label>' + (TR_NAME[x.id] || x.id) + ' <small>(' + x.seats + ' o\'rin)</small>' + inp("transport." + x.id, v("transport." + x.id, DEF.transport[x.id])) + '</label>'; }).join("") +
      '</div><p class="np-note">Turdagi barcha kunlar uchun hisoblanadi va guruhdagi odamlarga bo\'linadi. Mashina turi odam soniga qarab avtomatik tanlanadi.</p></details>';
    // 4. Guide — a full day price for EVERY language (owner: 2026-11-23)
    var gd = num(get(c, "guide.day"), DEF.guide.day), gl = get(c, "guide.languages") || DEF.guide.languages;
    var GL = ["en", "ru", "tr", "ar", "de", "zh", "ko", "hi", "sv"];
    h += '<details open class="np-sec"><summary>4. Gid — har bir til uchun bir kunlik narx, $</summary><div class="np-grid">' +
      GL.map(function (k) { return '<label>' + (LANG_NAME[k] || k) + ' tilidagi gid' + inp("guide.rate." + k, v("guide.rate." + k, Math.round((gd + num(gl[k], 0)) * 100) / 100)) + '</label>'; }).join("") +
      '</div><p class="np-note">Har bir tildagi gidning <b>to\'liq kunlik narxi</b>ni yozing (qo\'shimcha emas). Sayt, tur yig\'ish, prezentatsiyalar, agent portali va guruh turlari shu narxni o\'zi oladi: mijoz qaysi tildagi gidni tanlasa, o\'sha narx hisoblanadi. Gid kunlari = tur kunlari − 1, guruhdagi odamlarga bo\'linadi.</p></details>';
    // 5. Train / flight tickets per route
    h += '<details open class="np-sec"><summary>5. Poyezd, avia va transfer chiptalari — 1 kishi uchun, $</summary><div class="np-grid">' +
      '<label>Poyezd (standart)' + inp("fixed.train", v("fixed.train", DEF.fixed.train)) + '</label>' +
      '<label>Ichki reys (standart)' + inp("fixed.flight", v("fixed.flight", DEF.fixed.flight)) + '</label></div>' +
      '<p class="np-note">Yo\'nalish bo\'yicha bo\'sh qoldirilsa standart narx olinadi (mashina yo\'llari uchun 0 — transport narxida bor).</p><table class="tbl np-tbl"><thead><tr><th>Yo\'nalish</th><th>Turi</th><th>1 kishi, $</th></tr></thead><tbody>';
    ORDER.forEach(function (cc) {
      if (!used[cc] || !Object.keys(used[cc].legs).length) return;
      h += '<tr class="np-grp"><td colspan="3">' + COUNTRY[cc] + '</td></tr>';
      Object.keys(used[cc].legs).forEach(function (k) {
        var m = used[cc].legs[k], l = E.leg(m[0], m[1]);
        var def = l.mode === "train" ? "poyezd standart" : l.mode === "flight" ? "avia standart" : "0";
        h += '<tr><td>' + esc(cname(m[0])) + ' → ' + esc(cname(m[1])) + '</td><td>' + (MODE[l.mode] || l.mode) + '</td><td>' + inp("legPrice." + k, v("legPrice." + k, ""), def) + '</td></tr>';
      });
    });
    h += '</tbody></table></details>';
    // 6. Entry tickets per sight + dinner
    h += '<details class="np-sec" open><summary>6. Kirish chiptalari (obidalar) va ovqat — 1 kishi uchun, $</summary><div class="np-grid">' +
      '<label>Obida chiptasi (standart)' + inp("fixed.entryDefault", v("fixed.entryDefault", DEF.fixed.entryDefault)) + '<small>Ro\'yxatda narx yozilmagan obidalar uchun.</small></label>' +
      '<label>Kechki ovqat (birinchi kun)' + inp("fixed.welcomeDinner", v("fixed.welcomeDinner", DEF.fixed.welcomeDinner)) + '</label>' +
      '<label>Tur yig\'ish: kunlik kirish chiptalari' + inp("fixed.entryPerDay", v("fixed.entryPerDay", DEF.fixed.entryPerDay)) + '<small>Mijoz o\'zi yig\'gan turlar uchun (obidalar ro\'yxati yo\'q).</small></label></div>' +
      '<p class="np-note">Narxlar <b>chet ellik 1 kishi uchun, $</b>. Har shahar bo\'yicha: dasturdagi obidalar (tur narxiga avtomatik qo\'shiladi) va o\'zingiz qo\'shgan obidalar (ma\'lumot uchun; keyin turlarga qo\'shamiz). Bepul joylar uchun 0 yozing.</p>';
    var REG = [["tashkent", "Toshkent", ["tashkent"]], ["samarkand", "Samarqand", ["samarkand"]], ["bukhara", "Buxoro", ["bukhara", "gijduvan"]], ["khiva", "Xiva", ["khiva"]], ["nukus", "Nukus va Qoraqalpog\'iston", ["nukus", "moynaq", "ayazkala"]]];
    var inReg = {}; REG.forEach(function (r) { r[2].forEach(function (c) { inReg[c] = r[0]; }); });
    var EC = (cfg && cfg.entryCustom) || ENTRY_SEED;
    var ecRow = function (x) { return '<tr class="np-ec"><td><input class="np-in np-ecn" type="text" maxlength="80" value="' + esc(x.n || "") + '" placeholder="Obida nomi"></td><td><input class="np-in np-eca" type="number" min="0" step="any" value="' + (x.a === undefined || x.a === null ? "" : esc(x.a)) + '"></td><td><input class="np-in np-ecc" type="number" min="0" step="any" value="' + (x.c === undefined || x.c === null ? "" : esc(x.c)) + '"></td><td><input class="np-in np-ecp" type="number" min="0" step="any" value="' + (x.p === undefined || x.p === null ? "" : esc(x.p)) + '"></td><td><button type="button" class="btn btn--outline btn--sm np-ecdel" title="O\'chirish">✕</button></td></tr>'; };
    var head = '<table class="tbl np-tbl"><thead><tr><th>Obida</th><th>Kattalar, $</th><th>Bola, $</th><th>Foto/video, $</th><th></th></tr></thead><tbody>';
    REG.forEach(function (r) {
      h += '<h4 style="margin:14px 0 6px">📍 ' + r[1] + '</h4>' + head;
      Object.keys((used.UZ || {}).sights || {}).forEach(function (sid) {
        if (inReg[used.UZ.sights[sid]] !== r[0]) return;
        h += '<tr><td>' + esc(sname(sid)) + ' <small class="np-note">· dasturda</small></td><td>' + inp("sightPrice." + sid, v("sightPrice." + sid, ""), "standart") + '</td><td>' + inp("sightChild." + sid, v("sightChild." + sid, "")) + '</td><td>' + inp("sightPhoto." + sid, v("sightPhoto." + sid, "")) + '</td><td></td></tr>';
      });
      h += '<tbody class="np-ecb" data-reg="' + r[0] + '">' + EC.filter(function (x) { return x.r === r[0]; }).map(ecRow).join("") + '</tbody></table>' +
        '<button type="button" class="btn btn--outline btn--sm np-ecadd" data-reg="' + r[0] + '">+ Obida qo\'shish (' + r[1] + ')</button>';
    });
    h += '<h4 style="margin:18px 0 6px">Boshqa shahar va davlatlar (dasturdagi obidalar)</h4><table class="tbl np-tbl"><thead><tr><th>Obida</th><th>Shahar</th><th>1 kishi, $</th></tr></thead><tbody>';
    ORDER.forEach(function (cc) {
      if (!used[cc] || !Object.keys(used[cc].sights).length) return;
      var rows = Object.keys(used[cc].sights).filter(function (sid) { return !(cc === "UZ" && inReg[used[cc].sights[sid]]); });
      if (!rows.length) return;
      h += '<tr class="np-grp"><td colspan="3">' + COUNTRY[cc] + '</td></tr>';
      rows.forEach(function (sid) {
        h += '<tr><td>' + esc(sname(sid)) + '</td><td>' + esc(cname(used[cc].sights[sid])) + '</td><td>' + inp("sightPrice." + sid, v("sightPrice." + sid, ""), "standart") + '</td></tr>';
      });
    });
    h += '</tbody></table><p class="np-note">Bepul joylar (bozor, ko\'cha, tabiat) uchun 0 yozing.</p></details>';
    // 7. Tours
    h += '<details open class="np-sec"><summary>7. Turlar — narx: netto, brutto, agent komissiyasi</summary>' +
      '<p class="np-note"><b>Ikki usul bor.</b> 1) Avtomatik: yuqoridagi xarajatlar + ustama. 2) Qo\'lda: "Netto" va/yoki "Brutto" katagiga 1 kishi narxini yozasiz (2 kishi, turning asosiy mehmonxonasi) — sayt shu narxni ko\'rsatadi, boshqa variantlar (odam soni, mehmonxona) shunga mos o\'zgaradi. Faqat netto yozsangiz, brutto = netto + ustama. Bo\'sh qolsa — avtomatik.<br>' +
      '<b>Agent komissiyasi %</b> — shu tur uchun agentga beriladigan foiz (agent portalida va bronda shu ishlatiladi). Bo\'sh qolsa — agentlikning o\'z foizi.<br>' +
      'Qo\'shimcha xarajat: masalan, master-klass, qayiq, maxsus kechki ovqat. "1 kishiga" — har bir mijozga; "guruhga" — butun guruhga bir marta.</p>';
    ORDER.forEach(function (cc) {
      if (!used[cc]) return;
      h += '<details class="np-country"' + (cc === "UZ" ? " open" : "") + '><summary>' + COUNTRY[cc] + ' (' + used[cc].tours.length + ' ta tur)</summary>';
      used[cc].tours.forEach(function (tid) {
        var T = TOURS[tid];
        h += '<div class="np-tour" data-tour="' + tid + '"><div class="np-tour__h"><b>' + esc(T.title) + '</b><small>' + T.days.length + ' kun · ' + T.days.filter(function (d) { return d.sleep; }).length + ' kecha</small></div>' +
          '<div class="np-grid np-grid--s np-manual"><label>Netto, 1 kishi $ <small>(qo\'lda)</small>' + inp("tourPrice." + tid + ".netto", v("tourPrice." + tid + ".netto", ""), "avtomatik") + '</label>' +
          '<label>Brutto, 1 kishi $ <small>(saytdagi narx)</small>' + inp("tourPrice." + tid + ".brutto", v("tourPrice." + tid + ".brutto", ""), "avtomatik") + '</label>' +
          '<label>Agent komissiyasi %' + inp("tourComm." + tid, v("tourComm." + tid, ""), "agentlikniki") + '</label></div>' +
          '<div class="np-grid np-grid--s"><label>Qo\'shimcha, 1 kishiga $' + inp("tourExtra." + tid + ".pp", v("tourExtra." + tid + ".pp", ""), "0") + '</label>' +
          '<label>Qo\'shimcha, guruhga $' + inp("tourExtra." + tid + ".group", v("tourExtra." + tid + ".group", ""), "0") + '</label></div>' +
          '<div class="np-res" data-res="' + tid + '"></div></div>';
      });
      h += '</details>';
    });
    h += '</details>';
    // 8. Separate services
    h += '<details open class="np-sec"><summary>8. Alohida xizmatlar — netto, brutto, agent komissiyasi</summary>' +
      '<p class="np-note">Xizmatlar sahifasida (services.html) mijozga "…dan" narx sifatida brutto ko\'rinadi. Bo\'sh qolsa — narx ko\'rsatilmaydi, mijoz so\'rov yuboradi. Netto va komissiya faqat sizga ko\'rinadi.</p>' +
      '<table class="tbl np-tbl"><thead><tr><th>Xizmat</th><th>Birlik</th><th>Netto $</th><th>Brutto $ (saytda)</th><th>Agent komissiyasi %</th><th>Foyda</th></tr></thead><tbody>' +
      SVC.map(function (x) {
        return '<tr><td>' + x[1] + '</td><td><small>' + x[2] + '</small></td><td>' + inp("svcPrice." + x[0] + ".netto", v("svcPrice." + x[0] + ".netto", ""), "—") + '</td><td>' +
          inp("svcPrice." + x[0] + ".brutto", v("svcPrice." + x[0] + ".brutto", ""), "—") + '</td><td>' + inp("svcPrice." + x[0] + ".comm", v("svcPrice." + x[0] + ".comm", ""), "—") + '</td><td data-svcres="' + x[0] + '">—</td></tr>';
      }).join("") + '</tbody></table></details>';
    box.innerHTML = h;
    $$(".np-in, input[type=checkbox][data-p], input[type=radio][data-p]", box).forEach(function (el) { el.addEventListener("input", recalc); el.addEventListener("change", recalc); });
    recalc();
  }

  // Read the form into a costs object (only filled values)
  function collect() {
    var o = { hotelClasses: {}, hotelCity: {}, transport: {}, guide: { languages: {} }, fixed: {}, legPrice: {}, sightPrice: {}, tourExtra: {}, tourPrice: {}, tourComm: {}, svcPrice: {} };
    $$("#np-body [data-p]").forEach(function (el) {
      var p = el.dataset.p;
      if (p === "booking_online") { o.booking_online = el.checked; return; }
      if (p === "mk_mode") { if (el.checked) o.mkMode = el.value; return; }
      if (p === "pkg_on") { o.pkgOn = el.checked; return; }
      if (p.indexOf("open.") === 0) { o.openCountries = o.openCountries || []; if (el.checked) o.openCountries.push(p.slice(5)); return; }
      if (el.value === "") return;
      var n = parseFloat(el.value); if (!isFinite(n) || n < 0) return;
      if (p === "markup_pct") { o.markup = n / 100; return; }
      if (p === "mk_all") { o.mkAll = n / 100; return; }
      if (p === "pkg_pct") { o.pkgPct = n / 100; return; }
      if (p === "single_pct") { o.singleSupplement = n / 100; return; }
      if (p.indexOf("mk.") === 0) { o.markups = o.markups || {}; o.markups[p.slice(3)] = n / 100; return; }
      var parts = p.split("."), cur = o;
      for (var i = 0; i < parts.length - 1; i++) { cur[parts[i]] = cur[parts[i]] || {}; cur = cur[parts[i]]; }
      cur[parts[parts.length - 1]] = n;
    });
    o.entryCustom = $$("#np-body .np-ecb").reduce(function (acc, tb) {
      $$(".np-ec", tb).forEach(function (tr) {
        var n = tr.querySelector(".np-ecn").value.trim(), f = function (c) { var x = parseFloat(tr.querySelector(c).value); return isFinite(x) && x >= 0 ? x : null; };
        if (n) acc.push({ r: tb.dataset.reg, n: n.slice(0, 80), a: f(".np-eca"), c: f(".np-ecc"), p: f(".np-ecp") });
      });
      return acc;
    }, []);
    if (o.markup === undefined) o.markup = DEF.markup;
    if (o.guide.rate) {   // per-language day prices → base (English) + difference, which the price engine uses
      var base = o.guide.rate.en !== undefined ? o.guide.rate.en : (o.guide.rate.ru !== undefined ? o.guide.rate.ru : DEF.guide.day);
      o.guide.day = base; o.guide.languages = {};
      Object.keys(o.guide.rate).forEach(function (k) { o.guide.languages[k] = Math.round((o.guide.rate[k] - base) * 100) / 100; });
    }
    return o;
  }

  // Selling prices for the website: every amount × (1 + margin); the margin itself is not published
  function toPublic(c) {
    var k = 1 + (c.markup || 0), r = function (x) { return Math.round(x * k * 100) / 100; };
    var mapVals = function (obj, cat) { var kk = 1 + (cat ? pkgMk(c, cat) : pkgBase(c)), out = {}; Object.keys(obj || {}).forEach(function (key) { var x = obj[key]; out[key] = typeof x === "object" ? mapVals(x, cat) : Math.round(x * kk * 100) / 100; }); return out; };
    var fx = c.fixed || {}, rc = function (x, cat) { return x === undefined ? undefined : Math.round(x * (1 + pkgMk(c, cat)) * 100) / 100; };
    var fixedPub = {}; Object.keys(fx).forEach(function (key) { fixedPub[key] = rc(fx[key], key === "train" || key === "flight" ? "train" : key === "welcomeDinner" ? "dinner" : "entries"); });
    // hotels/transport/guide defaults from catalog must carry their margin too, so publish full lists
    var hcPub = {}; Object.keys(DEF.hotelClasses).forEach(function (id) { var x = (c.hotelClasses || {})[id]; hcPub[id] = rc(x !== undefined ? x : DEF.hotelClasses[id], "hotel"); });
    var trPub = {}; Object.keys(DEF.transport).forEach(function (id) { var x = (c.transport || {})[id]; trPub[id] = rc(x !== undefined ? x : DEF.transport[id], "transport"); });
    var gDay = c.guide && c.guide.day !== undefined ? c.guide.day : DEF.guide.day, gLang = Object.assign({}, DEF.guide.languages, (c.guide || {}).languages || {});
    var fxAll = Object.assign({}, DEF.fixed, fx); Object.keys(fxAll).forEach(function (key) { if (fixedPub[key] === undefined) fixedPub[key] = rc(fxAll[key], key === "train" || key === "flight" ? "train" : key === "welcomeDinner" ? "dinner" : "entries"); });
    return {
      markup: 0, singleSupplement: c.singleSupplement, roundTo: c.roundTo, defaultPax: c.defaultPax, booking_online: !!c.booking_online, openCountries: c.openCountries || DEF.openCountries,
      hotelClasses: hcPub, hotelCity: mapVals(c.hotelCity, "hotel"), transport: trPub,
      guide: { day: rc(gDay, "guide"), languages: mapVals(gLang, "guide") },
      fixed: fixedPub, legPrice: mapVals(c.legPrice, "train"), sightPrice: mapVals(c.sightPrice, "entries"), tourExtra: mapVals(c.tourExtra, "extra"),
      // manual tour prices: only the selling price is published (brutto, or netto + margin)
      tourPrice: pubTour(c), tourComm: c.tourComm || {},
      // services: only the selling price; netto and commission stay in the admin copy
      svcPrice: pubSvc(c)
    };
    function pubTour(c) {
      var out = {};
      Object.keys(c.tourPrice || {}).forEach(function (tid) {
        var x = c.tourPrice[tid] || {}, b = x.brutto > 0 ? x.brutto : (x.netto > 0 ? Math.ceil(x.netto * k) : 0);
        if (b > 0) out[tid] = { brutto: b };
      });
      return out;
    }
    function pubSvc(c) {
      var out = {};
      Object.keys(c.svcPrice || {}).forEach(function (id) {
        var x = c.svcPrice[id] || {}, b = x.brutto > 0 ? x.brutto : (x.netto > 0 ? Math.ceil(x.netto * (1 + svcMk(c, SVC_CAT[id] || "extra"))) : 0);
        if (b > 0) out[id] = { brutto: b };
      });
      // guide service: if no separate price is set in section 8, use the cheapest guide day price (+ margin) — "from $…"
      if (!out.guide && c.guide && c.guide.rate) {
        var rates = Object.keys(c.guide.rate).map(function (l) { return c.guide.rate[l]; }).filter(function (x) { return x > 0; });
        if (rates.length) out.guide = { brutto: Math.ceil(Math.min.apply(null, rates) * (1 + svcMk(c, "guide"))) };
      }
      return out;
    }
  }

  function recalc() {
    var c = collect();
    E.applyPrices(c);
    C.markup = pkgBase(c); C.markups = {}; ALLCAT.forEach(function (k) { C.markups[k] = pkgMk(c, k); });
    var one = c.mkMode === "one"; $$("[data-mkgrid]").forEach(function (g) { g.classList.toggle("np-dim", one); });
    $$("[data-p=mk_all]").forEach(function (i) { i.disabled = !one; }); $$("[data-p=pkg_pct]").forEach(function (i) { i.disabled = !c.pkgOn; });
    $$("[data-res]").forEach(function (el) {
      var T = TOURS[el.dataset.res], pax = C.defaultPax || 2;
      var rows = CLS.map(function (cls) {
        var p = E.price(T, { pax: pax, hotel: cls });
        var net = p.cost, gross = p.pp, profit = gross - net;
        return '<tr' + (cls === T.hotel ? ' class="np-main"' : '') + '><td>' + CLS_NAME[cls] + (cls === T.hotel ? ' <small>(saytda "…dan")</small>' : '') + (p.manual ? ' <small class="np-man">qo\'lda</small>' : '') + '</td><td>' + money(p.parts.hotel) + '</td><td>' + money(p.parts.transport) + '</td><td>' + money(p.parts.guide) +
          '</td><td>' + money(p.parts.train + p.parts.dinner) + '</td><td>' + money(p.parts.entries) + '</td><td>' + money(p.parts.extra) + '</td><td><b>' + money(net) + '</b></td><td><b class="np-gross">' + money(gross) + '</b></td><td class="' + (profit >= 0 ? "np-pos" : "np-neg") + '">' + money(profit) + ' <small>(' + (gross ? Math.round(profit / gross * 100) : 0) + '%)</small></td></tr>';
      });
      var pm = E.price(T, { pax: pax, hotel: T.hotel, _raw: true }), gpz = pm.grossParts || {}, PN = { hotel: "mehmonxona", transport: "transport", guide: "gid", train: "chiptalar", entries: "kirish", dinner: "ovqat", extra: "qo'shimcha" };
      var prof = Object.keys(PN).map(function (k) { var net = k === "train" ? pm.parts.train : pm.parts[k], g = gpz[k] || 0; return g - net > 0.004 ? PN[k] + " " + money(g - net) : ""; }).filter(Boolean).join(" · ");
      var foot = '<p class="np-note" style="margin:4px 0 0">Foyda (1 kishi, avtomatik narx) qayerdan: ' + (prof || "—") + '</p>';
      el.innerHTML = foot + '<table class="tbl np-tbl np-res-tbl"><thead><tr><th>' + pax + ' kishi, 1 kishi uchun</th><th>Mehmonxona</th><th>Transport</th><th>Gid</th><th>Poyezd/avia, ovqat</th><th>Kirish</th><th>Qo\'shimcha</th><th>Netto</th><th>Brutto (saytda)</th><th>Foyda</th></tr></thead><tbody>' + rows.join("") + '</tbody></table>';
    });
    $$("[data-svcres]").forEach(function (el) {
      var id = el.dataset.svcres, cat = SVC_CAT[id] || "extra", pct = svcMk(c, cat), x = (c.svcPrice || {})[id] || {}, b = x.brutto > 0 ? x.brutto : (x.netto > 0 ? Math.ceil(x.netto * (1 + pct)) : 0);
      el.innerHTML = b && x.netto ? '<span class="' + (b - x.netto >= 0 ? "np-pos" : "np-neg") + '">' + money(b - x.netto) + '</span>' + (x.brutto > 0 ? ' <small>(qo\'lda brutto)</small>' : ' <small>(brutto = netto + ' + Math.round(pct * 1000) / 10 + '%: ' + money(b) + ')</small>') : "—";
    });
    $("#np-state").textContent = "O'zgarishlar saqlanmagan";
    $("#np-state").className = "np-state is-dirty";
  }

  A._toPublic = function (c) { return toPublic(c); };
  A.prices = async function () {
    A.show("prices");
    $("#np-body").innerHTML = '<p class="p-sub">Yuklanmoqda…</p>';
    var r = await sb.from("price_config").select("id,data,updated_at");
    if (r.error) { $("#np-body").innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '<br>Bazada price_config jadvali yo\'qmi? supabase/prices.sql ni ishga tushiring.</div>'; return; }
    var costs = (r.data || []).filter(function (x) { return x.id === "costs"; })[0];
    saved = costs ? costs.data : null; savedAt = costs ? costs.updated_at : null;
    render(saved);
    $("#np-state").textContent = savedAt ? "Oxirgi saqlangan: " + new Date(savedAt).toLocaleString("ru-RU") : "Hali saqlanmagan — saytda namuna narxlar turibdi";
    $("#np-state").className = "np-state";
  };

  document.addEventListener("click", function (e) {
    var add = e.target.closest && e.target.closest(".np-ecadd");
    if (add) { var tb = document.querySelector('.np-ecb[data-reg="' + add.dataset.reg + '"]'); tb.insertAdjacentHTML("beforeend", '<tr class="np-ec"><td><input class="np-in np-ecn" type="text" maxlength="80" placeholder="Obida nomi"></td><td><input class="np-in np-eca" type="number" min="0" step="any"></td><td><input class="np-in np-ecc" type="number" min="0" step="any"></td><td><input class="np-in np-ecp" type="number" min="0" step="any"></td><td><button type="button" class="btn btn--outline btn--sm np-ecdel">✕</button></td></tr>'); tb.lastElementChild.querySelector("input").focus(); return; }
    var del = e.target.closest && e.target.closest(".np-ecdel");
    if (del) del.closest("tr").remove();
  });
  document.addEventListener("click", async function (e) {
    if (e.target.id === "np-reset") { e.preventDefault(); render(saved); $("#np-state").textContent = "Saqlangan holatga qaytarildi"; return; }
    if (e.target.id !== "np-save") return;
    e.preventDefault();
    var b = e.target, c = collect();
    if (c.markup > 2) { P.msg("#np-msg", "Ustama juda katta (" + Math.round(c.markup * 100) + "%). Tekshiring.", "err"); return; }
    b.disabled = true; b.textContent = "Saqlanmoqda…";
    var pub = toPublic(c);
    var r = await sb.from("price_config").upsert([{ id: "costs", data: c }, { id: "public", data: pub }]);
    b.disabled = false; b.textContent = "Saqlash va saytga chiqarish";
    if (r.error) { P.msg("#np-msg", r.error.message, "err"); return; }
    saved = c; savedAt = new Date().toISOString();
    try { localStorage.removeItem("mn_prices_v1"); } catch (x) {}
    P.msg("#np-msg", "Saqlandi. Saytdagi narxlar yangilandi (mijozlarda sahifa yangilanganda).", "ok");
    $("#np-state").textContent = "Oxirgi saqlangan: " + new Date().toLocaleString("ru-RU");
    $("#np-state").className = "np-state";
  });
})();
