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
  function score(p) { return (p.featured ? 1000 : 0) + (p.rating || 0) * Math.log(2 + (p.reviews_count || 0)) * 10 + (p.trips_count || 0) * 0.5; }
  var ALL = [], kind = window.MNPT_KIND || new URLSearchParams(location.search).get("k") || "", city = "", lng = "";

  // ---------------------------------------------------------------- home page tiles: counts
  if ($("[data-ptn]") && !$("#pt-grid")) {
    get("partners_public?select=kind").then(function (rows) {
      var c = {}; rows.forEach(function (r) { c[r.kind] = (c[r.kind] || 0) + 1; });
      $$("[data-ptn]").forEach(function (el) { var n = c[el.getAttribute("data-ptn")]; if (n) el.textContent = n + " " + (PT.partners_count || ""); });
    });
    return;
  }
  var grid = $("#pt-grid"); if (!grid) return;

  function card(p) {
    var unit = p.kind === "hotel" ? PT.per_night : PT.per_day;
    var facts = [];
    if (p.kind === "guide" && p.experience_years) facts.push(p.experience_years + " " + PT.exp);
    if (p.kind === "driver" && p.vehicle_type) facts.push(esc(p.vehicle_type) + (p.vehicle_seats ? " · " + p.vehicle_seats + " " + PT.seats : ""));
    if (p.kind === "hotel" && p.hotel_stars) facts.push(p.hotel_stars + " " + PT.stars);
    return '<article class="pt-card" id="p-' + p.id + '"><div class="pt-card__img"' + (p.photo ? ' style="background-image:url(\'' + img(p.photo) + '\')"' : '') + '>' +
      (p.license_ok ? '<span class="pt-badge">✓ ' + esc(PT.verified) + '</span>' : '') +
      '<div class="pt-card__name"><b>' + esc(p.name) + '</b><small>📍 ' + esc([p.city].concat((p.cities || []).filter(function (c) { return c !== p.city; })).filter(Boolean).slice(0, 3).join(", ")) + '</small></div></div>' +
      '<div class="pt-card__body"><div class="pt-card__rate">' + (p.reviews_count ? stars(p.rating) + ' <b>' + Number(p.rating).toFixed(1) + '</b> <small>(' + p.reviews_count + ')</small>' : '<span class="pt-new">' + esc(PT.new) + '</span>') +
      (p.trips_count ? '<small class="pt-trips">' + p.trips_count + ' ' + esc(PT.trips) + '</small>' : '') + '</div>' +
      (facts.length ? '<p class="pt-facts">' + facts.join(" · ") + '</p>' : '') +
      ((p.languages || []).length ? '<p class="pt-langs">🗣 ' + esc(p.languages.slice(0, 4).join(", ")) + (p.languages.length > 4 ? " +" + (p.languages.length - 4) : "") + '</p>' : '') +
      (p.price_day ? '<p class="pt-price">' + esc(PT.from) + ' <b>$' + Math.round(p.price_day) + '</b> ' + esc(unit) + '</p>' : '') +
      '<div class="pt-card__btns"><button class="btn btn--gold btn--sm" data-ask="' + p.id + '">' + esc(PT.ask) + '</button><button class="btn btn--outline btn--sm" data-prof="' + p.id + '">' + esc(PT.profile) + '</button></div></div></article>';
  }
  function draw() {
    $$("#pt-tabs [data-pk]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-pk") === kind); });
    if (!window.MNPT_KIND) $$(".ksub a").forEach(function (a) { var h = a.getAttribute("href"); a.classList.toggle("is-on", kind === "other" ? h.indexOf("k=other") > -1 : (!kind && h === "partners.html")); });
    var list = ALL.filter(function (p) { return (!kind || p.kind === kind) && (!city || p.city === city || (p.cities || []).indexOf(city) > -1) && (!lng || (p.languages || []).indexOf(lng) > -1); })
      .sort(function (a, b) { return score(b) - score(a); });
    grid.innerHTML = list.length ? list.map(card).join("") : '<p class="pt-empty">' + esc(PT.empty) + '</p>';
    $$("[data-ask]", grid).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-ask"), "ask"); }; });
    $$("[data-prof]", grid).forEach(function (b) { b.onclick = function () { open(b.getAttribute("data-prof"), "prof"); }; });
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
    if (mode === "prof") {
      var rv = await get("partner_reviews_public?partner_id=eq." + id + "&order=created_at.desc&limit=30");
      box.innerHTML = '<div class="pt-prof">' + (cur.photo ? '<img src="' + img(cur.photo) + '" alt="">' : '') + '<div><h3>' + esc(cur.name) + '</h3>' +
        '<p>' + (cur.reviews_count ? stars(cur.rating) + ' ' + Number(cur.rating).toFixed(1) + ' (' + cur.reviews_count + ')' : esc(PT.new)) + (cur.license_ok ? ' · ✓ ' + esc(PT.verified) : '') + '</p>' +
        ((cur.languages || []).length ? '<p><b>' + esc(PT.langs) + ':</b> ' + esc(cur.languages.join(", ")) + '</p>' : '') +
        (cur.price_day ? '<p>' + esc(PT.from) + ' <b>$' + Math.round(cur.price_day) + '</b> ' + esc(cur.kind === "hotel" ? PT.per_night : PT.per_day) + (cur.price_note ? ' — ' + esc(cur.price_note) : '') + '</p>' : '') + '</div></div>' +
        (cur.bio ? '<p class="pt-bio">' + esc(cur.bio) + '</p>' : '') +
        ((cur.photos || []).length ? '<div class="pt-gal">' + cur.photos.map(function (x) { return '<img loading="lazy" src="' + img(x) + '" alt="">'; }).join("") + '</div>' : '') +
        '<h4>' + esc(PT.reviews) + '</h4>' + (rv.length ? rv.map(function (r) { return '<div class="pt-rv">' + stars(r.rating) + ' <b>' + esc(r.name) + '</b> <small>' + esc(r.country || "") + ' · ' + new Date(r.created_at).toLocaleDateString() + '</small>' + (r.body ? '<p>' + esc(r.body) + '</p>' : '') + '</div>'; }).join("") : '<p class="pt-note">—</p>') +
        '<p class="pt-prof__btns"><button class="btn btn--gold btn--sm" id="pt-go-ask">' + esc(PT.ask) + '</button> <button class="btn btn--outline btn--sm" id="pt-go-rv">' + esc(PT.write) + '</button></p>';
      form.hidden = true; rform.hidden = true;
      $("#pt-go-ask").onclick = function () { open(id, "ask"); };
      $("#pt-go-rv").onclick = function () { box.innerHTML = ""; form.hidden = true; rform.hidden = false; msg(rform, ""); };
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
    var h = location.hash.match(/^#p-(.+)$/); if (h) { var el = document.getElementById("p-" + h[1]); if (el) el.scrollIntoView({ block: "center" }); }
  });
})();
