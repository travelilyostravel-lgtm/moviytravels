/* Moviy Nomad — tour presentation (slides). */
(function () {
  var E = window.MN_ENGINE, C = window.MN_CATALOG, CFG = window.MN || {}, t = E.t;
  var id = document.body.getAttribute("data-tour");
  var T = window.MN_TOURS[id];
  if (!T) return;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var state = { pax: C.defaultPax, hotel: T.hotel, transport: "", lang: (C.guide.languages[E.L.lang] !== undefined ? E.L.lang : "en"), single: false };
  var route = E.route(T);
  var legs = []; for (var i = 0; i < route.length - 1; i++) legs.push(E.leg(route[i], route[i + 1]));
  var totalKm = legs.reduce(function (s, l) { return s + l.km; }, 0);
  var MEALS = { B: t("meal_B"), L: t("meal_L"), D: t("meal_D") };
  var ICON = {
    passport: '<path d="M6 3h12v18H6z"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/>',
    shoes: '<path d="M3 16c3 0 4-5 6-5l3 2c2 1 5 1 7 2 1 .5 2 1.5 2 3H3z"/>',
    scarf: '<path d="M7 4c3 2 7 2 10 0l-1 8 2 8h-4l-2-6-2 6H6l2-8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    jacket: '<path d="M8 3 4 6v15h5V9M16 3l4 3v15h-5V9M8 3l4 4 4-4"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/>',
    meds: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M12 11v6M9 14h6"/>'
  };
  function svgI(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICON[k] || ICON.passport) + '</svg>'; }

  var slides = [];
  // 1. Cover
  slides.push({ label: t("lbl_cover"), cls: "s-cover", html:
    '<div class="s-bg" style="background-image:url(' + E.img(T.cover) + ')"></div>' +
    '<div class="s-inner cover">' +
      '<div class="cover__flags">' + T.flags.map(function (f) { return "<span>" + f + "</span>"; }).join("") + '</div>' +
      '<h1>' + esc(T.title) + '</h1><p class="cover__sub">' + esc(T.subtitle) + '</p>' +
      '<div class="cover__facts">' + [[T.days.length, t("days")], [T.days.filter(function (d) { return d.sleep; }).length, t("nights")], [route.filter(function (c, i) { return !C.cities[c].hidden && route.indexOf(c) === i; }).length, t("destinations")], [totalKm, t("km")]].filter(function (f, i) { return i === 0 || f[0] > 0; }).map(function (f) { return '<div><b>' + f[0].toLocaleString("en") + '</b><span>' + f[1] + '</span></div>'; }).join("") + '</div>' +
      '<ul class="cover__hl">' + T.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + '</ul>' +
      '<div class="cover__price calc-only"><small>' + t("from") + '</small><strong data-price>$' + E.fromPrice(T) + '</strong><small>' + t("pp_2") + '</small></div>' +
      '<div class="cover__lock lock-only"><span class="lock-badge">🔒 ' + t("lock_badge") + '</span><b>' + t("lock_price") + '</b></div>' +
      '<button class="btn btn--gold" data-go="1">' + t("see_program") + '</button>' +
    '</div>' });

  // 2. Route & map
  slides.push({ label: t("lbl_route"), cls: "s-route", html:
    '<div class="s-inner split">' +
      '<div class="split__text"><span class="eyebrow">' + t("route_eyebrow") + '</span><h2>' + t("route_title") + '</h2>' +
        '<ol class="legs">' + legs.map(function (l) {
          return '<li><span class="legs__ic legs__ic--' + l.mode + '">' + E.MODE_ICON[l.mode] + '</span><div><b>' + esc(C.cities[l.a].name) + ' → ' + esc(C.cities[l.b].name) + '</b><small>' + l.km + ' ' + t("km") + ' · ' + E.hours(l.h) + ' · ' + esc(l.note || E.MODE_NAME[l.mode]) + '</small></div></li>';
        }).join("") + '</ol>' +
        '<div class="legend"><span><i class="lg lg--car"></i>' + t("legend_car") + '</span><span><i class="lg lg--train"></i>' + t("legend_train") + '</span><span><i class="lg lg--flight"></i>' + t("legend_flight") + '</span></div>' +
      '</div>' +
      '<div class="split__map"><svg class="map" id="map"></svg></div>' +
    '</div>' });

  // 3. Included
  slides.push({ label: t("lbl_included"), cls: "s-inc", html:
    '<div class="s-inner"><span class="eyebrow">' + t("inc_eyebrow") + '</span><h2>' + t("inc_title") + '</h2>' +
      '<div class="inc"><div class="inc__col inc__col--yes"><h3>' + t("inc_yes") + '</h3><ul>' + T.included.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div>' +
      '<div class="inc__col inc__col--no"><h3>' + t("inc_no") + '</h3><ul>' + T.excluded.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div></div>' +
    '</div>' });

  // 4. Days
  T.days.forEach(function (d, n) {
    var moves = (d.move || []).map(function (m) { var l = E.leg(m[0], m[1]); return '<span class="chip-mv">' + E.MODE_ICON[l.mode] + esc(C.cities[l.a].name) + ' → ' + esc(C.cities[l.b].name) + ' · ' + l.km + ' ' + t("km") + ' · ' + E.hours(l.h) + '</span>'; }).join("");
    var meals = (d.meals || "").split(",").filter(function (m) { return MEALS[m]; }).map(function (m) { return MEALS[m]; }).join(", ");
    slides.push({ label: t("day_n", { n: n + 1 }), cls: "s-day", html:
      '<div class="s-inner day">' +
        '<div class="day__photo" style="background-image:url(' + E.img(d.stops[0].img) + ')"><span class="day__num">' + t("day_n", { n: n + 1 }) + '</span></div>' +
        '<div class="day__body"><span class="eyebrow">' + t("day_of", { n: n + 1, total: T.days.length }) + '</span><h2>' + esc(d.title) + '</h2>' +
          (moves ? '<div class="day__moves">' + moves + '</div>' : '') +
          '<div class="stops">' + d.stops.map(function (s) {
            return '<div class="stop"><img src="' + E.img(s.img) + '" alt="" loading="lazy"><div><b>' + esc(s.name) + '</b><p>' + esc(s.desc) + '</p></div></div>';
          }).join("") + '</div>' +
          '<div class="day__meta">' + (d.sleep ? '<span>🛏 ' + t("overnight") + ' <b>' + esc(C.cities[d.sleep].name) + '</b></span>' : '<span>✈ ' + t("end_tour") + '</span>') + (meals ? '<span>🍽 ' + meals + '</span>' : '') + '</div>' +
        '</div>' +
      '</div>' });
  });

  // 5. Customize
  var langOpts = Object.keys(C.guide.names).map(function (k) { return '<option value="' + k + '">' + C.guide.names[k] + '</option>'; }).join("");
  slides.push({ label: t("lbl_options"), cls: "s-opt", html:
    '<div class="s-inner"><span class="eyebrow">' + t("opt_eyebrow") + '</span><h2>' + t("opt_title") + '</h2>' +
      '<div class="lock-box lock-only"><span class="lock-badge">🔒 ' + t("lock_badge") + '</span><h3>' + t("lock_title") + '</h3><p>' + t("lock_text") + '</p>' +
        '<div class="book__btns"><a class="btn btn--wa" data-lockwa target="_blank" rel="noopener">WhatsApp · ' + t("lock_btn") + '</a><a class="btn btn--tg" href="https://t.me/' + esc(CFG.telegram || "") + '" target="_blank" rel="noopener">Telegram</a></div></div>' +
      '<div class="calc-only"><div class="opt-grid">' +
        '<div class="opt-block"><h3>' + t("travellers") + '</h3><div class="stepper"><button data-pax="-1" aria-label="Less">−</button><b id="pax">2</b><button data-pax="1" aria-label="More">+</button></div>' +
          '<label class="tgl"><input type="checkbox" id="single"> ' + t("single_room") + '</label></div>' +
        '<div class="opt-block"><h3>' + t("guide_lang") + '</h3><select id="lang">' + langOpts + '</select><p class="muted">' + t("guide_soon") + '</p></div>' +
        '<div class="opt-block opt-block--wide"><h3>' + t("hotels") + '</h3><div class="cards" id="hotels">' + C.hotelClasses.map(function (h) {
          return '<button class="card" data-hotel="' + h.id + '"><b>' + esc(h.name) + '</b><small>' + esc(h.desc) + '</small></button>'; }).join("") + '</div></div>' +
        '<div class="opt-block opt-block--wide"><h3>' + t("transport") + '</h3><div class="cards" id="transport">' + C.transport.map(function (tr) {
          return '<button class="card" data-tr="' + tr.id + '"><b>' + esc(tr.name) + '</b><small>' + esc(tr.desc) + ' · ' + t("seats", { n: tr.seats }) + '</small></button>'; }).join("") + '</div></div>' +
      '</div>' +
      '<div class="pricebar"><div><small>' + t("price_pp") + '</small><strong id="pp"></strong><small id="ptotal"></small></div><button class="btn btn--gold" data-go="last">' + t("get_offer") + '</button></div></div>' +
    '</div>' });

  // 6. Packing
  slides.push({ label: t("lbl_packing"), cls: "s-bring", html:
    '<div class="s-inner"><span class="eyebrow">' + t("bring_eyebrow") + '</span><h2>' + t("bring_title") + '</h2>' +
      '<div class="bring">' + T.bring.map(function (b) { return '<div class="bring__item"><span>' + svgI(b[0]) + '</span><p>' + esc(b[1]) + '</p></div>'; }).join("") + '</div>' +
    '</div>' });

  // 7. Contact
  slides.push({ label: t("lbl_book"), cls: "s-book", html:
    '<div class="s-bg" style="background-image:url(' + E.img((T.days[Math.max(0, T.days.length - 2)].stops[0] || T.days[0].stops[0]).img) + ')"></div>' +
    '<div class="s-inner book"><h2>' + t("book_title") + '</h2><p>' + t("book_text") + '</p>' +
      '<div class="book__sum" id="summary"></div>' +
      '<div class="book__btns"><a class="btn btn--gold calc-only" id="bookbtn" href="../booking.html?tour=' + encodeURIComponent(document.body.getAttribute("data-tour") || "") + '">' + esc(CFG.bookReqLabel || CFG.bookLabel || "Send a request") + ' →</a><a class="btn btn--wa" id="wa" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn--tg" href="https://t.me/' + esc(CFG.telegram || "") + '" target="_blank" rel="noopener">Telegram</a><a class="btn btn--ghost" href="https://instagram.com/' + esc(CFG.instagram || "") + '" target="_blank" rel="noopener">Instagram</a></div>' +
    '</div>' });

  // Render
  var deck = document.getElementById("deck");
  deck.innerHTML = slides.map(function (s, n) { return '<section class="slide ' + s.cls + '" data-n="' + n + '" aria-label="' + esc(s.label) + '">' + s.html + '</section>'; }).join("");
  var nav = document.getElementById("dots");
  nav.innerHTML = slides.map(function (s, n) { return '<button data-go="' + n + '" title="' + esc(s.label) + '"><span>' + esc(s.label) + '</span></button>'; }).join("");
  document.getElementById("t-title").textContent = T.title;
  if (C.sample) { var sm = document.getElementById("sample"); sm.textContent = t("sample"); sm.hidden = false; }

  var cur = 0, els = deck.querySelectorAll(".slide"), dots = nav.querySelectorAll("button");
  function go(n) {
    if (n === "last") n = slides.length - 1;
    cur = Math.max(0, Math.min(slides.length - 1, +n));
    els.forEach(function (el, i) { el.classList.toggle("is-on", i === cur); el.classList.toggle("is-past", i < cur); });
    dots.forEach(function (d, i) { d.classList.toggle("is-on", i === cur); });
    document.getElementById("count").textContent = (cur + 1) + " / " + slides.length;
    document.getElementById("bar").style.width = ((cur + 1) / slides.length * 100) + "%";
    els[cur].scrollTop = 0;
    var dot = dots[cur]; if (dot.scrollIntoView) dot.scrollIntoView({ block: "nearest", inline: "center" });
    if (cur === 1) E.drawMap(document.getElementById("map"), route);
  }
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(b.getAttribute("data-go")); });
  document.getElementById("prev").onclick = function () { go(cur - 1); };
  document.getElementById("next").onclick = function () { go(cur + 1); };
  document.addEventListener("keydown", function (e) { if (e.target.tagName === "SELECT") return; if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
  var sx = null;
  deck.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1)); sx = null; });

  // PDF (browser "Save as PDF" keeps every language and the photos) + share
  document.getElementById("share").onclick = function (e) {
    var url = location.href.split("#")[0].split("?")[0];
    if (navigator.share && window.matchMedia("(pointer:coarse)").matches) { navigator.share({ title: T.title, text: t("share_msg") + " " + T.title, url: url }).catch(function () {}); return; }
    window.MNShare.open({ anchor: e.currentTarget, tour: { title: T.title, url: url } });
  };

  // Options
  var locked = false;
  function applyLock() {
    locked = !E.tourOpen(T);
    document.body.classList.toggle("is-locked", locked);
    var wa = "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(t("msg_tour") + "\n• " + t("sum_tour") + ": " + T.title + " (" + T.days.length + " " + t("days") + ")\n" + t("msg_dates") + " ");
    document.querySelectorAll("[data-lockwa]").forEach(function (a) { a.href = wa; });
  }
  function update() {
    var p = E.price(T, state);
    document.getElementById("pax").textContent = state.pax;
    document.getElementById("pp").textContent = "$" + p.pp.toLocaleString("en");
    document.getElementById("ptotal").textContent = t("total_for", { n: state.pax, sum: "$" + p.total.toLocaleString("en") });
    document.querySelectorAll("[data-hotel]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-hotel") === p.hotel.id); });
    document.querySelectorAll("[data-tr]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-tr") === p.transport.id); });
    var lines = [
      [t("sum_tour"), T.title + " (" + T.days.length + " " + t("days") + ")"],
      [t("sum_travellers"), state.pax + (state.single ? ", " + t("sum_single") : "")],
      [t("sum_hotels"), p.hotel.name],
      [t("sum_transport"), p.transport.name + (p.vehicles > 1 ? " × " + p.vehicles : "")],
      [t("sum_guide"), C.guide.names[state.lang]],
      locked ? [t("sum_price"), t("lock_price")] : [t("sum_price"), "$" + p.pp + " " + t("per_person") + " · $" + p.total + " " + t("total")]
    ];
    if (locked) lines.splice(1, 4);
    document.getElementById("summary").innerHTML = lines.map(function (l) { return "<div><small>" + l[0] + "</small><b>" + esc(l[1]) + "</b></div>"; }).join("");
    var msg = t("msg_tour") + "\n" + lines.map(function (l) { return "• " + l[0] + ": " + l[1]; }).join("\n") + "\n" + t("msg_dates") + " ";
    document.getElementById("wa").href = "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll("[data-pax]").forEach(function (b) { b.onclick = function () { state.pax = Math.max(1, Math.min(40, state.pax + +b.getAttribute("data-pax"))); var tr = E.byId(C.transport, state.transport); if (state.transport && tr.seats * 3 < state.pax) state.transport = ""; update(); }; });
  document.querySelectorAll("[data-hotel]").forEach(function (b) { b.onclick = function () { state.hotel = b.getAttribute("data-hotel"); update(); }; });
  document.querySelectorAll("[data-tr]").forEach(function (b) { b.onclick = function () { state.transport = b.getAttribute("data-tr"); update(); }; });
  document.getElementById("lang").onchange = function (e) { state.lang = e.target.value; update(); };
  document.getElementById("single").onchange = function (e) { state.single = e.target.checked; update(); };

  applyLock();
  update();
  E.onPrices(function () { applyLock(); var bb = document.getElementById("bookbtn"); if (bb) bb.textContent = ((C.bookingOnline ? CFG.bookLabel : CFG.bookReqLabel) || CFG.bookLabel) + " →"; });
  E.onPrices(function () { var el = document.querySelector("[data-price]"); if (el) el.textContent = "$" + E.fromPrice(T).toLocaleString("en"); update(); });
  var start = parseInt((location.hash.match(/^#s(\d+)$/) || [])[1] || "1", 10) - 1;
  go(isNaN(start) ? 0 : start);
})();
