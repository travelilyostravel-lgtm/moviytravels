/* Moviy Nomad — admin: visitors & customer base (founder only). UI in Uzbek.
   Numbers of visitors, the list of signed-in customers, and each customer's card with every action. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var EV = { visit: "Saytga kirdi", page: "Sahifani ko'rdi", click: "Bosdi", contact: "Bog'lanish tugmasi", signin: "Ro'yxatdan o'tdi", signin_start: "Google orqali kirishni boshladi", signin_later: "\"Keyinroq\" ni bosdi", video: "Video ko'rdi", request: "So'rov / bron yubordi", subscribe: "🔔 Obuna bo'ldi", subscribe_prompt: "Obuna oynasi ko'rindi" };
  var PROV = { google: "Google", email: "E-mail", facebook: "Facebook" };
  var ACS = { none: "—", pending: "⏳ tasdiq kutmoqda", approved: "✅ ochiq", blocked: "⛔ yopiq" };
  var OBE = { request_new: "So'rov qabul qilindi", booking_new: "Agent broni", confirm: "Bron tasdiqlandi (30%)", received: "To'lov qabul qilindi", voucher: "Vaucherlar", cancel: "Bekor qilindi", reminder: "Eslatma", final: "Oxirgi eslatma",
    admin_new: "Ofisga: yangi so'rov", admin_paid: "Ofisga: to'lov", message: "Mijozga: yangi xabar", admin_msg: "Ofisga: mijoz yozdi", admin_reg: "Ofisga: kabinet so'rovi", account_ok: "Mijozga: kabinet ochildi" };
  // red badges on the tabs: unread client messages and cabinet requests waiting for approval
  A.inbox = async function () {
    var r = await sb.rpc("staff_inbox"); if (r.error || !r.data) return;
    var put = function (sel, n, title) { var b = document.querySelector(sel); if (!b) return; var i = b.querySelector(".tab-dot"); if (!i) { i = document.createElement("b"); i.className = "tab-dot"; i.style.cssText = "background:#e53935;color:#fff;border-radius:9px;padding:0 6px;margin-inline-start:6px;font-size:11px"; b.appendChild(i); } i.textContent = n; i.title = title; i.style.display = n ? "" : "none"; };
    put('[data-view="requests"]', r.data.unread || 0, "Mijozlardan o'qilmagan xabarlar");
    put('[data-view="customers"]', (r.data.pending || 0) + (r.data.unread || 0), "Kabinet so'rovlari va o'qilmagan xabarlar");
  };
  // red banner at the top: new messages from B2C clients and new B2C requests (checked every 15 s)
  var T0 = document.title, lastN = -1;
  A.alertBar = async function () {
    var m = await sb.from("request_messages").select("request_id,customer_id,body,created_at,site_customers(name,email)").eq("author", "client").is("read_at", null).order("created_at", { ascending: false }).limit(20);
    var q = await sb.from("site_requests").select("id,ref,contact_name,created_at").eq("status", "new").order("created_at", { ascending: false }).limit(20);
    var M = (m.data || []), Q = (q.data || []), n = M.length + Q.length;
    var bar = document.getElementById("mn-alert");
    if (!bar) {
      bar = document.createElement("div"); bar.id = "mn-alert";
      bar.style.cssText = "position:sticky;top:0;z-index:50;background:#e53935;color:#fff;font-weight:700;padding:10px 16px;display:none;box-shadow:0 4px 14px rgba(229,57,53,.35)";
      var tabs = document.getElementById("tabs"); (tabs && tabs.parentNode ? tabs.parentNode : document.body).insertAdjacentElement("afterend", bar);
      var st = document.createElement("style"); st.textContent = "@keyframes mnPulse{0%,100%{opacity:1}50%{opacity:.75}}#mn-alert{animation:mnPulse 1.6s ease-in-out infinite}#mn-alert a{color:#fff;text-decoration:underline;cursor:pointer;margin-inline-start:12px;font-weight:600}#mn-alert .x{float:right;background:none;border:0;color:#fff;font-size:18px;cursor:pointer;line-height:1}";
      document.head.appendChild(st);
    }
    if (!n) { bar.style.display = "none"; document.title = T0; lastN = 0; return; }
    var who = function (x) { var c = x.site_customers || {}; return c.name || c.email || "mijoz"; };
    var h = '<div class="container">';
    if (M.length) h += '🔴 Mijozdan ' + M.length + ' ta yangi xabar: ' + M.slice(0, 3).map(function (x, i) { return '<a data-am="' + i + '">' + esc(who(x)) + ' — «' + esc(String(x.body || "").slice(0, 40)) + '»</a>'; }).join("");
    if (Q.length) h += (M.length ? '<br>' : '') + '🆕 Yangi B2C so\'rov: ' + Q.length + ' ta ' + Q.slice(0, 3).map(function (x) { return '<a data-aq="' + x.id + '">' + esc(x.ref) + (x.contact_name ? ' · ' + esc(x.contact_name) : '') + '</a>'; }).join("");
    bar.innerHTML = h + '</div>'; bar.style.display = "block";
    bar.querySelectorAll("[data-am]").forEach(function (a) { a.onclick = function () { var x = M[+a.dataset.am]; if (x.request_id && A.openRequest) A.openRequest(x.request_id); else if (x.customer_id && A.customer) A.customer(x.customer_id); setTimeout(function () { A.alertBar(); A.inbox(); }, 2500); }; });
    bar.querySelectorAll("[data-aq]").forEach(function (a) { a.onclick = function () { A.openRequest && A.openRequest(a.dataset.aq); }; });
    document.title = "(" + n + ") 🔴 " + T0;
    if (lastN >= 0 && n > lastN) { try { var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(ac.destination); o.start(); setTimeout(function () { o.stop(); ac.close(); }, 250); } catch (e) {} }
    lastN = n;
  };
  setTimeout(A.inbox, 2500); setInterval(A.inbox, 15000);
  setTimeout(function () { A.alertBar().catch(function () {}); }, 3000); setInterval(function () { A.alertBar().catch(function () {}); }, 15000);
  function dt(s) { return s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"; }
  var q = "", prov = "";

  A.customers = async function () {
    A.show("customers");
    var box = $("#v-customers"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var s = (await sb.rpc("visitor_stats")).data || {};
    var r = await sb.from("site_customers").select("*").order("last_seen", { ascending: false }).limit(1000);
    var list = r.data || [];
    var unr = {}; ((await sb.from("request_messages").select("customer_id").eq("author", "client").is("read_at", null).limit(5000)).data || []).forEach(function (m) { unr[m.customer_id] = (unr[m.customer_id] || 0) + 1; });
    list.sort(function (a, b) { return (unr[b.id] ? 1 : 0) - (unr[a.id] ? 1 : 0); });
    var cnt = {}; ((await sb.from("site_events").select("customer_id").not("customer_id", "is", null).limit(20000)).data || []).forEach(function (e) { cnt[e.customer_id] = (cnt[e.customer_id] || 0) + 1; });
    var kpi = [["Bugun kirganlar", s.today], ["7 kunda", s.d7], ["30 kunda", s.d30], ["Hozir saytda", s.online], ["Jami tashrif buyuruvchi", s.all], ["30 kunda sahifa ko'rishlar", s.views30], ["Mijozlar bazasi", s.cust], ["7 kunda yangi mijoz", s.cust7]];
    var h = '<div class="p-card"><h2 style="margin-top:0">Saytga kiruvchilar</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' +
      kpi.map(function (k) { return '<div style="background:#f5f1ea;border-radius:12px;padding:12px"><small class="p-sub">' + k[0] + '</small><div style="font-size:26px;font-weight:800;color:#12355b">' + (k[1] == null ? "—" : k[1]) + '</div></div>'; }).join("") +
      '</div><p class="p-sub" style="margin-top:10px">"Kirganlar" — alohida brauzer/qurilmalar soni. Mijozlar bazasiga Google yoki e-mail orqali kirgan yoki so\'rov qoldirganlar tushadi.</p></div>';
    var pend = list.filter(function (c) { return c.account_status === "pending"; });
    if (pend.length) h += '<div class="p-card" style="border:2px solid #e53935"><h2 style="margin-top:0">🔴 Kabinet ochish so\'rovlari (' + pend.length + ')</h2><p class="p-sub">Mijoz saytda "Kabinetim" orqali ro\'yxatdan o\'tdi. Tasdiqlasangiz — kabineti ochiladi va unga xat ketadi.</p><table class="tbl"><tbody>' +
      pend.map(function (c) { return '<tr><td><b>' + esc(c.name || "—") + '</b><br><small>' + esc(c.email) + (c.phone ? " · " + esc(c.phone) : "") + '</small></td><td><small>' + dt(c.account_requested_at) + '</small></td><td style="text-align:right;white-space:nowrap"><button class="btn btn--green btn--sm" data-acc="' + c.id + '" data-s="approved">✓ Tasdiqlash</button> <button class="btn btn--outline btn--sm" data-acc="' + c.id + '" data-s="blocked">Rad etish</button> <button class="btn btn--outline btn--sm" data-cu="' + c.id + '">Kartasi</button></td></tr>'; }).join("") + '</tbody></table></div>';
    h += '<div class="p-card"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;justify-content:space-between"><h2 style="margin:0">Mijozlar bazasi (' + list.length + ')</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input id="cu-q" placeholder="Ism, e-mail yoki telefon" value="' + esc(q) + '" style="min-width:220px"><select id="cu-p"><option value="">Hammasi</option><option value="google"' + (prov === "google" ? " selected" : "") + '>Google</option><option value="email"' + (prov === "email" ? " selected" : "") + '>E-mail</option></select><button class="btn btn--outline btn--sm" id="cu-csv">Excel (CSV) yuklab olish</button></div></div>';
    var f = list.filter(function (c) {
      if (prov && c.provider !== prov) return false;
      if (!q) return true; var t = (c.name + " " + c.email + " " + (c.phone || "")).toLowerCase(); return t.indexOf(q.toLowerCase()) > -1;
    });
    h += f.length ? '<div style="overflow:auto"><table class="tbl" style="margin-top:12px"><thead><tr><th>Mijoz</th><th>Telefon</th><th>Qanday kirgan</th><th>Til</th><th>Birinchi marta</th><th>Oxirgi marta</th><th class="num">Amaliyotlar</th><th>Kabinet</th></tr></thead><tbody>' +
      f.map(function (c) { return '<tr class="click" data-cu="' + c.id + '"><td><b>' + esc(c.name || "—") + '</b><br><small>' + esc(c.email) + '</small></td><td>' + esc(c.phone || "—") + '</td><td>' + esc(PROV[c.provider] || c.provider) + '</td><td>' + esc((c.lang || "").toUpperCase()) + '</td><td><small>' + dt(c.first_seen) + '</small></td><td><small>' + dt(c.last_seen) + '</small></td><td class="num">' + (cnt[c.id] || 0) + '</td><td><small>' + (ACS[c.account_status] || "—") + (unr[c.id] ? ' <b style="color:#e53935">🔴 ' + unr[c.id] + '</b>' : '') + '</small></td></tr>'; }).join("") +
      '</tbody></table></div>' : '<p class="p-sub" style="margin-top:12px">Hali mijoz yo\'q.</p>';
    h += '</div>';
    // automatic e-mails (notify_outbox): what went out and what failed
    var ob = (await sb.from("notify_outbox").select("created_at,event,to_email,status,error,attempts,sent_at").order("created_at", { ascending: false }).limit(40)).data || [];
    var obc = { pending: 0, sent: 0, error: 0, expired: 0 }; ob.forEach(function (o) { obc[o.status] = (obc[o.status] || 0) + 1; });
    h += '<div class="p-card"><h2 style="margin-top:0">✉ Avtomatik xatlar (oxirgi 40)</h2><p class="p-sub">Yuborildi: <b>' + obc.sent + '</b> · Navbatda: <b>' + obc.pending + '</b> · Xato: <b style="color:#c62828">' + obc.error + '</b> · Muddati o\'tdi: ' + obc.expired +
      (obc.pending && !obc.sent ? ' — <b style="color:#c62828">xatlar ketmayapti: Resend domeni (moviy-travel.uz) hali tasdiqlanmagan. Eskiz\'da 3 ta DNS yozuvini qo\'shish kerak (asoschi jadvalida).</b>' : '') + '</p>' +
      (ob.length ? '<div style="overflow:auto;max-height:360px"><table class="tbl"><thead><tr><th>Vaqt</th><th>Xat</th><th>Kimga</th><th>Holat</th><th>Xato</th></tr></thead><tbody>' + ob.map(function (o) {
        return '<tr><td><small>' + dt(o.created_at) + '</small></td><td>' + esc(OBE[o.event] || o.event) + '</td><td><small>' + esc(o.to_email) + '</small></td><td>' + ({ sent: "✅ ketdi", pending: "⏳ navbatda", error: "❌ xato", expired: "⌛ eskirdi" }[o.status] || o.status) + '</td><td><small style="color:' + (o.status === "sent" ? "#5f6b7a" : "#c62828") + '">' + esc(o.error || "") + '</small></td></tr>'; }).join("") + '</tbody></table></div>' : '<p class="p-sub">Hali xat yo\'q.</p>') + '</div>';
    box.innerHTML = h;
    $$("[data-acc]", box).forEach(function (b) { b.onclick = async function () { b.disabled = true; var u = await sb.rpc("cabinet_set_status", { p_customer: b.dataset.acc, p_status: b.dataset.s }); if (u.error) { b.disabled = false; return alert(u.error.message); } A.inbox(); A.customers(); }; });
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
    var rq = (await sb.from("site_requests").select("id,ref,kind,tour_title,service,start_date,pax,status,price_total,created_at").or("customer_id.eq." + id + ",email.ilike." + c.email).order("created_at", { ascending: false })).data || [];
    var vis = (await sb.from("site_visitors").select("visits,pageviews,device,referrer,first_seen").eq("customer_id", id)).data || [];
    var tv = vis.reduce(function (s, v) { return s + (v.visits || 0); }, 0), tp = vis.reduce(function (s, v) { return s + (v.pageviews || 0); }, 0);
    var wa = (c.phone || "").replace(/\D/g, "");
    var h = '<div class="p-card"><button class="btn btn--outline btn--sm" id="cu-back">← Mijozlar bazasi</button>' +
      '<h2 style="margin:12px 0 4px">' + esc(c.name || c.email) + '</h2><p class="p-sub">' + esc(c.email) + (c.phone ? " · " + esc(c.phone) : "") + ' · ' + esc(PROV[c.provider] || c.provider) + ' orqali · til: ' + esc((c.lang || "").toUpperCase()) + '</p>' +
      '<div class="p-actions"><a class="btn btn--gold btn--sm" href="mailto:' + esc(c.email) + '">E-mail yozish</a>' + (wa ? '<a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">WhatsApp</a>' : '') + '</div>' +
      '<div class="kv" style="margin-top:12px"><div><small>Birinchi kirgan</small><b>' + dt(c.first_seen) + '</b></div><div><small>Oxirgi marta</small><b>' + dt(c.last_seen) + '</b></div><div><small>Tashriflar / sahifalar</small><b>' + tv + ' / ' + tp + '</b></div><div><small>Qurilmalar</small><b>' + vis.length + '</b></div></div>' +
      '<div class="fld" style="margin-top:12px"><label>Izoh (faqat siz ko\'rasiz)</label><textarea id="cu-notes" rows="2">' + esc(c.notes || "") + '</textarea></div><button class="btn btn--outline btn--sm" id="cu-save">Izohni saqlash</button><span class="msg" id="m-cu" style="margin-left:8px"></span></div>';
    var st = c.account_status || "none";
    h += '<div class="p-card"><h3>👤 Saytdagi kabineti: ' + (ACS[st] === "—" ? "ochmagan" : ACS[st]) + '</h3><p class="p-sub">' + (st === "pending" ? "Mijoz ro'yxatdan o'tdi, tasdiq kutmoqda (" + dt(c.account_requested_at) + ")." : st === "approved" ? "Tasdiqlangan: " + dt(c.approved_at) + ". Mijoz o'z so'rovlari, to'lovlari, hujjatlari va xabarlarini ko'radi (ichki izoh, netto, komissiya ko'rinmaydi)." : st === "blocked" ? "Kabinet yopiq." : "Mijoz hali kabinet ochmagan. Unga yozgan xabaringiz e-mail bilan boradi; kabinet ochsa saytda ham ko'radi.") + '</p><div class="p-actions">' +
      (st !== "approved" ? '<button class="btn btn--green btn--sm" data-acc="approved">✓ Kabinetni ochish / tasdiqlash</button>' : '') + (st === "approved" || st === "pending" ? '<button class="btn btn--outline btn--sm" data-acc="blocked">Kabinetni yopish</button>' : '') + '</div></div>';
    h += '<div class="p-card"><h3>💬 Yozishma (mijoz kabinetida ko\'rinadi)</h3><div id="cu-thread"><p class="p-sub">…</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><select id="cu-rq"><option value="">Umumiy xabar</option>' + rq.map(function (x) { return '<option value="' + x.id + '">' + esc(x.ref) + ' — ' + esc(x.tour_title || x.service || x.kind || "") + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld" style="margin-top:6px"><textarea id="cu-cm" rows="3" maxlength="3000" placeholder="Mijozga yozing…"></textarea></div><button class="btn btn--gold btn--sm" id="cu-send">Mijozga yuborish</button> <span class="msg" id="m-cm"></span></div>';
    h += '<div class="p-card"><h3>So\'rov va bronlari (' + rq.length + ')</h3>' + (rq.length ? '<table class="tbl"><tbody>' + rq.map(function (x) { return '<tr class="click" data-rq="' + x.id + '"><td><b>' + esc(x.ref) + '</b><br><small>' + dt(x.created_at) + '</small></td><td>' + esc(x.tour_title || x.service || x.kind || "") + '</td><td>' + P.date(x.start_date) + ' · ' + (x.pax || "—") + ' kishi</td><td>' + (x.price_total ? P.money(x.price_total) : "—") + '</td><td>' + esc(x.status) + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali so\'rov yo\'q.</p>') + '</div>';
    h += '<div class="p-card"><h3>Saytdagi amaliyotlari (' + ev.length + ')</h3>' + (ev.length ? '<table class="tbl"><tbody>' + ev.map(function (e) { return '<tr><td style="white-space:nowrap"><small>' + dt(e.created_at) + '</small></td><td><b>' + esc(EV[e.event] || e.event) + '</b></td><td><small>' + esc(e.detail || "") + '</small></td><td><small>' + esc(e.page || "") + '</small></td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali yo\'q.</p>') + '</div>';
    box.innerHTML = h;
    $("#cu-back").onclick = A.customers;
    $("#cu-save").onclick = async function () { var r = await sb.from("site_customers").update({ notes: $("#cu-notes").value }).eq("id", id); P.msg("#m-cu", r.error ? r.error.message : "Saqlandi", r.error ? "err" : "ok"); };
    $$("[data-rq]", box).forEach(function (tr) { tr.onclick = function () { if (A.openRequest) A.openRequest(tr.dataset.rq); else A.requests(); }; });
    $$("[data-acc]", box).forEach(function (b) { b.onclick = async function () { b.disabled = true; var u = await sb.rpc("cabinet_set_status", { p_customer: id, p_status: b.dataset.acc }); if (u.error) { b.disabled = false; return alert(u.error.message); } A.inbox(); A.customer(id); }; });
    async function thread() {
      var m = await sb.from("request_messages").select("*").eq("customer_id", id).order("created_at");
      var ref = {}; rq.forEach(function (x) { ref[x.id] = x.ref; });
      $("#cu-thread").innerHTML = m.error ? '<div class="msg msg--err">' + esc(m.error.message) + '</div>' : (A.bubbles ? A.bubbles(m.data || []) : "").replace(/ · umumiy/g, " · umumiy");
      if ((m.data || []).some(function (x) { return x.author === "client" && !x.read_at; })) sb.rpc("staff_read", { p_customer: id }).then(A.inbox);
    }
    thread();
    $("#cu-send").onclick = async function () {
      var b = $("#cu-cm").value.trim(); if (!b) return P.msg("#m-cm", "Matn yozing", "err");
      this.disabled = true;
      var u = await sb.from("request_messages").insert({ customer_id: id, request_id: $("#cu-rq").value || null, author: "admin", body: b });
      this.disabled = false;
      if (u.error) return P.msg("#m-cm", u.error.message, "err");
      $("#cu-cm").value = ""; P.msg("#m-cm", "Yuborildi", "ok"); thread();
    };
  };
})();
