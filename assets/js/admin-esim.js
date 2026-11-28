/* Moviy Nomad — admin: eSIM (27.11.2026). Referral model with partner Qulay SIM:
   the tourist buys on Qulay SIM's page, Qulay SIM reports each sale/top-up to /api/esim-postback,
   and here the founder sees clicks, sales, money and our share by month, and keeps the plans and the partner link. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var st = { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() };
  function d(x) { return x.toISOString().slice(0, 10); }
  function m(n) { n = +n || 0; return "$" + n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  var KIND = { sale: "🛒 Sotuv", topup: "➕ To'ldirish", refund: "↩ Qaytarildi" };

  A.esim = async function () {
    A.show("esim");
    var box = $("#v-esim"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var s = (await sb.from("esim_settings").select("*").eq("id", 1).single()).data || {};
    var plans = (await sb.from("esim_plans").select("*").order("sort").order("price")).data || [];
    var r = await sb.rpc("admin_esim_stats", { p_from: d(st.from), p_to: d(st.to) });
    var S = r.data || {};
    var conv = S.clicks ? Math.round((S.sales || 0) * 1000 / S.clicks) / 10 : 0;
    var ready = s.enabled && s.partner_url && plans.some(function (p) { return p.active; });
    var h = '<div class="p-card"><h2 style="margin:0 0 4px">📶 eSIM — Qulay SIM hamkorligi</h2>' +
      '<p class="p-sub">Turist saytda tarif tanlaydi va <b>Qulay SIM</b> sahifasida sotib oladi. Sotuvchi, to\'lov, QR-kod, yordam va pulni qaytarish — Qulay SIM\'da. Har bir sotuv va to\'ldirish haqida Qulay SIM bizga avtomatik xabar beradi; bu yerda bizning ulushimiz hisoblanadi.</p>' +
      '<p>' + (ready ? '<b style="color:#1a7f37">● Saytda yoqilgan</b>' : '<b style="color:#a12f2f">● Hali yoqilmagan</b> — hamkor havolasi, kamida 1 ta tarif va «Yoqilgan» belgisi kerak') +
      ' · Sahifa: <a href="../uz/esim.html" target="_blank">moviy-travel.uz/uz/esim.html</a></p></div>';

    // ---- numbers
    h += '<div class="p-card"><div class="filters" style="flex-wrap:wrap;align-items:center"><b>Davr:</b> <input type="date" id="es-f" value="' + d(st.from) + '"> — <input type="date" id="es-t" value="' + d(st.to) + '"> ' +
      '<button data-p="m">Shu oy</button><button data-p="pm">O\'tgan oy</button><button data-p="y">Shu yil</button> <button class="btn btn--outline btn--sm" id="es-csv">⬇ Solishtirish hisoboti (CSV)</button></div>' +
      (r.error ? '<div class="msg msg--err">' + esc(r.error.message) + '</div>' :
      '<div class="hstats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px">' +
        [["👆 Bosishlar", S.clicks], ["🛒 Sotuvlar", S.sales], ["➕ To'ldirishlar", S.topups], ["📈 Konversiya", conv + "%"], ["💵 Sotuv summasi", m(S.revenue)], ["💰 Bizning ulush", m(S.share)], ["📶 Jami GB", (+S.gb || 0) + " GB"], ["↩ Qaytarilgan", S.refunds]]
          .map(function (k) { return '<div style="background:#f7f4ee;border-radius:12px;padding:12px"><small>' + k[0] + '</small><div style="font:700 22px/1.2 var(--font-head)">' + esc(k[1] == null ? 0 : k[1]) + '</div></div>'; }).join("") + '</div>' +
      '<h3 style="margin-top:18px">Oylar bo\'yicha</h3><table class="tbl"><thead><tr><th>Oy</th><th>Sotuv</th><th>To\'ldirish</th><th>Summa</th><th>Bizning ulush</th></tr></thead><tbody>' +
        ((S.months || []).map(function (x) { return '<tr><td><b>' + esc(x.m) + '</b></td><td>' + x.sales + '</td><td>' + x.topups + '</td><td>' + m(x.revenue) + '</td><td><b>' + m(x.share) + '</b></td></tr>'; }).join("") || '<tr><td colspan="5" class="p-sub">Hali sotuv yo\'q</td></tr>') + '</tbody></table>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:12px">' +
        '<div><h3>Tariflar (sotuv)</h3>' + list(S.plans, function (x) { return esc(x.plan) + ' — <b>' + x.n + '</b> · ' + m(x.share); }) + '</div>' +
        '<div><h3>Tariflar (bosish)</h3>' + list(S.click_plans, function (x) { return esc(x.plan) + ' — <b>' + x.n + '</b>'; }) + '</div>' +
        '<div><h3>Davlatlar</h3>' + list(S.countries, function (x) { return esc(x.c) + ' — <b>' + x.n + '</b>'; }) + '</div></div>' +
      '<h3 style="margin-top:18px">Oxirgi sotuvlar</h3><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Sana</th><th>Turi</th><th>Tarif</th><th>GB / kun</th><th>Summa</th><th>Ulush</th><th>Buyurtma</th><th>Bosish №</th><th>Davlat</th></tr></thead><tbody>' +
        ((S.recent || []).map(function (x) { return '<tr><td>' + P.date(x.t) + '</td><td>' + (KIND[x.kind] || x.kind) + '</td><td>' + esc(x.plan || "") + '</td><td>' + esc((x.gb != null ? x.gb + " GB" : "") + (x.days ? " / " + x.days + " kun" : "")) + '</td><td>' + esc(x.amount != null ? x.amount + " " + (x.cur || "") : "") + '</td><td><b>' + m(x.share) + '</b></td><td><small>' + esc(x.order) + '</small></td><td><small>' + esc(x.sub || "—") + '</small></td><td>' + esc(x.country || "") + '</td></tr>'; }).join("") || '<tr><td colspan="9" class="p-sub">Hali yo\'q</td></tr>') +
      '</tbody></table></div>') + '</div>';

    // ---- plans
    h += '<div class="p-card"><h3>Saytdagi tariflar</h3><p class="p-sub">Qulay SIM API\'si ulanguncha tariflarni shu yerga yozasiz (Qulay SIM bergan narx bilan). API ulangach ro\'yxat o\'zi yangilanadi. «Qulay SIM tarif ID» — havoladagi {plan} o\'rniga qo\'yiladi.</p>' +
      '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nomi</th><th>GB (bo\'sh = cheksiz)</th><th>Kun</th><th>Narx</th><th>Valyuta</th><th>Qulay SIM tarif ID</th><th>★</th><th>Saytda</th><th>Tartib</th><th></th></tr></thead><tbody>' +
      plans.map(row).join("") + row({ id: "", name: "", gb: "", days: "", price: "", currency: "USD", partner_plan: "", popular: false, active: true, sort: 100 }) + '</tbody></table></div><div class="msg" id="m-esp"></div></div>';

    // ---- settings
    h += '<div class="p-card"><h3>Hamkorlik sozlamalari</h3>' +
      '<div class="fld"><label>Hamkor havolasi (Qulay SIM bergan). Ichida <code>{sub}</code> bo\'lishi shart — bosish raqami; ixtiyoriy: <code>{plan}</code>, <code>{lang}</code>, <code>{promo}</code></label><input id="es-url" value="' + esc(s.partner_url || "") + '" placeholder="https://…?ref=MOVIY&sub={sub}&plan={plan}&lang={lang}"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px"><div class="fld"><label>Promo-kod (ixtiyoriy)</label><input id="es-promo" value="' + esc(s.promo_code || "") + '" placeholder="MOVIYNOMAD"></div>' +
      '<div class="fld"><label>Bizning komissiya, % (shartnomadagi)</label><input id="es-pct" type="number" step="0.01" min="0" max="100" value="' + esc(s.commission_pct == null ? "" : s.commission_pct) + '"></div></div>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="es-on"' + (s.enabled ? " checked" : "") + '> <b>Saytda yoqilgan</b> (turistlar tariflarni ko\'radi va sotib olishga o\'ta oladi)</label>' +
      '<div class="p-actions"><button class="btn btn--gold btn--sm" id="es-save">Saqlash</button></div><div class="msg" id="m-es"></div>' +
      '<hr style="margin:16px 0;border:0;border-top:1px dashed #ddd"><h3>🔐 Sotuv xabarlari kaliti</h3>' +
      '<p class="p-sub">Qulay SIM sotuv haqidagi xabarni <code>https://moviy-travel.uz/api/esim-postback</code> manziliga yuboradi. Soxta xabar kirmasligi uchun uzun maxfiy kalit kerak: <br>1) o\'zingiz 24+ belgili kalit o\'ylab toping (yoki «Kalit yaratish»); 2) uni shu yerga yozib «Kalitni saqlash» ni bosing; 3) aynan shu kalitni Vercel → Settings → Environment Variables ga <code>ESIM_INGEST_KEY</code> nomi bilan qo\'ying. Kalitning o\'zi bazada saqlanmaydi.</p>' +
      '<p>' + (s.ingest_key_hash ? '✅ Kalit o\'rnatilgan' : '⚠ Kalit hali o\'rnatilmagan') + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input id="es-key" type="password" autocomplete="new-password" placeholder="Maxfiy kalit (24+ belgi)" style="flex:1;min-width:260px;padding:8px 10px;border-radius:10px;border:1px solid #e5e0d5">' +
      '<button class="btn btn--outline btn--sm" id="es-gen">Kalit yaratish</button><button class="btn btn--outline btn--sm" id="es-setkey">Kalitni saqlash</button></div><div class="msg" id="m-esk"></div></div>';
    box.innerHTML = h;

    $$("[data-p]", box).forEach(function (b) { b.onclick = function () { var n = new Date(), p = b.dataset.p;
      if (p === "m") { st.from = new Date(n.getFullYear(), n.getMonth(), 1); st.to = n; }
      if (p === "pm") { st.from = new Date(n.getFullYear(), n.getMonth() - 1, 1); st.to = new Date(n.getFullYear(), n.getMonth(), 0); }
      if (p === "y") { st.from = new Date(n.getFullYear(), 0, 1); st.to = n; }
      A.esim(); }; });
    $("#es-f").onchange = function () { st.from = new Date(this.value); A.esim(); };
    $("#es-t").onchange = function () { st.to = new Date(this.value); A.esim(); };
    $("#es-csv").onclick = function () {
      var rows = [["Sana", "Turi", "Buyurtma", "Bosish raqami", "Tarif", "GB", "Kun", "Summa", "Valyuta", "Bizning ulush", "Holat", "Davlat"]].concat((S.recent || []).map(function (x) {
        return [String(x.t).slice(0, 10), x.kind, x.order, x.sub || "", x.plan || "", x.gb == null ? "" : x.gb, x.days || "", x.amount == null ? "" : x.amount, x.cur || "", x.share == null ? "" : x.share, x.status || "", x.country || ""]; }));
      var csv = "﻿" + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(";"); }).join("\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "eSIM_QulaySIM_" + d(st.from) + "_" + d(st.to) + ".csv"; a.click();
    };
    $$("[data-ps]", box).forEach(function (b) { b.onclick = async function () {
      var tr = b.closest("tr"), id = b.dataset.ps, g = function (k) { return tr.querySelector('[data-k="' + k + '"]'); };
      var rec = { name: g("name").value.trim(), gb: g("gb").value === "" ? null : +g("gb").value, days: +g("days").value, price: +g("price").value, currency: (g("currency").value || "USD").toUpperCase(),
        partner_plan: g("partner_plan").value.trim() || null, popular: g("popular").checked, active: g("active").checked, sort: +g("sort").value || 100, updated_at: new Date().toISOString() };
      if (!rec.name || !rec.days || !rec.price) return P.msg("#m-esp", "Nomi, kun va narxni yozing", "err");
      var q = id ? sb.from("esim_plans").update(rec).eq("id", id) : sb.from("esim_plans").insert(rec);
      var u = await q; if (u.error) return P.msg("#m-esp", u.error.message, "err"); A.esim();
    }; });
    $$("[data-pd]", box).forEach(function (b) { b.onclick = async function () {
      if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Ha, o'chirilsin"; return; }
      var u = await sb.from("esim_plans").delete().eq("id", b.dataset.pd); if (u.error) return P.msg("#m-esp", u.error.message, "err"); A.esim();
    }; });
    $("#es-save").onclick = async function () {
      var url = $("#es-url").value.trim();
      if (url && !/^https:\/\//.test(url)) return P.msg("#m-es", "Havola https:// bilan boshlansin", "err");
      if (url && url.indexOf("{sub}") < 0) return P.msg("#m-es", "Havolada {sub} bo'lishi shart — usiz sotuvlar bizga yozilmaydi", "err");
      var pct = $("#es-pct").value;
      var u = await sb.from("esim_settings").update({ partner_url: url || null, promo_code: $("#es-promo").value.trim() || null, commission_pct: pct === "" ? null : +pct, enabled: $("#es-on").checked, updated_at: new Date().toISOString() }).eq("id", 1);
      P.msg("#m-es", u.error ? u.error.message : "Saqlandi", u.error ? "err" : "ok"); if (!u.error) setTimeout(A.esim, 600);
    };
    $("#es-gen").onclick = function () { var a = new Uint8Array(24); crypto.getRandomValues(a); $("#es-key").type = "text"; $("#es-key").value = Array.from(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      P.msg("#m-esk", "Kalit yaratildi — nusxalab, avval Vercel'ga qo'ying, keyin «Kalitni saqlash» ni bosing", "ok"); };
    $("#es-setkey").onclick = async function () { var k = $("#es-key").value.trim(); var u = await sb.rpc("admin_esim_set_key", { p_key: k });
      if (u.error) return P.msg("#m-esk", u.error.message, "err"); $("#es-key").value = ""; P.msg("#m-esk", "Kalit saqlandi (bazada faqat uning izi qoldi)", "ok"); };
  };
  function list(a, f) { a = a || []; return a.length ? '<ul style="margin:0;padding-left:18px">' + a.map(function (x) { return '<li>' + f(x) + '</li>'; }).join("") + '</ul>' : '<p class="p-sub">—</p>'; }
  function row(p) {
    var inp = function (k, w, t) { return '<input data-k="' + k + '" ' + (t ? 'type="' + t + '" step="any" ' : '') + 'value="' + esc(p[k] == null ? "" : p[k]) + '" style="width:' + w + 'px;padding:5px 7px;border-radius:8px;border:1px solid #e5e0d5">'; };
    return '<tr><td>' + inp("name", 160) + '</td><td>' + inp("gb", 70, "number") + '</td><td>' + inp("days", 55, "number") + '</td><td>' + inp("price", 70, "number") + '</td><td>' + inp("currency", 55) + '</td><td>' + inp("partner_plan", 120) + '</td>' +
      '<td><input type="checkbox" data-k="popular"' + (p.popular ? " checked" : "") + '></td><td><input type="checkbox" data-k="active"' + (p.active ? " checked" : "") + '></td><td>' + inp("sort", 50, "number") + '</td>' +
      '<td style="white-space:nowrap"><button class="btn btn--gold btn--sm" data-ps="' + (p.id || "") + '">' + (p.id ? "Saqlash" : "＋ Qo'shish") + '</button>' + (p.id ? ' <button class="btn btn--outline btn--sm" data-pd="' + p.id + '">✕</button>' : '') + '</td></tr>';
  }
})();
