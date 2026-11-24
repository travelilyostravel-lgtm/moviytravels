/* Moviy Nomad — admin: website requests (B2C bookings + service requests) and travellers' stories moderation. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var RS = { new: "Yangi", in_progress: "Ishlanmoqda", awaiting_payment: "30% kutilmoqda", deposit_paid: "30% to'landi, 70% kutilmoqda", paid: "100% to'landi", confirmed: "Tasdiqlandi", closed: "Yopildi", cancelled: "Bekor" };
  var SV = { airport: "Aeroportda haydovchi kutib oladi", airport_guide: "Aeroportda gid kutib oladi", transfer: "Transfer", car: "Haydovchili transport", hotel: "Mehmonxona", train: "Poyezd chiptasi", guide: "Gid", mice: "Guruh / MICE", esim: "eSIM", partner: "Gid / hamkorga so'rov" };
  var HC = { comfort: "Komfort 3★", superior: "Superior 4★", boutique: "Butik va tarixiy" };
  var PM = { bank: "Bank o'tkazmasi", card: "Karta havolasi", contact: "Avval bog'lanish" };
  var rFilter = "open", pFilter = "pending";
  function badge(s) { return '<span class="badge-s st-' + (s === "new" ? "request" : s === "closed" ? "cancelled" : s) + '">' + esc(RS[s] || s) + '</span>'; }
  function wa(phone) { var d = String(phone || "").replace(/\D/g, ""); return d ? "https://wa.me/" + d : "#"; }

  // ---------------------------------------------------------------- requests
  A.requests = async function () {
    A.show("requests");
    var F = [["open", "Ochiq"], ["new", "Yangi"], ["in_progress", "Ishlanmoqda"], ["awaiting_payment", "30% kutilmoqda"], ["deposit_paid", "70% kutilmoqda"], ["paid", "To'landi"], ["confirmed", "Tasdiqlandi"], ["all", "Hammasi"]];
    $("#rf").innerHTML = F.map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === rFilter ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("");
    $$("#rf button").forEach(function (b) { b.onclick = function () { rFilter = b.dataset.f; A.requests(); }; });
    var q = sb.from("site_requests").select("*").order("created_at", { ascending: false }).limit(300);
    if (rFilter === "open") q = q.not("status", "in", "(closed,cancelled,confirmed)"); else if (rFilter !== "all") q = q.eq("status", rFilter);
    var mh = $("#rm"); if (!mh) { mh = document.createElement("div"); mh.id = "rm"; mh.className = "filters"; $("#rf").after(mh); }
    if (A.mgrChips) await A.mgrChips(mh, A.requests);
    var isOwner = A.role === "admin";
    var r = await q, box = $("#rlist");
    if (!r.error && isOwner) r.data = r.data.filter(function (x) { return A.mgrPass(x.assigned_to); });
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (!r.data.length) { box.innerHTML = '<div class="empty">So\'rov yo\'q.</div>'; return; }
    box.innerHTML = '<table class="tbl"><thead><tr><th>Raqam</th><th>Turi</th><th>Mijoz</th><th>Sana</th><th>Kishi</th><th>To\'lov</th><th>Holat</th>' + (isOwner ? '<th>Menejer</th>' : '') + '</tr></thead><tbody>' +
      r.data.map(function (x) {
        var what = x.kind === "tour" ? "🧭 " + esc(x.tour_title || x.tour_id || "Tur") : x.kind === "group" ? "👥 Guruh: " + esc(x.tour_title || "") : "🛎 " + esc(SV[x.service] || x.service || "Xizmat");
        return '<tr class="click" data-id="' + x.id + '"><td><b>' + esc(x.ref) + '</b><br><small>' + P.date(x.created_at) + ' · ' + esc((x.lang || "").toUpperCase()) + '</small></td><td>' + what + '</td><td>' + esc(x.contact_name) + '<br><small>' + esc(x.phone || "") + (x.messenger && /telegram/.test(x.messenger) ? " · " + esc(x.messenger) : "") + (x.citizenship ? " · " + esc(x.citizenship) : "") + '</small></td><td>' + P.date(x.start_date) + '</td><td>' + (x.pax || "—") + '</td><td><small>' + (x.price_total ? P.money(x.paid_total || 0) + ' / ' + P.money(x.price_total) : esc(PM[x.pay_method] || "—")) + (x.balance_due && x.status === 'deposit_paid' ? '<br>70% muddati: ' + P.date(x.balance_due) : '') + '</small></td><td>' + badge(x.status) + '</td>' + (isOwner ? '<td><small>' + esc(A.staffName(x.assigned_to) || "— tayinlanmagan") + '</small></td>' : '') + '</tr>';
      }).join("") + '</tbody></table>';
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { openRequest(tr.dataset.id); }; });
  };

  A.openRequest = function (id) { return openRequest(id); };
  async function openRequest(id, lang) {
    A.show("request");
    var box = $("#v-request"); box.innerHTML = '<div class="p-card">…</div>';
    var r = await sb.from("site_requests").select("*").eq("id", id).single();
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    var x = r.data, d = x.details || {}, tr = x.travellers || [];
    if (lang) x._lang = lang;
    var rows = [["Raqam", x.ref], ["Yuborilgan", new Date(x.created_at).toLocaleString("ru-RU")], ["Til", (x.lang || "").toUpperCase()],
      ["Turi", x.kind === "tour" ? "Tur bron so'rovi" : x.kind === "group" ? (d.notify ? "Guruh turi: yangi sana chiqsa xabar berish" : "Guruh turiga joy so'rovi") : "Xizmat: " + (SV[x.service] || x.service)], ["Xona", {twin_share: "Ikki kishilik (sherik bilan)", twin: "Ikki kishilik (o'zlari)", single: "Bir kishilik"}[d.room]], ["Guruh", {small: "Kichik (12–17)", medium: "O'rta (30–35)", large: "Katta (45–50)"}[d.group_kind]],
      ["Qo'shimchalar", [d.extra_night ? "Toshkentda +1 kecha" : "", d.arrival_transfer ? "Individual kutib olish" : "", d.departure_transfer ? "Individual kuzatish" : ""].filter(Boolean).join(", ")],
      ["Saytdagi taxminiy jami", d.est_total ? "$" + d.est_total : ""], ["Tur", x.tour_title], ["Shahar / yo'nalish", d.city],
      ["Boshlanish", P.date(x.start_date)], ["Kishi soni", x.pax + (d.adults != null ? " (kattalar " + d.adults + ", bolalar " + (d.children || 0) + ")" : "")],
      ["Mehmonxona", HC[d.hotel] || d.hotel], ["Gid tili", d.guide_lang], ["To'lov usuli", PM[x.pay_method]],
      ["Hamkor (gid)", d.partner_name],
      ["Mijoz", x.contact_name], ["Telefon / WhatsApp", x.phone], ["Telegram", d.telegram], ["E-mail", x.email], ["Bog'lanish", x.messenger], ["Fuqarolik", x.citizenship], ["Izoh", x.message]];
    var h = '<p><a href="#" id="r-back">← So\'rovlar</a></p><div class="p-card"><h2>' + esc(x.ref) + ' ' + badge(x.status) + '</h2><table class="tbl">' +
      rows.filter(function (a) { return a[1] != null && a[1] !== "" && a[1] !== "—"; }).map(function (a) { return '<tr><th style="width:200px">' + esc(a[0]) + '</th><td style="white-space:pre-wrap">' + esc(a[1]) + '</td></tr>'; }).join("") + '</table>' +
      '<div class="p-actions">' + (x.phone ? '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="' + wa(x.phone) + '">WhatsApp\'da yozish</a>' : '') +
      (d.telegram ? '<a class="btn btn--gold btn--sm" target="_blank" rel="noopener" href="' + (/^@/.test(d.telegram) || !/^\+?[\d\s-]+$/.test(d.telegram) ? "https://t.me/" + d.telegram.replace(/^@/, "") : "https://t.me/+" + d.telegram.replace(/\D/g, "")) + '">✈ Telegram</a>' : '') + (x.email ? '<a class="btn btn--outline btn--sm" href="mailto:' + esc(x.email) + '">E-mail</a>' : '') + '</div></div>';
    if (tr.length) h += '<div class="p-card"><h3>Sayohatchilar (' + tr.length + ')</h3><table class="tbl"><thead><tr><th>#</th><th>Ism</th><th>Familiya</th><th>Jinsi</th><th>Tug\'ilgan</th></tr></thead><tbody>' +
      tr.map(function (t, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(t.first) + '</td><td>' + esc(t.last) + '</td><td>' + esc(t.gender) + '</td><td>' + esc(t.dob) + '</td></tr>'; }).join("") + '</tbody></table></div>';
    var mgSel = A.role === "admin" && A.mgrSelect ? await A.mgrSelect(x.assigned_to, "r-mgr") : "";
    h += '<div class="p-card"><h3>Holat va izoh</h3>' + (mgSel ? '<div class="fld" style="margin-bottom:12px"><label>Menejer (kimning mijozi)</label>' + mgSel + '</div>' : (A.role === "manager" ? '' : '')) + '<div class="fld"><label>Holat</label><select id="r-st">' + Object.keys(RS).map(function (k) { return '<option value="' + k + '"' + (k === x.status ? " selected" : "") + '>' + RS[k] + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld" style="margin-top:12px"><label>Ichki izoh (mijoz ko\'rmaydi)</label><textarea id="r-note">' + esc(x.admin_note || "") + '</textarea></div><div class="msg" id="m-r"></div>' +
      '<div class="p-actions"><button class="btn btn--gold btn--sm" id="r-save">Saqlash</button></div></div>';
    h += payCard(x);
    box.innerHTML = h;
    bindPay(x, id);
    $("#r-back").onclick = function (e) { e.preventDefault(); A.requests(); };
    if ($("#r-mgr")) $("#r-mgr").onchange = async function () { var u = await sb.from("site_requests").update({ assigned_to: this.value || null }).eq("id", id); P.msg("#m-r", u.error ? u.error.message : "Menejer o'zgartirildi", u.error ? "err" : "ok"); };
    $("#r-save").onclick = async function () {
      var u = await sb.from("site_requests").update({ status: $("#r-st").value, admin_note: $("#r-note").value.trim() || null, updated_at: new Date().toISOString() }).eq("id", id);
      if (u.error) return P.msg("#m-r", u.error.message, "err");
      P.msg("#m-r", "Saqlandi", "ok"); setTimeout(function () { openRequest(id); }, 500);
    };
  }


  // ---------------------------------------------------------------- payments (30% / 70%) and voucher
  function addDays(d, n) { var t = new Date(d + "T12:00:00"); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); }
  function workDays(from, n) { var t = new Date(from); while (n > 0) { t.setDate(t.getDate() + 1); var w = t.getDay(); if (w !== 0 && w !== 6) n--; } return t.toISOString().slice(0, 10); }
  function vurl(x) { return location.origin + location.pathname.replace(/admin\/.*$/, "") + "voucher.html?ref=" + encodeURIComponent(x.ref) + "&k=" + encodeURIComponent(x.voucher_key); }
  // ---- messages (templates in assets/js/msg-templates.js, 10 languages)
  var MTN = { confirm: "Bron tasdiqlandi — 30% to'lang", received: "To'lov qabul qilindi (+ hujjat)", reminder: "Eslatma: qolgan to'lov muddati yaqin", final: "Oxirgi eslatma (48 soat)", voucher: "Vaucherlar tayyor (to'liq to'langan)", cancel: "Bron bekor qilindi" };
  var SK = { meet: "Kutib olish", transfer: "Transfer / transport", train: "Poyezd", flight: "Avia", hotel: "Mehmonxona", guide: "Gid", excursion: "Ekskursiya / chipta", meal: "Ovqat", other: "Boshqa" };
  var TRAIN = { "bukhara-samarkand": 1, "samarkand-bukhara": 1, "samarkand-tashkent": 1, "tashkent-samarkand": 1, "bukhara-tashkent": 1, "tashkent-bukhara": 1 };
  function suggest(x) {
    var tot = +x.price_total || 0, paid = +x.paid_total || 0;
    if (x.status === "cancelled") return "cancel";
    if (tot && paid >= tot - 0.5) return "voucher";
    if (paid > 0) { var dd = x.balance_due ? (new Date(x.balance_due) - new Date()) / 864e5 : 99; return dd < 0 ? "final" : dd <= 10 ? "reminder" : "received"; }
    return "confirm";
  }
  function docLang(x) { return x._lang || (window.MN_MSG[x.lang] ? x.lang : "en"); }
  function vurlL(x, svc) { return vurl(x) + "&lang=" + docLang(x) + (svc ? "&doc=services" : ""); }
  function fillMsg(x, key) {
    var lang = docLang(x), T = window.MN_MSG[lang] || window.MN_MSG.en, t = T[key], C = window.MN_CO || {};
    var tot = +x.price_total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), left = Math.max(0, tot - paid);
    var m = function (n) { return P.money(n); };
    var leftTxt = left > 0 ? T.w.bal + ": " + m(left) + (x.balance_due ? " — " + T.w.by + " " + P.date(x.balance_due) : "") : T.w.full;
    var V = { ref: x.ref, name: x.contact_name || "", tour: x.tour_title || x.tour_id || "", date: x.start_date ? P.date(x.start_date) : "", pax: x.pax || "",
      total: m(tot), dep: m(dep), bal: m(tot - dep), due: x.balance_due ? P.date(x.balance_due) : (x.start_date ? P.date(addDays(x.start_date, -14)) : ""),
      paid: m(paid), last: x._lastPayTxt || m(paid), left: leftTxt, left_amt: m(left), doc: x.voucher_key ? vurlL(x) : "", svc: x.voucher_key ? vurlL(x, 1) : "",
      lic: C.license || "", phone: C.phone || "", terms: location.origin + location.pathname.replace(/admin\/.*$/, "") + (lang === "en" ? "" : lang + "/") + "terms.html",
      bank: (C.company || "") + "\nINN " + (C.inn || "") + " · " + (C.bank || "") + " · MFO " + (C.mfo || "") + "\nAccount (UZS): " + (C.account || "") };
    var f = function (s) { return s.replace(/\{(\w+)\}/g, function (_, k) { return V[k] == null ? "" : V[k]; }); };
    return { subj: f(t[0]), body: f(t[1]) };
  }
  function newKey() { var a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join(""); }
  var rateCache = {};
  async function cbuRate(cur, d) {
    var k = cur + d; if (rateCache[k]) return rateCache[k];
    try { var j = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/" + cur + "/" + d + "/").then(function (r) { return r.json(); }); var v = +(j[0] && j[0].Rate); if (v > 0) { rateCache[k] = v; return v; } } catch (e) {}
    return null;
  }
  function autoServices(x) {
    var T = (window.MN_TOURS || {})[x.tour_id]; if (!T || !x.start_date) return [];
    var d = x.details || {}, out = [], day = function (i) { return addDays(x.start_date, i); };
    var first = T.days[0].sleep || (T.days[0].stops[0] || {}).city;
    out.push({ kind: "meet", city: first, from: day(0), title: "", place: d.arrival_transfer ? "Airport / railway station → hotel" : "Hotel lobby", time: "", conf: "", contact: "", details: "" });
    var cur = null;
    T.days.forEach(function (dd, i) {
      (dd.move || []).forEach(function (mv) { out.push({ kind: TRAIN[mv[0] + "-" + mv[1]] && T.inc.indexOf("train") > -1 ? "train" : "transfer", city: mv[0], to_city: mv[1], from: day(i), title: "", place: "", time: "", conf: "", contact: "", details: "" }); });
      if (dd.sleep && (!cur || cur.city !== dd.sleep)) { cur = { kind: "hotel", city: dd.sleep, from: day(i), to: day(i + 1), title: "", place: "", time: "", conf: "", contact: "", details: (d.room ? "Room: " + d.room : "") }; out.push(cur); }
      else if (dd.sleep && cur) cur.to = day(i + 1);
      if (!dd.sleep) cur = null;
    });
    if (d.extra_night) { var lastH = out.filter(function (s) { return s.kind === "hotel"; }).pop(); if (lastH) lastH.to = addDays(lastH.to, 1); }
    var gcities = []; T.days.forEach(function (dd, i) { (dd.stops || []).forEach(function (st) { var g = gcities[gcities.length - 1]; if (g && g.city === st.city) g.to = day(i); else gcities.push({ kind: "guide", city: st.city, from: day(i), to: day(i), title: "", place: "", time: "", conf: "", contact: "", details: d.guide_lang || "English" }); }); });
    out = out.concat(gcities);
    if (d.departure_transfer) { var endc = T.days[T.days.length - 1].stops.length ? T.days[T.days.length - 1].stops[0].city : "tashkent"; out.push({ kind: "transfer", city: endc, to_city: "airport", from: day(T.days.length - 1 + (d.extra_night ? 1 : 0)), title: "Departure transfer", place: "Hotel → airport", time: "", conf: "", contact: "", details: "" }); }
    return out.sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
  }
  function svcTable(list) {
    var inp = function (i, f, v, w, t) { return '<input data-i="' + i + '" data-f="' + f + '" value="' + esc(v || "") + '" style="width:' + w + 'px"' + (t ? ' type="' + t + '"' : '') + '>'; };
    return '<div style="overflow:auto"><table class="tbl" id="svc-t"><thead><tr><th>Xizmat</th><th>Nomi (mehmonxona, gid ismi…)</th><th>Shahar</th><th>Sana</th><th>Gacha</th><th>Vaqt / joy</th><th>Tasdiq №</th><th>Aloqa (tel)</th><th>Izoh</th><th></th></tr></thead><tbody>' +
      list.map(function (s, i) { return '<tr><td><select data-i="' + i + '" data-f="kind">' + Object.keys(SK).map(function (k) { return '<option value="' + k + '"' + (s.kind === k ? " selected" : "") + '>' + SK[k] + '</option>'; }).join("") + '</select></td>' +
        '<td>' + inp(i, "title", s.title, 170) + '</td><td>' + inp(i, "city", s.city, 90) + (s.to_city ? ' → ' + esc(s.to_city) : '') + '</td><td>' + inp(i, "from", s.from, 125, "date") + '</td><td>' + inp(i, "to", s.to, 125, "date") + '</td>' +
        '<td>' + inp(i, "time", s.time, 55) + ' ' + inp(i, "place", s.place, 130) + '</td><td>' + inp(i, "conf", s.conf, 80) + '</td><td>' + inp(i, "contact", s.contact, 110) + '</td><td>' + inp(i, "details", s.details, 120) + '</td>' +
        '<td><button class="btn btn--outline btn--sm" data-del="' + i + '">✕</button></td></tr>'; }).join("") + '</tbody></table></div>';
  }

  function payCard(x) {
    var tot = +x.price_total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), left = Math.max(0, tot - paid), due = x.balance_due || (x.start_date ? addDays(x.start_date, -14) : "");
    var est = (x.details && x.details.est_total) || "", full = tot && paid >= tot - 0.5, lang = docLang(x);
    var step = function (n, on, head, txt) { return '<div style="display:flex;gap:12px;margin:16px 0;opacity:' + (on ? 1 : .45) + '"><b style="flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:' + (on ? "var(--gold)" : "#ddd") + '">' + n + '</b><div style="flex:1;min-width:0"><b>' + head + '</b><div style="margin-top:6px">' + txt + '</div></div></div>'; };
    var h = '<div class="p-card" id="pay-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h3 style="margin:0">To\'lov, hujjatlar va xabarlar</h3>' +
      '<label style="display:flex;gap:6px;align-items:center"><b>Hujjat va xabar tili:</b> <select id="p-lang">' + Object.keys(window.MN_LANGS).map(function (k) { return '<option value="' + k + '"' + (k === lang ? " selected" : "") + '>' + window.MN_LANGS[k] + '</option>'; }).join("") + '</select></label></div>';
    h += step(1, true, "Tur narxi (USD)", '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="number" min="0" step="1" id="p-total" style="width:140px" value="' + (tot || est) + '"> <button class="btn btn--gold btn--sm" id="p-save-total">Saqlash</button>' +
      (tot ? '<small>30% = <b>' + P.money(dep) + '</b> (3 ish kunida) · 70% = <b>' + P.money(tot - dep) + '</b>' + (due ? ' (' + P.date(due) + ' gacha)' : '') + '</small>' : '') + '</div>');
    var nextAmt = paid < dep ? dep - paid : left;
    h += step(2, !!tot, "To'lov tushdi — summani yozing", tot ? (
      '<div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap"><div class="fld"><label>Valyuta</label><select id="p-cur"><option value="UZS">so\'m (UZS)</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>' +
      '<div class="fld"><label>Tushgan summa</label><input type="number" step="1" id="p-amt" style="width:150px"></div>' +
      '<div class="fld"><label>MB kursi (1 USD/EUR = so\'m)</label><input type="number" step="0.01" id="p-rate" style="width:120px"></div>' +
      '<div class="fld"><label>Sana</label><input type="date" id="p-date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
      '<div class="fld"><label>Usul</label><select id="p-m"><option value="bank">Bank o\'tkazmasi</option><option value="card">Karta (Visa/Mastercard)</option><option value="cash">Naqd</option><option value="other">Boshqa</option></select></div>' +
      '<button class="btn btn--green btn--sm" id="p-add">✓ To\'lovni tasdiqlash</button></div><small class="p-sub" id="p-conv">Keyingi to\'lov: ' + P.money(nextAmt) + '</small>' +
      '<p style="margin:8px 0 0">To\'langan: <b>' + P.money(paid) + '</b> / ' + P.money(tot) + (left > 0 ? ' · qoldiq: <b style="color:#c8553d">' + P.money(left) + '</b>' : ' · <b style="color:#2e7d32">to\'liq to\'langan ✓</b>') + '</p><div id="p-list"></div>') : "Avval narxni saqlang");
    if (x.kind === "group") h += '<div class="msg ' + (x.seats_held ? 'msg--ok' : 'msg--info') + '" style="margin:6px 0">' + (x.seats_held ? '✅ Guruh jadvalida <b>' + x.seats_held + ' ta joy</b> shu mijoz uchun band qilindi.' : 'Guruh joylari 30% to\'lov tasdiqlanganda jadvaldan o\'zi band qilinadi (bekor qilinsa qaytadi).') + '</div>';
    h += step(3, !!x.voucher_key, "Umumiy hujjat (bron tasdig'i → to'liq to'langach sayohat vaucheri)", x.voucher_key ?
      '<a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' + esc(vurlL(x)) + '">Ko\'rish / PDF</a> <button class="btn btn--outline btn--sm" data-copy="0">Havolani nusxalash</button> <small>(' + window.MN_LANGS[lang] + ')</small>' :
      'Birinchi to\'lov tasdiqlanishi bilan o\'zi tayyorlanadi: Moviy Travel rekvizitlari, mijoz ma\'lumotlari, tur, to\'lovlar.');
    var sv = x.services || [];
    h += step(4, full, "Har bir xizmatga alohida vaucher (100% to'langach)", (full ? '' : '<small class="p-sub">Xizmatlarni hozirdan kiritib qo\'yish mumkin; vaucherlar 100% to\'langach ochiladi.</small><br>') +
      '<div class="p-actions" style="margin:6px 0"><button class="btn btn--outline btn--sm" id="svc-auto">⚡ Dasturdan avtomatik to\'ldirish</button><button class="btn btn--outline btn--sm" id="svc-add">+ Xizmat</button><button class="btn btn--gold btn--sm" id="svc-save">Xizmatlarni saqlash</button>' +
      (full && x.voucher_key && sv.length ? '<a class="btn btn--green btn--sm" target="_blank" rel="noopener" href="' + esc(vurlL(x, 1)) + '">Xizmat vaucherlari (' + sv.length + ') — ko\'rish / PDF</a> <button class="btn btn--outline btn--sm" data-copy="1">Havolani nusxalash</button>' : '') + '</div>' +
      '<div id="svc-box">' + (sv.length ? svcTable(sv) : '<p class="p-sub">Hali xizmat yo\'q. "Dasturdan avtomatik to\'ldirish"ni bosing — kutib olish, transferlar, poyezd, mehmonxonalar va gidlar sanalari bilan o\'zi yoziladi; keyin mehmonxona nomi, tasdiq raqami, haydovchi/gid telefonini kiritasiz.</p>') + '</div>');
    var sug = suggest(x);
    h += step(5, true, "Mijozga xabar yuborish", '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select id="p-tpl">' + Object.keys(MTN).map(function (k) { return '<option value="' + k + '"' + (k === sug ? " selected" : "") + '>' + MTN[k] + '</option>'; }).join("") + '</select>' +
      '<button class="btn btn--gold btn--sm" id="p-mail"' + (x.email ? "" : " disabled") + '>✉ E-mailga yuborish</button>' +
      '<button class="btn btn--wa btn--sm" id="p-wa"' + (x.phone ? "" : " disabled") + '>WhatsApp\'ga yuborish</button></div>' +
      '<small class="p-sub">E-mail: ' + esc(x.email || "— yo'q") + ' · WhatsApp: ' + esc(x.phone || "— yo'q") + '</small>' +
      '<div class="fld" style="margin-top:8px"><label>Mavzu</label><input id="p-subj"></div><div class="fld"><label>Matn (kerak bo\'lsa tahrirlang)</label><textarea id="p-body" rows="9"></textarea></div>' +
      ((x.messages || []).length ? '<p class="p-sub" style="margin-top:6px">Yuborilganlar: ' + x.messages.slice(-6).map(function (m) { return P.date(m.at) + " — " + esc(MTN[m.t] || m.t) + " (" + (m.ch === "email" ? "e-mail" : "WhatsApp") + (m.l ? ", " + m.l.toUpperCase() : "") + ")"; }).join("; ") + '</p>' : ''));
    return h + '<div id="auto-log" style="margin-top:12px"></div><div class="msg" id="m-p"></div></div>';
  }
  function bindPay(x, id) {
    if (window.MN_AUTOLOG) window.MN_AUTOLOG(id, $("#auto-log"));
    var tot = +x.price_total || 0, paid0 = +x.paid_total || 0, dep = Math.round(tot * 0.3), nextAmt = paid0 < dep ? dep - paid0 : Math.max(0, tot - paid0);
    async function save(patch) { patch.updated_at = new Date().toISOString(); var u = await sb.from("site_requests").update(patch).eq("id", id); if (u.error) { P.msg("#m-p", u.error.message, "err"); return false; } return true; }
    var b;
    $("#p-lang").onchange = function () { x._lang = this.value; var y = Object.assign({}, x); box_refresh(); };
    function box_refresh() { var card = $("#pay-card"); var tmp = document.createElement("div"); tmp.innerHTML = payCard(x); card.replaceWith(tmp.firstChild); bindPay(x, id); }
    if ((b = $("#p-save-total"))) b.onclick = async function () {
      var v = +$("#p-total").value; if (!(v > 0)) return P.msg("#m-p", "Narxni kiriting", "err");
      if (await save({ price_total: v, balance_due: x.start_date ? addDays(x.start_date, -14) : null, status: ["new", "in_progress"].indexOf(x.status) > -1 ? "awaiting_payment" : x.status })) openRequest(id);
    };
    // currency + CBU rate
    async function setRate() {
      var cur = $("#p-cur").value, d = $("#p-date").value;
      if (cur === "USD") { $("#p-rate").value = ""; $("#p-rate").disabled = true; if (!$("#p-amt").value) $("#p-amt").value = nextAmt || ""; conv(); return; }
      $("#p-rate").disabled = false;
      var r = await cbuRate(cur === "UZS" ? "USD" : cur, d); if (r) $("#p-rate").value = r;
      if (cur === "UZS" && !$("#p-amt").value && r && nextAmt) $("#p-amt").value = Math.round(nextAmt * r);
      conv();
    }
    function usdOf() {
      var cur = $("#p-cur").value, a = +$("#p-amt").value || 0, r = +$("#p-rate").value || 0;
      if (cur === "USD") return a;
      if (cur === "UZS") return r ? Math.round(a / r * 100) / 100 : 0;
      var usd = rateCache["USD" + $("#p-date").value]; return usd && r ? Math.round(a * r / usd * 100) / 100 : 0;
    }
    function conv() { var u = usdOf(); $("#p-conv").textContent = "Keyingi to'lov: " + P.money(nextAmt) + (u ? " · kiritilgani ≈ " + P.money(u) : ""); }
    if ($("#p-cur")) { $("#p-cur").onchange = function () { $("#p-amt").value = ""; setRate(); }; $("#p-date").onchange = setRate; $("#p-amt").oninput = conv; $("#p-rate").oninput = conv; setRate(); if ($("#p-cur").value === "EUR") cbuRate("USD", $("#p-date").value); }
    if ((b = $("#p-add"))) b.onclick = async function () {
      var cur = $("#p-cur").value, orig = +$("#p-amt").value; if (!orig) return P.msg("#m-p", "Summani yozing", "err");
      if (cur === "EUR") await cbuRate("USD", $("#p-date").value);
      var a = usdOf(); if (!a) return P.msg("#m-p", "Kursni kiriting (MB kursi)", "err");
      this.disabled = true;
      var ins = await sb.from("payments").insert({ ref_kind: "request", ref_id: id, amount: a, currency: cur, amount_orig: orig, rate: cur === "USD" ? null : +$("#p-rate").value, paid_on: $("#p-date").value, method: $("#p-m").value });
      if (ins.error) { this.disabled = false; return P.msg("#m-p", ins.error.message, "err"); }
      var paid = Math.round((paid0 + a) * 100) / 100, st = paid >= tot - 0.5 ? "paid" : paid >= dep - 0.5 ? "deposit_paid" : "awaiting_payment";
      if (["confirmed", "closed", "cancelled"].indexOf(x.status) > -1) st = x.status;
      var patch = { paid_total: paid, status: st };
      if (!x.voucher_key) patch.voucher_key = newKey();
      if (st === "paid") { patch.status = "confirmed"; patch.voucher_at = new Date().toISOString(); }
      window._mnLastPay = cur === "USD" ? P.money(orig) : Math.round(orig).toLocaleString("ru-RU").replace(/,/g, " ") + " " + (cur === "UZS" ? "UZS" : cur) + " (≈ " + P.money(a) + ")";
      if (await save(patch)) openRequest(id, x._lang);
    };
    if ($("#p-list")) sb.from("payments").select("*").eq("ref_kind", "request").eq("ref_id", id).order("paid_on").then(function (r) {
      var L = r.data || []; if (!L.length) return;
      var lp = L[L.length - 1];
      x._lastPayTxt = window._mnLastPay || (lp.currency && lp.currency !== "USD" ? Math.round(lp.amount_orig).toLocaleString("ru-RU") + " " + lp.currency + " (≈ " + P.money(lp.amount) + ")" : P.money(lp.amount));
      $("#p-list").innerHTML = '<table class="tbl" style="margin-top:6px"><tbody>' + L.map(function (p) { return '<tr><td>' + P.date(p.paid_on) + '</td><td><b>' + (p.currency && p.currency !== "USD" ? Math.round(p.amount_orig).toLocaleString("ru-RU") + " " + p.currency + '</b> <small>(kurs ' + p.rate + ' → ' + P.money(p.amount) + ')</small>' : P.money(p.amount) + '</b>') + '</td><td>' + esc({ bank: "Bank", card: "Karta", cash: "Naqd", other: "Boshqa" }[p.method] || p.method || "") + '</td></tr>'; }).join("") + '</tbody></table>';
      fill();
    });
    $$("[data-copy]").forEach(function (el) { el.onclick = function () { navigator.clipboard.writeText(vurlL(x, el.getAttribute("data-copy") === "1")); P.msg("#m-p", "Nusxalandi", "ok"); }; });
    // services
    var SV = (x.services || []).slice();
    function drawSv() { $("#svc-box").innerHTML = SV.length ? svcTable(SV) : '<p class="p-sub">Xizmat yo\'q.</p>'; bindSv(); }
    function bindSv() {
      $$("#svc-t [data-f]").forEach(function (el) { el.onchange = el.oninput = function () { SV[+el.getAttribute("data-i")][el.getAttribute("data-f")] = el.value; }; });
      $$("#svc-t [data-del]").forEach(function (el) { el.onclick = function () { SV.splice(+el.getAttribute("data-del"), 1); drawSv(); }; });
    }
    bindSv();
    $("#svc-auto").onclick = function () { var a = autoServices(x); if (!a.length) return P.msg("#m-p", "Bu so'rovda tur yoki sana yo'q — xizmatlarni qo'lda qo'shing", "err"); SV = a; drawSv(); P.msg("#m-p", a.length + " ta xizmat yozildi. Nomlar, tasdiq raqamlari va telefonlarni to'ldirib \"Xizmatlarni saqlash\"ni bosing.", "ok"); };
    $("#svc-add").onclick = function () { SV.push({ kind: "transfer", title: "", city: "", from: x.start_date || "", to: "", time: "", place: "", conf: "", contact: "", details: "" }); drawSv(); };
    $("#svc-save").onclick = async function () { if (await save({ services: SV })) { x.services = SV; P.msg("#m-p", "Xizmatlar saqlandi", "ok"); openRequest(id, x._lang); } };
    // messages
    function fill() { var m = fillMsg(x, $("#p-tpl").value); $("#p-subj").value = m.subj; $("#p-body").value = m.body; }
    $("#p-tpl").onchange = fill; fill();
    async function logMsg(ch) {
      var L = (x.messages || []).concat([{ t: $("#p-tpl").value, ch: ch, l: docLang(x), at: new Date().toISOString() }]);
      await sb.from("site_requests").update({ messages: L }).eq("id", id); x.messages = L;
      P.msg("#m-p", ch === "email" ? "Pochta dasturi ochildi — \"Yuborish\"ni bosing." : "WhatsApp ochildi — \"Yuborish\"ni bosing.", "ok");
    }
    if ((b = $("#p-mail"))) b.onclick = function () { location.href = "mailto:" + encodeURIComponent(x.email) + "?subject=" + encodeURIComponent($("#p-subj").value) + "&body=" + encodeURIComponent($("#p-body").value); logMsg("email"); };
    if ((b = $("#p-wa"))) b.onclick = function () { window.open(wa(x.phone) + "?text=" + encodeURIComponent("*" + $("#p-subj").value + "*\n\n" + $("#p-body").value), "_blank", "noopener"); logMsg("whatsapp"); };
  }

  // ---------------------------------------------------------------- travellers' stories
  function purl(p) { return P.sb.storage.from("traveller-photos").getPublicUrl(p).data.publicUrl; }
  A.posts = async function () {
    A.show("posts");
    var F = [["pending", "Tekshirishda"], ["approved", "Saytda"], ["rejected", "Rad etilgan"]];
    $("#pf").innerHTML = F.map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === pFilter ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("");
    $$("#pf button").forEach(function (b) { b.onclick = function () { pFilter = b.dataset.f; A.posts(); }; });
    var r = await sb.from("traveller_posts").select("*").eq("status", pFilter).order("created_at", { ascending: false }).limit(200), box = $("#plist");
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (!r.data.length) { box.innerHTML = '<div class="empty">Bu bo\'limda hikoya yo\'q.</div>'; return; }
    box.innerHTML = r.data.map(function (p) {
      return '<div class="p-card" style="margin-top:14px" data-id="' + p.id + '"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
        (p.photos || []).map(function (ph) { return '<a href="' + esc(purl(ph)) + '" target="_blank" rel="noopener"><img src="' + esc(purl(ph)) + '" style="width:120px;height:120px;object-fit:cover;border-radius:10px" alt=""></a>'; }).join("") + '</div>' +
        '<p><b>' + esc(p.name) + '</b> · ' + esc(p.country || "") + ' · ' + esc(p.trip || "") + ' · ' + "★".repeat(p.rating || 0) + ' <small>' + P.date(p.created_at) + ' · ' + esc((p.lang || "").toUpperCase()) + '</small></p>' +
        '<p style="white-space:pre-wrap;margin-top:6px">' + esc(p.body) + '</p><div class="p-actions">' +
        (p.status !== "approved" ? '<button class="btn btn--gold btn--sm" data-a="approved">✓ Saytga chiqarish</button>' : '') +
        (p.status !== "rejected" ? '<button class="btn btn--outline btn--sm" data-a="rejected">Rad etish</button>' : '') +
        '<button class="btn btn--outline btn--sm" data-a="delete" style="color:#a12f2f;border-color:#a12f2f">O\'chirish (suratlar bilan)</button></div></div>';
    }).join("");
    $$("[data-a]", box).forEach(function (b) {
      b.onclick = async function () {
        var card = b.closest("[data-id]"), id = card.dataset.id, a = b.dataset.a, row = r.data.filter(function (x) { return x.id === id; })[0];
        if (a === "delete") {
          if (!confirm("Hikoya va uning suratlari butunlay o'chirilsinmi? Buni qaytarib bo'lmaydi.")) return;
          if ((row.photos || []).length) { var s = await sb.storage.from("traveller-photos").remove(row.photos); if (s.error) return alert(s.error.message); }
          var d = await sb.from("traveller_posts").delete().eq("id", id); if (d.error) return alert(d.error.message);
        } else {
          var u = await sb.from("traveller_posts").update({ status: a, approved_at: a === "approved" ? new Date().toISOString() : null }).eq("id", id);
          if (u.error) return alert(u.error.message);
        }
        A.posts();
      };
    });
  };
})();
