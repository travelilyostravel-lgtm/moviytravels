/* Moviy Nomad — shared engine: routes, prices, maps. */
(function () {
  var C = window.MN_CATALOG, G = window.MN_GEO || {}, PL = window.MN_PLACES || {};
  var L = window.MN_L || { ui: {}, items: {}, legnotes: {}, hotels: {}, transport: {}, guide: {}, cities: {}, sights: {}, tours: {}, bringIcon: {} };
  if (PL.cities) { C.cities = PL.cities; C.legs = PL.legs; }

  // ---- localization: everything visible comes from window.MN_L (assets/data/l10n/<lang>.js)
  function t(key, vars) {
    var s = L.ui[key]; if (s === undefined) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = String(s).split("{" + k + "}").join(vars[k]); });
    return s;
  }
  Object.keys(C.cities).forEach(function (id) { var x = L.cities[id] || [id, ""]; C.cities[id].name = x[0]; C.cities[id].desc = x[1]; });
  C.hotelClasses.forEach(function (h) { var x = L.hotels[h.id]; if (x) { h.name = x[0]; h.desc = x[1]; } });
  C.transport.forEach(function (tr) { var x = L.transport[tr.id]; if (x) { tr.name = x[0]; tr.desc = x[1]; } });
  Object.keys(L.guide).forEach(function (k) { C.guide.names[k] = L.guide[k]; });
  function cname(id) { return (C.cities[id] || {}).name || id; }
  var TOURS = window.MN_TOURS || {};
  Object.keys(TOURS).forEach(function (id) {
    var T = TOURS[id], tx = L.tours[id] || [id, ""];
    T.id = id; T.title = tx[0]; T.subtitle = tx[1];
    T.highlights = (T.hl || []).map(function (s) { return (L.sights[s] || [s])[0]; });
    T.included = (T.inc || []).map(function (k) { return L.items[k] || k; });
    T.excluded = (T.exc || []).map(function (k) { return L.items[k] || k; });
    T.bring = (T.bring || []).map(function (k) { return [L.bringIcon[k] || "passport", L.items[k] || k]; });
    T.days.forEach(function (d) {
      var from = d.move && d.move.length ? d.move[0][0] : null;
      var roundTrip = from && from === d.sleep && d.move.length > 1;  // day trip and back to the same hotel
      d.title = !d.sleep ? t("departure") : roundTrip ? cname(from) + " → " + cname(d.move[0][1]) + " → " + cname(d.sleep)
        : (from && from !== d.sleep ? cname(from) + " → " + cname(d.sleep) : cname(d.sleep));
      if (!d.stops.length) d.stops = [{ id: "", img: (C.cities[from || d.sleep || "tashkent"] || C.cities.tashkent).img, city: d.sleep }];
      d.stops.forEach(function (st) { var x = L.sights[st.id] || [cname(st.city), (C.cities[st.city] || {}).desc || ""]; st.name = x[0]; st.desc = x[1]; });
    });
  });
  var BASE = document.documentElement.getAttribute("data-base") || "";
  var MAIN_IMG = ["hero", "bukhara", "camels", "ceramics", "charvak", "chorsu", "khiva", "mountains", "plov", "shahizinda", "tashkent", "tea", "train"];

  function img(k) { return BASE + "assets/img/" + (MAIN_IMG.indexOf(k) > -1 ? "" : "p/") + k + ".webp"; }

  function hav(a, b) {
    var R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // Transfer between two cities: known leg, or an estimate by road
  function leg(a, b) {
    for (var i = 0; i < C.legs.length; i++) {
      var l = C.legs[i];
      if ((l.a === a && l.b === b) || (l.a === b && l.b === a)) return { a: a, b: b, km: l.km, h: l.h, mode: l.mode, note: (l.note && L.legnotes[l.note]) || l.note || "", known: true };
    }
    var ca = C.cities[a], cb = C.cities[b];
    var km = Math.round(hav(ca, cb) * 1.3 / 10) * 10;
    var border = ca.country !== cb.country;
    if (km > 900) return { a: a, b: b, km: km, h: Math.round(km / 600 * 10) / 10 + 1, mode: "flight", note: t("flight_est"), known: false };
    return { a: a, b: b, km: km, h: Math.round((km / 65 + (border ? 1 : 0)) * 2) / 2, mode: border ? "border" : "car", note: border ? t("border_est") : t("estimate"), known: false };
  }

  function hours(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return (hh ? hh + " " + t("h") : "") + (mm ? (hh ? " " : "") + mm + " " + t("min") : "");
  }

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }

  function autoTransport(pax) {
    var opts = C.transport.filter(function (t) { return t.id !== "premium"; });
    for (var i = 0; i < opts.length; i++) if (opts[i].seats >= pax) return opts[i].id;
    return "bus";
  }

  // ---- prices. Costs/selling prices can be overridden from the admin panel ("Narxlar"):
  //      the site reads the ready selling prices (row "public" in price_config) and applies them here.
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
  function roomPrice(city, cls) {
    var hc = C.hotelCity && C.hotelCity[city], v = hc ? num(hc[cls.id], NaN) : NaN;
    return v > 0 ? v : cls.room;
  }
  function legTicket(a, b) {
    var k = a + ">" + b, v = C.legPrice ? C.legPrice[k] : undefined;
    if (v !== undefined && v !== null && v !== "") return num(v, 0);
    var l = leg(a, b);
    return l.mode === "train" ? C.fixed.train : l.mode === "flight" ? C.fixed.flight : 0;
  }

  // Price per person for a tour with chosen options
  function price(tour, cfg) {
    var pax = Math.max(1, cfg.pax || C.defaultPax);
    var hotel = byId(C.hotelClasses, cfg.hotel || tour.hotel || "superior");
    var tr = byId(C.transport, cfg.transport || autoTransport(pax));
    var vehicles = Math.ceil(pax / tr.seats);
    var days = tour.days.length;
    var nights = tour.days.filter(function (d) { return d.sleep; }).length;
    var guideDays = Math.max(1, days - 1);
    var langExtra = C.guide.languages[cfg.lang || "en"] || 0;
    var single = cfg.single ? 1 + C.singleSupplement : 1;

    var hotelPP = 0;
    tour.days.forEach(function (d) { if (d.sleep) hotelPP += roomPrice(d.sleep, hotel) / 2 * single; });
    var transportPP = tr.day * days * vehicles / pax;
    var guidePP = (C.guide.day + langExtra) * guideDays / pax;
    var tickets = 0;
    tour.days.forEach(function (d) { (d.move || []).forEach(function (m) { tickets += legTicket(m[0], m[1]); }); });
    var entries = 0, sightIds = [];
    tour.days.forEach(function (d) { (d.stops || []).forEach(function (st) { if (st.id) sightIds.push(st.id); }); });
    if (C.sightPrice && sightIds.length) sightIds.forEach(function (id) { entries += num(C.sightPrice[id], num(C.fixed.entryDefault, 0)); });
    else entries = guideDays * C.fixed.entryPerDay;
    var dinner = /D/.test(tour.days[0].meals || "") ? C.fixed.welcomeDinner : 0;
    var ex = C.tourExtra && tour.id ? C.tourExtra[tour.id] : null;
    var extra = ex ? num(ex.pp, 0) + num(ex.group, 0) / pax : 0;
    var cost = hotelPP + transportPP + guidePP + tickets + entries + dinner + extra;
    var step = num(C.roundTo, 5) || 1;
    // service fee (margin) per kind of service, set in admin → Narxlar → 1a (falls back to the general margin)
    var mk = function (cat) { var m = C.markups; return m && isFinite(parseFloat(m[cat])) ? parseFloat(m[cat]) : C.markup; };
    var gp = { hotel: hotelPP * (1 + mk("hotel")), transport: transportPP * (1 + mk("transport")), guide: guidePP * (1 + mk("guide")),
      train: tickets * (1 + mk("train")), entries: entries * (1 + mk("entries")), dinner: dinner * (1 + mk("dinner")), extra: extra * (1 + mk("extra")) };
    var gross = gp.hotel + gp.transport + gp.guide + gp.train + gp.entries + gp.dinner + gp.extra;
    var grossAuto = gross, costAuto = cost;
    // Manual price set by the admin for this tour (Narxlar → 7): netto / brutto per person for the base
    // configuration (2 travellers, the tour's hotel class). Other options are scaled from it.
    var o = !cfg._raw && tour.id && C.tourPrice ? C.tourPrice[tour.id] : null;
    var manual = false;
    if (o && (num(o.netto, 0) > 0 || num(o.brutto, 0) > 0)) {
      var base = price(tour, { pax: C.defaultPax, hotel: tour.hotel, _raw: true });
      if (num(o.netto, 0) > 0 && base.cost > 0) cost = cost * num(o.netto, 0) / base.cost;
      if (num(o.brutto, 0) > 0 && base.gross > 0) gross = gross * num(o.brutto, 0) / base.gross;
      else gross = costAuto > 0 ? grossAuto * cost / costAuto : cost * (1 + C.markup);
      manual = true;
    }
    var pp = Math.ceil(gross / step) * step;
    return { pp: pp, total: pp * pax, pax: pax, nights: nights, days: days, hotel: hotel, transport: tr, vehicles: vehicles, cost: cost, gross: gross, manual: manual,
      parts: { hotel: hotelPP, transport: transportPP, guide: guidePP, tickets: tickets + entries + dinner, train: tickets, entries: entries, dinner: dinner, extra: extra }, grossParts: gp };
  }

  // Apply a price set (from the admin panel) on top of the defaults in catalog.js
  function applyPrices(d) {
    if (!d || typeof d !== "object") return;
    if (d.markup !== undefined) C.markup = num(d.markup, C.markup);
    C.markups = d.markups && typeof d.markups === "object" ? d.markups : null;   // per-service margins (admin copy only)
    if (d.singleSupplement !== undefined) C.singleSupplement = num(d.singleSupplement, C.singleSupplement);
    if (d.roundTo !== undefined) C.roundTo = num(d.roundTo, 5);
    if (d.defaultPax !== undefined) C.defaultPax = num(d.defaultPax, C.defaultPax);
    if (d.hotelClasses) C.hotelClasses.forEach(function (h) { if (d.hotelClasses[h.id] !== undefined) h.room = num(d.hotelClasses[h.id], h.room); });
    if (d.transport) C.transport.forEach(function (x) { if (d.transport[x.id] !== undefined) x.day = num(d.transport[x.id], x.day); });
    if (d.guide) { if (d.guide.day !== undefined) C.guide.day = num(d.guide.day, C.guide.day);
      if (d.guide.languages) Object.keys(d.guide.languages).forEach(function (k) { C.guide.languages[k] = num(d.guide.languages[k], 0); }); }
    if (d.fixed) Object.keys(d.fixed).forEach(function (k) { C.fixed[k] = num(d.fixed[k], C.fixed[k] || 0); });
    C.hotelCity = d.hotelCity || C.hotelCity || {};
    C.legPrice = d.legPrice || C.legPrice || {};
    if (d.sightPrice) C.sightPrice = d.sightPrice;
    C.tourExtra = d.tourExtra || C.tourExtra || {};
    C.tourPrice = d.tourPrice || C.tourPrice || {};   // {tourId: {netto, brutto}} — manual prices
    C.tourComm = d.tourComm || C.tourComm || {};      // {tourId: agent commission %}
    C.svcPrice = d.svcPrice || C.svcPrice || {};      // {serviceId: {brutto, unit}} (+ netto, comm in the admin copy)
    C.bookingOnline = !!d.booking_online;
    if (Array.isArray(d.openCountries)) C.openCountries = d.openCountries.filter(function (x) { return typeof x === "string"; });
  }

  // Load the published selling prices once per page; callbacks re-run when prices change
  var priceCbs = [], pricesLoaded = false;
  function onPrices(fn) { priceCbs.push(fn); if (pricesLoaded) { try { fn(); } catch (e) {} } }
  function firePrices() { pricesLoaded = true; priceCbs.forEach(function (f) { try { f(); } catch (e) {} }); }
  (function loadPrices() {
    if (window.MN_NO_PRICE_FETCH) return;
    var SB = window.MN_SB, KEY = "mn_prices_v1", cached = null;
    try { cached = localStorage.getItem(KEY); if (cached) { applyPrices(JSON.parse(cached)); pricesLoaded = true; } } catch (e) {}
    if (!SB || !SB.url || !window.fetch) { pricesLoaded = true; return; }
    var timer = setTimeout(function () { if (!pricesLoaded) firePrices(); }, 2500);
    fetch(SB.url + "/rest/v1/price_config?id=eq.public&select=data", { headers: { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        clearTimeout(timer);
        var d = rows && rows[0] && rows[0].data, txt = d ? JSON.stringify(d) : null;
        if (d && txt !== cached) { applyPrices(d); try { localStorage.setItem(KEY, txt); } catch (e) {} firePrices(); }
        else if (!pricesLoaded) firePrices();
      })
      .catch(function () { clearTimeout(timer); if (!pricesLoaded) firePrices(); });
  })();

  // Countries whose prices / calculator are open to the public (others: presentation only, "coming soon")
  function isOpen(cc) { return (C.openCountries || ["UZ"]).indexOf(cc) > -1; }
  function tourOpen(tour) { return !!tour && isOpen(tour.country); }
  function cityOpen(id) { var c = C.cities[id]; return !!c && isOpen(c.country); }

  function fromPrice(tour) { return price(tour, { pax: C.defaultPax, hotel: tour.hotel }).pp; }

  // Ordered list of cities visited by a tour (for the map)
  function route(tour) {
    var list = [];
    function add(c) { if (c && list[list.length - 1] !== c) list.push(c); }
    tour.days.forEach(function (d, i) {
      if (i === 0 && !d.move && d.sleep) add(d.sleep);
      (d.move || []).forEach(function (m) { add(m[0]); add(m[1]); });
      add(d.sleep);
    });
    return list;
  }

  var MODE_ICON = {
    train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14M9 20l-2 2M15 20l2 2M8 16h.01M16 16h.01"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-4l-2-5H7l-2 5z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M5 13h14"/></svg>',
    flight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 13.5 3 11l1.5-1.5 7 1L16 6a2 2 0 0 1 3 3l-4.5 4.5 1 7L14 22l-2.5-7.5L8 18v2l-1.5 1L5 18l-3-1.5 1-1.5h2l3.5-3.5"/></svg>',
    border: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></svg>'
  };
  var MODE_NAME = { train: t("mode_train"), car: t("mode_car"), flight: t("mode_flight"), border: t("mode_border") };

  // Draw a route map into an <svg>
  function drawMap(svg, cities, opts) {
    opts = opts || {};
    var W = 1000, H = opts.h || 680, pad = 110;
    var pts = cities.map(function (id) { return C.cities[id]; });
    var all = opts.extent || pts;
    var minLon = Math.min.apply(null, all.map(function (p) { return p.lon; })), maxLon = Math.max.apply(null, all.map(function (p) { return p.lon; }));
    var minLat = Math.min.apply(null, all.map(function (p) { return p.lat; })), maxLat = Math.max.apply(null, all.map(function (p) { return p.lat; }));
    var k = Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
    var spanX = Math.max((maxLon - minLon) * k, 1.5), spanY = Math.max(maxLat - minLat, 1);
    var s = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
    var cx = (minLon + maxLon) / 2, cy = (minLat + maxLat) / 2;
    function P(lon, lat) { return [W / 2 + (lon - cx) * k * s, H / 2 - (lat - cy) * s]; }

    var out = '<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".25"/></filter></defs>';
    out += '<rect width="' + W + '" height="' + H + '" fill="#e9f3f7"/>';
    var tint = { UZB: "#fdf8ee", KAZ: "#f4f1ea", KGZ: "#f4f1ea", TJK: "#f4f1ea", TKM: "#efede8", AFG: "#efede8" };
    var U = function (k) { return String(t(k)).toUpperCase(); };
    var names = { UZB: [U("country_UZ"), 64.0, 41.9], KAZ: [U("country_KZ"), 70.5, 44.6], KGZ: [U("country_KG"), 74.6, 41.4], TJK: [U("country_TJ"), 70.6, 38.4], TKM: [U("country_TM"), 60.0, 39.2], AFG: [U("country_AF"), 66.5, 36.6] };
    Object.keys(G).forEach(function (c) {
      G[c].forEach(function (ring) {
        out += '<path d="M' + ring.map(function (p) { var q = P(p[0], p[1]); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join("L") + 'Z" fill="' + tint[c] + '" stroke="#c9c2b4" stroke-width="1.5"/>';
      });
    });
    Object.keys(names).forEach(function (c) {
      var q = P(names[c][1], names[c][2]);
      if (q[0] > 20 && q[0] < W - 20 && q[1] > 20 && q[1] < H - 20)
        out += '<text x="' + q[0] + '" y="' + q[1] + '" text-anchor="middle" font-size="15" letter-spacing="4" fill="#b3aa98" font-family="Montserrat,sans-serif" font-weight="600">' + names[c][0] + '</text>';
    });
    // legs
    for (var i = 0; i < cities.length - 1; i++) {
      var l = leg(cities[i], cities[i + 1]);
      var a = P(C.cities[l.a].lon, C.cities[l.a].lat), b = P(C.cities[l.b].lon, C.cities[l.b].lat);
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var color = l.mode === "train" ? "#2fa4c7" : l.mode === "flight" ? "#8a7fd1" : "#12355b";
      var dash = l.mode === "flight" ? ' stroke-dasharray="2 10"' : l.mode === "train" ? ' stroke-dasharray="14 7"' : "";
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var bend = l.mode === "flight" ? 0.22 : 0.08;
      var qx = mx - dy / len * len * bend, qy = my + dx / len * len * bend;
      out += '<path d="M' + a[0] + ',' + a[1] + ' Q' + qx + ',' + qy + ' ' + b[0] + ',' + b[1] + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-linecap="round"' + dash + '/>';
      if (!opts.noLabels && len > 60) {
        var lx = (a[0] + 2 * qx + b[0]) / 4, ly = (a[1] + 2 * qy + b[1]) / 4;
        var label = l.km + " km · " + hours(l.h);
        var w = label.length * 9.2 + 42;
        out += '<g transform="translate(' + (lx - w / 2) + ',' + (ly - 18) + ')" filter="url(#sh)"><rect width="' + w + '" height="36" rx="18" fill="#fff"/>' +
          '<g color="' + color + '">' + MODE_ICON[l.mode].replace('<svg ', '<svg x="10" y="7" width="22" height="22" ') + '</g>' +
          '<text x="36" y="24" font-size="16" font-weight="700" fill="#12355b" font-family="Montserrat,sans-serif">' + label + '</text></g>';
      }
    }
    // cities
    var seen = {};
    cities.forEach(function (id, n) {
      if (seen[id]) return; seen[id] = 1;
      var c = C.cities[id];
      var q = P(c.lon, c.lat);
      if (c.hidden) { out += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6" fill="#12355b" stroke="#fff" stroke-width="3"/>'; return; }
      out += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="13" fill="#f3b443" stroke="#fff" stroke-width="4" filter="url(#sh)"/>';
      out += '<text x="' + q[0] + '" y="' + (q[1] - 24) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#12355b" font-family="Montserrat,sans-serif" paint-order="stroke" stroke="#fff" stroke-width="5">' + c.name + '</text>';
    });
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = out;
  }

  window.MN_ENGINE = { t: t, L: L, img: img, leg: leg, hours: hours, price: price, fromPrice: fromPrice, commission: function (tid, agencyPct) { var x = C.tourComm && tid ? C.tourComm[tid] : undefined; return x !== undefined && x !== null && x !== "" ? num(x, 0) : num(agencyPct, 0); }, isOpen: isOpen, tourOpen: tourOpen, cityOpen: cityOpen, applyPrices: applyPrices, onPrices: onPrices, roomPrice: roomPrice, legTicket: legTicket, route: route, drawMap: drawMap, autoTransport: autoTransport, MODE_ICON: MODE_ICON, MODE_NAME: MODE_NAME, byId: byId };
})();
