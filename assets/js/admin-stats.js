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
  // sources (2026-11-27): label + icon for every source key
  var SRC = {
    google: ["🔎", "Google qidiruv"], yandex: ["🔎", "Yandex qidiruv"], bing: ["🔎", "Bing qidiruv"], search: ["🔎", "Boshqa qidiruv tizimlari"],
    google_ads: ["💰", "Google reklama"], yandex_ads: ["💰", "Yandex reklama"],
    instagram: ["📸", "Instagram"], facebook: ["📘", "Facebook"], telegram: ["✈️", "Telegram"], vk: ["🟦", "VK (VKontakte)"], max: ["💬", "MAX"],
    ok: ["🟧", "Odnoklassniki"], whatsapp: ["🟢", "WhatsApp"], youtube: ["▶️", "YouTube"], tiktok: ["🎵", "TikTok"], twitter: ["✖️", "X (Twitter)"],
    linkedin: ["💼", "LinkedIn"], email: ["✉️", "E-mail / rassilka"], tripadvisor: ["🦉", "TripAdvisor"], sites: ["🌐", "Boshqa saytlardagi havolalar"],
    direct: ["⌨️", "To'g'ridan-to'g'ri (manzilni yozgan, saqlangan havola, ilova ichidan)"], old: ["🕓", "Aniqlanmagan (27.11 gacha)"]
  };
  function srcName(k) { if (/^utm:/.test(k)) return "🏷 Belgili havola: " + k.slice(4); var x = SRC[k]; return x ? x[0] + " " + x[1] : k; }
  var DN = null; try { DN = new Intl.DisplayNames(["uz", "ru", "en"], { type: "region" }); } catch (e) {}
  function flag(cc) { return /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint.apply(null, cc.split("").map(function (ch) { return 127397 + ch.charCodeAt(0); })) : "🏳"; }
  function cName(cc) { if (!/^[A-Z]{2}$/.test(cc)) return "Aniqlanmagan"; try { return DN ? DN.of(cc) : cc; } catch (e) { return cc; } }
  function list2(title, sub, rows, f) {
    var tot = (rows || []).reduce(function (a, r) { return a + (+r.c || 0); }, 0) || 1, max = Math.max.apply(null, (rows || []).map(function (r) { return r.c; }).concat([1]));
    return '<div class="p-card st-list"><h3>' + title + '</h3>' + (sub ? '<p class="p-sub" style="margin:-4px 0 8px">' + sub + '</p>' : '') + ((rows || []).length ? rows.map(function (r) {
      return '<div class="st-row"><span>' + esc(f(r)) + '</span><i style="width:' + Math.round(r.c / max * 100) + '%"></i><b>' + n(r.c) + ' <small style="color:#6b7280;font-weight:600">' + Math.round(r.c / tot * 100) + '%</small></b></div>';
    }).join("") : '<p class="p-sub">Hali ma\'lumot yo\'q.</p>') + '</div>';
  }
  var LINKS = [["instagram", "bio"], ["instagram", "stories"], ["telegram", "kanal"], ["vk", "post"], ["max", "kanal"], ["facebook", "post"], ["youtube", "video"], ["tiktok", "video"], ["whatsapp", "status"], ["email", "rassilka"]];
  function linksCard() {
    var base = location.origin + "/";
    return '<div class="p-card"><h3 style="margin:0 0 4px">🔗 Kuzatiladigan havolalar</h3><p class="p-sub">Telegram, MAX, WhatsApp va ilovalar ko\'pincha qayerdan kelganini aytmaydi. Ijtimoiy tarmoqlarga saytni shu havolalar bilan qo\'ying — statistika aniq bo\'ladi. «Nusxa» bosing va joylang.</p>' +
      '<div class="st-links">' + LINKS.map(function (l) {
        var u = base + "?utm_source=" + l[0] + "&utm_medium=social&utm_campaign=" + l[1];
        return '<div class="st-link"><span>' + srcName(l[0]) + ' · ' + esc(l[1]) + '</span><code>' + esc(u) + '</code><button type="button" class="btn btn--sm" data-copy="' + esc(u) + '">Nusxa</button></div>';
      }).join("") + '</div><p class="p-sub" style="margin-top:8px">O\'zingiz yangi belgi qo\'shsangiz ham bo\'ladi: <code>?utm_source=NOM&amp;utm_campaign=KAMPANIYA</code> — u «Belgili havola: NOM» bo\'lib chiqadi.</p></div>';
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
      '<p class="p-sub"><b>Tashrif</b> — har safar saytga kirish (bitta odam 3 marta kirsa — 3; 30 daqiqa ichidagi qayta ochish bitta tashrif). <b>Noyob</b> — bitta qurilma/brauzer bir marta sanaladi. Qidiruv robotlari, asoschi va menejerlar hisobga olinmaydi.</p>' +
      '<div class="filters" style="margin:10px 0">' + PER.map(function (x) { return '<button data-per="' + x[0] + '" class="' + (x[0] === per ? "is-on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' +
      '<div class="st-kpi"><div><b>' + n(d.visits) + '</b><small>Tashriflar (davrda, har kirish)</small></div><div><b>' + n(d.visitors) + '</b><small>Noyob tashrifchilar (davrda)</small></div><div><b>' + n(d.views) + '</b><small>Sahifa ko\'rishlar</small></div>' +
      '<div><b>' + n(d.new) + '</b><small>Yangi tashrifchilar</small></div><div><b>' + n(d.total_visits) + '</b><small>Jami tashriflar (hamma vaqt)</small></div><div><b>' + n(d.total) + '</b><small>Jami noyob (hamma vaqt)</small></div>' +
      '<div class="st-live"><b>' + n(d.online) + '</b><small>🟢 Hozir saytda</small></div></div>' +
      '<div class="st-chart">' + bars + '</div><p class="st-leg"><i class="st-v"></i> Tashrifchilar &nbsp; <i class="st-p"></i> Sahifa ko\'rishlar</p></div>' +
      '<div class="st-grid">' + list("Eng ko'p ochilgan sahifalar", d.pages, function (x) { return page(x.page); }) +
      list("Qaysi tilda o'qishadi", d.langs, function (x) { return LN[x.lang] || x.lang; }) +

      '<div class="p-card st-list"><h3>Qurilma</h3><div class="st-row"><span>📱 Telefon</span><i style="width:' + Math.round((dev.mobile || 0) / dt * 100) + '%"></i><b>' + Math.round((dev.mobile || 0) / dt * 100) + '%</b></div>' +
      '<div class="st-row"><span>💻 Kompyuter</span><i style="width:' + Math.round((dev.desktop || 0) / dt * 100) + '%"></i><b>' + Math.round((dev.desktop || 0) / dt * 100) + '%</b></div></div></div>';
    box.insertAdjacentHTML("beforeend", '<div class="st-grid">' +
      list2("📣 Qayerdan kelishdi", "Har bir tashrif qaysi manbadan boshlangan (Google, Instagram, Telegram…)", d.sources, function (x) { return srcName(x.src); }) +
      list2("🌍 Qaysi davlatdan", "Tashriflar soni davlat bo'yicha (27.11.2026 dan)", d.countries, function (x) { return flag(x.cc) + " " + cName(x.cc); }) +
      list2("🌐 Qaysi saytlardan", "Boshqa saytlardagi havolalar orqali kelganlar", d.sites, function (x) { return x.site; }) +
      list2("🏷 Kampaniyalar (utm_campaign)", "Belgili havolalar bo'yicha", d.campaigns, function (x) { return x.campaign; }) +
      '</div>' + linksCard());
    $$("[data-copy]", box).forEach(function (b) { b.onclick = function () { try { navigator.clipboard.writeText(b.dataset.copy); b.textContent = "✓ Nusxalandi"; setTimeout(function () { b.textContent = "Nusxa"; }, 1500); } catch (e) {} }; });
    $$("[data-per]", box).forEach(function (b) { b.onclick = function () { per = b.dataset.per; A.stats(); }; });
  };
})();
