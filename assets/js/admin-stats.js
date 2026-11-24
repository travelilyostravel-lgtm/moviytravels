/* Moviy Nomad — admin: site visitor statistics (day / week / month / year). Robots and our own staff are not counted. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var per = "day";
  var PER = [["day", "Kunlik (30 kun)"], ["week", "Haftalik (12 hafta)"], ["month", "Oylik (12 oy)"], ["year", "Yillik"]];
  var LN = { en: "Inglizcha", ru: "Ruscha", uz: "O'zbekcha", tr: "Turkcha", ar: "Arabcha", de: "Nemischa", sv: "Shvedcha", zh: "Xitoycha", hi: "Hindcha", ko: "Koreyscha" };
  function n(x) { return (+x || 0).toLocaleString("ru"); }
  function page(pth) {
    var m = String(pth || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/index\.html$/, "/");
    var map = [[/guides\.html/, "Gidlar"], [/transport\.html/, "Transport"], [/hotels\.html/, "Mehmonxonalar"], [/partners\.html/, "Hamkorlar"], [/services\.html/, "Xizmatlar"],
      [/builder/, "Tur yig'ish"], [/group-tours/, "Guruh turlari"], [/stories/, "Sharhlar"], [/tours?\//, "Tur sahifasi"], [/^\/([a-z]{2}\/)?$/, "Bosh sahifa"]];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(m)) { var l = (m.match(/^\/([a-z]{2})\//) || [])[1]; return map[i][1] + (l ? " (" + l + ")" : " (en)"); }
    return m || "/";
  }
  function list(title, rows, f) {
    var max = Math.max.apply(null, (rows || []).map(function (r) { return r.c; }).concat([1]));
    return '<div class="p-card st-list"><h3>' + title + '</h3>' + ((rows || []).length ? rows.map(function (r) {
      return '<div class="st-row"><span>' + esc(f(r)) + '</span><i style="width:' + Math.round(r.c / max * 100) + '%"></i><b>' + n(r.c) + '</b></div>';
    }).join("") : '<p class="p-sub">Hali ma\'lumot yo\'q.</p>') + '</div>';
  }
  A.stats = async function () {
    A.show("stats");
    var box = $("#v-stats"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var r = await sb.rpc("site_analytics", { p_period: per }); var d = r.data;
    if (r.error || !d) { box.innerHTML = '<div class="p-card">Xatolik: ' + esc(r.error ? r.error.message : "ruxsat yo'q") + '</div>'; return; }
    var s = d.series || [], mx = Math.max.apply(null, s.map(function (x) { return Math.max(x.v, 1); }).concat([1])), mxp = Math.max.apply(null, s.map(function (x) { return x.p; }).concat([1]));
    var bars = s.map(function (x) {
      return '<div class="st-bar" title="' + esc(x.k) + ': ' + x.v + ' tashrifchi, ' + x.p + ' sahifa ko\'rish, ' + x.n + ' yangi"><div class="st-bar__c"><i class="st-p" style="height:' + Math.round(x.p / mxp * 100) + '%"></i><i class="st-v" style="height:' + Math.round(x.v / mx * 100) + '%"></i></div>' +
        '<b>' + (x.v || "") + '</b><small>' + esc(x.k) + '</small></div>';
    }).join("");
    var dev = d.devices || {}, dt = (dev.mobile || 0) + (dev.desktop || 0) || 1;
    box.innerHTML = '<div class="p-card"><h2 style="margin:0 0 4px">📈 Saytga kiruvchilar statistikasi</h2>' +
      '<p class="p-sub">Har bir tashrifchi bir marta sanaladi (bitta brauzer = bitta odam). Qidiruv robotlari, asoschi va menejerlar hisobga olinmaydi.</p>' +
      '<div class="filters" style="margin:10px 0">' + PER.map(function (x) { return '<button data-per="' + x[0] + '" class="' + (x[0] === per ? "is-on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' +
      '<div class="st-kpi"><div><b>' + n(d.visitors) + '</b><small>Tashrifchilar (davrda)</small></div><div><b>' + n(d.views) + '</b><small>Sahifa ko\'rishlar</small></div>' +
      '<div><b>' + n(d.new) + '</b><small>Yangi tashrifchilar</small></div><div><b>' + n(d.total) + '</b><small>Jami (hamma vaqt)</small></div>' +
      '<div class="st-live"><b>' + n(d.online) + '</b><small>🟢 Hozir saytda</small></div></div>' +
      '<div class="st-chart">' + bars + '</div><p class="st-leg"><i class="st-v"></i> Tashrifchilar &nbsp; <i class="st-p"></i> Sahifa ko\'rishlar</p></div>' +
      '<div class="st-grid">' + list("Eng ko'p ochilgan sahifalar", d.pages, function (x) { return page(x.page); }) +
      list("Qaysi tilda o'qishadi", d.langs, function (x) { return LN[x.lang] || x.lang; }) +
      list("Qayerdan kelishdi", d.refs, function (x) { return x.ref; }) +
      '<div class="p-card st-list"><h3>Qurilma</h3><div class="st-row"><span>📱 Telefon</span><i style="width:' + Math.round((dev.mobile || 0) / dt * 100) + '%"></i><b>' + Math.round((dev.mobile || 0) / dt * 100) + '%</b></div>' +
      '<div class="st-row"><span>💻 Kompyuter</span><i style="width:' + Math.round((dev.desktop || 0) / dt * 100) + '%"></i><b>' + Math.round((dev.desktop || 0) / dt * 100) + '%</b></div></div></div>';
    $$("[data-per]", box).forEach(function (b) { b.onclick = function () { per = b.dataset.per; A.stats(); }; });
  };
})();
