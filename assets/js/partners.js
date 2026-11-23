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
      '<span title="' + esc(PT.shares) + '">↗ <b>' + fmt(p.shares_count) + '</b></span><span class="pt-pts" title="' + esc(PT.rules) + '">🏆 <b>' + points(p) + '</b> ' + esc(PT.points) + '</span></div>';
  }
  var ALL = [], kind = window.MNPT_KIND || new URLSearchParams(location.search).get("k") || "", city = "", lng = "";

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
        return '<a class="pth" href="' + (page[p.kind] || "partners.html?k=other") + '#p-' + p.id + '"><span class="pth__img" style="background-image:url(\'' + img(p.photo) + '\')">' + (p.license_ok ? '<i>✓ ' + esc(PT.verified) + '</i>' : '') + '</span>' +
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
    return '<article class="pt-card" id="p-' + p.id + '"><div class="pt-card__img"' + (p.photo ? ' style="background-image:url(\'' + img(p.photo) + '\')"' : '') + '>' +
      (p.license_ok ? '<span class="pt-badge">✓ ' + esc(PT.verified) + '</span>' : '') + (rank ? '<span class="pt-rank' + (rank <= 3 ? ' pt-rank--' + rank : '') + '">#' + rank + '</span>' : '') +
      '<div class="pt-card__name"><b>' + esc(p.name) + '</b><small>📍 ' + esc([p.city].concat((p.cities || []).filter(function (c) { return c !== p.city; })).filter(Boolean).slice(0, 3).join(", ")) + '</small></div></div>' +
      '<div class="pt-card__body"><div class="pt-card__rate">' + (p.reviews_count ? stars(p.rating) + ' <b>' + Number(p.rating).toFixed(1) + '</b> <small>(' + p.reviews_count + ')</small>' : '<span class="pt-new">' + esc(PT.new) + '</span>') +
      '</div>' + stats(p) +
      (facts.length ? '<p class="pt-facts">' + facts.join(" · ") + '</p>' : '') +
      ((p.languages || []).length ? '<p class="pt-langs">🗣 ' + esc(p.languages.slice(0, 4).join(", ")) + (p.languages.length > 4 ? " +" + (p.languages.length - 4) : "") + '</p>' : '') +
      '<div class="pt-card__btns"><button class="btn btn--gold btn--sm" data-ask="' + p.id + '">' + esc(PT.ask) + '</button><button class="btn btn--outline btn--sm" data-prof="' + p.id + '">' + esc(PT.profile) + '</button></div></div></article>';
  }
  function draw() {
    $$("#pt-tabs [data-pk]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-pk") === kind); });
    if (!window.MNPT_KIND) $$(".ksub a").forEach(function (a) { var h = a.getAttribute("href"); a.classList.toggle("is-on", kind === "other" ? h.indexOf("k=other") > -1 : (!kind && h === "partners.html")); });
    var ranked = ALL.filter(function (p) { return !kind || p.kind === kind; }).sort(function (a, b) { return score(b) - score(a); });
    var rankOf = {}; ranked.forEach(function (p, i) { rankOf[p.id] = i + 1; });
    var list = ranked.filter(function (p) { return (!city || p.city === city || (p.cities || []).indexOf(city) > -1) && (!lng || (p.languages || []).indexOf(lng) > -1); });
    var topBox = $("#pt-top"), top = (!city && !lng && kind && ranked.length) ? ranked.slice(0, 4) : [];
    if (topBox) {
      topBox.hidden = !top.length;
      topBox.innerHTML = top.length ? '<div class="pt-top__head"><div class="orn-line"><i></i></div><h2>🏆 ' + esc(PT.top_t) + '</h2><p>' + esc(PT.top_sub) + '</p></div><div class="pt-grid pt-grid--top">' + top.map(function (p) { return card(p, rankOf[p.id]); }).join("") + '</div>' +
        (ranked.length > 4 ? '<h3 class="pt-rest">' + esc(PT.rest_t) + '</h3>' : '') : "";
    }
    var rest = top.length ? list.slice(4) : list;
    grid.innerHTML = rest.length ? rest.map(function (p) { return card(p, rankOf[p.id]); }).join("") : (top.length ? "" : '<p class="pt-empty">' + esc(PT.empty) + '</p>');
    bindCards(topBox); bindCards(grid);
  }
  function bindCards(root) {
    if (!root) return;
    $$("[data-ask]", root).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-ask"), "ask"); }; });
    $$("[data-prof]", root).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-prof"), "prof"); }; });
    $$("[data-like]", root).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); like(b.getAttribute("data-like")); }; });
  }
  async function like(id) {
    var on = !liked(id); setLiked(id, on);
    $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", on); });
    var r = await hit(id, on ? "like" : "unlike");
    if (r) { setLiked(id, r.liked); $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", r.liked); }); $$('[data-lc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.likes); }); }
  }
  async function share(id) {
    var p = ALL.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var url = location.origin + location.pathname + "#p-" + id, done = false;
    try { if (navigator.share) { await navigator.share({ title: p.name + " — Moviy Nomad", url: url }); done = true; } } catch (e) { if (e && e.name === "AbortError") return; }
    if (!done) { try { await navigator.clipboard.writeText(url); } catch (e) {} var t = $("#pt-share-ok"); if (t) { t.hidden = false; setTimeout(function () { t.hidden = true; }, 2000); } }
    var r = await hit(id, "share"); if (r) $$('[data-sc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.shares); });
  }

  $$("#pt-tabs [data-pk]").forEach(function (b) { b.onclick = function () { kind = b.getAttribute("data-pk"); history.replaceState(null, "", location.pathname + (kind ? "?k=" + kind : "")); draw(); }; });
  $("#pt-city").onchange = function () { city = this.value; draw(); };
  $("#pt-lang").onchange = function () { lng = this.value; draw(); };

  // ---------------------------------------------------------------- profile / request / review modal
  var modal = $("#pt-modal"), form = $("#pt-form"), rform = $("#pt-rform"), cur = null;
  function show(m) { modal.classList.add("is-open"); }
  async function open(id, mode) {
    cur = ALL.filter(function (p) { return p.id === id; })[0]; if (!cur) return;
    if (window.MN_TRACK) window.MN_TRACK("partner", (mode === "ask" ? "request: " : "profile: ") + cur.name);
    $("#pt-fname").textContent = cur.name;
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
      var info = row(PT.langs, (cur.languages || []).join(", ")) + row(PT.works_in, places.join(", ")) + row(PT.lives, cur.home_area) + row(PT.spec, (cur.specialties || []).join(", ")) +
        (cur.kind === "driver" ? row("🚗", [cur.vehicle_type, cur.vehicle_seats ? cur.vehicle_seats + " " + PT.seats : "", cur.vehicle_year].filter(Boolean).join(" · ")) : "") +
        (cur.kind === "hotel" && cur.hotel_stars ? row("★", cur.hotel_stars + " " + PT.stars) : "");
      box.innerHTML = '<div class="pp"><div class="pp__hero">' + (cur.photo ? '<img class="pp__main" src="' + img(cur.photo) + '" alt="">' : '') +
        '<div class="pp__id"><span class="pp__kind">' + esc(PT["k_" + cur.kind] || "") + (rank ? ' · 🏆 #' + rank + (rank <= 4 ? ' · ' + esc(PT.top_t) : '') : '') + '</span>' +
        '<h3>' + esc(cur.name) + '</h3><p>' + (cur.reviews_count ? stars(cur.rating) + ' <b>' + Number(cur.rating).toFixed(1) + '</b> (' + cur.reviews_count + ')' : '<span class="pt-new">' + esc(PT.new) + '</span>') + (cur.license_ok ? ' · <span class="pp__ok">✓ ' + esc(PT.verified) + '</span>' : '') + '</p>' +
        (cur.price_day ? '<p class="pp__price">' + esc(PT.from) + ' <b>$' + Math.round(cur.price_day) + '</b> ' + esc(unit) + (cur.price_note ? ' — ' + esc(cur.price_note) : '') + '</p>' : '') +
        '<div class="pp__acts"><button type="button" class="pp__btn pt-like' + (liked(id) ? ' is-on' : '') + '" data-like="' + id + '" data-free>❤ ' + esc(PT.like) + '</button><button type="button" class="pp__btn" id="pp-share" data-free>↗ ' + esc(PT.share) + '</button>' +
        '<small id="pt-share-ok" hidden>✓ ' + esc(PT.copied) + '</small></div></div></div>' +
        '<div class="pp__nums">' + nums + '</div>' + (info ? '<dl class="pp__info">' + info + '</dl>' : '') +
        (cur.bio ? '<p class="pt-bio">' + esc(cur.bio) + '</p>' : '') +
        ((cur.photos || []).length ? '<div class="pp__gal">' + cur.photos.map(function (x) { return '<a href="' + img(x) + '" target="_blank" rel="noopener" data-free><img loading="lazy" src="' + img(x) + '" alt=""></a>'; }).join("") + '</div>' : '') +
        '<h4>' + esc(PT.reviews) + ' (' + rv.length + ')</h4>' + (rv.length ? rv.map(function (r) { return '<div class="pt-rv">' + stars(r.rating) + ' <b>' + esc(r.name) + '</b> <small>' + esc(r.country || "") + ' · ' + new Date(r.created_at).toLocaleDateString() + '</small>' + (r.body ? '<p>' + esc(r.body) + '</p>' : '') + '</div>'; }).join("") : '<p class="pt-note">' + esc(PT.rv_note) + '</p>') +
        '<p class="pt-prof__btns"><button class="btn btn--gold btn--sm" id="pt-go-ask">' + esc(PT.ask) + '</button> <button class="btn btn--outline btn--sm" id="pt-go-rv">' + esc(PT.write) + '</button></p></div>';
      form.hidden = true; rform.hidden = true;
      $("#pt-go-ask").onclick = function () { open(id, "ask"); };
      $("#pt-go-rv").onclick = function () { box.innerHTML = ""; form.hidden = true; rform.hidden = false; msg(rform, ""); };
      $("#pp-share").onclick = function () { share(id); };
      bindCards(box);
      hit(id, "view").then(function (r) { if (r) { $$('[data-vc="' + id + '"]').forEach(function (b) { b.textContent = fmt(r.views); }); setLiked(id, r.liked); $$('[data-like="' + id + '"]').forEach(function (b) { b.classList.toggle("is-on", r.liked); }); } });
    } else { box.innerHTML = ""; form.hidden = false; rform.hidden = true; msg(form, ""); }
    show();
  }
  function msg(f, t, k) { var m = $(".mf-msg", f); if (m) { m.className = "mf-msg" + (k ? " mf-msg--" + k : ""); m.textContent = t || ""; } }
  function v(f, n) { var el = f.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function req(f) { var bad = $$("[required]", f).filter(function (el) { return el.type === "checkbox" ? !el.checked : !String(el.value || "").trim(); }); if (bad.length) { msg(f, X.f_required || "*", "err"); bad[0].focus(); return false; } return true; }
  form.onsubmit = async function (e) {
    e.preventDefault(); if (!req(form)) return; var b = $("button[type=submit]", form); b.disabled = true;
    try {
      var ref = await rpc("submit_site_request", {
        kind: "service", service: "partner", tour_id: cur.id, tour_title: (PT["k_" + cur.kind] || "") + ": " + cur.name,
        start_date: v(form, "start_date"), pax: v(form, "pax"), contact_name: v(form, "contact_name"), email: v(form, "email"), phone: v(form, "phone"),
        citizenship: v(form, "citizenship"), message: v(form, "message"), details: { partner_id: cur.id, partner_kind: cur.kind, partner_name: cur.name },
        consent: form.elements.consent ? form.elements.consent.checked : true, lang: LANG });
      if (window.MN_TRACK) window.MN_TRACK("request", "partner " + cur.name + " " + ref);
      msg(form, (X.f_ok_title || "OK") + " — " + String(X.f_ok_text || "{ref}").replace("{ref}", ref), "ok"); form.reset();
    } catch (er) { msg(form, X.f_err || String(er), "err"); }
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
    $("#pt-city").innerHTML = '<option value="">' + esc(PT.city) + '</option>' + Object.keys(cities).sort().map(function (c) { return '<option>' + esc(c) + '</option>'; }).join("");
    $("#pt-lang").innerHTML = '<option value="">' + esc(PT.lang) + '</option>' + Object.keys(langs).sort().map(function (c) { return '<option>' + esc(c) + '</option>'; }).join("");
    draw();
    var h = location.hash.match(/^#p-(.+)$/); if (h) { var el = document.getElementById("p-" + h[1]); if (el) el.scrollIntoView({ block: "center" }); if (ALL.some(function (p) { return p.id === h[1]; })) open(h[1], "prof"); }
  });
})();
