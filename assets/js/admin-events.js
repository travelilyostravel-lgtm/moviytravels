/* Moviy Nomad — admin: Events (2026-11-27). iTicket.uz events arrive by themselves every 3 hours; here staff can hide an event,
   pin it to the top, write conditions / our package price, and add festivals or national holidays by hand. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var CAT = { concert: "🎤 Konsert", theatre: "🎭 Teatr", festival: "🎉 Festival", official: "🇺🇿 Davlat bayrami", culture: "🏛 Madaniyat", exhibition: "🖼 Ko'rgazma", kids: "🧸 Bolalar", sport: "🏆 Sport", museum: "🏺 Muzey (saytda ko'rinmaydi)", other: "✨ Boshqa" };
  var CITY = { tashkent: "Toshkent", samarkand: "Samarqand", bukhara: "Buxoro", khiva: "Xiva", nukus: "Nukus", boysun: "Boysun", fergana: "Farg'ona", other: "Boshqa" };
  var flt = "upcoming", q = "";
  function nm(o) { o = o || {}; return o.uz || o.ru || o.en || ""; }
  function dt(s) { return s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"; }
  function loc(s) { if (!s) return ""; var d = new Date(s); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }
  A.events = async function () {
    A.show("events");
    var box = $("#v-events"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var r = await sb.from("events").select("*").order("starts_at", { ascending: true }).limit(1000);
    if (r.error) { box.innerHTML = '<div class="p-card">Xatolik: ' + esc(r.error.message) + '</div>'; return; }
    var now = Date.now(), all = r.data || [];
    var L = all.filter(function (x) {
      var end = x.ends_at ? Date.parse(x.ends_at) : x.starts_at ? Date.parse(x.starts_at) + 864e5 : now + 1;
      if (flt === "upcoming" && (end < now || x.hidden || x.category === "museum")) return false;
      if (flt === "hidden" && !x.hidden) return false;
      if (flt === "manual" && x.source !== "manual") return false;
      if (flt === "past" && end >= now) return false;
      return !q || JSON.stringify(x.name).toLowerCase().indexOf(q) > -1 || String(x.venue || "").toLowerCase().indexOf(q) > -1;
    });
    var last = all.filter(function (x) { return x.source === "iticket"; }).reduce(function (m, x) { return x.seen_at > m ? x.seen_at : m; }, "");
    box.innerHTML = '<div class="p-card"><h2 style="margin:0 0 4px">🎟 Tadbirlar</h2>' +
      '<p class="p-sub">Konsert, teatr, sport va boshqa tadbirlar <b>iTicket.uz</b> dan har 3 soatda o\'zi qo\'shiladi (oxirgi yangilanish: ' + esc(dt(last)) + '). Festival va davlat bayramlarini shu yerda qo\'lda qo\'shasiz. Saytda: <a href="../uz/events.html" target="_blank">moviy-travel.uz/uz/events.html</a></p>' +
      '<div class="p-actions" style="margin:8px 0 12px"><button class="btn btn--gold btn--sm" id="ev-new">＋ Tadbir qo\'shish (festival, bayram…)</button><button class="btn btn--outline btn--sm" id="ev-sync">⟳ iTicket\'dan hozir yangilash</button><span id="ev-sync-m" class="p-sub"></span></div>' +
      '<div class="filters">' + [["upcoming", "Saytdagilar"], ["manual", "Qo'lda qo'shilganlar"], ["hidden", "Yashirilganlar"], ["past", "O'tganlar"]].map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === flt ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("") +
      ' <input id="ev-q" placeholder="Qidirish…" value="' + esc(q) + '" style="padding:7px 10px;border-radius:10px;border:1px solid #e5e0d5;min-width:200px"></div>' +
      '<p class="p-sub">' + L.length + ' ta</p><div style="overflow-x:auto"><table class="tbl"><thead><tr><th></th><th>Tadbir</th><th>Sana</th><th>Shahar / joy</th><th>Narx</th><th>Manba</th><th>Saytda</th><th></th></tr></thead><tbody>' +
      L.map(function (x) {
        return '<tr' + (x.hidden ? ' style="opacity:.5"' : '') + '><td>' + (x.image ? '<img src="' + esc(x.image) + '" alt="" referrerpolicy="no-referrer" style="width:46px;height:46px;object-fit:cover;border-radius:8px">' : '') + '</td>' +
          '<td><b>' + esc(nm(x.name)) + '</b>' + (x.pinned ? ' 📌' : '') + (x.official ? ' <span class="pill">Rasmiy</span>' : '') + '<br><small>' + esc(CAT[x.category] || x.category) + '</small></td>' +
          '<td>' + esc(dt(x.starts_at)) + (x.date_tba ? '<br><small>sana aniq emas</small>' : '') + '</td><td>' + esc(CITY[x.city] || x.city || "") + '<br><small>' + esc(x.venue || "") + '</small></td>' +
          '<td>' + (x.our_price ? '<b>$' + x.our_price + '</b> (biz)<br>' : '') + (x.min_price ? Math.round(x.min_price).toLocaleString("ru-RU") + " so'm" : "—") + '</td>' +
          '<td>' + (x.source === "iticket" ? '<a href="' + esc(x.ticket_url || "#") + '" target="_blank" rel="noopener">iTicket ↗</a>' : 'Qo\'lda') + '</td>' +
          '<td><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-vis="' + x.id + '"' + (x.hidden ? '' : ' checked') + '> ko\'rinadi</label></td>' +
          '<td><button class="btn btn--outline btn--sm" data-edit="' + x.id + '">Tahrirlash</button></td></tr>';
      }).join("") + '</tbody></table></div></div><div id="ev-ed"></div>';
    $$("[data-f]", box).forEach(function (b) { b.onclick = function () { flt = b.dataset.f; A.events(); }; });
    $("#ev-q").onchange = function () { q = this.value.trim().toLowerCase(); A.events(); };
    $$("[data-vis]", box).forEach(function (c) { c.onchange = async function () { var u = await sb.from("events").update({ hidden: !c.checked, updated_at: new Date().toISOString() }).eq("id", +c.dataset.vis); if (u.error) alertBox(u.error.message); }; });
    $$("[data-edit]", box).forEach(function (b) { b.onclick = function () { edit(all.filter(function (x) { return x.id === +b.dataset.edit; })[0]); }; });
    $("#ev-new").onclick = function () { edit(null); };
    $("#ev-sync").onclick = async function () {
      var m = $("#ev-sync-m"), b = this; b.disabled = true; m.textContent = "iTicket'dan so'ralmoqda…";
      var a = await sb.rpc("admin_events_refresh"); if (a.error) { m.textContent = "Xatolik: " + a.error.message; b.disabled = false; return; }
      setTimeout(async function () {
        var p = await sb.rpc("admin_events_process"); m.textContent = p.error ? "Xatolik: " + p.error.message : "✓ Yangilandi (" + p.data + " ta yozuv o'qildi)"; b.disabled = false;
        setTimeout(A.events, 1200);
      }, 9000);
    };
  };
  function alertBox(t) { var m = $("#ev-sync-m"); if (m) m.textContent = "Xatolik: " + t; }
  function edit(x) {
    var isNew = !x; x = x || { name: {}, info: {}, our_note: {}, category: "festival", city: "tashkent", official: false, date_tba: false };
    var man = isNew || x.source === "manual";
    var f = function (id, label, val, type, extra) { return '<div class="fld"><label>' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '"' + (extra || "") + '></div>'; };
    var sel = function (id, label, map, val) { return '<div class="fld"><label>' + label + '</label><select id="' + id + '">' + Object.keys(map).map(function (k) { return '<option value="' + k + '"' + (k === val ? " selected" : "") + '>' + esc(map[k]) + '</option>'; }).join("") + '</select></div>'; };
    $("#ev-ed").innerHTML = '<div class="p-card" id="ev-card"><h3 style="margin-top:0">' + (isNew ? "Yangi tadbir" : "Tahrirlash: " + esc(nm(x.name))) + '</h3>' +
      (man ? '' : '<p class="p-sub">Bu tadbir iTicket\'dan keladi — nomi, sanasi, narxi o\'zi yangilanadi. Siz faqat shartlar, bizning narx, «tepada turadi» va ko\'rinishini o\'zgartirasiz.</p>') +
      '<div class="grid2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px">' +
      (man ? f("e-n-uz", "Nomi (o'zbekcha) *", x.name.uz) + f("e-n-en", "Nomi (inglizcha)", x.name.en) + f("e-n-ru", "Nomi (ruscha)", x.name.ru) +
        sel("e-cat", "Turkum", CAT, x.category) + sel("e-city", "Shahar", CITY, x.city) + f("e-venue", "Joy (manzil)", x.venue) +
        f("e-st", "Boshlanishi *", loc(x.starts_at), "datetime-local") + f("e-en2", "Tugashi", loc(x.ends_at), "datetime-local") + f("e-img", "Rasm havolasi (ixtiyoriy)", x.image) +
        f("e-min", "Chipta narxi, so'm (ixtiyoriy)", x.min_price, "number") + f("e-url", "Chipta / rasmiy sayt havolasi", x.ticket_url) +
        '<div class="fld"><label><input type="checkbox" id="e-tba"' + (x.date_tba ? " checked" : "") + '> Aniq sana hali yo\'q (faqat oy ko\'rsatiladi)</label><label><input type="checkbox" id="e-off"' + (x.official ? " checked" : "") + '> Rasmiy tadbir</label></div>' +
        '<div class="fld" style="grid-column:1/-1"><label>Qisqa tavsif (o\'zbekcha / inglizcha / ruscha)</label><textarea id="e-i-uz" rows="2" placeholder="o\'zbekcha">' + esc(x.info.uz || "") + '</textarea><textarea id="e-i-en" rows="2" placeholder="English">' + esc(x.info.en || "") + '</textarea><textarea id="e-i-ru" rows="2" placeholder="русский">' + esc(x.info.ru || "") + '</textarea></div>' : '') +
      f("e-our", "Bizning paket narxi, $ / kishi (ixtiyoriy)", x.our_price, "number", ' step="1" min="0"') +
      '<div class="fld"><label>Shartlar (mijozga ko\'rinadi): o\'zbekcha / inglizcha / ruscha</label><input id="e-no-uz" value="' + esc((x.our_note || {}).uz || "") + '" placeholder="masalan: chipta + transfer + gid"><input id="e-no-en" value="' + esc((x.our_note || {}).en || "") + '" placeholder="e.g. ticket + transfer + guide"><input id="e-no-ru" value="' + esc((x.our_note || {}).ru || "") + '" placeholder="напр. билет + трансфер + гид"></div>' +
      '<div class="fld"><label><input type="checkbox" id="e-pin"' + (x.pinned ? " checked" : "") + '> 📌 Ro\'yxat boshida tursin</label><label><input type="checkbox" id="e-vis"' + (x.hidden ? "" : " checked") + '> Saytda ko\'rinadi</label></div>' +
      '</div><div class="msg" id="m-ev"></div><div class="p-actions"><button class="btn btn--gold" id="e-save">Saqlash</button><button class="btn btn--outline" id="e-cancel">Yopish</button>' +
      (!isNew && man ? '<button class="btn btn--outline" id="e-del" style="margin-inline-start:auto">O\'chirish</button>' : '') + '</div></div>';
    $("#ev-card").scrollIntoView({ behavior: "smooth" });
    $("#e-cancel").onclick = function () { $("#ev-ed").innerHTML = ""; };
    var v = function (id) { var el = $("#" + id); return el ? el.value.trim() : ""; };
    $("#e-save").onclick = async function () {
      var row = { our_price: v("e-our") ? +v("e-our") : null, our_note: { uz: v("e-no-uz"), en: v("e-no-en"), ru: v("e-no-ru") }, pinned: $("#e-pin").checked, hidden: !$("#e-vis").checked, updated_at: new Date().toISOString() };
      if (man) {
        if (!v("e-n-uz") || !v("e-st")) { P.msg("#m-ev", "Nomi va boshlanish sanasini yozing.", "err"); return; }
        Object.assign(row, { source: "manual", name: { uz: v("e-n-uz"), en: v("e-n-en") || v("e-n-uz"), ru: v("e-n-ru") || v("e-n-uz") }, info: { uz: v("e-i-uz"), en: v("e-i-en"), ru: v("e-i-ru") },
          category: v("e-cat"), city: v("e-city"), venue: v("e-venue") || null, starts_at: new Date(v("e-st")).toISOString(), ends_at: v("e-en2") ? new Date(v("e-en2")).toISOString() : null,
          image: v("e-img") || null, min_price: v("e-min") ? +v("e-min") : null, ticket_url: v("e-url") || null, date_tba: $("#e-tba").checked, official: $("#e-off").checked });
      }
      var res = isNew ? await sb.from("events").insert(row) : await sb.from("events").update(row).eq("id", x.id);
      if (res.error) { P.msg("#m-ev", "Xatolik: " + res.error.message, "err"); return; }
      P.msg("#m-ev", "Saqlandi ✓", "ok"); setTimeout(A.events, 700);
    };
    if ($("#e-del")) $("#e-del").onclick = async function () {
      if (this.dataset.sure !== "1") { this.dataset.sure = "1"; this.textContent = "Rostdan o'chirilsinmi? Yana bosing"; return; }
      var d = await sb.from("events").delete().eq("id", x.id); if (d.error) { P.msg("#m-ev", "Xatolik: " + d.error.message, "err"); return; } A.events();
    };
  }
})();
