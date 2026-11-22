/* Moviy Nomad — admin: website requests (B2C bookings + service requests) and travellers' stories moderation. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var RS = { new: "Yangi", in_progress: "Ishlanmoqda", awaiting_payment: "To'lov kutilmoqda", paid: "To'landi", confirmed: "Tasdiqlandi", closed: "Yopildi", cancelled: "Bekor" };
  var SV = { airport: "Kutib olish", transfer: "Transfer", car: "Haydovchili mashina", hotel: "Mehmonxona", train: "Poyezd chiptasi", guide: "Gid", mice: "Guruh / MICE" };
  var HC = { comfort: "Komfort 3★", superior: "Superior 4★", boutique: "Butik va tarixiy" };
  var PM = { bank: "Bank o'tkazmasi", card: "Karta havolasi", contact: "Avval bog'lanish" };
  var rFilter = "open", pFilter = "pending";
  function badge(s) { return '<span class="badge-s st-' + (s === "new" ? "request" : s === "closed" ? "cancelled" : s) + '">' + esc(RS[s] || s) + '</span>'; }
  function wa(phone) { var d = String(phone || "").replace(/\D/g, ""); return d ? "https://wa.me/" + d : "#"; }

  // ---------------------------------------------------------------- requests
  A.requests = async function () {
    A.show("requests");
    var F = [["open", "Ochiq"], ["new", "Yangi"], ["in_progress", "Ishlanmoqda"], ["awaiting_payment", "To'lov kutilmoqda"], ["paid", "To'landi"], ["confirmed", "Tasdiqlandi"], ["all", "Hammasi"]];
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
        return '<tr class="click" data-id="' + x.id + '"><td><b>' + esc(x.ref) + '</b><br><small>' + P.date(x.created_at) + ' · ' + esc((x.lang || "").toUpperCase()) + '</small></td><td>' + what + '</td><td>' + esc(x.contact_name) + '<br><small>' + esc(x.phone) + (x.citizenship ? " · " + esc(x.citizenship) : "") + '</small></td><td>' + P.date(x.start_date) + '</td><td>' + (x.pax || "—") + '</td><td><small>' + esc(PM[x.pay_method] || "—") + '</small></td><td>' + badge(x.status) + '</td></tr>';
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
      ["Turi", x.kind === "tour" ? "Tur bron so'rovi" : x.kind === "group" ? (d.notify ? "Guruh turi: yangi sana chiqsa xabar berish" : "Guruh turiga joy so'rovi") : "Xizmat: " + (SV[x.service] || x.service)], ["Xona", {twin_share: "Ikki kishilik (sherik bilan)", twin: "Ikki kishilik (o'zlari)", single: "Bir kishilik"}[d.room]], ["Tur", x.tour_title], ["Shahar / yo'nalish", d.city],
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
    box.innerHTML = h;
    $("#r-back").onclick = function (e) { e.preventDefault(); A.requests(); };
    $("#r-save").onclick = async function () {
      var u = await sb.from("site_requests").update({ status: $("#r-st").value, admin_note: $("#r-note").value.trim() || null, updated_at: new Date().toISOString() }).eq("id", id);
      if (u.error) return P.msg("#m-r", u.error.message, "err");
      P.msg("#m-r", "Saqlandi", "ok"); setTimeout(function () { openRequest(id); }, 500);
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
