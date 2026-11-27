/* Moviy Nomad — Food (2026-11-27). food.html: region tiles with counts. food-<region>.html: cuisine chips, halal, search,
   cards (24 per page) and a place sheet: photos, menu, hours, phone, map and a big "Yandex Go" taxi button.
   Data: public.restaurants (OpenStreetMap, refreshed weekly; photos/menu/halal-confirmed by Moviy Nomad). */
(function () {
  "use strict";
  var SB = window.MN_SB || {}, T = window.MNFOOD || {}, LANG = (document.documentElement.lang || "en").slice(0, 2);
  if (!SB.url) return;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hdr(x) { var h = { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey, "Content-Type": "application/json" }; if (x) for (var k in x) h[k] = x[k]; return h; }
  function nm(o) { o = o || {}; return o[LANG] || o["default"] || o.en || o.ru || o.uz || ""; }
  function num(n) { try { return Number(n).toLocaleString(LANG === "uz" ? "ru" : LANG); } catch (e) { return String(n); } }
  function track(k, v) { try { if (window.MN_TRACK) window.MN_TRACK(k, v); } catch (e) {} }

  function counts() { return fetch(SB.url + "/rest/v1/rpc/food_counts", { method: "POST", headers: hdr(), body: "{}" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); }

  // ---------------------------------------------------------------- index: region tiles
  if (!T.region) {
    counts().then(function (c) {
      document.querySelectorAll("[data-cnt]").forEach(function (el) { var n = (c[el.getAttribute("data-cnt")] || {})._all; el.textContent = n ? num(n) + " " + T.places : ""; });
    });
    return;
  }

  // ---------------------------------------------------------------- region page
  var grid = document.getElementById("fd-grid"), PAGE = 24, off = 0, cat = "", halal = false, q = "", rows = [], busy = false, last = 0;
  counts().then(function (c) {
    var rc = c[T.region] || {};
    document.querySelectorAll("[data-cc]").forEach(function (el) {
      var k = el.getAttribute("data-cc"), n = rc[k] || 0; el.textContent = n ? num(n) : "";
      if (!n && k !== "_all") el.closest(".fdc").hidden = true;
    });
  });
  function url() {
    var u = SB.url + "/rest/v1/restaurants?select=id,name,kind,cuisine,cat,halal,halal_ok,lat,lon,address,city,phone,website,instagram,hours,photos,menu,about,price_level,pinned" +
      "&region=eq." + encodeURIComponent(T.region) + (cat ? "&cat=eq." + cat : "") +
      (halal ? "&or=(halal_ok.is.true,halal.eq.yes,cat.eq.national)" : "") +
      (q ? "&name->>default=ilike." + encodeURIComponent("*" + q.replace(/[*,()]/g, " ") + "*") : "") +
      "&order=pinned.desc,score.desc,id.asc&limit=" + PAGE + "&offset=" + off;
    return u;
  }
  var CUI = { uzbek: "O'zbek", regional: "", local: "", plov: "plov", kebab: "kebab", shashlik: "shashlik", pizza: "pizza", burger: "burger", coffee_shop: "coffee",
    korean: "Korean", chinese: "Chinese", japanese: "Japanese", sushi: "sushi", italian: "Italian", turkish: "Turkish", georgian: "Georgian", european: "", asian: "", chicken: "chicken" };
  function cuiTxt(r) {
    var parts = String(r.cuisine || "").split(/[;,]/).map(function (s) { s = s.trim(); return CUI.hasOwnProperty(s) ? CUI[s] : s.replace(/_/g, " "); }).filter(Boolean);
    var lbl = (T.cats || {})[r.cat] || "";
    return [lbl].concat(parts.slice(0, 2)).filter(Boolean).join(" · ");
  }
  function isHalal(r) { return r.halal_ok ? "ok" : r.halal === "yes" ? "osm" : r.cat === "national" ? "nat" : ""; }
  function cover(r, big) {
    if (r.photos && r.photos.length) return '<img src="' + esc(r.photos[0]) + '" alt="' + esc(nm(r.name)) + '" loading="lazy">';
    return '<span class="fdx fdx--' + esc(r.cat) + '"><i>' + ((T.icons || {})[r.cat] || "🍽") + '</i>' + (big ? '' : '<b>' + esc(nm(r.name)).slice(0, 2) + '</b>') + '</span>';
  }
  function taxi(r) { return "https://3.redirect.appmetrica.yandex.com/route?end-lat=" + r.lat + "&end-lon=" + r.lon + "&ref=moviy-travel.uz&appmetrica_tracking_id=1178268795219780156"; }
  function card(r, i) {
    var h = isHalal(r);
    return '<article class="fdk" style="--i:' + (i % PAGE) + '" data-id="' + r.id + '">' +
      '<button type="button" class="fdk__img" data-open="' + r.id + '" aria-label="' + esc(nm(r.name)) + '">' + cover(r) +
        (h === "ok" || h === "osm" ? '<span class="fdk__halal">☪ ' + esc(T.halal) + '</span>' : '') + (r.pinned ? '<span class="fdk__pin">★</span>' : '') + '</button>' +
      '<div class="fdk__b"><h3><button type="button" data-open="' + r.id + '">' + esc(nm(r.name)) + '</button></h3>' +
        '<div class="fdk__cui">' + esc(cuiTxt(r)) + '</div>' +
        ((r.address || r.city) ? '<div class="fdk__addr">📍 ' + esc(r.address || r.city) + '</div>' : '') +
        (r.hours ? '<div class="fdk__hrs">🕒 ' + esc(r.hours.length > 40 ? r.hours.slice(0, 40) + "…" : r.hours) + '</div>' : '') +
        '<div class="fdk__act">' + (r.lat ? '<a class="fdk__taxi" href="' + esc(taxi(r)) + '" target="_blank" rel="noopener" data-taxi="' + r.id + '">🚕 Yandex Go</a>' : '') +
        '<button type="button" class="fdk__more" data-open="' + r.id + '">' + esc(T.menu) + ' · ' + esc(T.addr) + ' →</button></div></div></article>';
  }
  function load(reset) {
    // a new filter always wins; only "show more" waits for the running request
    if (busy && !reset) return; busy = true; var my = ++last;
    if (reset) { off = 0; rows = []; grid.innerHTML = '<p class="ev-load">' + esc(T.loading) + '</p>'; }
    fetch(url(), { headers: hdr() }).then(function (r) { return r.ok ? r.json() : []; }).then(function (d) {
      if (my !== last) return; busy = false;
      if (reset) grid.innerHTML = "";
      var start = rows.length; rows = rows.concat(d || []); off += (d || []).length;
      grid.insertAdjacentHTML("beforeend", (d || []).map(function (r, k) { return card(r, start + k); }).join(""));
      requestAnimationFrame(function () { grid.querySelectorAll(".fdk:not(.is-in)").forEach(function (c) { c.classList.add("is-in"); }); });
      document.getElementById("fd-empty").hidden = rows.length > 0;
      document.getElementById("fd-more").hidden = (d || []).length < PAGE;
      if (reset) ld();
    }).catch(function () { if (my !== last) return; busy = false; grid.innerHTML = ""; document.getElementById("fd-empty").hidden = false; });
  }
  // Google: list of the first places as structured data
  function ld() {
    var old = document.getElementById("fd-ld"); if (old) old.remove();
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "fd-ld";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: rows.slice(0, 20).map(function (r, i) {
      return { "@type": "ListItem", position: i + 1, item: { "@type": "Restaurant", name: nm(r.name), servesCuisine: cuiTxt(r) || undefined, address: r.address ? { "@type": "PostalAddress", streetAddress: r.address, addressCountry: "UZ" } : undefined,
        telephone: r.phone || undefined, openingHours: r.hours || undefined, geo: r.lat ? { "@type": "GeoCoordinates", latitude: r.lat, longitude: r.lon } : undefined, image: (r.photos || [])[0] || undefined } };
    }) });
    document.head.appendChild(s);
  }
  document.querySelectorAll(".fdc").forEach(function (b) {
    b.onclick = function () { cat = b.getAttribute("data-cat") || ""; document.querySelectorAll(".fdc").forEach(function (x) { x.classList.toggle("is-on", x === b); }); load(true); };
  });
  document.getElementById("fd-halal").onchange = function () { halal = this.checked; load(true); };
  var qt; document.getElementById("fd-q").oninput = function () { var v = this.value.trim(); clearTimeout(qt); qt = setTimeout(function () { q = v; load(true); }, 350); };
  document.getElementById("fd-more").onclick = function () { load(false); };
  load(true);

  // ---------------------------------------------------------------- place sheet
  var sheet = document.getElementById("fd-sheet"), inner = document.getElementById("fd-sheet-in");
  function open(r) {
    var h = isHalal(r), n = nm(r.name), menu = Array.isArray(r.menu) ? r.menu : [], about = nm(r.about);
    var photos = (r.photos || []);
    var gl = r.lat ? "https://www.google.com/maps/search/?api=1&query=" + r.lat + "," + r.lon : "", ym = r.lat ? "https://yandex.uz/maps/?pt=" + r.lon + "," + r.lat + "&z=17&l=map" : "",
        gis = r.lat ? "https://2gis.uz/geo/" + r.lon + "," + r.lat : "";
    var ig = r.instagram ? (/^https?:/.test(r.instagram) ? r.instagram : "https://instagram.com/" + r.instagram.replace(/^@/, "")) : "";
    var bb = r.lat ? (r.lon - 0.004) + "," + (r.lat - 0.0025) + "," + (r.lon + 0.004) + "," + (r.lat + 0.0025) : "";
    inner.innerHTML =
      '<div class="fds__hero">' + (photos.length ? '<div class="fds__gal">' + photos.map(function (p) { return '<img src="' + esc(p) + '" alt="' + esc(n) + '" loading="lazy">'; }).join("") + '</div>' : cover(r, true)) + '</div>' +
      '<div class="fds__body"><div class="fds__cui">' + esc(cuiTxt(r)) + '</div><h2>' + esc(n) + '</h2>' +
        (h ? '<p class="fds__halal fds__halal--' + h + '">☪ ' + esc(h === "ok" ? T.halal_ok : h === "osm" ? T.halal_osm : T.halal_nat) + '</p>' : '') +
        (r.lat ? '<a class="fds__taxi" href="' + esc(taxi(r)) + '" target="_blank" rel="noopener" data-taxi="' + r.id + '"><span class="fds__taxi-ic">🚕</span><span><b>' + esc(T.taxi) + '</b><small>' + esc(T.taxi_s) + '</small></span><i>→</i></a>' : '') +
        '<div class="fds__nav">' + (ym ? '<a href="' + esc(ym) + '" target="_blank" rel="noopener">🗺 ' + esc(T.ymap) + '</a>' : '') + (gl ? '<a href="' + esc(gl) + '" target="_blank" rel="noopener">📍 ' + esc(T.gmap) + '</a>' : '') +
          (gis ? '<a href="' + esc(gis) + '" target="_blank" rel="noopener">🧭 ' + esc(T.gis) + '</a>' : '') + (r.phone ? '<a href="tel:' + esc(r.phone.split(/[;,]/)[0].replace(/[^\d+]/g, "")) + '">📞 ' + esc(T.call) + '</a>' : '') + '</div>' +
        (about ? '<p class="fds__about">' + esc(about) + '</p>' : '') +
        '<dl class="fds__info">' + (r.address || r.city ? '<dt>' + esc(T.addr) + '</dt><dd>' + esc([r.address, r.city].filter(Boolean).join(", ")) + '</dd>' : '') +
          (r.hours ? '<dt>' + esc(T.hours) + '</dt><dd>' + esc(r.hours) + '</dd>' : '') + (r.phone ? '<dt>☎</dt><dd><a href="tel:' + esc(r.phone.split(/[;,]/)[0].replace(/[^\d+]/g, "")) + '">' + esc(r.phone) + '</a></dd>' : '') +
          (r.website ? '<dt>' + esc(T.web) + '</dt><dd><a href="' + esc(/^https?:/.test(r.website) ? r.website : "https://" + r.website) + '" target="_blank" rel="noopener nofollow">' + esc(r.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)) + '</a></dd>' : '') +
          (ig ? '<dt>Instagram</dt><dd><a href="' + esc(ig) + '" target="_blank" rel="noopener nofollow">' + esc(ig.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")) + '</a></dd>' : '') + '</dl>' +
        (menu.length ? '<h3 class="fds__h">' + esc(T.menu) + '</h3><div class="fds__menu">' + menu.map(function (m) {
          return '<div class="fds__mi">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="" loading="lazy">' : '') + '<span>' + esc(nm(m.name) || m.name) + '</span>' + (m.price ? '<b>' + num(m.price) + ' ' + (LANG === "ru" ? "сум" : "so'm") + '</b>' : '') + '</div>';
        }).join("") + '</div>' : '') +
        (bb ? '<div class="fds__map"><iframe title="map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=' + bb + '&layer=mapnik&marker=' + r.lat + ',' + r.lon + '"></iframe></div>' : '') +
      '</div>';
    sheet.classList.add("is-open"); sheet.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    track("food", n);
    try { history.replaceState(null, "", "#p" + r.id); } catch (e) {}
  }
  function close() { sheet.classList.remove("is-open"); sheet.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-taxi]"); if (t) { var r0 = rows.filter(function (x) { return String(x.id) === t.getAttribute("data-taxi"); })[0]; track("taxi", r0 ? nm(r0.name) : ""); return; }
    var o = e.target.closest("[data-open]"); if (o) { var r = rows.filter(function (x) { return String(x.id) === o.getAttribute("data-open"); })[0]; if (r) open(r); return; }
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("is-open")) close(); });
  // a shared link to one place (#p123) opens its sheet
  var m = /^#p(\d+)$/.exec(location.hash);
  if (m) fetch(SB.url + "/rest/v1/restaurants?select=*&id=eq." + m[1], { headers: hdr() }).then(function (r) { return r.json(); }).then(function (d) { if (d && d[0]) { rows.push(d[0]); open(d[0]); } }).catch(function () {});
})();
