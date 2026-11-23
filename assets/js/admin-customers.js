/* Moviy Nomad — admin: visitors & customer base (founder only). UI in Uzbek.
   Numbers of visitors, the list of signed-in customers, and each customer's card with every action. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var EV = { visit: "Saytga kirdi", page: "Sahifani ko'rdi", click: "Bosdi", contact: "Bog'lanish tugmasi", signin: "Ro'yxatdan o'tdi", signin_start: "Google orqali kirishni boshladi", signin_later: "\"Keyinroq\" ni bosdi", request: "So'rov / bron yubordi" };
  var PROV = { google: "Google", email: "E-mail", facebook: "Facebook" };
  function dt(s) { return s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"; }
  var q = "", prov = "";

  A.customers = async function () {
    A.show("customers");
    var box = $("#v-customers"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var s = (await sb.rpc("visitor_stats")).data || {};
    var r = await sb.from("site_customers").select("*").order("last_seen", { ascending: false }).limit(1000);
    var list = r.data || [];
    var cnt = {}; ((await sb.from("site_events").select("customer_id").not("customer_id", "is", null).limit(20000)).data || []).forEach(function (e) { cnt[e.customer_id] = (cnt[e.customer_id] || 0) + 1; });
    var kpi = [["Bugun kirganlar", s.today], ["7 kunda", s.d7], ["30 kunda", s.d30], ["Hozir saytda", s.online], ["Jami tashrif buyuruvchi", s.all], ["30 kunda sahifa ko'rishlar", s.views30], ["Mijozlar bazasi", s.cust], ["7 kunda yangi mijoz", s.cust7]];
    var h = '<div class="p-card"><h2 style="margin-top:0">Saytga kiruvchilar</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' +
      kpi.map(function (k) { return '<div style="background:#f5f1ea;border-radius:12px;padding:12px"><small class="p-sub">' + k[0] + '</small><div style="font-size:26px;font-weight:800;color:#12355b">' + (k[1] == null ? "—" : k[1]) + '</div></div>'; }).join("") +
      '</div><p class="p-sub" style="margin-top:10px">"Kirganlar" — alohida brauzer/qurilmalar soni. Mijozlar bazasiga Google yoki e-mail orqali kirgan yoki so\'rov qoldirganlar tushadi.</p></div>';
    h += '<div class="p-card"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;justify-content:space-between"><h2 style="margin:0">Mijozlar bazasi (' + list.length + ')</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input id="cu-q" placeholder="Ism, e-mail yoki telefon" value="' + esc(q) + '" style="min-width:220px"><select id="cu-p"><option value="">Hammasi</option><option value="google"' + (prov === "google" ? " selected" : "") + '>Google</option><option value="email"' + (prov === "email" ? " selected" : "") + '>E-mail</option></select><button class="btn btn--outline btn--sm" id="cu-csv">Excel (CSV) yuklab olish</button></div></div>';
    var f = list.filter(function (c) {
      if (prov && c.provider !== prov) return false;
      if (!q) return true; var t = (c.name + " " + c.email + " " + (c.phone || "")).toLowerCase(); return t.indexOf(q.toLowerCase()) > -1;
    });
    h += f.length ? '<div style="overflow:auto"><table class="tbl" style="margin-top:12px"><thead><tr><th>Mijoz</th><th>Telefon</th><th>Qanday kirgan</th><th>Til</th><th>Birinchi marta</th><th>Oxirgi marta</th><th class="num">Amaliyotlar</th></tr></thead><tbody>' +
      f.map(function (c) { return '<tr class="click" data-cu="' + c.id + '"><td><b>' + esc(c.name || "—") + '</b><br><small>' + esc(c.email) + '</small></td><td>' + esc(c.phone || "—") + '</td><td>' + esc(PROV[c.provider] || c.provider) + '</td><td>' + esc((c.lang || "").toUpperCase()) + '</td><td><small>' + dt(c.first_seen) + '</small></td><td><small>' + dt(c.last_seen) + '</small></td><td class="num">' + (cnt[c.id] || 0) + '</td></tr>'; }).join("") +
      '</tbody></table></div>' : '<p class="p-sub" style="margin-top:12px">Hali mijoz yo\'q.</p>';
    h += '</div>';
    box.innerHTML = h;
    $("#cu-q").oninput = function () { q = this.value; clearTimeout(A._cuT); A._cuT = setTimeout(A.customers, 500); };
    $("#cu-p").onchange = function () { prov = this.value; A.customers(); };
    $("#cu-csv").onclick = function () {
      var rows = [["Ism", "E-mail", "Telefon", "Qanday kirgan", "Til", "Birinchi marta", "Oxirgi marta", "Amaliyotlar"]].concat(f.map(function (c) { return [c.name || "", c.email, c.phone || "", PROV[c.provider] || c.provider, c.lang || "", dt(c.first_seen), dt(c.last_seen), cnt[c.id] || 0]; }));
      var csv = "﻿" + rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";"); }).join("\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "moviy-nomad-mijozlar.csv"; a.click();
    };
    $$("[data-cu]", box).forEach(function (tr) { tr.onclick = function () { A.customer(tr.dataset.cu); }; });
  };

  A.customer = async function (id) {
    A.show("customers");
    var box = $("#v-customers"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var c = (await sb.from("site_customers").select("*").eq("id", id).single()).data;
    if (!c) { box.innerHTML = '<div class="p-card">Topilmadi.</div>'; return; }
    var ev = (await sb.from("site_events").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(500)).data || [];
    var rq = (await sb.from("site_requests").select("id,ref,kind,tour_title,service,start_date,pax,status,price_total,created_at").ilike("email", c.email).order("created_at", { ascending: false })).data || [];
    var vis = (await sb.from("site_visitors").select("visits,pageviews,device,referrer,first_seen").eq("customer_id", id)).data || [];
    var tv = vis.reduce(function (s, v) { return s + (v.visits || 0); }, 0), tp = vis.reduce(function (s, v) { return s + (v.pageviews || 0); }, 0);
    var wa = (c.phone || "").replace(/\D/g, "");
    var h = '<div class="p-card"><button class="btn btn--outline btn--sm" id="cu-back">← Mijozlar bazasi</button>' +
      '<h2 style="margin:12px 0 4px">' + esc(c.name || c.email) + '</h2><p class="p-sub">' + esc(c.email) + (c.phone ? " · " + esc(c.phone) : "") + ' · ' + esc(PROV[c.provider] || c.provider) + ' orqali · til: ' + esc((c.lang || "").toUpperCase()) + '</p>' +
      '<div class="p-actions"><a class="btn btn--gold btn--sm" href="mailto:' + esc(c.email) + '">E-mail yozish</a>' + (wa ? '<a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">WhatsApp</a>' : '') + '</div>' +
      '<div class="kv" style="margin-top:12px"><div><small>Birinchi kirgan</small><b>' + dt(c.first_seen) + '</b></div><div><small>Oxirgi marta</small><b>' + dt(c.last_seen) + '</b></div><div><small>Tashriflar / sahifalar</small><b>' + tv + ' / ' + tp + '</b></div><div><small>Qurilmalar</small><b>' + vis.length + '</b></div></div>' +
      '<div class="fld" style="margin-top:12px"><label>Izoh (faqat siz ko\'rasiz)</label><textarea id="cu-notes" rows="2">' + esc(c.notes || "") + '</textarea></div><button class="btn btn--outline btn--sm" id="cu-save">Izohni saqlash</button><span class="msg" id="m-cu" style="margin-left:8px"></span></div>';
    h += '<div class="p-card"><h3>So\'rov va bronlari (' + rq.length + ')</h3>' + (rq.length ? '<table class="tbl"><tbody>' + rq.map(function (x) { return '<tr class="click" data-rq="' + x.id + '"><td><b>' + esc(x.ref) + '</b><br><small>' + dt(x.created_at) + '</small></td><td>' + esc(x.tour_title || x.service || x.kind || "") + '</td><td>' + P.date(x.start_date) + ' · ' + (x.pax || "—") + ' kishi</td><td>' + (x.price_total ? P.money(x.price_total) : "—") + '</td><td>' + esc(x.status) + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali so\'rov yo\'q.</p>') + '</div>';
    h += '<div class="p-card"><h3>Saytdagi amaliyotlari (' + ev.length + ')</h3>' + (ev.length ? '<table class="tbl"><tbody>' + ev.map(function (e) { return '<tr><td style="white-space:nowrap"><small>' + dt(e.created_at) + '</small></td><td><b>' + esc(EV[e.event] || e.event) + '</b></td><td><small>' + esc(e.detail || "") + '</small></td><td><small>' + esc(e.page || "") + '</small></td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali yo\'q.</p>') + '</div>';
    box.innerHTML = h;
    $("#cu-back").onclick = A.customers;
    $("#cu-save").onclick = async function () { var r = await sb.from("site_customers").update({ notes: $("#cu-notes").value }).eq("id", id); P.msg("#m-cu", r.error ? r.error.message : "Saqlandi", r.error ? "err" : "ok"); };
    $$("[data-rq]", box).forEach(function (tr) { tr.onclick = function () { if (A.openRequest) A.openRequest(tr.dataset.rq); else A.requests(); }; });
  };
})();
