/* Moviy Nomad — admin: guaranteed group departures (fixed-date group tours, English guides).
 * Admins add departures one by one or generate a whole season as drafts, then publish.
 * Visitors see only published upcoming departures (price, seats left) — never costs or notes. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P && P.sb, A = window.MNA = window.MNA || {};
  var KN = { small: "Kichik guruh (12–17)", medium: "O'rta guruh (30–35)", large: "Katta guruh (45–50)" };
  var VH = { minibus: "Mikroavtobus (1 gid)", bus: "Avtobus (2 gid)", bus50: "50 o'rinli avtobus (2 gid)" };
  if (!sb) return;
  var $ = P.$, $$ = P.$$, esc = P.esc, E = window.MN_ENGINE, C = window.MN_CATALOG, TOURS = window.MN_TOURS || {}, L = window.MN_L || {};
  var ST = { open: "Bron ochiq", guaranteed: "Kafolatlangan", full: "Joy qolmadi", cancelled: "Bekor qilingan" };
  var ROOM = { twin_share: "Ikki kishilik (sherik bilan)", twin: "Ikki kishilik (o'zlari)", single: "Bir kishilik" };
  var MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  var WD = [["6", "Shanba"], ["0", "Yakshanba"], ["1", "Dushanba"], ["2", "Seshanba"], ["3", "Chorshanba"], ["4", "Payshanba"], ["5", "Juma"]];
  var costsLoaded = false, all = [], reqs = [];

  function title(id) { return ((L.tours || {})[id] || [id])[0]; }
  function days(id) { return ((TOURS[id] || {}).days || []).length || 1; }
  function uzTours() { return Object.keys(TOURS).filter(function (k) { return TOURS[k].country === "UZ" || TOURS[k].country === "CA"; }); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function d0(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function endDate(x) { var d = d0(x.start_date); d.setDate(d.getDate() + days(x.tour_id) - 1); return iso(d); }
  function n(v) { var x = parseFloat(String(v).replace(",", ".")); return isFinite(x) ? x : null; }
  function money(v) { return v == null ? "—" : "$" + Math.round(v).toLocaleString("en"); }

  async function ensureCosts() {
    if (costsLoaded || !E) return;
    var r = await sb.from("price_config").select("id,data").eq("id", "costs");
    if (!r.error && r.data && r.data[0]) E.applyPrices(r.data[0].data);
    costsLoaded = true;
  }
  // Estimated cost per person for a group of `pax` with `guides` guides (comfort hotels, bus)
  function estimate(tid, pax, guides, cls) {
    var T = TOURS[tid]; if (!T || !E) return null;
    var p = E.price(Object.assign({ id: tid }, T), { pax: pax, hotel: cls || "comfort", lang: "en" });
    var extraGuides = Math.max(0, (guides || 1) - 1) * C.guide.day * Math.max(1, p.days - 1) / pax;
    var cost = p.cost + extraGuides;
    var step = C.roundTo || 5;
    return { cost: cost, sell: Math.ceil(cost * (1 + C.markup) / step) * step, hotel: p.parts.hotel,
      single: Math.ceil(p.parts.hotel * C.singleSupplement * (1 + C.markup) / step) * step, vehicles: p.vehicles, transport: p.transport.name || p.transport.id };
  }

  // ---------------------------------------------------------------- list
  A.groups = async function () {
    A.show("groups");
    var box = $("#glist"); box.innerHTML = "…";
    await ensureCosts();
    var r = await sb.from("group_departures").select("*").order("start_date", { ascending: true });
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '<br>Bazada group_departures jadvali yo\'qmi? supabase/group_tours.sql ni ishga tushiring.</div>'; return; }
    all = r.data;
    var q = await sb.from("site_requests").select("id,ref,details,pax,status,contact_name,phone,citizenship,created_at").eq("kind", "group").order("created_at", { ascending: false }).limit(1000);
    reqs = q.error ? [] : q.data;
    var today = iso(new Date());
    var up = all.filter(function (x) { return x.start_date >= today; }), past = all.filter(function (x) { return x.start_date < today; });
    var drafts = up.filter(function (x) { return !x.published; }).length;
    var notify = reqs.filter(function (x) { return !(x.details || {}).departure_id; }).length;
    var h = '<div class="p-actions" style="margin-top:0"><button class="btn btn--gold btn--sm" id="g-new">+ Yangi sana</button><button class="btn btn--outline btn--sm" id="g-gen">Yillik jadval yaratish</button>' +
      (drafts ? '<button class="btn btn--outline btn--sm" id="g-pub">Barcha qoralamalarni e\'lon qilish (' + drafts + ')</button>' : '') + '</div>' +
      (notify ? '<p class="p-sub" style="margin-top:12px">📩 "Sana chiqsa xabar bering" so\'rovlari: <b>' + notify + '</b> — Mijoz so\'rovlari bo\'limida.</p>' : '') +
      '<div class="msg" id="g-msg"></div>';
    if (up.length) h += '<h3 style="margin:16px 0 8px">Reyslar jadvali — bo\'sh joylar</h3><div id="g-sched"></div>';
    if (!all.length) h += '<div class="empty">Hali sana yo\'q. "Yillik jadval yaratish" bilan butun mavsumni bir martada qo\'shing.</div>';
    else h += table(up, "Yaqin sanalar") + (past.length ? '<details style="margin-top:18px"><summary>O\'tgan sanalar (' + past.length + ')</summary>' + table(past.reverse(), "") + '</details>' : '');
    box.innerHTML = h;
    if ($("#g-sched") && window.MN_GDS) window.MN_GDS.render($("#g-sched"), up, { lang: "uz", range: function (x) { return P.date(x.start_date) + " — " + P.date(endDate(x)); }, title: title, onPick: function (x) { edit(x); } });
    $("#g-new").onclick = function () { edit(null); };
    $("#g-gen").onclick = generator;
    if ($("#g-pub")) $("#g-pub").onclick = async function () {
      var ids = up.filter(function (x) { return !x.published; }).map(function (x) { return x.id; });
      var u = await sb.from("group_departures").update({ published: true, updated_at: new Date().toISOString() }).in("id", ids);
      if (u.error) return P.msg("#g-msg", u.error.message, "err");
      A.groups();
    };
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { edit(all.filter(function (x) { return x.id === tr.dataset.id; })[0]); }; });
  };
  function reqFor(id) { return reqs.filter(function (r) { return (r.details || {}).departure_id === id && r.status !== "cancelled"; }); }
  function table(list, cap) {
    return (cap ? '<h3 style="margin:18px 0 8px">' + cap + '</h3>' : '') + '<table class="tbl"><thead><tr><th>Sana</th><th>Tur</th><th>Holat</th><th>Joylar</th><th>So\'rovlar</th><th>Narx / kishi</th><th>Saytda</th></tr></thead><tbody>' +
      list.map(function (x) {
        var rq = reqFor(x.id), rp = rq.reduce(function (s, r) { return s + (r.pax || 1); }, 0);
        return '<tr class="click" data-id="' + x.id + '"><td><b>' + P.date(x.start_date) + '</b><br><small>' + P.date(endDate(x)) + ' gacha</small></td><td>' + esc(title(x.tour_id)) + '<br><small>' + days(x.tour_id) + ' kun · ' + esc(KN[x.group_kind] || "") + ' · ' + x.guides + ' gid · ' + esc(x.guide_lang) + '</small></td>' +
          '<td>' + esc(ST[x.status] || x.status) + '</td><td class="gds-c gds-c--' + (window.MN_GDS ? window.MN_GDS.color(x) : '') + '"><b>' + x.booked + '</b> / ' + x.capacity + '<br><small>' + Math.max(0, x.capacity - x.booked) + ' bo\'sh</small></td>' +
          '<td>' + (rq.length ? '<b>' + rq.length + '</b> ta (' + rp + ' kishi)' : '—') + '</td><td>' + money(x.price_pp) + (x.single_supp ? '<br><small>single +' + money(x.single_supp) + '</small>' : '') + '</td>' +
          '<td>' + (x.published ? '✅ E\'lon qilingan' : '📝 Qoralama') + '</td></tr>';
      }).join("") + '</tbody></table>';
  }

  // ---------------------------------------------------------------- edit one departure
  function edit(x) {
    A.show("group");
    var isNew = !x; x = x || { tour_id: "classic", start_date: "", capacity: 50, booked: 0, guides: 2, guide_lang: "English", status: "open", published: false, group_kind: "large", vehicle: "bus50", extra_night: 65, transfer_pp: 25, price_pp: null, single_supp: null, note: "", admin_note: "" };
    var box = $("#v-group");
    var opts = uzTours().map(function (k) { return '<option value="' + k + '"' + (k === x.tour_id ? " selected" : "") + '>' + esc(title(k)) + ' (' + days(k) + ' kun)</option>'; }).join("");
    var rq = x.id ? reqFor(x.id) : [];
    box.innerHTML = '<p><a href="#" id="g-back">← Guruh sanalari</a></p><div class="p-card"><h2>' + (isNew ? "Yangi guruh sanasi" : "Sanani tahrirlash") + '</h2>' +
      '<div class="np-grid">' +
      fld("Tur (yo'nalish)", '<select id="g-tour">' + opts + '</select>') +
      fld("Boshlanish sanasi", '<input type="date" id="g-date" value="' + esc(x.start_date || "") + '">', '<span id="g-end"></span>') +
      fld("Guruh turi", '<select id="g-kind">' + Object.keys(KN).map(function (k) { return '<option value="' + k + '"' + (x.group_kind === k ? " selected" : "") + '>' + KN[k] + '</option>'; }).join("") + '</select>') +
      fld("Transport", '<select id="g-veh">' + Object.keys(VH).map(function (k) { return '<option value="' + k + '"' + (x.vehicle === k ? " selected" : "") + '>' + VH[k] + '</option>'; }).join("") + '</select>') +
      fld("Toshkentda qo'shimcha kecha, 1 kishiga ($)", '<input type="number" id="g-xn" min="0" value="' + (x.extra_night == null ? "" : x.extra_night) + '">') +
      fld("Individual transfer, 1 kishiga ($)", '<input type="number" id="g-xt" min="0" value="' + (x.transfer_pp == null ? "" : x.transfer_pp) + '">') +
      fld("Guruh sig'imi (kishi)", '<input type="number" id="g-cap" min="1" max="200" value="' + x.capacity + '">') +
      fld("Band qilingan joylar", '<input type="number" id="g-booked" min="0" value="' + x.booked + '">', "To'lov qilganlar sonini o'zingiz yozasiz") +
      fld("Gidlar soni", '<input type="number" id="g-guides" min="1" max="10" value="' + x.guides + '">') +
      fld("Gid tili", '<input id="g-lang" value="' + esc(x.guide_lang) + '">') +
      fld("Narx, 1 kishi ($, ikki kishilik xonada)", '<input type="number" id="g-price" min="0" step="5" value="' + (x.price_pp == null ? "" : x.price_pp) + '">', "Bo'sh bo'lsa saytda «Narx so'rov bo'yicha»") +
      fld("Bir kishilik xona qo'shimchasi ($)", '<input type="number" id="g-single" min="0" step="5" value="' + (x.single_supp == null ? "" : x.single_supp) + '">') +
      fld("Holat", '<select id="g-status">' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (k === x.status ? " selected" : "") + '>' + ST[k] + '</option>'; }).join("") + '</select>', "«Kafolatlangan» — guruh yig'ilgan, tur albatta bo'ladi") +
      '<div class="fld"><label>Saytda ko\'rinishi</label><label class="np-check"><input type="checkbox" id="g-pub1"' + (x.published ? " checked" : "") + '> E\'lon qilingan (mijozlar ko\'radi)</label></div>' +
      '</div>' +
      fld("Mijozga qisqa izoh (ixtiyoriy)", '<input id="g-note" maxlength="140" value="' + esc(x.note || "") + '">', "Masalan: Navro'z bayrami bilan") +
      fld("Ichki izoh (mijoz ko'rmaydi)", '<textarea id="g-anote">' + esc(x.admin_note || "") + '</textarea>') +
      '<div class="g-est" id="g-est"></div>' +
      '<div class="msg" id="g-m"></div><div class="p-actions"><button class="btn btn--gold btn--sm" id="g-save">Saqlash</button>' +
      (isNew ? "" : '<button class="btn btn--outline btn--sm" id="g-del">O\'chirish</button>') + '</div></div>' +
      (rq.length ? '<div class="p-card"><h3>Bu sanaga so\'rovlar (' + rq.length + ')</h3><table class="tbl"><thead><tr><th>Raqam</th><th>Mijoz</th><th>Kishi</th><th>Xona</th><th>Holat</th></tr></thead><tbody>' +
        rq.map(function (r) { return '<tr><td><b>' + esc(r.ref) + '</b><br><small>' + P.date(r.created_at) + '</small></td><td>' + esc(r.contact_name) + '<br><small>' + esc(r.phone) + (r.citizenship ? " · " + esc(r.citizenship) : "") + '</small></td><td>' + (r.pax || 1) + '</td><td>' + esc(ROOM[(r.details || {}).room] || "—") + '</td><td>' + esc(r.status) + '</td></tr>'; }).join("") +
        '</tbody></table><p class="p-sub">Holatni «Mijoz so\'rovlari» bo\'limida o\'zgartirasiz. To\'lov qilganlarni «Band qilingan joylar»ga qo\'shing.</p></div>' : '');
    $("#g-back").onclick = function (e) { e.preventDefault(); A.groups(); };
    function upd() {
      var tid = $("#g-tour").value, cap = parseInt($("#g-cap").value, 10) || 50, g = parseInt($("#g-guides").value, 10) || 1;
      var dt = $("#g-date").value; $("#g-end").textContent = dt ? "Tugashi: " + P.date(endDate({ start_date: dt, tour_id: tid })) : "";
      var sizes = [cap, Math.max(1, Math.round(cap * 0.6)), Math.max(1, Math.round(cap * 0.3))].filter(function (v, i, a) { return a.indexOf(v) === i; });
      var rows = sizes.map(function (p) { var e = estimate(tid, p, g); return e ? '<tr><td>' + p + ' kishi</td><td>' + money(e.cost) + '</td><td>' + money(e.sell) + '</td><td>' + e.vehicles + ' × ' + esc(e.transport) + '</td></tr>' : ''; }).join("");
      var e0 = estimate(tid, cap, g);
      var price = n($("#g-price").value);
      var prof = price != null && e0 ? '<p>Siz qo\'ygan narxda (' + money(price) + ') ' + cap + ' kishilik to\'liq guruhdan taxminiy foyda: <b>' + money((price - e0.cost) * cap) + '</b> (1 kishidan ' + money(price - e0.cost) + ').</p>' : '';
      $("#g-est").innerHTML = '<h3>Taxminiy hisob (Narxlar bo\'limidagi xarajatlar asosida, Komfort 3★)</h3><table class="tbl"><thead><tr><th>Guruh</th><th>Netto / kishi</th><th>Ustama bilan</th><th>Transport</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        (e0 ? '<p class="p-sub">Tavsiya: bir kishilik xona qo\'shimchasi ≈ ' + money(e0.single) + '. Guruh kam yig\'ilsa netto oshadi — narxni shunga qarab qo\'ying.</p>' : '') + prof;
    }
    ["#g-tour", "#g-cap", "#g-guides", "#g-date", "#g-price"].forEach(function (s) { $(s).oninput = upd; $(s).onchange = upd; });
    upd();
    $("#g-save").onclick = async function () {
      var row = { tour_id: $("#g-tour").value, start_date: $("#g-date").value, capacity: parseInt($("#g-cap").value, 10) || 50, booked: parseInt($("#g-booked").value, 10) || 0,
        guides: parseInt($("#g-guides").value, 10) || 2, guide_lang: $("#g-lang").value.trim() || "English", price_pp: n($("#g-price").value), single_supp: n($("#g-single").value),
        group_kind: $("#g-kind").value, vehicle: $("#g-veh").value, extra_night: n($("#g-xn").value), transfer_pp: n($("#g-xt").value),
        status: $("#g-status").value, published: $("#g-pub1").checked, note: $("#g-note").value.trim() || null, admin_note: $("#g-anote").value.trim() || null, updated_at: new Date().toISOString() };
      if (!row.start_date) return P.msg("#g-m", "Sanani kiriting", "err");
      if (row.booked >= row.capacity && row.status === "open") row.status = "full";
      var r = isNew ? await sb.from("group_departures").insert(row) : await sb.from("group_departures").update(row).eq("id", x.id);
      if (r.error) return P.msg("#g-m", r.error.message, "err");
      P.msg("#g-m", "Saqlandi", "ok"); setTimeout(A.groups, 500);
    };
    if ($("#g-del")) $("#g-del").onclick = async function () {
      var b = $("#g-del");
      if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Ha, o'chirilsin"; b.classList.add("btn--danger"); return; }
      var r = await sb.from("group_departures").delete().eq("id", x.id);
      if (r.error) return P.msg("#g-m", r.error.message, "err");
      A.groups();
    };
  }
  function fld(label, input, hint) { return '<div class="fld"><label>' + label + '</label>' + input + (hint ? '<small>' + hint + '</small>' : '') + '</div>'; }

  // ---------------------------------------------------------------- season generator (drafts)
  function generator() {
    A.show("group");
    var y = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    var box = $("#v-group");
    var opts = uzTours().map(function (k) { return '<option value="' + k + '"' + (k === "classic" ? " selected" : "") + '>' + esc(title(k)) + ' (' + days(k) + ' kun)</option>'; }).join("");
    box.innerHTML = '<p><a href="#" id="g-back">← Guruh sanalari</a></p><div class="p-card"><h2>Yillik jadval yaratish</h2>' +
      '<p class="p-sub">Tanlangan oylarda har oyning tanlangan hafta kunlarida sanalar «qoralama» bo\'lib yaratiladi. Ko\'rib chiqib, keyin e\'lon qilasiz.</p>' +
      '<div class="np-grid">' +
      fld("Tur", '<select id="q-tour">' + opts + '</select>') +
      fld("Yil", '<input type="number" id="q-year" value="' + y + '" min="2025" max="2035">') +
      fld("Hafta kuni (boshlanish)", '<select id="q-wd">' + WD.map(function (w) { return '<option value="' + w[0] + '">' + w[1] + '</option>'; }).join("") + '</select>') +
      fld("Oyiga nechta reys", '<select id="q-per"><option value="1">1 ta (oyning 1-haftasi)</option><option value="2" selected>2 ta (1- va 3-hafta)</option><option value="4">Har hafta</option></select>') +
      fld("Guruh sig'imi", '<input type="number" id="q-cap" value="50" min="1" max="200">') +
      fld("Gidlar soni", '<input type="number" id="q-guides" value="2" min="1" max="10">') +
      fld("Narx, 1 kishi ($)", '<input type="number" id="q-price" step="5" min="0">', "Keyin har bir sanada alohida o'zgartirish mumkin") +
      fld("Single qo'shimcha ($)", '<input type="number" id="q-single" step="5" min="0">') +
      '</div><div class="fld"><label>Oylar</label><div class="g-months">' + MONTHS.map(function (m, i) { return '<label><input type="checkbox" value="' + i + '"' + (i >= 2 && i <= 10 ? " checked" : "") + '> ' + m + '</label>'; }).join("") + '</div><small>Odatiy mavsum: mart – noyabr</small></div>' +
      '<div id="q-prev"></div><div class="msg" id="q-m"></div><div class="p-actions"><button class="btn btn--gold btn--sm" id="q-go">Qoralama sifatida yaratish</button></div></div>';
    $("#g-back").onclick = function (e) { e.preventDefault(); A.groups(); };
    function dates() {
      var yr = parseInt($("#q-year").value, 10), wd = parseInt($("#q-wd").value, 10), per = parseInt($("#q-per").value, 10), out = [];
      $$(".g-months input:checked", box).forEach(function (cb) {
        var m = parseInt(cb.value, 10), d = new Date(yr, m, 1), list = [];
        while (d.getMonth() === m) { if (d.getDay() === wd) list.push(new Date(d)); d.setDate(d.getDate() + 1); }
        (per === 1 ? [list[0]] : per === 2 ? [list[0], list[2]] : list).forEach(function (x) { if (x) out.push(iso(x)); });
      });
      var today = iso(new Date()), tid = $("#q-tour").value;
      var cap = parseInt($("#q-cap").value, 10) || 50, kd = cap <= 17 ? "small" : cap <= 35 ? "medium" : "large";
      var taken = all.filter(function (x) { return x.tour_id === tid && (x.group_kind || "large") === kd; }).map(function (x) { return x.start_date; });
      return out.filter(function (s) { return s > today && taken.indexOf(s) < 0; });
    }
    function prev() { var ds = dates(); $("#q-prev").innerHTML = '<p class="p-sub"><b>' + ds.length + ' ta sana</b>: ' + ds.map(function (s) { return P.date(s); }).join(", ") + '</p>'; }
    $$("input,select", box).forEach(function (el) { el.onchange = prev; el.oninput = prev; });
    prev();
    $("#q-go").onclick = async function () {
      var ds = dates(); if (!ds.length) return P.msg("#q-m", "Sana yo'q — oylarni tanlang", "err");
      var base = { tour_id: $("#q-tour").value, capacity: parseInt($("#q-cap").value, 10) || 50, guides: parseInt($("#q-guides").value, 10) || 2, guide_lang: "English",
        price_pp: n($("#q-price").value), single_supp: n($("#q-single").value), status: "open", published: false, extra_night: 65, transfer_pp: 25 };
      base.group_kind = base.capacity <= 17 ? "small" : base.capacity <= 35 ? "medium" : "large"; base.vehicle = base.group_kind === "small" ? "minibus" : base.group_kind === "medium" ? "bus" : "bus50";
      var r = await sb.from("group_departures").insert(ds.map(function (s) { return Object.assign({ start_date: s }, base); }));
      if (r.error) return P.msg("#q-m", r.error.message, "err");
      P.msg("#q-m", ds.length + " ta qoralama yaratildi", "ok"); setTimeout(A.groups, 600);
    };
  }
})();
