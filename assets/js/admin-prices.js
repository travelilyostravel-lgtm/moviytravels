/* Moviy Nomad — admin: price control ("Narxlar").
 * Admins enter real COSTS + margin. On save two rows are written to price_config:
 *   costs  — what was entered (admins only)
 *   public — ready selling prices (every amount × (1 + margin), margin 0) that the website reads.
 * Visitors never see costs or the margin. Every save keeps the previous version (price_config_log). */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  var E = window.MN_ENGINE, C = window.MN_CATALOG, TOURS = window.MN_TOURS || {};
  if (!sb || !E) return;

  var COUNTRY = { UZ: "O'zbekiston", KZ: "Qozog'iston", KG: "Qirg'iziston", TJ: "Tojikiston" };
  var ORDER = ["UZ", "KZ", "KG", "TJ"];
  var CLS = C.hotelClasses.map(function (h) { return h.id; });
  var CLS_NAME = { comfort: "Komfort 3★", superior: "Superior 4★", boutique: "Butik" };
  var TR_NAME = { sedan: "Sedan", minivan: "Miniven", premium: "Premium miniven", minibus: "Mikroavtobus", bus: "Avtobus" };
  var LANG_NAME = { en: "Ingliz", ru: "Rus", tr: "Turk", ar: "Arab", de: "Nemis", zh: "Xitoy", ko: "Koreys", hi: "Hind", sv: "Shved" };
  var MODE = { train: "🚆 poyezd", flight: "✈️ avia", car: "🚗 mashina", border: "🛂 chegara" };

  // Defaults taken from catalog.js before anything is applied
  var DEF = {
    markup: C.markup, singleSupplement: C.singleSupplement, roundTo: C.roundTo || 5, defaultPax: C.defaultPax,
    hotelClasses: {}, transport: {}, guide: { day: C.guide.day, languages: JSON.parse(JSON.stringify(C.guide.languages)) },
    fixed: { train: C.fixed.train, flight: C.fixed.flight, entryPerDay: C.fixed.entryPerDay, entryDefault: 5, welcomeDinner: C.fixed.welcomeDinner }
  };
  C.hotelClasses.forEach(function (h) { DEF.hotelClasses[h.id] = h.room; });
  C.transport.forEach(function (x) { DEF.transport[x.id] = x.day; });

  // What the tours use, grouped by country
  var used = {};  // country -> {cities:{}, legs:{}, sights:{}, tours:[]}
  Object.keys(TOURS).forEach(function (id) {
    var T = TOURS[id], g = used[T.country] = used[T.country] || { cities: {}, legs: {}, sights: {}, tours: [] };
    g.tours.push(id);
    T.days.forEach(function (d) {
      if (d.sleep) g.cities[d.sleep] = 1;
      (d.move || []).forEach(function (m) { g.legs[m[0] + ">" + m[1]] = m; });
      (d.stops || []).forEach(function (st) { if (st.id) g.sights[st.id] = st.city || d.sleep; });
    });
  });
  function cname(id) { return (C.cities[id] || {}).name || id; }
  function sname(id) { var x = (E.L.sights || {})[id]; return x ? x[0] : id; }
  function money(v) { return "$" + (Math.round(v * 100) / 100).toLocaleString("en", { maximumFractionDigits: 2 }); }

  var saved = null, savedAt = null;

  function inp(path, val, ph, extra) {
    return '<input class="np-in" type="number" min="0" step="any" data-p="' + path + '" value="' + (val === undefined || val === null || val === "" ? "" : esc(val)) + '" placeholder="' + esc(ph === undefined ? "" : ph) + '"' + (extra || "") + '>';
  }
  function get(o, path) { return path.split(".").reduce(function (a, k) { return a && a[k] !== undefined ? a[k] : undefined; }, o); }

  function render(cfg) {
    var box = $("#np-body");
    var c = cfg || {};
    var v = function (path, def) { var x = get(c, path); return x === undefined ? def : x; };
    var h = '';
    // 1. General
    h += '<details open class="np-sec"><summary>1. Umumiy sozlamalar</summary><div class="np-grid">' +
      '<label>Ustama (foyda), %' + inp("markup_pct", Math.round(v("markup", DEF.markup) * 1000) / 10, "", "") + '<small>Barcha xarajatlar ustiga qo\'shiladi. Mijoz narxi = xarajat × (1 + ustama).</small></label>' +
      '<label>Single xona qo\'shimchasi, %' + inp("single_pct", Math.round(v("singleSupplement", DEF.singleSupplement) * 100), "") + '<small>1 kishilik xona uchun mehmonxona narxiga qo\'shimcha.</small></label>' +
      '<label>Narxni yaxlitlash, $' + inp("roundTo", v("roundTo", DEF.roundTo), "5") + '<small>1 kishi narxi shu songa karrali qilib yuqoriga yaxlitlanadi.</small></label>' +
      '<label>"…dan" narx necha kishi uchun' + inp("defaultPax", v("defaultPax", DEF.defaultPax), "2") + '<small>Bosh sahifadagi kartochkalar narxi.</small></label>' +
      '<label class="np-check"><input type="checkbox" data-p="booking_online"' + (c.booking_online ? " checked" : "") + '> Onlayn bron va to\'lov yoqilgan<small>O\'chiq bo\'lsa saytda "Tez orada" ko\'rinadi, mijoz faqat so\'rov qoldiradi.</small></label>' +
      '</div></details>';
    // 2. Hotels
    h += '<details open class="np-sec"><summary>2. Mehmonxonalar — xona narxi bir kechaga (2 kishilik xona), $</summary>' +
      '<p class="np-note">Shahar bo\'yicha bo\'sh qoldirilsa, "Standart" narx olinadi. Mijozdan 1 kishi uchun xona narxining yarmi olinadi.</p>' +
      '<table class="tbl np-tbl"><thead><tr><th>Shahar</th>' + CLS.map(function (k) { return '<th>' + CLS_NAME[k] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      '<tr class="np-def"><td><b>Standart (boshqa shaharlar)</b></td>' + CLS.map(function (k) { return '<td>' + inp("hotelClasses." + k, v("hotelClasses." + k, DEF.hotelClasses[k])) + '</td>'; }).join("") + '</tr>';
    ORDER.forEach(function (cc) {
      if (!used[cc]) return;
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
    // 4. Guide
    h += '<details open class="np-sec"><summary>4. Gid — bir kunga, $</summary><div class="np-grid">' +
      '<label>Gid (ingliz / rus tili)' + inp("guide.day", v("guide.day", DEF.guide.day)) + '</label>' +
      Object.keys(DEF.guide.languages).filter(function (k) { return k !== "en" && k !== "ru"; }).map(function (k) {
        return '<label>+ ' + (LANG_NAME[k] || k) + ' tili qo\'shimchasi' + inp("guide.languages." + k, v("guide.languages." + k, DEF.guide.languages[k])) + '</label>';
      }).join("") + '</div><p class="np-note">Gid kunlari = tur kunlari − 1. Guruhdagi odamlarga bo\'linadi.</p></details>';
    // 5. Train / flight tickets per route
    h += '<details open class="np-sec"><summary>5. Poyezd, avia va transfer chiptalari — 1 kishi uchun, $</summary><div class="np-grid">' +
      '<label>Poyezd (standart)' + inp("fixed.train", v("fixed.train", DEF.fixed.train)) + '</label>' +
      '<label>Ichki reys (standart)' + inp("fixed.flight", v("fixed.flight", DEF.fixed.flight)) + '</label></div>' +
      '<p class="np-note">Yo\'nalish bo\'yicha bo\'sh qoldirilsa standart narx olinadi (mashina yo\'llari uchun 0 — transport narxida bor).</p><table class="tbl np-tbl"><thead><tr><th>Yo\'nalish</th><th>Turi</th><th>1 kishi, $</th></tr></thead><tbody>';
    ORDER.forEach(function (cc) {
      if (!used[cc]) return;
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
      '<table class="tbl np-tbl"><thead><tr><th>Obida</th><th>Shahar</th><th>1 kishi, $</th></tr></thead><tbody>';
    ORDER.forEach(function (cc) {
      if (!used[cc]) return;
      h += '<tr class="np-grp"><td colspan="3">' + COUNTRY[cc] + '</td></tr>';
      Object.keys(used[cc].sights).forEach(function (sid) {
        h += '<tr><td>' + esc(sname(sid)) + '</td><td>' + esc(cname(used[cc].sights[sid])) + '</td><td>' + inp("sightPrice." + sid, v("sightPrice." + sid, ""), "standart") + '</td></tr>';
      });
    });
    h += '</tbody></table><p class="np-note">Bepul joylar (bozor, ko\'cha, tabiat) uchun 0 yozing.</p></details>';
    // 7. Tours
    h += '<details open class="np-sec"><summary>7. Turlar — qo\'shimcha xarajat va natija (netto / brutto / foyda)</summary>' +
      '<p class="np-note">Qo\'shimcha xarajat: masalan, master-klass, qayiq, maxsus kechki ovqat. "1 kishiga" — har bir mijozga; "guruhga" — butun guruhga bir marta (odamlarga bo\'linadi).</p>';
    ORDER.forEach(function (cc) {
      if (!used[cc]) return;
      h += '<details class="np-country"' + (cc === "UZ" ? " open" : "") + '><summary>' + COUNTRY[cc] + ' (' + used[cc].tours.length + ' ta tur)</summary>';
      used[cc].tours.forEach(function (tid) {
        var T = TOURS[tid];
        h += '<div class="np-tour" data-tour="' + tid + '"><div class="np-tour__h"><b>' + esc(T.title) + '</b><small>' + T.days.length + ' kun · ' + T.days.filter(function (d) { return d.sleep; }).length + ' kecha</small></div>' +
          '<div class="np-grid np-grid--s"><label>Qo\'shimcha, 1 kishiga $' + inp("tourExtra." + tid + ".pp", v("tourExtra." + tid + ".pp", ""), "0") + '</label>' +
          '<label>Qo\'shimcha, guruhga $' + inp("tourExtra." + tid + ".group", v("tourExtra." + tid + ".group", ""), "0") + '</label></div>' +
          '<div class="np-res" data-res="' + tid + '"></div></div>';
      });
      h += '</details>';
    });
    h += '</details>';
    box.innerHTML = h;
    $$(".np-in, [data-p=booking_online]", box).forEach(function (el) { el.addEventListener("input", recalc); el.addEventListener("change", recalc); });
    recalc();
  }

  // Read the form into a costs object (only filled values)
  function collect() {
    var o = { hotelClasses: {}, hotelCity: {}, transport: {}, guide: { languages: {} }, fixed: {}, legPrice: {}, sightPrice: {}, tourExtra: {} };
    $$("#np-body [data-p]").forEach(function (el) {
      var p = el.dataset.p;
      if (p === "booking_online") { o.booking_online = el.checked; return; }
      if (el.value === "") return;
      var n = parseFloat(el.value); if (!isFinite(n) || n < 0) return;
      if (p === "markup_pct") { o.markup = n / 100; return; }
      if (p === "single_pct") { o.singleSupplement = n / 100; return; }
      var parts = p.split("."), cur = o;
      for (var i = 0; i < parts.length - 1; i++) { cur[parts[i]] = cur[parts[i]] || {}; cur = cur[parts[i]]; }
      cur[parts[parts.length - 1]] = n;
    });
    if (o.markup === undefined) o.markup = DEF.markup;
    return o;
  }

  // Selling prices for the website: every amount × (1 + margin); the margin itself is not published
  function toPublic(c) {
    var k = 1 + (c.markup || 0), r = function (x) { return Math.round(x * k * 100) / 100; };
    var mapVals = function (obj) { var out = {}; Object.keys(obj || {}).forEach(function (key) { var x = obj[key]; out[key] = typeof x === "object" ? mapVals(x) : r(x); }); return out; };
    return {
      markup: 0, singleSupplement: c.singleSupplement, roundTo: c.roundTo, defaultPax: c.defaultPax, booking_online: !!c.booking_online,
      hotelClasses: mapVals(c.hotelClasses), hotelCity: mapVals(c.hotelCity), transport: mapVals(c.transport),
      guide: { day: c.guide.day !== undefined ? r(c.guide.day) : undefined, languages: mapVals(c.guide.languages) },
      fixed: mapVals(c.fixed), legPrice: mapVals(c.legPrice), sightPrice: mapVals(c.sightPrice), tourExtra: mapVals(c.tourExtra)
    };
  }

  function recalc() {
    var c = collect();
    E.applyPrices(c);
    C.markup = c.markup;
    $$("[data-res]").forEach(function (el) {
      var T = TOURS[el.dataset.res], pax = C.defaultPax || 2;
      var rows = CLS.map(function (cls) {
        var p = E.price(T, { pax: pax, hotel: cls });
        var net = p.cost, gross = p.pp, profit = gross - net;
        return '<tr' + (cls === T.hotel ? ' class="np-main"' : '') + '><td>' + CLS_NAME[cls] + (cls === T.hotel ? ' <small>(saytda "…dan")</small>' : '') + '</td><td>' + money(p.parts.hotel) + '</td><td>' + money(p.parts.transport) + '</td><td>' + money(p.parts.guide) +
          '</td><td>' + money(p.parts.train + p.parts.dinner) + '</td><td>' + money(p.parts.entries) + '</td><td>' + money(p.parts.extra) + '</td><td><b>' + money(net) + '</b></td><td><b class="np-gross">' + money(gross) + '</b></td><td class="' + (profit >= 0 ? "np-pos" : "np-neg") + '">' + money(profit) + ' <small>(' + (gross ? Math.round(profit / gross * 100) : 0) + '%)</small></td></tr>';
      });
      el.innerHTML = '<table class="tbl np-tbl np-res-tbl"><thead><tr><th>' + pax + ' kishi, 1 kishi uchun</th><th>Mehmonxona</th><th>Transport</th><th>Gid</th><th>Poyezd/avia, ovqat</th><th>Kirish</th><th>Qo\'shimcha</th><th>Netto</th><th>Brutto (saytda)</th><th>Foyda</th></tr></thead><tbody>' + rows.join("") + '</tbody></table>';
    });
    $("#np-state").textContent = "O'zgarishlar saqlanmagan";
    $("#np-state").className = "np-state is-dirty";
  }

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
