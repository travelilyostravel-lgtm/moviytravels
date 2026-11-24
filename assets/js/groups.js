/* Moviy Nomad — guaranteed group departures (public).
 * Reads published, upcoming departures from Supabase (anon key, read-only columns)
 * and renders them on the group-tours page (#gd-list) and the home teaser (#gd-home).
 * Seat requests go through submit_site_request(kind = 'group'). */
(function () {
  var SB = window.MN_SB || {}, G = window.MNG || {}, LANG = window.MN_LANG || document.documentElement.lang || "en";
  var TOURS = window.MN_TOURS || {}, L = window.MN_L || {}, E = window.MN_ENGINE;
  var COLS = "id,tour_id,start_date,capacity,booked,price_pp,single_supp,guides,guide_lang,status,note,group_kind,vehicle,extra_night,transfer_pp";
  var KORD = { small: 0, medium: 1, large: 2 };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hdr(x) { var h = { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey }; for (var k in x || {}) h[k] = x[k]; return h; }
  function tf(s, o) { return String(s || "").replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ""; }); }
  function money(n) { return Math.round(n).toLocaleString("en"); }
  function d0(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var UZM = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
  function fmt(d, o) {
    if (LANG === "uz") { var mn = UZM[d.getMonth()], sh = o.month === "short" ? mn.slice(0, 3) : mn;
      return (o.day ? d.getDate() + "-" : "") + sh + (o.year ? " " + d.getFullYear() : ""); }
    try { return d.toLocaleDateString(LANG === "zh" ? "zh-CN" : LANG, o); } catch (e) { return d.toDateString(); } }
  function title(id) { return ((L.tours || {})[id] || [id])[0]; }
  function days(id) { return ((TOURS[id] || {}).days || []).length || 1; }
  function cities(id) {
    var seen = [], out = [];
    ((TOURS[id] || {}).days || []).forEach(function (d) { if (d.sleep && seen.indexOf(d.sleep) < 0) { seen.push(d.sleep); out.push(((L.cities || {})[d.sleep] || [d.sleep])[0]); } });
    return out.join(" · ");
  }
  function cover(id) { var c = (TOURS[id] || {}).cover; return c && E && E.img ? E.img(c) : ""; }
  function seatsLeft(x) { return Math.max(0, (x.capacity || 0) - (x.booked || 0)); }
  function isFull(x) { return x.status === "full" || seatsLeft(x) <= 0; }
  function range(x) {
    var a = d0(x.start_date), b = new Date(a); b.setDate(a.getDate() + days(x.tour_id) - 1);
    var y = a.getFullYear() !== b.getFullYear();
    return fmt(a, y ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short" }) + " – " + fmt(b, { day: "numeric", month: "short", year: "numeric" });
  }
  function badge(x) {
    if (isFull(x)) return '<span class="gd-st gd-st--full">' + esc(G.gr_full) + '</span>';
    var left = seatsLeft(x);
    if (left <= 8) return '<span class="gd-st gd-st--few">' + esc(G.gr_st_few) + '</span>';
    if (x.status === "guaranteed") return '<span class="gd-st gd-st--ok">✓ ' + esc(G.gr_st_guaranteed) + '</span>';
    return '<span class="gd-st">' + esc(G.gr_st_open) + '</span>';
  }

  var rows = [];
  async function load() {
    if (!SB.url) return [];
    var today = new Date(); var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    var r = await fetch(SB.url + "/rest/v1/group_departures?select=" + COLS + "&published=eq.true&status=neq.cancelled&start_date=gte." + iso + "&order=start_date.asc&limit=300", { headers: hdr() });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).filter(function (x) { return TOURS[x.tour_id]; });
  }

  function priceTxt(x) { return x.price_pp ? '$' + money(x.price_pp) : G.gr_on_request; }
  function kindRow(x) {
    var left = seatsLeft(x), full = isFull(x), pct = x.capacity ? Math.min(100, Math.round(100 * (x.booked || 0) / x.capacity)) : 0;
    var col = window.MN_GDS ? window.MN_GDS.color(x) : "";
    return '<div class="gk gk--' + col + '"><div class="gk__info"><b>' + esc(G["gr_k_" + (x.group_kind || "large")] || "") + '</b><small>' + esc(G["gr_veh_" + (x.vehicle || "bus")] || "") + '</small>' +
      '<div class="gd__bar"><i style="width:' + pct + '%"></i></div><small>' + esc(full ? G.gr_full : tf(G.gr_seats_left, { n: left })) + '</small></div>' +
      '<div class="gk__price"><b class="gd-price">' + esc(priceTxt(x)) + '</b><small>' + esc(G.gr_pp) + '</small></div>' +
      '<button class="btn btn--gold btn--sm" data-gd="' + x.id + '"' + (full ? " disabled" : "") + '>' + esc(G.gr_request) + '</button></div>';
  }
  function card(grp) {
    var x = grp[0], any = grp.filter(function (g) { return !isFull(g); })[0] || x;
    return '<article class="gd" data-id="' + x.id + '">' +
      '<div class="gd__img" style="background-image:url(' + cover(x.tour_id) + ')"><span class="gd__date">' + esc(range(x)) + '</span></div>' +
      '<div class="gd__body"><div class="gd__top">' + badge(any) + '<span class="gd__days">' + esc(tf(G.gr_days, { n: days(x.tour_id) })) + '</span></div>' +
      '<h3>' + esc(title(x.tour_id)) + '</h3><p class="gd__route">' + esc(cities(x.tour_id)) + '</p>' +
      (x.tour_id === "classic" && G.gr_start_khiva ? '<p class="gd__meta">📍 ' + esc(G.gr_start_khiva) + ' · 🗣 ' + esc(x.guide_lang || "English") + '</p>' : '<p class="gd__meta">🗣 ' + esc(x.guide_lang || "English") + '</p>') +
      (x.note ? '<p class="gd__note">' + esc(x.note) + '</p>' : '') +
      '<div class="gk-list">' + grp.map(kindRow).join("") + '</div>' +
      '<div class="gd__foot"><small class="gd__solo">' + esc(G.gr_join_note || "") + (x.single_supp ? ' · ' + esc(tf(G.gr_single, { n: money(x.single_supp) })) : '') + '</small><a class="btn btn--outline btn--sm" href="tours/' + x.tour_id + '.html">' + esc(G.gr_program) + '</a></div></div></article>';
  }
  function groups(list) {
    var map = {}, out = [];
    list.forEach(function (x) { var k = x.tour_id + "|" + x.start_date; if (!map[k]) { map[k] = []; out.push(map[k]); } map[k].push(x); });
    out.forEach(function (g) { g.sort(function (a, b) { return (KORD[a.group_kind] || 0) - (KORD[b.group_kind] || 0); }); });
    return out;
  }

  // ---------------------------------------------------------------- page
  var list = $("#gd-list"), monthSel = $("#gd-month"), kindSel = null;
  if (monthSel && G.gr_size) {
    kindSel = document.createElement("select"); kindSel.id = "gd-kind"; kindSel.className = monthSel.className; kindSel.setAttribute("aria-label", G.gr_size);
    kindSel.innerHTML = '<option value="">' + esc(G.gr_all_sizes) + '</option>' + ["small", "medium", "large"].map(function (k) { return '<option value="' + k + '">' + esc(G["gr_k_" + k]) + '</option>'; }).join("");
    monthSel.parentNode.insertBefore(kindSel, monthSel.nextSibling); kindSel.onchange = function () { drawList(); };
  }
  function drawSched() {
    var h = $("#gd-sched"); if (!h || !window.MN_GDS) return;
    window.MN_GDS.render(h, rows, { lang: LANG, title: title, range: range, onPick: function (x) { openReq(x.id); },
      labels: { date: G.gr_sched_date, small: G.gr_k_small, medium: G.gr_k_medium, large: G.gr_k_large, left: G.gr_seats_left, full: G.gr_full, green: G.gr_c_green, yellow: G.gr_c_yellow, red: G.gr_c_red, none: G.gr_empty } });
  }
  function drawList() {
    var m = monthSel ? monthSel.value : "";
    var kf = kindSel ? kindSel.value : "";
    var show = rows.filter(function (x) { return (!m || x.start_date.slice(0, 7) === m) && (!kf || x.group_kind === kf); });
    list.innerHTML = show.length ? groups(show).map(card).join("") : '<div class="gd-empty"><p>' + esc(G.gr_empty) + '</p><button class="btn btn--gold" data-gd="">' + esc(G.gr_empty_btn) + '</button></div>';
  }
  function fillMonths() {
    if (!monthSel) return;
    var ms = [];
    rows.forEach(function (x) { var k = x.start_date.slice(0, 7); if (ms.indexOf(k) < 0) ms.push(k); });
    monthSel.innerHTML = '<option value="">' + esc(G.gr_all_months) + '</option>' + ms.map(function (k) {
      return '<option value="' + k + '">' + esc(fmt(d0(k + "-01"), { month: "long", year: "numeric" })) + '</option>'; }).join("");
    monthSel.hidden = ms.length < 2;
  }
  function fillDepSelect() {
    var s = $("#gd-form select[name=dep]"); if (!s) return;
    s.innerHTML = rows.filter(function (x) { return !isFull(x); }).map(function (x) {
      return '<option value="' + x.id + '">' + esc(range(x) + " · " + (G["gr_k_" + x.group_kind] || title(x.tour_id)) + " · " + priceTxt(x)) + '</option>'; }).join("") + '<option value="">' + esc(G.gr_empty_btn) + '</option>';
  }

  // seat request modal
  var modal = $("#gd-modal"), form = $("#gd-form");
  function openReq(id) {
    if (!modal) { location.href = "group-tours.html" + (id ? "#" + id : ""); return; }
    fillDepSelect(); if (form) { form.elements.dep.value = id || ""; form.querySelector(".mf-msg").textContent = ""; }
    $("#gd-ok").hidden = true; form.hidden = false; modal.classList.add("is-open"); extras();
  }
  function curDep() { return form ? rows.filter(function (x) { return x.id === form.elements.dep.value; })[0] : null; }
  function extras() {
    if (!form) return;
    var box = $("#gd-x", form);
    if (!box) {
      box = document.createElement("div"); box.id = "gd-x"; box.className = "mf-f full gd-x";
      var anchor = form.elements.message ? (form.elements.message.closest(".mf-f") || form.elements.message) : form.querySelector("button[type=submit]");
      anchor.parentNode.insertBefore(box, anchor);
      form.addEventListener("change", function (e) { if (e.target.name === "dep") extras(); else calc(); });
      form.addEventListener("input", function (e) { if (e.target.name === "pax") calc(); });
    }
    var d = curDep();
    if (!d) { box.hidden = true; return; }
    box.hidden = false;
    var night = d.extra_night || 0, tr = d.transfer_pp || 0;
    box.innerHTML = '<label>' + esc(G.gr_extras) + '</label>' +
      (night ? '<label class="mf-check"><input type="checkbox" name="x_night"> <span>' + esc(tf(G.gr_x_night, { n: money(night) })) + '</span></label>' : '') +
      (tr ? '<label class="mf-check"><input type="checkbox" name="x_arr"> <span>' + esc(tf(G.gr_x_arr, { n: money(tr) })) + '</span></label>' +
            '<label class="mf-check"><input type="checkbox" name="x_dep"> <span>' + esc(tf(G.gr_x_dep, { n: money(tr) })) + '</span></label>' : '') +
      '<p class="gd-x__total" id="gd-total"></p>';
    calc();
  }
  function total() {
    var d = curDep(); if (!d || !d.price_pp) return 0;
    var n = Math.max(1, parseInt((form.elements.pax || {}).value, 10) || 1), room = (form.elements.room || {}).value;
    var t = n * d.price_pp + (room === "single" ? n * (d.single_supp || 0) : 0);
    if (form.elements.x_night && form.elements.x_night.checked) t += n * (d.extra_night || 0) * (room === "single" ? 1.5 : 1);
    if (form.elements.x_arr && form.elements.x_arr.checked) t += n * (d.transfer_pp || 0);
    if (form.elements.x_dep && form.elements.x_dep.checked) t += n * (d.transfer_pp || 0);
    return Math.round(t);
  }
  function calc() { var el = $("#gd-total"); if (el) { var t = total(); el.textContent = t ? tf(G.gr_total, { n: money(t) }) : ""; } }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-gd]"); if (b && !b.disabled) { e.preventDefault(); openReq(b.getAttribute("data-gd")); }
    if (modal && (e.target === modal || e.target.closest("#gd-modal .modal__close"))) modal.classList.remove("is-open");
  });
  if (form) form.onsubmit = async function (ev) {
    ev.preventDefault();
    var bad = $$("[required]", form).filter(function (el) { return el.type === "checkbox" ? !el.checked : !String(el.value || "").trim(); });
    $$(".is-bad", form).forEach(function (el) { el.classList.remove("is-bad"); });
    var m = form.querySelector(".mf-msg");
    if (bad.length) { bad.forEach(function (el) { (el.closest(".mf-f") || el.closest(".mf-check") || el).classList.add("is-bad"); }); m.className = "mf-msg mf-msg--err"; m.textContent = G.f_required; return; }
    if (window.MN_CHECK_CIT && !window.MN_CHECK_CIT(form)) return;
    var v = function (n) { return String((form.elements[n] || {}).value || "").trim(); };
    var dep = rows.filter(function (x) { return x.id === v("dep"); })[0];
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true; m.className = "mf-msg"; m.textContent = G.f_sending;
    try {
      var r = await fetch(SB.url + "/rest/v1/rpc/submit_site_request", { method: "POST", headers: hdr({ "Content-Type": "application/json" }), body: JSON.stringify({ p: {
        kind: "group", tour_id: dep ? dep.tour_id : "", tour_title: dep ? title(dep.tour_id) + " — " + range(dep) + " — " + (G["gr_k_" + dep.group_kind] || "") : "Group tours: notify me",
        start_date: dep ? dep.start_date : "", pax: v("pax"), contact_name: v("contact_name"), phone: v("phone"), email: v("email"),
        citizenship: v("citizenship"), messenger: v("messenger"), message: v("message"),
        details: { departure_id: dep ? dep.id : null, group_kind: dep ? dep.group_kind : null, room: v("room"), guide_lang: dep ? dep.guide_lang : "English", notify: !dep,
          extra_night: !!(form.elements.x_night && form.elements.x_night.checked), arrival_transfer: !!(form.elements.x_arr && form.elements.x_arr.checked),
          departure_transfer: !!(form.elements.x_dep && form.elements.x_dep.checked), est_total: total() || null },
        pay_method: "contact", consent: form.elements.consent.checked, lang: LANG } }) });
      var body = await r.json().catch(function () { return null; });
      if (!r.ok) throw new Error((body && body.message) || r.status);
      form.hidden = true; var ok = $("#gd-ok"); ok.hidden = false;
      ok.innerHTML = '<div class="okbox"><div class="okbox__ic">✓</div><h3>' + esc(G.f_ok_title) + '</h3><p>' + esc(G.gr_ok).replace("{ref}", "<b>" + esc(body) + "</b>") + '</p></div>';
      form.reset();
    } catch (e) { m.className = "mf-msg mf-msg--err"; m.textContent = G.f_err; }
    btn.disabled = false; if (m.textContent === G.f_sending) m.textContent = "";
  };

  // ---------------------------------------------------------------- home teaser
  var home = $("#gd-home");
  function drawHome() {
    var next = groups(rows.filter(function (x) { return !isFull(x); })).slice(0, 3);
    if (!next.length) { home.innerHTML = '<div class="gd-empty"><p>' + esc(G.gr_empty) + '</p><a class="btn btn--gold" href="group-tours.html">' + esc(G.gr_empty_btn) + '</a></div>'; return; }
    home.innerHTML = next.map(card).join("");
  }

  if (!list && !home) return;
  if (list) list.innerHTML = '<p class="gd-loading">' + esc(G.gr_loading) + '</p>';
  load().then(function (r) { rows = r; }).catch(function () { rows = []; }).then(function () {
    if (list) { drawSched(); fillMonths(); drawList(); if (location.hash.length > 1 && modal) { var id = location.hash.slice(1); if (rows.some(function (x) { return x.id === id; })) openReq(id); } }
    if (home) drawHome();
  });
  if (monthSel) monthSel.onchange = drawList;
})();
