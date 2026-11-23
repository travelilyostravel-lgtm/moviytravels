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
  function payCard(x) {
    var tot = +x.price_total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), due = x.balance_due || (x.start_date ? addDays(x.start_date, -14) : "");
    var est = (x.details && x.details.est_total) || "", done = x.voucher_key && ["paid", "confirmed", "closed"].indexOf(x.status) > -1;
    var step = function (n, on, txt) { return '<div style="display:flex;gap:10px;align-items:center;margin:8px 0;opacity:' + (on ? 1 : .45) + '"><b style="flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:' + (on ? "var(--gold)" : "#ddd") + '">' + n + '</b><div style="flex:1">' + txt + '</div></div>'; };
    var h = '<div class="p-card" id="pay-card"><h3>To\'lov va vaucher</h3>';
    // 1) price
    h += step(1, true, '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">Tur narxi (USD): <input type="number" min="0" step="1" id="p-total" style="width:130px" value="' + (tot || est) + '">' +
      (tot ? '<small>30% = <b>' + P.money(dep) + '</b> · 70% = <b>' + P.money(tot - dep) + '</b>' + (due ? ' (' + P.date(due) + ' gacha)' : '') + '</small>' : '<button class="btn btn--gold btn--sm" id="p-save-total">Saqlash</button>') + '</div>');
    // 2) money received — one click, no typing
    var t2 = paid >= tot && tot ? '✅ To\'liq to\'langan: <b>' + P.money(paid) + '</b>' :
      (paid ? 'Tushgan: <b>' + P.money(paid) + '</b> · qoldi: <b>' + P.money(tot - paid) + '</b><br>' : '') +
      (paid < dep ? '<button class="btn btn--green btn--sm" id="p-30">30% tushdi (' + P.money(dep) + ')</button> ' : '') +
      '<button class="btn btn--green btn--sm" id="p-100">' + (paid ? 'Qolgani tushdi (' + P.money(tot - paid) + ')' : '100% tushdi (' + P.money(tot) + ')') + '</button>';
    h += step(2, !!tot, tot ? t2 : 'Pul tushganda shu yerda bitta tugmani bosasiz');
    // 3) voucher — one click: create + send
    var t3 = done ? '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" id="p-send" href="' + wa(x.phone) + '?text=' + encodeURIComponent("Moviy Nomad: your trip is fully paid. Your voucher: " + vurl(x)) + '">WhatsApp\'da yuborish</a> <a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' + esc(vurl(x)) + '">Vaucherni ko\'rish</a> <button class="btn btn--outline btn--sm" id="p-copy">Havolani nusxalash</button>'
      : (tot && paid >= tot ? '<button class="btn btn--gold" id="p-vouch">Vaucher tayyorlash va WhatsApp\'da yuborish</button>' : 'To\'liq to\'langach shu yerda tugma chiqadi');
    h += step(3, tot && paid >= tot, t3);
    if (tot) h += '<details style="margin-top:10px"><summary class="p-sub" style="cursor:pointer">Boshqa summa tushdimi? (qo\'lda yozish va to\'lovlar tarixi)</summary>' +
      '<div id="p-list" style="margin-top:8px"></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:8px"><div class="fld"><label>Summa (USD)</label><input type="number" step="1" id="p-amt" style="width:120px"></div>' +
      '<div class="fld"><label>Usul</label><select id="p-m"><option value="bank">Bank</option><option value="card">Karta</option><option value="cash">Naqd</option></select></div>' +
      '<button class="btn btn--outline btn--sm" id="p-add">Yozish</button></div></details>';
    return h + '<div class="msg" id="m-p"></div></div>';
  }
  function bindPay(x, id) {
    var tot = +x.price_total || 0, paid0 = +x.paid_total || 0;
    async function save(patch) { patch.updated_at = new Date().toISOString(); var u = await sb.from("site_requests").update(patch).eq("id", id); if (u.error) { P.msg("#m-p", u.error.message, "err"); return false; } return true; }
    async function pay(amount, method, note) {
      if (!(amount > 0)) return;
      var ins = await sb.from("payments").insert({ ref_kind: "request", ref_id: id, amount: amount, method: method || "bank", note: note || null });
      if (ins.error) return P.msg("#m-p", ins.error.message, "err");
      var paid = paid0 + amount, st = paid >= tot ? "paid" : paid >= Math.round(tot * 0.3) - 0.5 ? "deposit_paid" : "awaiting_payment";
      if (["confirmed", "closed", "cancelled"].indexOf(x.status) > -1) st = x.status;
      if (await save({ paid_total: paid, status: st })) openRequest(id);
    }
    var b;
    if ((b = $("#p-save-total"))) b.onclick = async function () {
      var v = +$("#p-total").value; if (!(v > 0)) return P.msg("#m-p", "Narxni kiriting", "err");
      if (await save({ price_total: v, balance_due: x.start_date ? addDays(x.start_date, -14) : null, status: ["new", "in_progress"].indexOf(x.status) > -1 ? "awaiting_payment" : x.status })) openRequest(id);
    };
    if (tot && $("#p-total")) $("#p-total").onchange = async function () { var v = +this.value; if (v > 0 && await save({ price_total: v })) openRequest(id); };
    if ((b = $("#p-30"))) b.onclick = function () { this.disabled = true; pay(Math.round(tot * 0.3) - paid0, "bank", "30% oldindan"); };
    if ((b = $("#p-100"))) b.onclick = function () { this.disabled = true; pay(tot - paid0, "bank", paid0 ? "qolgan qism" : "100%"); };
    if ((b = $("#p-add"))) b.onclick = function () { var a = +$("#p-amt").value; if (!a) return P.msg("#m-p", "Summani kiriting", "err"); pay(a, $("#p-m").value, "qo'lda"); };
    if ($("#p-list")) sb.from("payments").select("*").eq("ref_kind", "request").eq("ref_id", id).order("paid_on").then(function (r) {
      var L = r.data || []; $("#p-list").innerHTML = L.length ? '<table class="tbl"><tbody>' + L.map(function (p) { return '<tr><td>' + P.date(p.paid_on) + '</td><td><b>' + P.money(p.amount) + '</b></td><td>' + esc(p.method || "") + '</td><td>' + esc(p.note || "") + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali to\'lov yozilmagan.</p>';
    });
    if ((b = $("#p-vouch"))) b.onclick = async function () {
      var a = new Uint8Array(18); crypto.getRandomValues(a); var k = Array.from(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join("");
      var w = window.open("about:blank", "_blank");   // open now (click), fill after save — browsers block late pop-ups
      if (await save({ voucher_key: k, voucher_at: new Date().toISOString(), status: "confirmed" })) {
        x.voucher_key = k;
        if (w) w.location = wa(x.phone) + "?text=" + encodeURIComponent("Moviy Nomad: your trip is fully paid. Your voucher: " + vurl(x));
        openRequest(id);
      } else if (w) w.close();
    };
    if ((b = $("#p-copy"))) b.onclick = function () { navigator.clipboard.writeText(vurl(x)); P.msg("#m-p", "Nusxalandi", "ok"); };
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
