/* Moviy Nomad — admin: website requests (B2C bookings + service requests) and travellers' stories moderation. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var RS = { new: "Yangi", in_progress: "Ishlanmoqda", awaiting_payment: "30% kutilmoqda", deposit_paid: "30% to'landi, 70% kutilmoqda", paid: "100% to'landi", confirmed: "Tasdiqlandi", closed: "Yopildi", cancelled: "Bekor" };
  var SV = { airport: "Kutib olish", transfer: "Transfer", car: "Haydovchili mashina", hotel: "Mehmonxona", train: "Poyezd chiptasi", guide: "Gid", mice: "Guruh / MICE" };
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
    var r = await q, box = $("#rlist");
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (!r.data.length) { box.innerHTML = '<div class="empty">So\'rov yo\'q.</div>'; return; }
    box.innerHTML = '<table class="tbl"><thead><tr><th>Raqam</th><th>Turi</th><th>Mijoz</th><th>Sana</th><th>Kishi</th><th>To\'lov</th><th>Holat</th></tr></thead><tbody>' +
      r.data.map(function (x) {
        var what = x.kind === "tour" ? "🧭 " + esc(x.tour_title || x.tour_id || "Tur") : x.kind === "group" ? "👥 Guruh: " + esc(x.tour_title || "") : "🛎 " + esc(SV[x.service] || x.service || "Xizmat");
        return '<tr class="click" data-id="' + x.id + '"><td><b>' + esc(x.ref) + '</b><br><small>' + P.date(x.created_at) + ' · ' + esc((x.lang || "").toUpperCase()) + '</small></td><td>' + what + '</td><td>' + esc(x.contact_name) + '<br><small>' + esc(x.phone) + (x.citizenship ? " · " + esc(x.citizenship) : "") + '</small></td><td>' + P.date(x.start_date) + '</td><td>' + (x.pax || "—") + '</td><td><small>' + (x.price_total ? P.money(x.paid_total || 0) + ' / ' + P.money(x.price_total) : esc(PM[x.pay_method] || "—")) + (x.balance_due && x.status === 'deposit_paid' ? '<br>70% muddati: ' + P.date(x.balance_due) : '') + '</small></td><td>' + badge(x.status) + '</td></tr>';
      }).join("") + '</tbody></table>';
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { openRequest(tr.dataset.id); }; });
  };

  async function openRequest(id) {
    A.show("request");
    var box = $("#v-request"); box.innerHTML = '<div class="p-card">…</div>';
    var r = await sb.from("site_requests").select("*").eq("id", id).single();
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    var x = r.data, d = x.details || {}, tr = x.travellers || [];
    var rows = [["Raqam", x.ref], ["Yuborilgan", new Date(x.created_at).toLocaleString("ru-RU")], ["Til", (x.lang || "").toUpperCase()],
      ["Turi", x.kind === "tour" ? "Tur bron so'rovi" : x.kind === "group" ? (d.notify ? "Guruh turi: yangi sana chiqsa xabar berish" : "Guruh turiga joy so'rovi") : "Xizmat: " + (SV[x.service] || x.service)], ["Xona", {twin_share: "Ikki kishilik (sherik bilan)", twin: "Ikki kishilik (o'zlari)", single: "Bir kishilik"}[d.room]], ["Guruh", {small: "Kichik (12–17)", medium: "O'rta (30–35)", large: "Katta (45–50)"}[d.group_kind]],
      ["Qo'shimchalar", [d.extra_night ? "Toshkentda +1 kecha" : "", d.arrival_transfer ? "Individual kutib olish" : "", d.departure_transfer ? "Individual kuzatish" : ""].filter(Boolean).join(", ")],
      ["Saytdagi taxminiy jami", d.est_total ? "$" + d.est_total : ""], ["Tur", x.tour_title], ["Shahar / yo'nalish", d.city],
      ["Boshlanish", P.date(x.start_date)], ["Kishi soni", x.pax + (d.adults != null ? " (kattalar " + d.adults + ", bolalar " + (d.children || 0) + ")" : "")],
      ["Mehmonxona", HC[d.hotel] || d.hotel], ["Gid tili", d.guide_lang], ["To'lov usuli", PM[x.pay_method]],
      ["Mijoz", x.contact_name], ["Telefon", x.phone], ["E-mail", x.email], ["Bog'lanish", x.messenger], ["Fuqarolik", x.citizenship], ["Izoh", x.message]];
    var h = '<p><a href="#" id="r-back">← Mijoz so\'rovlari</a></p><div class="p-card"><h2>' + esc(x.ref) + ' ' + badge(x.status) + '</h2><table class="tbl">' +
      rows.filter(function (a) { return a[1] != null && a[1] !== "" && a[1] !== "—"; }).map(function (a) { return '<tr><th style="width:200px">' + esc(a[0]) + '</th><td style="white-space:pre-wrap">' + esc(a[1]) + '</td></tr>'; }).join("") + '</table>' +
      '<div class="p-actions"><a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="' + wa(x.phone) + '">WhatsApp\'da yozish</a>' + (x.email ? '<a class="btn btn--outline btn--sm" href="mailto:' + esc(x.email) + '">E-mail</a>' : '') + '</div></div>';
    if (tr.length) h += '<div class="p-card"><h3>Sayohatchilar (' + tr.length + ')</h3><table class="tbl"><thead><tr><th>#</th><th>Ism</th><th>Familiya</th><th>Jinsi</th><th>Tug\'ilgan</th></tr></thead><tbody>' +
      tr.map(function (t, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(t.first) + '</td><td>' + esc(t.last) + '</td><td>' + esc(t.gender) + '</td><td>' + esc(t.dob) + '</td></tr>'; }).join("") + '</tbody></table></div>';
    h += '<div class="p-card"><h3>Holat va izoh</h3><div class="fld"><label>Holat</label><select id="r-st">' + Object.keys(RS).map(function (k) { return '<option value="' + k + '"' + (k === x.status ? " selected" : "") + '>' + RS[k] + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld" style="margin-top:12px"><label>Ichki izoh (mijoz ko\'rmaydi)</label><textarea id="r-note">' + esc(x.admin_note || "") + '</textarea></div><div class="msg" id="m-r"></div>' +
      '<div class="p-actions"><button class="btn btn--gold btn--sm" id="r-save">Saqlash</button></div></div>';
    h += payCard(x);
    box.innerHTML = h;
    bindPay(x, id);
    $("#r-back").onclick = function (e) { e.preventDefault(); A.requests(); };
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
  // ---- message templates (client's language: en / ru / uz; others get English)
  var MT = {
    en: {
      confirm: ["Booking confirmed — please pay the 30% deposit · {ref}", "Dear {name},\n\nThank you for choosing Moviy Nomad! Your booking {ref} — {tour}, {date}, {pax} traveller(s) — is confirmed.\n\nTour price: {total}\nDeposit (30%): {dep} — please pay within 3 working days.\nBalance (70%): {bal} — by {due}.\n\nBank details:\n{bank}\nPayment reference: {ref}\n\nWe will send a payment confirmation as soon as the money arrives.\nTerms: {terms}\n\nMoviy Nomad (MOVIY TRAVEL), licence № {lic}\nWhatsApp {phone}"],
      received: ["Payment received — {ref}", "Dear {name},\n\nWe have received your payment of {last}. Thank you!\nPaid so far: {paid} of {total}.\n{left}\nYour booking confirmation (PDF): {doc}\n\nMoviy Nomad, WhatsApp {phone}"],
      reminder: ["Reminder: balance due {due} — {ref}", "Dear {name},\n\nA friendly reminder: the balance of {left_amt} for your trip {tour} ({date}) is due by {due}.\n\nBank details:\n{bank}\nPayment reference: {ref}\n\nMoviy Nomad, WhatsApp {phone}"],
      final: ["Final reminder — 48 hours — {ref}", "Dear {name},\n\nWe have not yet received the balance of {left_amt} for booking {ref}. Please pay within 48 hours, otherwise, under our terms, the booking will be cancelled and the deposit kept.\n\nBank details:\n{bank}\n\nMoviy Nomad, WhatsApp {phone}"],
      voucher: ["Your travel voucher — {ref}", "Dear {name},\n\nYour trip {tour} ({date}) is fully paid — thank you!\nYour travel voucher (open and download PDF): {doc}\n\nPlease show it together with your passport. We are available 24/7 on WhatsApp {phone}.\n\nHave a wonderful journey!\nMoviy Nomad"],
      cancel: ["Booking cancelled — {ref}", "Dear {name},\n\nYour booking {ref} ({tour}, {date}) has been cancelled. Any refund will follow our terms: {terms}\n\nMoviy Nomad, WhatsApp {phone}"]
    },
    ru: {
      confirm: ["Бронь подтверждена — внесите предоплату 30% · {ref}", "Здравствуйте, {name}!\n\nСпасибо, что выбрали Moviy Nomad! Ваша бронь {ref} — {tour}, {date}, туристов: {pax} — подтверждена.\n\nСтоимость тура: {total}\nПредоплата (30%): {dep} — в течение 3 рабочих дней.\nОстаток (70%): {bal} — до {due}.\n\nРеквизиты:\n{bank}\nНазначение платежа: {ref}\n\nКак только деньги поступят, пришлём подтверждение.\nУсловия: {terms}\n\nMoviy Nomad (MOVIY TRAVEL), лицензия № {lic}\nWhatsApp {phone}"],
      received: ["Оплата получена — {ref}", "Здравствуйте, {name}!\n\nМы получили вашу оплату {last}. Спасибо!\nВсего оплачено: {paid} из {total}.\n{left}\nПодтверждение брони (PDF): {doc}\n\nMoviy Nomad, WhatsApp {phone}"],
      reminder: ["Напоминание: остаток до {due} — {ref}", "Здравствуйте, {name}!\n\nНапоминаем: остаток {left_amt} за тур {tour} ({date}) нужно оплатить до {due}.\n\nРеквизиты:\n{bank}\nНазначение: {ref}\n\nMoviy Nomad, WhatsApp {phone}"],
      final: ["Последнее напоминание — 48 часов — {ref}", "Здравствуйте, {name}!\n\nМы пока не получили остаток {left_amt} по брони {ref}. Пожалуйста, оплатите в течение 48 часов, иначе по нашим условиям бронь будет отменена, а предоплата не возвращается.\n\nРеквизиты:\n{bank}\n\nMoviy Nomad, WhatsApp {phone}"],
      voucher: ["Ваш ваучер — {ref}", "Здравствуйте, {name}!\n\nТур {tour} ({date}) полностью оплачен — спасибо!\nВаш ваучер (открыть и скачать PDF): {doc}\n\nПокажите его вместе с паспортом. Мы на связи 24/7 в WhatsApp {phone}.\n\nПриятного путешествия!\nMoviy Nomad"],
      cancel: ["Бронь отменена — {ref}", "Здравствуйте, {name}!\n\nВаша бронь {ref} ({tour}, {date}) отменена. Возврат — по нашим условиям: {terms}\n\nMoviy Nomad, WhatsApp {phone}"]
    },
    uz: {
      confirm: ["Bron tasdiqlandi — 30% oldindan to'lovni qiling · {ref}", "Hurmatli {name},\n\nMoviy Nomad'ni tanlaganingiz uchun rahmat! Broningiz {ref} — {tour}, {date}, {pax} kishi — tasdiqlandi.\n\nTur narxi: {total}\nOldindan to'lov (30%): {dep} — 3 ish kuni ichida.\nQolgan 70%: {bal} — {due} gacha.\n\nRekvizitlar:\n{bank}\nTo'lov maqsadi: {ref}\n\nPul tushishi bilan tasdiq yuboramiz.\nShartlar: {terms}\n\nMoviy Nomad (MOVIY TRAVEL), litsenziya № {lic}\nWhatsApp {phone}"],
      received: ["To'lov qabul qilindi — {ref}", "Hurmatli {name},\n\n{last} to'lovingiz qabul qilindi. Rahmat!\nJami to'langan: {paid} / {total}.\n{left}\nBron tasdig'i (PDF): {doc}\n\nMoviy Nomad, WhatsApp {phone}"],
      reminder: ["Eslatma: qolgan to'lov muddati {due} — {ref}", "Hurmatli {name},\n\nEslatamiz: {tour} ({date}) uchun qolgan {left_amt} summani {due} gacha to'lash kerak.\n\nRekvizitlar:\n{bank}\nTo'lov maqsadi: {ref}\n\nMoviy Nomad, WhatsApp {phone}"],
      final: ["Oxirgi eslatma — 48 soat — {ref}", "Hurmatli {name},\n\n{ref} bron bo'yicha qolgan {left_amt} hali tushmadi. Iltimos, 48 soat ichida to'lang, aks holda shartlarimizga ko'ra bron bekor qilinadi va oldindan to'lov qaytarilmaydi.\n\nRekvizitlar:\n{bank}\n\nMoviy Nomad, WhatsApp {phone}"],
      voucher: ["Sayohat vaucheringiz — {ref}", "Hurmatli {name},\n\n{tour} ({date}) to'liq to'landi — rahmat!\nVaucheringiz (ochib PDF yuklab oling): {doc}\n\nUni pasportingiz bilan birga ko'rsating. 24/7 WhatsApp: {phone}.\n\nYaxshi sayohat!\nMoviy Nomad"],
      cancel: ["Bron bekor qilindi — {ref}", "Hurmatli {name},\n\n{ref} broningiz ({tour}, {date}) bekor qilindi. Pul qaytarish shartlarimiz bo'yicha: {terms}\n\nMoviy Nomad, WhatsApp {phone}"]
    }
  };
  var MTN = { confirm: "Bron tasdiqlandi — 30% to'lang", received: "To'lov qabul qilindi (+ hujjat)", reminder: "Eslatma: qolgan to'lov muddati yaqin", final: "Oxirgi eslatma (48 soat)", voucher: "Vaucher tayyor (to'liq to'langan)", cancel: "Bron bekor qilindi" };
  function suggest(x) {
    var tot = +x.price_total || 0, paid = +x.paid_total || 0;
    if (x.status === "cancelled") return "cancel";
    if (tot && paid >= tot) return "voucher";
    if (paid > 0) { var dd = x.balance_due ? (new Date(x.balance_due) - new Date()) / 864e5 : 99; return dd < 0 ? "final" : dd <= 10 ? "reminder" : "received"; }
    return "confirm";
  }
  function fillMsg(x, key) {
    var lang = MT[x.lang] ? x.lang : "en", t = MT[lang][key], C = window.MN_CO || {};
    var tot = +x.price_total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), left = Math.max(0, tot - paid);
    var m = function (n) { return P.money(n); }, last = x._lastPay || paid;
    var leftTxt = left > 0 ? { en: "Balance: " + m(left) + (x.balance_due ? " — due by " + P.date(x.balance_due) : ""), ru: "Остаток: " + m(left) + (x.balance_due ? " — до " + P.date(x.balance_due) : ""), uz: "Qoldiq: " + m(left) + (x.balance_due ? " — " + P.date(x.balance_due) + " gacha" : "") }[lang] : { en: "Your trip is fully paid.", ru: "Тур полностью оплачен.", uz: "Sayohat to'liq to'langan." }[lang];
    var V = { ref: x.ref, name: x.contact_name || "", tour: x.tour_title || x.tour_id || "", date: x.start_date ? P.date(x.start_date) : "", pax: x.pax || "",
      total: m(tot), dep: m(dep), bal: m(tot - dep), due: x.balance_due ? P.date(x.balance_due) : (x.start_date ? P.date(addDays(x.start_date, -14)) : ""),
      paid: m(paid), last: m(last), left: leftTxt, left_amt: m(left), doc: x.voucher_key ? vurl(x) : "", lic: C.license || "", phone: C.phone || "",
      terms: location.origin + location.pathname.replace(/admin\/.*$/, "") + (lang === "en" ? "" : lang + "/") + "terms.html",
      bank: (C.company || "") + "\nINN " + (C.inn || "") + " · " + (C.bank || "") + " · MFO " + (C.mfo || "") + "\nAccount: " + (C.account || "") };
    var f = function (s) { return s.replace(/\{(\w+)\}/g, function (_, k) { return V[k] == null ? "" : V[k]; }); };
    return { subj: f(t[0]), body: f(t[1]) };
  }
  function newKey() { var a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join(""); }

  function payCard(x) {
    var tot = +x.price_total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), left = Math.max(0, tot - paid), due = x.balance_due || (x.start_date ? addDays(x.start_date, -14) : "");
    var est = (x.details && x.details.est_total) || "";
    var step = function (n, on, head, txt) { return '<div style="display:flex;gap:12px;margin:14px 0;opacity:' + (on ? 1 : .45) + '"><b style="flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:' + (on ? "var(--gold)" : "#ddd") + '">' + n + '</b><div style="flex:1"><b>' + head + '</b><div style="margin-top:6px">' + txt + '</div></div></div>'; };
    var h = '<div class="p-card" id="pay-card"><h3>To\'lov, hujjat va xabarlar</h3>';
    h += step(1, true, "Tur narxi", '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="number" min="0" step="1" id="p-total" style="width:140px" value="' + (tot || est) + '"> USD <button class="btn btn--gold btn--sm" id="p-save-total">Saqlash</button>' +
      (tot ? '<small>30% = <b>' + P.money(dep) + '</b> (3 ish kunida) · 70% = <b>' + P.money(tot - dep) + '</b>' + (due ? ' (' + P.date(due) + ' gacha)' : '') + '</small>' : '') + '</div>');
    var nextAmt = paid < dep ? dep - paid : left;
    h += step(2, !!tot, "To'lov tushdi — summani yozing", tot ? (
      '<div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap"><div class="fld"><label>Summa (USD)</label><input type="number" step="1" id="p-amt" style="width:130px" value="' + (left > 0 ? nextAmt : "") + '"></div>' +
      '<div class="fld"><label>Sana</label><input type="date" id="p-date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
      '<div class="fld"><label>Usul</label><select id="p-m"><option value="bank">Bank o\'tkazmasi</option><option value="card">Karta (Visa/Mastercard)</option><option value="cash">Naqd</option><option value="other">Boshqa</option></select></div>' +
      '<button class="btn btn--green btn--sm" id="p-add">✓ To\'lovni tasdiqlash</button></div>' +
      '<p style="margin:8px 0 0">To\'langan: <b>' + P.money(paid) + '</b> / ' + P.money(tot) + (left > 0 ? ' · qoldiq: <b style="color:#c8553d">' + P.money(left) + '</b>' : ' · <b style="color:#2e7d32">to\'liq to\'langan ✓</b>') + '</p><div id="p-list"></div>') : "Avval narxni saqlang");
    h += step(3, !!x.voucher_key, "Hujjat (bron tasdig'i / vaucher)", x.voucher_key ?
      'To\'lov tasdiqlangach o\'zi tayyor bo\'ldi — ' + (left > 0 ? '<b>bron tasdig\'i</b> (to\'langan summa va qoldiq bilan)' : '<b>sayohat vaucheri</b>') + '. <a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' + esc(vurl(x)) + '">Ko\'rish / PDF</a> <button class="btn btn--outline btn--sm" id="p-copy">Havolani nusxalash</button>' :
      'Birinchi to\'lov tasdiqlanishi bilan o\'zi tayyorlanadi (Moviy Travel rekvizitlari, mijoz ma\'lumotlari, tur, to\'lovlar).');
    var sug = suggest(x);
    h += step(4, true, "Mijozga xabar yuborish", '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select id="p-tpl">' + Object.keys(MTN).map(function (k) { return '<option value="' + k + '"' + (k === sug ? " selected" : "") + '>' + MTN[k] + '</option>'; }).join("") + '</select>' +
      '<button class="btn btn--gold btn--sm" id="p-mail"' + (x.email ? "" : " disabled") + '>✉ E-mailga yuborish</button>' +
      '<button class="btn btn--wa btn--sm" id="p-wa"' + (x.phone ? "" : " disabled") + '>WhatsApp\'ga yuborish</button></div>' +
      '<small class="p-sub">E-mail: ' + esc(x.email || "— yo'q") + ' · WhatsApp: ' + esc(x.phone || "— yo'q") + ' · til: ' + esc((MT[x.lang] ? x.lang : "en").toUpperCase()) + '</small>' +
      '<div class="fld" style="margin-top:8px"><label>Mavzu</label><input id="p-subj"></div><div class="fld"><label>Matn (kerak bo\'lsa tahrirlang)</label><textarea id="p-body" rows="9"></textarea></div>' +
      ((x.messages || []).length ? '<p class="p-sub" style="margin-top:6px">Yuborilganlar: ' + x.messages.slice(-6).map(function (m) { return P.date(m.at) + " — " + esc(MTN[m.t] || m.t) + " (" + (m.ch === "email" ? "e-mail" : "WhatsApp") + ")"; }).join("; ") + '</p>' : ''));
    return h + '<div class="msg" id="m-p"></div></div>';
  }
  function bindPay(x, id) {
    var tot = +x.price_total || 0, paid0 = +x.paid_total || 0;
    async function save(patch) { patch.updated_at = new Date().toISOString(); var u = await sb.from("site_requests").update(patch).eq("id", id); if (u.error) { P.msg("#m-p", u.error.message, "err"); return false; } return true; }
    var b;
    if ((b = $("#p-save-total"))) b.onclick = async function () {
      var v = +$("#p-total").value; if (!(v > 0)) return P.msg("#m-p", "Narxni kiriting", "err");
      if (await save({ price_total: v, balance_due: x.start_date ? addDays(x.start_date, -14) : null, status: ["new", "in_progress"].indexOf(x.status) > -1 ? "awaiting_payment" : x.status })) openRequest(id);
    };
    if ((b = $("#p-add"))) b.onclick = async function () {
      var a = +$("#p-amt").value; if (!a) return P.msg("#m-p", "Summani yozing", "err");
      this.disabled = true;
      var ins = await sb.from("payments").insert({ ref_kind: "request", ref_id: id, amount: a, paid_on: $("#p-date").value, method: $("#p-m").value });
      if (ins.error) { this.disabled = false; return P.msg("#m-p", ins.error.message, "err"); }
      var paid = paid0 + a, st = paid >= tot - 0.5 ? "paid" : paid >= Math.round(tot * 0.3) - 0.5 ? "deposit_paid" : "awaiting_payment";
      if (["confirmed", "closed", "cancelled"].indexOf(x.status) > -1) st = x.status;
      var patch = { paid_total: paid, status: st };
      if (!x.voucher_key) patch.voucher_key = newKey();
      if (st === "paid") { patch.status = "confirmed"; patch.voucher_at = new Date().toISOString(); }
      if (await save(patch)) { window._mnLastPay = a; openRequest(id); }
    };
    if ($("#p-list")) sb.from("payments").select("*").eq("ref_kind", "request").eq("ref_id", id).order("paid_on").then(function (r) {
      var L = r.data || []; if (!L.length) return;
      x._lastPay = window._mnLastPay || +L[L.length - 1].amount;
      $("#p-list").innerHTML = '<table class="tbl" style="margin-top:6px"><tbody>' + L.map(function (p) { return '<tr><td>' + P.date(p.paid_on) + '</td><td><b>' + P.money(p.amount) + '</b></td><td>' + esc({ bank: "Bank", card: "Karta", cash: "Naqd", other: "Boshqa" }[p.method] || p.method || "") + '</td></tr>'; }).join("") + '</tbody></table>';
      fill();
    });
    if ((b = $("#p-copy"))) b.onclick = function () { navigator.clipboard.writeText(vurl(x)); P.msg("#m-p", "Nusxalandi", "ok"); };
    function fill() { var m = fillMsg(x, $("#p-tpl").value); $("#p-subj").value = m.subj; $("#p-body").value = m.body; }
    $("#p-tpl").onchange = fill; fill();
    async function logMsg(ch) {
      var L = (x.messages || []).concat([{ t: $("#p-tpl").value, ch: ch, at: new Date().toISOString() }]);
      await sb.from("site_requests").update({ messages: L }).eq("id", id); x.messages = L;
      P.msg("#m-p", ch === "email" ? "Pochta dasturi ochildi — \"Yuborish\"ni bosing." : "WhatsApp ochildi — \"Yuborish\"ni bosing.", "ok");
    }
    if ((b = $("#p-mail"))) b.onclick = function () {
      location.href = "mailto:" + encodeURIComponent(x.email) + "?subject=" + encodeURIComponent($("#p-subj").value) + "&body=" + encodeURIComponent($("#p-body").value);
      logMsg("email");
    };
    if ((b = $("#p-wa"))) b.onclick = function () {
      window.open(wa(x.phone) + "?text=" + encodeURIComponent("*" + $("#p-subj").value + "*\n\n" + $("#p-body").value), "_blank", "noopener");
      logMsg("whatsapp");
    };
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
