/* Moviy Nomad — public partners page: cards, filters, profile, request through Moviy Nomad, verified reviews.
   Contacts of partners are never shown: every request goes to our team (site_requests). */
(function () {
  var SB = window.MN_SB || {}, X = window.MNX || {}, PT = window.MNPT || {}, LANG = window.MN_LANG || document.documentElement.lang || "en";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hdr(x) { var h = { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey }; for (var k in x || {}) h[k] = x[k]; return h; }
  function get(q) { return fetch(SB.url + "/rest/v1/" + q, { headers: hdr() }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); }
  async function rpc(n, p) { var r = await fetch(SB.url + "/rest/v1/rpc/" + n, { method: "POST", headers: hdr({ "Content-Type": "application/json" }), body: JSON.stringify({ p: p }) }); var b = await r.json().catch(function () { return null; }); if (!r.ok) throw new Error((b && b.message) || r.status); return b; }
  function img(path) { return path ? SB.url + "/storage/v1/object/public/partner-photos/" + path.split("/").map(encodeURIComponent).join("/") : ""; }
  function stars(r) { var n = Math.round(r || 0); return '<span class="pt-st">' + "★★★★★".slice(0, n) + '<i>' + "★★★★★".slice(n) + '</i></span>'; }
  // public points: real reviews weigh most, then trips with us, likes, shares and views
  function points(p) { return Math.round((p.reviews_count || 0) * 10 * ((p.rating || 0) / 5) + (p.trips_count || 0) * 5 + (p.likes_count || 0) * 2 + (p.shares_count || 0) * 3 + (p.views_count || 0) * 0.1 + (p.license_ok ? 5 : 0)); }
  function score(p) { return (p.featured ? 100000 : 0) + points(p) + (p.rating || 0) * 0.01; }
  function fmt(n) { n = +n || 0; return n >= 10000 ? Math.round(n / 1000) + "k" : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
  var VID = (function () { try { return localStorage.getItem("mn_vid") || ""; } catch (e) { return ""; } })();
  function liked(id) { try { return (localStorage.getItem("mn_liked") || "").indexOf(id) > -1; } catch (e) { return false; } }
  function setLiked(id, on) { try { var l = (localStorage.getItem("mn_liked") || "").split(",").filter(function (x) { return x && x !== id; }); if (on) l.push(id); localStorage.setItem("mn_liked", l.join(",")); } catch (e) {} }
  async function hit(id, k) {
    if (!VID) { try { VID = localStorage.getItem("mn_vid") || ""; } catch (e) {} }
    if (!VID) return null;
    try { var r = await rpc("partner_hit", { id: id, kind: k, vid: VID }); var p = ALL.filter(function (x) { return x.id === id; })[0]; if (p && r) { p.views_count = r.views; p.likes_count = r.likes; p.shares_count = r.shares; } return r; } catch (e) { return null; }
  }
  function stats(p) {
    return '<div class="pt-nums"><span title="' + esc(PT.views) + '">👁 <b>' + fmt(p.views_count) + '</b></span><span title="' + esc(PT.likes) + '">❤ <b data-lc="' + p.id + '">' + fmt(p.likes_count) + '</b></span>' +
      '<button type="button" class="pt-shr" data-share="' + p.id + '" title="' + esc(PT.share) + '" aria-label="' + esc(PT.share) + '" data-free>↗ <b data-sc="' + p.id + '">' + fmt(p.shares_count) + '</b></button><span class="pt-pts" title="' + esc(PT.rules) + '">🏆 <b>' + points(p) + '</b> ' + esc(PT.points) + '</span></div>';
  }
  var ALL = [], kind = window.MNPT_KIND || new URLSearchParams(location.search).get("k") || "", city = new URLSearchParams(location.search).get("c") || "", lng = new URLSearchParams(location.search).get("l") || "";
  function lkeys(p) { var out = []; (p.languages || []).forEach(function (l) { var k = window.MNLangs ? window.MNLangs.key(l) : l; if (k && out.indexOf(k) < 0) out.push(k); }); return out; }
  function lname(k) { return window.MNLangs ? window.MNLangs.label(k, LANG) : k; }
  function lflag(k) { return window.MNLangs ? window.MNLangs.flag(k) : "🗣"; }
  var CL = LANG === "uz" || LANG === "ru" ? LANG : "en";
  function ckey(n) { return window.MNCities ? window.MNCities.key(n) : String(n || "").toLowerCase(); }
  function cname(k) { return window.MNCities ? window.MNCities.label(k, CL) : k; }
  function inCity(p, k) { return ckey(p.city) === k || (p.cities || []).some(function (c) { return ckey(c) === k; }); }

  // ---------------------------------------------------------------- home page tiles: counts
  if ($("[data-ptn]") && !$("#pt-grid")) {
    get("partners_public?select=*").then(function (rows) {
      var c = {}; rows.forEach(function (r) { c[r.kind] = (c[r.kind] || 0) + 1; });
      $$("[data-ptn]").forEach(function (el) { var n = c[el.getAttribute("data-ptn")]; if (n) el.textContent = n + " " + (PT.partners_count || ""); });
      // approved guides (then others) appear on the home page as soon as the founder or a manager approves them
      var box = $("#pt-home"), page = { guide: "guides.html", driver: "transport.html", hotel: "hotels.html" };
      var top = rows.filter(function (p) { return p.photo; }).sort(function (a, b) { return (a.kind === "guide" ? 0 : 1) - (b.kind === "guide" ? 0 : 1) || score(b) - score(a); }).slice(0, 4);
      if (!box || !top.length) return;
      box.innerHTML = top.map(function (p) {
        var unit = p.kind === "hotel" ? PT.per_night : PT.per_day;
        return '<a class="pth" href="' + (page[p.kind] || "partners.html?k=other") + '#p-' + p.id + '"><span class="pth__img" style="--ph:url(\'' + img(p.photo) + '\')"><img src="' + img(p.photo) + '" alt="" loading="lazy">' + (p.license_ok ? '<i>✓ ' + esc(PT.verified) + '</i>' : '') + '</span>' +
          '<span class="pth__b"><small>' + esc(PT["k_" + p.kind] || "") + ' · ' + esc(p.city || "") + '</small><b>' + esc(p.name) + '</b>' +
          '<span class="pth__m">' + (p.reviews_count ? stars(p.rating) + ' ' + Number(p.rating).toFixed(1) : '<em>' + esc(PT["new"]) + '</em>') + '</span>' +
          ((p.languages || []).length ? '<span class="pth__l">🗣 ' + esc(p.languages.slice(0, 3).join(", ")) + '</span>' : '') + '</span></a>';
      }).join("");
      box.hidden = false;
    });
    return;
  }
  var grid = $("#pt-grid"); if (!grid) return;

  function card(p, rank) {
    var unit = p.kind === "hotel" ? PT.per_night : PT.per_day;
    var facts = [];
    if (p.kind === "guide" && p.experience_years) facts.push(p.experience_years + " " + PT.exp);
    if (p.kind === "driver" && p.vehicle_type) facts.push(esc(p.vehicle_type) + (p.vehicle_seats ? " · " + p.vehicle_seats + " " + PT.seats : ""));
    if (p.kind === "hotel" && p.hotel_stars) facts.push(p.hotel_stars + " " + PT.stars);
    return '<article class="pt-card" id="p-' + p.id + '"><div class="pt-card__img"' + (p.photo ? ' style="--ph:url(\'' + img(p.photo) + '\')"' : '') + '>' + (p.photo ? '<img class="pt-card__ph" src="' + img(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">' : '') +
      (p.license_ok ? '<span class="pt-badge">✓ ' + esc(PT.verified) + '</span>' : '') + (rank ? '<span class="pt-rank' + (rank <= 3 ? ' pt-rank--' + rank : '') + '">#' + rank + '</span>' : '') +
      '<div class="pt-card__name"><b>' + esc(p.name) + '</b><small>📍 ' + esc([p.city].concat(p.cities || []).filter(Boolean).map(function (c) { return cname(ckey(c)); }).filter(function (c, i, a) { return a.indexOf(c) === i; }).slice(0, 3).join(", ")) + '</small></div></div>' +
      '<div class="pt-card__body"><div class="pt-card__rate">' + (p.reviews_count ? stars(p.rating) + ' <b>' + Number(p.rating).toFixed(1) + '</b> <small>(' + p.reviews_count + ')</small>' : '<span class="pt-new">' + esc(PT.new) + '</span>') +
      '</div>' + stats(p) +
      (facts.length ? '<p class="pt-facts">' + facts.join(" · ") + '</p>' : '') +
      (lkeys(p).length ? '<p class="pt-langs">' + lkeys(p).slice(0, 4).map(function (k) { return '<span class="pt-lg' + (k === lng ? ' is-on' : '') + '">' + lflag(k) + ' ' + esc(lname(k)) + '</span>'; }).join("") + (lkeys(p).length > 4 ? ' <span class="pt-lg">+' + (lkeys(p).length - 4) + '</span>' : '') + '</p>' : '') +
      (p.price_brutto ? '<p class="pt-price">' + esc(PT.from) + ' <b>$' + Math.round(p.price_brutto) + '</b> ' + esc(unit) + '</p>' : '') +
      '<div class="pt-card__btns"><button class="btn btn--gold btn--sm" data-ask="' + p.id + '">' + esc(PT.ask) + '</button><button class="btn btn--outline btn--sm" data-prof="' + p.id + '">' + esc(PT.profile) + '</button></div></div></article>';
  }
  function draw() {
    $$("#pt-tabs [data-pk]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-pk") === kind); });
    if (!window.MNPT_KIND) $$(".ksub a").forEach(function (a) { var h = a.getAttribute("href"); a.classList.toggle("is-on", kind === "other" ? h.indexOf("k=other") > -1 : (!kind && h === "partners.html")); });
    // ranking scope = current kind + chosen city + chosen language: TOP-4 and places are counted inside that scope
    var ranked = ALL.filter(function (p) { return (!kind || p.kind === kind) && (!city || inCity(p, city)) && (!lng || lkeys(p).indexOf(lng) > -1); })
      .sort(function (a, b) { return score(b) - score(a); });
    var rankOf = {}; ranked.forEach(function (p, i) { rankOf[p.id] = i + 1; });
    var list = ranked;
    cityChips(); langChips();
    var topBox = $("#pt-top"), top = (kind && ranked.length) ? ranked.slice(0, 4) : [];
    var where = city ? String(PT.in_city || "— {c}").replace("{c}", cname(city)) : "— " + (PT.all_uz || "");
    if (topBox) {
      topBox.hidden = !top.length;
      topBox.innerHTML = top.length ? '<div class="pt-top__head"><div class="orn-line"><i></i></div><h2>🏆 ' + esc(PT.top_t) + ' <span class="pt-where">' + esc(where) + '</span></h2><p>' + esc(PT.top_sub) + '</p></div><div class="pt-grid pt-grid--top">' + top.map(function (p) { return card(p, rankOf[p.id]); }).join("") + '</div>' +
        (ranked.length > 4 ? '<div class="pt-seeall"><button type="button" id="pt-seeall" data-free>' + esc(String(PT.see_all || "{n}").replace("{n}", ranked.length)) + '<i aria-hidden="true">↓</i></button></div>' +
          '<h3 class="pt-rest" id="pt-rest">' + esc(PT.rest_t) + ' <span class="pt-where">' + esc(where) + '</span></h3>' : '') : "";
      var sa = $("#pt-seeall"); if (sa) sa.onclick = function () { var r = $("#pt-rest"); if (r) window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); };
    }
    var rest = top.length ? list.slice(4) : list;
    grid.innerHTML = rest.length ? rest.map(function (p) { return card(p, rankOf[p.id]); }).join("") : (top.length ? "" : '<p class="pt-empty">' + esc(city && ALL.length ? PT.no_city : PT.empty) + '</p>');
    bindCards(topBox); bindCards(grid);
  }

  // ---- open portfolio: all photos as a mosaic, likes per photo, the most liked first, 10 shown then "see all"
  function plLiked(path) { try { return (localStorage.getItem("mn_plike") || "").split("|").indexOf(path) > -1; } catch (e) { return false; } }
  function plSet(path, on) { try { var l = (localStorage.getItem("mn_plike") || "").split("|").filter(function (x) { return x && x !== path; }); if (on) l.push(path); localStorage.setItem("mn_plike", l.slice(-400).join("|")); } catch (e) {} }
  async function gallery(p) {
    var box = $("#pp-gal"); if (!box) return;
    var likes = {}; (await get("partner_photo_likes_public?select=path,likes&partner_id=eq." + p.id) || []).forEach(function (r) { likes[r.path] = r.likes; });
    var list = p.photos.map(function (x, i) { return { path: x, i: i, n: likes[x] || 0 }; }).sort(function (a, b) { return b.n - a.n || a.i - b.i; });
    var all = false;
    function tile(x, k) {
      return '<figure class="gph' + (k === 0 ? ' gph--big' : '') + '" data-k="' + k + '"><img loading="lazy" src="' + img(x.path) + '" alt="">' +
        '<button type="button" class="gph__like' + (plLiked(x.path) ? ' is-on' : '') + '" data-pl="' + k + '" aria-label="' + esc(PT.like) + '" data-free>❤ <b>' + x.n + '</b></button></figure>';
    }
    function draw() {
      box.innerHTML = list.slice(0, all ? 30 : 10).map(tile).join("");
      $$("[data-pl]", box).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); likePhoto(list[+b.getAttribute("data-pl")]); }; });
      $$(".gph", box).forEach(function (f) { f.onclick = function () { lightbox(+f.getAttribute("data-k")); }; });
      var m = $("#pp-gal-more"); if (m) m.textContent = all ? PT.gal_less : String(PT.gal_all).replace("{n}", list.length);
    }
    async function likePhoto(x) {
      if (!VID) { try { VID = localStorage.getItem("mn_vid") || ""; } catch (e) {} }
      var on = !plLiked(x.path); plSet(x.path, on); x.n = Math.max(0, x.n + (on ? 1 : -1)); draw(); lbSync();
      try { var r = await rpc("partner_photo_like", { id: p.id, path: x.path, vid: VID || ("v" + Math.random().toString(36).slice(2, 12)), on: on }); if (r) { x.n = r.likes; plSet(x.path, r.liked); draw(); lbSync(); } } catch (e) {}
    }
    var lb = null, cur = 0;
    function lbSync() { if (!lb || lb.hidden) return; var x = list[cur]; lb.querySelector("img").src = img(x.path); var b = lb.querySelector(".glb__like"); b.classList.toggle("is-on", plLiked(x.path)); b.querySelector("b").textContent = x.n; lb.querySelector(".glb__n").textContent = (cur + 1) + " / " + list.length; }
    function lightbox(k) {
      if (!lb) {
        lb = document.createElement("div"); lb.className = "glb"; lb.setAttribute("data-free", "");
        lb.innerHTML = '<button type="button" class="glb__x" aria-label="×">×</button><button type="button" class="glb__p" aria-label="‹">‹</button><img alt=""><button type="button" class="glb__nx" aria-label="›">›</button>' +
          '<div class="glb__bar"><span class="glb__n"></span><button type="button" class="glb__like">❤ <b>0</b></button></div>';
        document.body.appendChild(lb);
        lb.querySelector(".glb__x").onclick = function () { lb.hidden = true; };
        lb.onclick = function (e) { if (e.target === lb) lb.hidden = true; };
        lb.querySelector(".glb__p").onclick = function () { cur = (cur - 1 + list.length) % list.length; lbSync(); };
        lb.querySelector(".glb__nx").onclick = function () { cur = (cur + 1) % list.length; lbSync(); };
        lb.querySelector(".glb__like").onclick = function () { likePhoto(list[cur]); };
        document.addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") lb.hidden = true; if (e.key === "ArrowRight") lb.querySelector(".glb__nx").click(); if (e.key === "ArrowLeft") lb.querySelector(".glb__p").click(); });
      }
      cur = k; lb.hidden = false; lbSync();
    }
    var more = $("#pp-gal-more"); if (more) more.onclick = function () { all = !all; draw(); };
    draw();
  }
  function bindCards(root) {
    if (!root) return;
    $$("[data-ask]", root).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-ask"), "ask"); }; });
    $$("[data-prof]", root).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-prof"), "prof"); }; });
    $$("[data-like]", root).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); like(b.getAttribute("data-like")); }; });
    $$("[data-share]", root).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); share(b.getAttribute("data-share"), b); }; });
  }
  async function like(id) {
    var on = !liked(id); setLiked(id, on);
    $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", on); });
    var r = await hit(id, on ? "like" : "unlike");
    if (r) { setLiked(id, r.liked); $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", r.liked); }); $$('[data-lc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.likes); }); }
  }
  async function share(id, btn) {
    var p = ALL.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var pg = { guide: "guides.html", driver: "transport.html", hotel: "hotels.html" }[p.kind] || "partners.html";
    var url = location.origin + location.pathname.replace(/[^\/]*$/, "") + pg + "#p-" + id, done = false;
    try { if (navigator.share) { await navigator.share({ title: p.name + " — Moviy Nomad", url: url }); done = true; } } catch (e) { if (e && e.name === "AbortError") return; }
    if (!done) {
      try { await navigator.clipboard.writeText(url); } catch (e) { window.prompt("", url); }
      var t = $("#pt-share-ok"); if (t && modal.classList.contains("is-open")) { t.hidden = false; setTimeout(function () { t.hidden = true; }, 2200); }
      else if (btn) { var o = btn.innerHTML; btn.innerHTML = "✓ " + esc(PT.copied); btn.classList.add("is-ok"); setTimeout(function () { btn.innerHTML = o; btn.classList.remove("is-ok"); }, 2200); }
    }
    var r = await hit(id, "share"); if (r) $$('[data-sc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.shares); });
  }

  $$("#pt-tabs [data-pk]").forEach(function (b) { b.onclick = function () { kind = b.getAttribute("data-pk"); history.replaceState(null, "", location.pathname + (kind ? "?k=" + kind : "")); draw(); }; });
  function cityChips() {
    var box = $("#pt-cities"); if (!box) return;
    var cnt = {}, base = ALL.filter(function (p) { return !kind || p.kind === kind; });
    base.forEach(function (p) { var seen = {}; [p.city].concat(p.cities || []).forEach(function (c) { var k = ckey(c); if (k && !seen[k]) { seen[k] = 1; cnt[k] = (cnt[k] || 0) + 1; } }); });
    var keys = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || cname(a).localeCompare(cname(b)); });
    if (city && keys.indexOf(city) < 0) keys.unshift(city);
    box.innerHTML = '<button type="button" data-city="" data-free class="' + (!city ? "is-on" : "") + '">🇺🇿 ' + esc(PT.all_cities) + ' <b>' + base.length + '</b></button>' +
      keys.map(function (k) { return '<button type="button" data-city="' + esc(k) + '" data-free class="' + (city === k ? "is-on" : "") + '">📍 ' + esc(cname(k)) + ' <b>' + (cnt[k] || 0) + '</b></button>'; }).join("");
    $$("[data-city]", box).forEach(function (b) { b.onclick = function () {
      city = b.getAttribute("data-city"); var q = new URLSearchParams(location.search); city ? q.set("c", city) : q.delete("c");
      history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); draw();
      var t = $("#pt-top"); if (t && !t.hidden) t.scrollIntoView({ behavior: "smooth", block: "start" });
    }; });
  }
  // "Which language do you need?" — chips with the languages partners of this kind speak (in the chosen city)
  function langChips() {
    var box = $("#pt-langc"); if (!box) return;
    var cnt = {}, base = ALL.filter(function (p) { return (!kind || p.kind === kind) && (!city || inCity(p, city)); });
    base.forEach(function (p) { lkeys(p).forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; }); });
    var keys = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || lname(a).localeCompare(lname(b)); });
    if (lng && keys.indexOf(lng) < 0) keys.unshift(lng);
    box.innerHTML = '<button type="button" data-lng="" data-free class="' + (!lng ? "is-on" : "") + '">🌐 ' + esc(PT.all_langs) + '</button>' +
      keys.map(function (k) { return '<button type="button" data-lng="' + esc(k) + '" data-free class="' + (lng === k ? "is-on" : "") + '">' + lflag(k) + ' ' + esc(lname(k)) + ' <b>' + (cnt[k] || 0) + '</b></button>'; }).join("");
    $$("[data-lng]", box).forEach(function (b) { b.onclick = function () {
      lng = b.getAttribute("data-lng"); var q = new URLSearchParams(location.search); lng ? q.set("l", lng) : q.delete("l");
      history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); draw();
    }; });
  }

  // ---------------------------------------------------------------- hotel room types / transport vehicles (brutto prices only)
  async function units(p) {
    var U = window.MNPT_U || {}, el = $("#pp-units"); if (!el) return;
    var rows = await get("partner_units_public?select=*&partner_id=eq." + p.id + "&order=sort,price_brutto");
    var ex = ((await get("partner_extra_public?select=extra&partner_id=eq." + p.id))[0] || {}).extra || {};
    var room = p.kind === "hotel", AMK = { ac: "ac_a", transfer: "transfer_a", family: "family_a" };
    var h = "";
    if (room && ((ex.amenities || []).length || ex.check_in || ex.map_url)) {
      h += '<div class="pp-amen"><h4>✨ ' + esc(U.amen_t) + '</h4><p>' + (ex.amenities || []).map(function (k) { return '<span class="pt-lg">' + esc(U[AMK[k] || k] || k) + '</span>'; }).join(" ") + '</p>' +
        '<p class="pt-note">' + [ex.check_in ? esc(U.check_in) + " " + esc(ex.check_in) : "", ex.check_out ? esc(U.check_out) + " " + esc(ex.check_out) : ""].filter(Boolean).join(" · ") +
        (ex.map_url ? ' · <a href="' + esc(ex.map_url) + '" target="_blank" rel="noopener">📍 ' + esc(U.map) + '</a>' : '') + '</p>' + (ex.policies ? '<p class="pt-note">' + esc(U.policies) + ': ' + esc(ex.policies) + '</p>' : '') + '</div>';
    }
    if (rows.length) {
      h += '<h4>' + (room ? "🛏 " + esc(U.rooms_t) : "🚐 " + esc(U.cars_t)) + '</h4><div class="pp-units" style="display:grid;gap:10px;margin:0 0 16px">' + rows.map(function (u) {
        var spec = room ? [U[u.class] || "", (u.capacity || "") + " " + esc(U.guests), u.beds || "", u.breakfast ? U.bf_yes : U.bf_no]
                        : [U[u.class] || "", (u.capacity || "") + " " + esc(U.seats), u.luggage != null ? u.luggage + " " + U.bags : "", u.year || "", u.ac ? U.ac : ""];
        return '<div style="display:flex;gap:12px;align-items:center;border:1px solid #e5e0d5;border-radius:14px;padding:10px">' +
          (u.photos && u.photos[0] ? '<img src="' + img(u.photos[0]) + '" alt="" loading="lazy" style="width:96px;height:72px;object-fit:cover;border-radius:10px;flex-shrink:0">' : '') +
          '<div style="flex:1;min-width:0"><b>' + esc(u.name) + '</b><br><small>' + esc(spec.filter(Boolean).join(" · ")) + '</small></div>' +
          '<div style="text-align:right;white-space:nowrap">' + (u.price_brutto ? '<b>$' + Math.round(u.price_brutto) + '</b><br><small>' + esc(room ? U.per_night : U.per_day) + '</small>' : '') +
          (u.transfer_brutto ? '<br><small>' + esc(U.transfer) + ' $' + Math.round(u.transfer_brutto) + '</small>' : '') + '</div></div>';
      }).join("") + '</div>';
    }
    el.innerHTML = h;
  }

  // ---------------------------------------------------------------- profile / request / review modal
  var modal = $("#pt-modal"), form = $("#pt-form"), rform = $("#pt-rform"), cur = null;
  function show(m) { modal.classList.add("is-open"); }
  async function open(id, mode) {
    cur = ALL.filter(function (p) { return p.id === id; })[0]; if (!cur) return;
    if (window.MN_TRACK) window.MN_TRACK("partner", (mode === "ask" ? "request: " : "profile: ") + cur.name);
    $("#pt-fname").textContent = cur.name; if (window.MN_PT_EST) window.MN_PT_EST();
    var box = $("#pt-prof");
    var mbox = $(".modal__box", modal); if (mbox) mbox.classList.toggle("modal__box--wide", mode === "prof");
    if (mode === "prof") {
      var rv = await get("partner_reviews_public?partner_id=eq." + id + "&order=created_at.desc&limit=30");
      var same = ALL.filter(function (x) { return x.kind === cur.kind; }).sort(function (a, b) { return score(b) - score(a); });
      var rank = same.indexOf(cur) + 1, unit = cur.kind === "hotel" ? PT.per_night : PT.per_day;
      var places = [cur.city].concat(cur.cities || []).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
      var cell = function (ic, n, l, attr) { return '<div><b' + (attr || "") + '>' + n + '</b><small>' + ic + ' ' + esc(l) + '</small></div>'; };
      var nums = cell("👁", fmt(cur.views_count), PT.views, ' data-vc="' + id + '"') + cell("❤", fmt(cur.likes_count), PT.likes, ' data-lc="' + id + '"') + cell("↗", fmt(cur.shares_count), PT.shares, ' data-sc="' + id + '"') +
        cell("🏆", points(cur), PT.points) + cell("★", cur.reviews_count ? Number(cur.rating).toFixed(1) : "—", PT.rating_l) + cell("💬", cur.reviews_count || 0, PT.reviews_l) +
        cell("🧭", cur.trips_count || 0, PT.trips_l) + (cur.experience_years ? cell("⏳", cur.experience_years, PT.exp_l + " (" + PT.exp.split(" ")[0] + ")") : "") + (cur.age && cur.kind !== "hotel" ? cell("🎂", cur.age, PT.age) : "");
      var row = function (l, v) { return v ? '<div><dt>' + esc(l) + '</dt><dd>' + esc(v) + '</dd></div>' : ""; };
      var info = row(PT.langs, lkeys(cur).map(function (k) { return lflag(k) + " " + lname(k); }).join(", ")) + row(PT.works_in, places.join(", ")) + row(PT.lives, cur.home_area) + row(PT.spec, (cur.specialties || []).join(", ")) +
        (cur.kind === "driver" ? row("🚗", [cur.vehicle_type, cur.vehicle_seats ? cur.vehicle_seats + " " + PT.seats : "", cur.vehicle_year].filter(Boolean).join(" · ")) : "") +
        (cur.kind === "hotel" && cur.hotel_stars ? row("★", cur.hotel_stars + " " + PT.stars) : "");
      box.innerHTML = '<div class="pp"><div class="pp__hero">' + (cur.photo ? '<span class="pp__mainw" style="--ph:url(\'' + img(cur.photo) + '\')"><img class="pp__main" src="' + img(cur.photo) + '" alt=""></span>' : '') +
        '<div class="pp__id"><span class="pp__kind">' + esc(PT["k_" + cur.kind] || "") + (rank ? ' · 🏆 #' + rank + (rank <= 4 ? ' · ' + esc(PT.top_t) : '') : '') + '</span>' +
        '<h3>' + esc(cur.name) + '</h3><p>' + (cur.reviews_count ? stars(cur.rating) + ' <b>' + Number(cur.rating).toFixed(1) + '</b> (' + cur.reviews_count + ')' : '<span class="pt-new">' + esc(PT.new) + '</span>') + (cur.license_ok ? ' · <span class="pp__ok">✓ ' + esc(PT.verified) + '</span>' : '') + '</p>' +
        (cur.price_brutto ? '<p class="pp__price">' + esc(PT.from) + ' <b>$' + Math.round(cur.price_brutto) + '</b> ' + esc(unit) + (cur.price_note ? ' — ' + esc(cur.price_note) : '') + '</p>' : '') +
        '<div class="pp__acts"><button type="button" class="pp__btn pt-like' + (liked(id) ? ' is-on' : '') + '" data-like="' + id + '" data-free>❤ ' + esc(PT.like) + '</button><button type="button" class="pp__btn" id="pp-share" data-free>↗ ' + esc(PT.share) + '</button>' +
        '<small id="pt-share-ok" hidden>✓ ' + esc(PT.copied) + '</small></div></div></div>' +
        '<div class="pp__nums">' + nums + '</div>' + (info ? '<dl class="pp__info">' + info + '</dl>' : '') +
        '<div id="pp-units"></div>' +
        '<div class="pp__cal"><h4>📅 ' + esc(PT.cal_t) + '</h4><p>' + esc(PT.cal_hint) + '</p><div id="pp-cal"></div><div class="pp__calmsg" id="pp-calmsg"></div></div>' +
        (cur.bio ? '<p class="pt-bio">' + esc(cur.bio) + '</p>' : '') +
        ((cur.photos || []).length ? '<div class="pp__galw"><h4>📸 ' + esc(PT.gal_t) + ' <small>(' + cur.photos.length + ')</small></h4><div class="gmos" id="pp-gal"></div>' +
          (cur.photos.length > 10 ? '<p class="gmos__more"><button type="button" class="btn btn--outline btn--sm" id="pp-gal-more" data-free>' + esc(String(PT.gal_all).replace("{n}", cur.photos.length)) + '</button></p>' : '') + '</div>' : '') +
        '<h4>' + esc(PT.reviews) + ' (' + rv.length + ')</h4>' + (rv.length ? rv.map(function (r) { return '<div class="pt-rv">' + stars(r.rating) + ' <b>' + esc(r.name) + '</b> <small>' + esc(r.country || "") + ' · ' + new Date(r.created_at).toLocaleDateString() + '</small>' + (r.body ? '<p>' + esc(r.body) + '</p>' : '') + '</div>'; }).join("") : '<p class="pt-note">' + esc(PT.rv_note) + '</p>') +
        '<p class="pt-prof__btns"><button class="btn btn--gold btn--sm" id="pt-go-ask">' + esc(PT.ask) + '</button> <button class="btn btn--outline btn--sm" id="pt-go-rv">' + esc(PT.write) + '</button></p></div>';
      form.hidden = true; rform.hidden = true;
      $("#pt-go-ask").onclick = function () { open(id, "ask"); };
      $("#pt-go-rv").onclick = function () { box.innerHTML = ""; form.hidden = true; rform.hidden = false; msg(rform, ""); };
      $("#pp-share").onclick = function () { share(id); };
      if ((cur.photos || []).length) gallery(cur);
      if (cur.kind === "hotel" || cur.kind === "driver") units(cur);
      get("partner_busy_public?select=day&partner_id=eq." + id).then(function (rows) {
        var busy = {}; (rows || []).forEach(function (r) { busy[r.day] = true; });
        var el = $("#pp-cal"); if (!el || !window.MNCal) return;
        window.MNCal.render(el, { lang: LANG, months: window.innerWidth < 640 ? 1 : 2, busy: busy, legend: [esc(PT.cal_free), esc(PT.cal_busy)],
          onPick: function (day, isBusy) {
            var m = $("#pp-calmsg");
            if (isBusy) { m.textContent = "⛔ " + PT.cal_busy_msg; m.style.color = "#b42323"; return; }
            open(id, "ask").then(function () { if (form.elements.start_date) form.elements.start_date.value = day; });
          } });
      });
      bindCards(box);
      hit(id, "view").then(function (r) { if (r) { $$('[data-vc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.views); }); setLiked(id, r.liked); $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", r.liked); }); } });
    } else { box.innerHTML = ""; form.hidden = false; rform.hidden = true; msg(form, ""); }
    show();
  }
  function msg(f, t, k) { var m = $(".mf-msg", f); if (m) { m.className = "mf-msg" + (k ? " mf-msg--" + k : ""); m.textContent = t || ""; } }
  function v(f, n) { var el = f.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function req(f) { var bad = $$("[required]", f).filter(function (el) { return el.type === "checkbox" ? !el.checked : !String(el.value || "").trim(); }); if (bad.length) { msg(f, X.f_required || "*", "err"); bad[0].focus(); return false; } return true; }
  // B2C portal: everyone fills the same form. Country from the list:
  // Uzbekistan → Telegram + phone number required, e-mail optional; any other country → WhatsApp number + e-mail required
  function rqRules() {
    var cc = window.MNCountries ? window.MNCountries.code(form.elements.country) : "", uz = cc === "UZ", wl = $("#rq-wa-l"), el = $("#rq-em-l");
    $("#rq-tg").hidden = !uz; form.elements.telegram.required = uz;
    form.elements.phone.required = true; wl.textContent = uz ? wl.getAttribute("data-opt") : wl.getAttribute("data-req");
    form.elements.email.required = !uz; el.textContent = uz ? el.getAttribute("data-opt") : el.getAttribute("data-req");
    return cc;
  }
  if (window.MNCountries) window.MNCountries.attach(form.elements.country, LANG);
  ["change", "input"].forEach(function (ev) { form.addEventListener(ev, function (e) { if (e.target.name === "country") rqRules(); }); });
  // estimated price = brutto per day / night × days (the server keeps the real calculation)
  function est() {
    var box = $("#pt-est"); if (!box) return;
    var n = Math.max(1, parseInt(v(form, "units"), 10) || 1), pb = cur && +cur.price_brutto;
    box.hidden = !pb; if (pb) $("b", box).textContent = "$" + Math.round(pb * n).toLocaleString("en-US") + " (" + n + " × $" + Math.round(pb) + ")";
  }
  form.addEventListener("input", function (e) { if (e.target.name === "units") est(); });
  window.MN_PT_EST = est;
  form.onsubmit = async function (e) {
    e.preventDefault();
    var cc = rqRules();
    if (!cc) { msg(form, PT.rq_e_country, "err"); form.elements.country.focus(); return; }
    var tg = v(form, "telegram"), wa = v(form, "phone");
    if (cc === "UZ" && tg.replace(/^@/, "").length < 5) { msg(form, PT.rq_e_tg, "err"); form.elements.telegram.focus(); return; }
    if (wa.replace(/\D/g, "").length < 7) { msg(form, cc === "UZ" ? PT.rq_e_phone : PT.rq_e_wa, "err"); form.elements.phone.focus(); return; }
    if (!req(form)) return; var b = $("button[type=submit]", form); b.disabled = true;
    try {
      var ref = await rpc("submit_site_request", {
        kind: "service", service: "partner", tour_id: cur.id, tour_title: (PT["k_" + cur.kind] || "") + ": " + cur.name,
        start_date: v(form, "start_date"), pax: v(form, "pax"), contact_name: v(form, "contact_name"), email: v(form, "email"), phone: wa,
        messenger: cc === "UZ" ? "telegram " + tg : "whatsapp",
        citizenship: window.MNCountries.name(cc, "en"), message: v(form, "message"),
        details: { partner_id: cur.id, partner_kind: cur.kind, partner_name: cur.name, country_code: cc, telegram: tg, whatsapp: wa, units: Math.max(1, parseInt(v(form, "units"), 10) || 1) },
        consent: form.elements.consent ? form.elements.consent.checked : true, lang: LANG });
      if (window.MN_TRACK) window.MN_TRACK("request", "partner " + cur.name + " " + ref);
      msg(form, (X.f_ok_title || "OK") + " — " + String(X.f_ok_text || "{ref}").replace("{ref}", ref), "ok"); form.reset(); rqRules();
    } catch (er) {
      var m = String(er && er.message || er);
      msg(form, /whatsapp_required/.test(m) ? PT.rq_e_wa : /telegram_required/.test(m) ? PT.rq_e_tg : /phone_required/.test(m) ? PT.rq_e_phone : /country_required/.test(m) ? PT.rq_e_country : /email_required|contact_required/.test(m) ? (X.f_err || m) : (X.f_err || m), "err");
    }
    b.disabled = false;
  };
  rform.onsubmit = async function (e) {
    e.preventDefault(); if (!req(rform)) return; var b = $("button[type=submit]", rform); b.disabled = true;
    try {
      await rpc("submit_partner_review", { partner_id: cur.id, trip_ref: v(rform, "trip_ref"), email: v(rform, "email"), name: v(rform, "name"), country: v(rform, "country"),
        rating: (rform.querySelector("[name=rating]:checked") || {}).value || 5, body: v(rform, "body") });
      msg(rform, PT.rv_ok, "ok"); rform.reset();
    } catch (er) { msg(rform, /not_verified|already/.test(String(er)) ? PT.rv_bad : (X.f_err || String(er)), "err"); }
    b.disabled = false;
  };

  // ---------------------------------------------------------------- load
  get("partners_public?select=*").then(function (rows) {
    ALL = rows || [];
    var cities = {}, langs = {};
    ALL.forEach(function (p) { [p.city].concat(p.cities || []).filter(Boolean).forEach(function (c) { cities[c] = 1; }); (p.languages || []).forEach(function (l) { langs[l] = 1; }); });
    draw();
    var h = location.hash.match(/^#p-(.+)$/); if (h) { var el = document.getElementById("p-" + h[1]); if (el) el.scrollIntoView({ block: "center" }); if (ALL.some(function (p) { return p.id === h[1]; })) open(h[1], "prof"); }
  });
})();
/* Links like partners.html#join / guides.html#join: the cards load later and push the section down — keep the section in view
   for the first seconds unless the visitor scrolls himself. */
(function () {
  var id = (location.hash || "").slice(1); if (!/^[a-z][\w-]*$/i.test(id)) return;
  var moved = false, n = 0;
  ["wheel", "touchmove", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { passive: true, once: true }); });
  var t = setInterval(function () {
    var el = document.getElementById(id); n++;
    if (moved || n > 12) { clearInterval(t); return; }
    if (el && Math.abs(el.getBoundingClientRect().top - 80) > 40) el.scrollIntoView({ block: "start" });
  }, 400);
})();
