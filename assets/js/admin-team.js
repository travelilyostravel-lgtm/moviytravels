/* Moviy Nomad — admin: team of managers (founder only).
   Managers, invitations, devices to approve, each manager's numbers, and the manager filter used in
   "Mijoz so'rovlari" and "Bronlar". UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;

  // ---- shared: staff list + manager filter (founder only)
  A.staffCache = null;
  A.staffList = async function (force) {
    if (A.staffCache && !force) return A.staffCache;
    var r = await sb.from("profiles").select("id,full_name,email,role,active,last_assigned_at,created_at").in("role", ["admin", "manager"]).order("created_at");
    A.staffCache = r.data || []; return A.staffCache;
  };
  A.staffName = function (id) { var s = (A.staffCache || []).filter(function (x) { return x.id === id; })[0]; return s ? (s.full_name || s.email) : ""; };
  // mgrFilter: [] = everyone; otherwise list of manager ids and/or "none" (unassigned)
  try { A.mgrFilter = JSON.parse(sessionStorage.getItem("mn_mgrf") || "[]"); } catch (e) { A.mgrFilter = []; }
  A.mgrPass = function (id) { return !A.mgrFilter.length || A.mgrFilter.indexOf(id || "none") > -1; };
  A.mgrChips = async function (holder, onChange) {
    if (A.role !== "admin" || !holder) return;
    var st = (await A.staffList()).filter(function (s) { return s.role === "manager"; });
    if (!st.length) { holder.innerHTML = ""; return; }
    var opts = [["", "Hammasi"], ["none", "Tayinlanmagan"]].concat(st.map(function (s) { return [s.id, s.full_name || s.email]; }));
    holder.innerHTML = '<span class="p-sub" style="margin-right:6px">Menejer:</span>' + opts.map(function (o) {
      var on = o[0] === "" ? !A.mgrFilter.length : A.mgrFilter.indexOf(o[0]) > -1;
      return '<button data-m="' + o[0] + '" class="' + (on ? "is-on" : "") + '">' + esc(o[1]) + '</button>';
    }).join("") + '<small class="p-sub" style="margin-left:6px">(bir nechtasini tanlash mumkin)</small>';
    $$("button", holder).forEach(function (b) {
      b.onclick = function () {
        var m = b.dataset.m;
        if (!m) A.mgrFilter = [];
        else { var i = A.mgrFilter.indexOf(m); if (i > -1) A.mgrFilter.splice(i, 1); else A.mgrFilter.push(m); }
        try { sessionStorage.setItem("mn_mgrf", JSON.stringify(A.mgrFilter)); } catch (e) {}
        onChange();
      };
    });
  };
  A.mgrSelect = async function (current, id) {
    var st = (await A.staffList()).filter(function (s) { return s.role === "manager" && s.active; });
    return '<select id="' + id + '"><option value="">— tayinlanmagan (asoschida) —</option>' + st.map(function (s) { return '<option value="' + s.id + '"' + (s.id === current ? " selected" : "") + '>' + esc(s.full_name || s.email) + '</option>'; }).join("") + '</select>';
  };

  // ---- badge on the "Jamoa" tab when a device waits for approval
  A.teamBadge = async function () {
    var r = await sb.from("admin_devices").select("id", { count: "exact", head: true }).eq("approved", false);
    var b = $('#tabs button[data-view="team"]'); if (!b) return;
    b.textContent = "Jamoa" + (r.count ? " 🔴 " + r.count : "");
  };

  var RSN = { new: "Yangi", in_progress: "Ishlanmoqda", awaiting_payment: "30% kutilmoqda", deposit_paid: "70% kutilmoqda", paid: "To'landi", confirmed: "Tasdiqlandi", closed: "Yopildi", cancelled: "Bekor" };

  A.team = async function () {
    A.show("team");
    var box = $("#v-team"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var st = await A.staffList(true), mg = st.filter(function (s) { return s.role === "manager"; });
    var dv = (await sb.from("admin_devices").select("*").order("created_at", { ascending: false })).data || [];
    var inv = (await sb.from("staff_invites").select("*").order("created_at", { ascending: false })).data || [];
    var rq = (await sb.from("site_requests").select("assigned_to,status,price_total,paid_total,created_at").limit(5000)).data || [];
    var ag = (await sb.from("agencies").select("id,manager_id,status")).data || [];
    var bk = (await sb.from("bookings").select("agency_id,status,netto")).data || [];
    var agM = {}; ag.forEach(function (a) { agM[a.id] = a.manager_id || "none"; });
    function stats(id) {
      var R = rq.filter(function (x) { return (x.assigned_to || "none") === id; });
      var open = R.filter(function (x) { return ["closed", "cancelled", "confirmed"].indexOf(x.status) < 0; }).length;
      var sum = R.reduce(function (s, x) { return s + (+x.price_total || 0); }, 0), paid = R.reduce(function (s, x) { return s + (+x.paid_total || 0); }, 0);
      var B = bk.filter(function (b) { return agM[b.agency_id] === id; });
      var by = {}; R.forEach(function (x) { by[x.status] = (by[x.status] || 0) + 1; });
      return { all: R.length, open: open, sum: sum, paid: paid, ag: ag.filter(function (a) { return (a.manager_id || "none") === id; }).length, bk: B.length, bkSum: B.reduce(function (s, b) { return s + (+b.netto || 0); }, 0), by: by };
    }
    var pend = dv.filter(function (d) { return !d.approved; });
    var h = '';
    if (pend.length) h += '<div class="p-card" style="border:2px solid #c8553d"><h3>🔴 Tasdiq kutayotgan qurilmalar</h3><table class="tbl"><tbody>' + pend.map(function (d) {
      return '<tr><td><b>' + esc(A.staffName(d.user_id)) + '</b><br><small>' + new Date(d.created_at).toLocaleString("ru-RU") + '</small></td><td><small>' + esc(d.label || "") + '</small></td><td style="white-space:nowrap"><button class="btn btn--green btn--sm" data-ok="' + d.id + '">Tasdiqlash</button> <button class="btn btn--outline btn--sm" data-no="' + d.id + '">Rad etish</button></td></tr>';
    }).join("") + '</tbody></table></div>';
    // overview table
    var rows = mg.map(function (m) { var s = stats(m.id); return [m, s]; });
    var un = stats("none");
    h += '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">Jamoa — umumiy ko\'rinish</h2><small class="p-sub">Yangi so\'rovlar va agentliklar faol menejerlarga navbat bilan o\'zi beriladi.</small></div>' +
      '<div style="overflow:auto"><table class="tbl" style="margin-top:12px"><thead><tr><th>Menejer</th><th>Holat</th><th class="num">Ochiq so\'rov</th><th class="num">Jami so\'rov</th><th class="num">Sotuv (USD)</th><th class="num">Tushgan</th><th class="num">Agentlik / bron</th><th>Holatlar</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        var m = r[0], s = r[1];
        return '<tr><td><b>' + esc(m.full_name || "—") + '</b><br><small>' + esc(m.email) + '</small></td><td>' + (m.active ? '<span class="badge-s st-confirmed">Faol</span>' : '<span class="badge-s st-cancelled">To\'xtatilgan</span>') + '</td>' +
          '<td class="num"><b>' + s.open + '</b></td><td class="num">' + s.all + '</td><td class="num">' + P.money(s.sum) + '</td><td class="num">' + P.money(s.paid) + '</td><td class="num">' + s.ag + ' / ' + s.bk + '</td>' +
          '<td><small>' + Object.keys(s.by).map(function (k) { return esc(RSN[k] || k) + ": " + s.by[k]; }).join(" · ") + '</small></td>' +
          '<td style="white-space:nowrap"><button class="btn btn--gold btn--sm" data-view-m="' + m.id + '">Kabinetini ko\'rish</button> <button class="btn btn--outline btn--sm" data-act="' + m.id + '">' + (m.active ? "To\'xtatish" : "Faollashtirish") + '</button></td></tr>';
      }).join("") +
      '<tr><td><b>Tayinlanmagan</b><br><small>asoschida</small></td><td></td><td class="num"><b>' + un.open + '</b></td><td class="num">' + un.all + '</td><td class="num">' + P.money(un.sum) + '</td><td class="num">' + P.money(un.paid) + '</td><td class="num">' + un.ag + ' / ' + un.bk + '</td><td></td><td><button class="btn btn--outline btn--sm" data-view-m="none">Ko\'rish</button></td></tr>' +
      '</tbody></table></div>' + (mg.length ? '<p class="p-sub" style="margin-top:10px">Bir nechta menejerni birga ko\'rish: "Mijoz so\'rovlari" yoki "Bronlar" tepasidagi menejer tugmalaridan bir nechtasini bosing.</p>' : '') + '</div>';
    // invite
    h += '<div class="p-card"><h3>Yangi menejer qo\'shish</h3><p class="p-sub">1) Bu yerga menejerning e-mailini yozing. 2) Unga admin panel havolasini yuboring: u "Yangi xodim: ro\'yxatdan o\'tish"ni bosib, shu e-mail va o\'z paroli bilan ro\'yxatdan o\'tadi. 3) Birinchi kirishda telefoniga Google Authenticator ulaydi (ikki bosqichli kod). 4) U kirgan birinchi qurilma o\'zi tasdiqlanadi; boshqa qurilmadan kirsa — siz shu sahifada tasdiqlaysiz.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><div class="fld"><label>Ism familiya</label><input id="i-name"></div><div class="fld"><label>E-mail</label><input type="email" id="i-email"></div><button class="btn btn--gold btn--sm" id="i-add">Qo\'shish</button>' +
      '<a class="btn btn--outline btn--sm" id="i-link" target="_blank" rel="noopener">Taklif xatini yuborish</a></div><div class="msg" id="m-inv"></div>' +
      (inv.length ? '<table class="tbl" style="margin-top:10px"><tbody>' + inv.map(function (i) { return '<tr><td><b>' + esc(i.full_name || "") + '</b></td><td>' + esc(i.email) + '</td><td>' + (i.used_at ? '✅ ro\'yxatdan o\'tgan' : '⏳ kutilmoqda') + '</td><td>' + (i.used_at ? '' : '<button class="btn btn--outline btn--sm" data-inv-del="' + esc(i.email) + '">O\'chirish</button>') + '</td></tr>'; }).join("") + '</tbody></table>' : '') + '</div>';
    // devices
    var ok = dv.filter(function (d) { return d.approved; });
    h += '<div class="p-card"><h3>Tasdiqlangan qurilmalar</h3>' + (ok.length ? '<table class="tbl"><tbody>' + ok.map(function (d) {
      return '<tr><td><b>' + esc(A.staffName(d.user_id)) + '</b></td><td><small>' + esc(d.label || "") + '</small></td><td><small>Oxirgi kirish: ' + (d.last_seen ? new Date(d.last_seen).toLocaleString("ru-RU") : "—") + '</small></td><td><button class="btn btn--outline btn--sm" data-no="' + d.id + '">Bekor qilish</button></td></tr>';
    }).join("") + '</tbody></table>' : '<p class="p-sub">Hali yo\'q.</p>') + '</div>';
    box.innerHTML = h;
    var adminUrl = location.origin + location.pathname;
    function invLink() {
      var n = $("#i-name").value.trim(), e = $("#i-email").value.trim();
      $("#i-link").href = "mailto:" + encodeURIComponent(e) + "?subject=" + encodeURIComponent("Moviy Nomad — admin panelga taklif") + "&body=" + encodeURIComponent("Assalomu alaykum" + (n ? ", " + n : "") + "!\n\nSizni Moviy Nomad jamoasiga menejer sifatida qo'shdim.\n1) Shu havolani oching: " + adminUrl + "\n2) \"Yangi xodim: ro'yxatdan o'tish\" — shu e-mail (" + e + ") va o'zingiz o'ylagan parol bilan.\n3) E-mailga kelgan tasdiqlash havolasini bosing.\n4) Kirishda telefoningizga Google Authenticator ilovasini o'rnatib, QR kodni skanerlaysiz.\n\nParolingizni hech kimga bermang.");
    }
    $("#i-name").oninput = $("#i-email").oninput = invLink; invLink();
    $("#i-add").onclick = async function () {
      var e = $("#i-email").value.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return P.msg("#m-inv", "E-mailni to'g'ri yozing", "err");
      var r = await sb.from("staff_invites").upsert({ email: e, full_name: $("#i-name").value.trim() || null, used_at: null });
      if (r.error) return P.msg("#m-inv", r.error.message, "err");
      P.msg("#m-inv", "Qo'shildi. Endi \"Taklif xatini yuborish\"ni bosing.", "ok"); setTimeout(A.team, 1500);
    };
    $$("[data-inv-del]", box).forEach(function (b) { b.onclick = async function () { await sb.from("staff_invites").delete().eq("email", b.dataset.invDel); A.team(); }; });
    $$("[data-ok]", box).forEach(function (b) { b.onclick = async function () { await sb.from("admin_devices").update({ approved: true, approved_at: new Date().toISOString() }).eq("id", b.dataset.ok); A.teamBadge(); A.team(); }; });
    $$("[data-no]", box).forEach(function (b) { b.onclick = async function () { await sb.from("admin_devices").delete().eq("id", b.dataset.no); A.teamBadge(); A.team(); }; });
    $$("[data-act]", box).forEach(function (b) { b.onclick = async function () { var m = mg.filter(function (x) { return x.id === b.dataset.act; })[0]; await sb.from("profiles").update({ active: !m.active }).eq("id", m.id); A.team(); }; });
    $$("[data-view-m]", box).forEach(function (b) { b.onclick = function () { A.mgrFilter = [b.dataset.viewM]; try { sessionStorage.setItem("mn_mgrf", JSON.stringify(A.mgrFilter)); } catch (e) {} A.requests(); }; });
  };
})();
