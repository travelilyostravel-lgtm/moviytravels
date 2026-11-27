/* Moviy Nomad — Events page (2026-11-27). Reads public.events (iTicket.uz is collected automatically every 3 hours,
   festivals and national holidays are added in the admin), shows 12 cards (4 × 3), "show more", filters, booking request. */
(function () {
  "use strict";
  var SB = window.MN_SB || {}, T = window.MNEV || {}, LANG = (document.documentElement.lang || "en").slice(0, 2);
  var grid = document.getElementById("ev-grid"); if (!grid || !SB.url) return;
  var PAGE = 12, shown = PAGE, all = [], cat = "", city = "", month = "", usd = null;
  var A = (document.documentElement.getAttribute("data-base") || "") + "assets/";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hdr() { return { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey, "Content-Type": "application/json" }; }
  function nm(o) { o = o || {}; return o[LANG] || (LANG === "uz" ? o.ru : null) || o.en || o.ru || o.uz || Object.values(o)[0] || ""; }
  var LOC = LANG === "uz" ? "uz-Latn" : LANG;
  // browsers have no Uzbek month names — write them ourselves
  var UZM = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"], UZW = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
  function fmtUz(d, o) {
    var p = [];
    if (o.weekday) p.push(UZW[d.getDay()].slice(0, o.weekday === "short" ? 3 : 20) + ",");
    if (o.day) p.push(d.getDate());
    if (o.month) p.push(o.month === "short" ? UZM[d.getMonth()].slice(0, 3) : UZM[d.getMonth()]);
    if (o.year) p.push(d.getFullYear());
    if (o.hour) p.push(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
    return p.join(" ");
  }
  function fmt(d, opt) { if (LANG === "uz") return fmtUz(d, opt); try { return new Intl.DateTimeFormat(LOC, opt).format(d); } catch (e) { return new Intl.DateTimeFormat("en", opt).format(d); } }
  function sum(n) { return Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ") + " " + (LANG === "ru" ? "сум" : LANG === "uz" ? "so'm" : "UZS"); }

  // today's USD rate (same cache the currency button uses), so prices can be shown in $ and converted by it
  function rate() {
    try { var c = JSON.parse(localStorage.getItem("mn_fx") || "null"); if (c && c.r && c.r.USD) return Promise.resolve(+c.r.USD); } catch (e) {}
    return fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/").then(function (r) { return r.json(); }).then(function (j) { return +(j[0] && j[0].Rate) || null; }).catch(function () { return null; });
  }
  var IMG = { bukhara: "bukhara", khiva: "khiva", tashkent: "tashkent", samarkand: "shahizinda", boysun: "mountains", nukus: "camels" };
  var EMO = { concert: "🎤", theatre: "🎭", festival: "🎉", official: "🇺🇿", culture: "🏛", exhibition: "🖼", kids: "🧸", sport: "🏆", other: "✨" };

  function card(ev, i) {
    var d = ev.starts_at ? new Date(ev.starts_at) : null, end = ev.ends_at ? new Date(ev.ends_at) : null, title = nm(ev.name);
    var multi = end && d && end - d > 36e5 * 30;
    var dateTxt = !d ? "" : ev.date_tba ? fmt(d, { month: "long", year: "numeric" }) + " · " + T.tba
      : multi ? fmt(d, { day: "numeric", month: "short" }) + " — " + fmt(end, { day: "numeric", month: "short", year: "numeric" })
      : fmt(d, { weekday: "short", day: "numeric", month: "long" }) + (d.getHours() || d.getMinutes() ? " · " + fmt(d, { hour: "2-digit", minute: "2-digit", hour12: false }) : "");
    var img = ev.image || (A + "img/" + (IMG[ev.city] || "hero") + ".webp");
    var price = "";
    if (ev.our_price) price = '<b>$' + Math.round(ev.our_price).toLocaleString("en") + '</b>';
    else if (+ev.min_price > 0) price = (usd ? '<b>$' + Math.max(1, Math.round(ev.min_price / usd)).toLocaleString("en") + '</b> <small>' + esc(sum(ev.min_price)) + '</small>' : '<b>' + esc(sum(ev.min_price)) + '</b>');
    else price = '<small>' + esc(T.free) + '</small>';
    var cityName = (T.cities || {})[ev.city] || "";
    var note = nm(ev.our_note), info = nm(ev.info);
    return '<article class="evc' + (ev.official ? " evc--off" : "") + '" style="--i:' + (i % PAGE) + '">' +
      '<div class="evc__img"><img src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'' + A + 'img/hero.webp\'">' +
        (d && !ev.date_tba ? '<span class="evc__day"><b>' + esc(fmt(d, { day: "numeric" })) + '</b><small>' + esc(fmt(d, { month: "short" })) + '</small></span>' : '') +
        '<span class="evc__cat">' + (EMO[ev.category] || "✨") + ' ' + esc((T.cats || {})[ev.category] || (T.cats || {}).other || "") + '</span>' +
        (ev.official ? '<span class="evc__off">★ ' + esc(T.official) + '</span>' : '') + (ev.age ? '<span class="evc__age">' + esc(ev.age) + '</span>' : '') + '</div>' +
      '<div class="evc__b"><div class="evc__date">' + esc(dateTxt) + '</div><h3>' + esc(title) + '</h3>' +
        '<div class="evc__where">📍 ' + esc([ev.venue, cityName].filter(Boolean).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(" · ")) + '</div>' +
        (info ? '<p class="evc__info">' + esc(info) + '</p>' : '') + (note ? '<p class="evc__note">✓ ' + esc(note) + '</p>' : '') +
        '<div class="evc__foot"><div class="evc__price">' + (ev.our_price || +ev.min_price > 0 ? '<small>' + esc(T.from_) + '</small> ' : '') + price + '</div></div>' +
        '<div class="evc__btns"><button type="button" class="btn btn--gold btn--sm" data-book="' + ev.id + '">' + esc(T.book) + '</button>' +
        (ev.ticket_url ? '<a class="evc__tk" href="' + esc(ev.ticket_url.replace("/en/events/", "/" + (LANG === "ru" || LANG === "uz" ? LANG : "en") + "/events/")) + '" target="_blank" rel="noopener nofollow">' + esc(T.tickets) + ' ↗</a>' : '') + '</div>' +
      '</div></article>';
  }
  function list() {
    return all.filter(function (ev) {
      return (!cat || ev.category === cat || (cat === "festival" && ev.category === "official" && false)) && (!city || ev.city === city) && (!month || (ev.starts_at || "").slice(0, 7) === month);
    });
  }
  function draw() {
    var L = list();
    grid.innerHTML = L.slice(0, shown).map(card).join("");
    document.getElementById("ev-empty").hidden = L.length > 0;
    document.getElementById("ev-more").hidden = L.length <= shown;
    requestAnimationFrame(function () { grid.querySelectorAll(".evc").forEach(function (c) { c.classList.add("is-in"); }); });
  }
  function months() {
    var sel = document.getElementById("ev-month"), seen = {};
    all.forEach(function (ev) { var k = (ev.starts_at || "").slice(0, 7); if (k) seen[k] = (seen[k] || 0) + 1; });
    Object.keys(seen).sort().forEach(function (k) {
      var o = document.createElement("option"); o.value = k;
      o.textContent = fmt(new Date(k + "-15T12:00:00"), { month: "long", year: "numeric" }) + " (" + seen[k] + ")"; sel.appendChild(o);
    });
  }

  var now = Date.now();
  Promise.all([
    fetch(SB.url + "/rest/v1/events?select=id,source,name,info,category,starts_at,ends_at,date_tba,city,venue,image,min_price,age,ticket_url,official,pinned,our_note,our_price&order=pinned.desc,starts_at.asc&limit=500", { headers: hdr() })
      .then(function (r) { return r.ok ? r.json() : []; }),
    rate()
  ]).then(function (res) {
    usd = res[1];
    all = (res[0] || []).filter(function (ev) {
      if (ev.category === "museum") return false;
      var end = ev.ends_at ? Date.parse(ev.ends_at) : (ev.starts_at ? Date.parse(ev.starts_at) + 864e5 : now + 1);
      return end >= now - 6 * 36e5;
    });
    all.sort(function (a, b) { return (b.pinned - a.pinned) || (Date.parse(a.starts_at || 0) - Date.parse(b.starts_at || 0)); });
    // category chips: only those that have events
    var has = {}; all.forEach(function (ev) { has[ev.category] = 1; });
    document.querySelectorAll(".evf__c[data-cat]").forEach(function (b) { var k = b.getAttribute("data-cat"); if (k && !has[k]) b.hidden = true; });
    var q = new URLSearchParams(location.search); if (q.get("cat")) cat = q.get("cat");
    document.querySelectorAll(".evf__c").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-cat") === cat); });
    months(); draw();
  }).catch(function () { grid.innerHTML = ""; document.getElementById("ev-empty").hidden = false; });

  document.querySelectorAll(".evf__c").forEach(function (b) {
    b.onclick = function () { cat = b.getAttribute("data-cat") || ""; shown = PAGE; document.querySelectorAll(".evf__c").forEach(function (x) { x.classList.toggle("is-on", x === b); }); draw(); };
  });
  document.getElementById("ev-city").onchange = function () { city = this.value; shown = PAGE; draw(); };
  document.getElementById("ev-month").onchange = function () { month = this.value; shown = PAGE; draw(); };
  document.getElementById("ev-more").onclick = function () { shown += PAGE; draw(); };

  // ---------------------------------------------------------------- booking request (goes to admin → B2C requests)
  var modal = document.getElementById("ev-modal"), form = document.getElementById("ev-form"), cur = null;
  function open(ev) {
    cur = ev; var d = ev.starts_at ? new Date(ev.starts_at) : null;
    document.getElementById("ev-m-ev").innerHTML = "<b>" + esc(nm(ev.name)) + "</b>" + (d ? " · " + esc(ev.date_tba ? fmt(d, { month: "long", year: "numeric" }) : fmt(d, { day: "numeric", month: "long", year: "numeric" })) : "") + (ev.venue ? " · " + esc(ev.venue) : "");
    modal.classList.add("is-open"); document.body.style.overflow = "hidden";
    if (window.MN_TRACK) window.MN_TRACK("event", nm(ev.name));
  }
  function close() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-book]"); if (!b) return;
    var id = +b.getAttribute("data-book"); var ev = all.filter(function (x) { return x.id === id; })[0]; if (ev) open(ev);
  });
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".modal__close")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
  function msg(t, k) { var m = form.querySelector(".mf-msg"); m.className = "mf-msg" + (k ? " mf-msg--" + k : ""); m.textContent = t || ""; if (t) m.scrollIntoView({ block: "nearest" }); }
  form.onsubmit = function (e) {
    e.preventDefault();
    var v = function (n) { return (form.elements[n].value || "").trim(); };
    if (!v("contact_name") || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email")) || !form.elements.consent.checked || !(+v("pax") > 0)) { msg(T.f_required, "err"); return; }
    var btn = form.querySelector('[type="submit"]'); btn.disabled = true; btn.textContent = T.f_sending;
    var extras = ["x_tr", "x_ho", "x_gu"].filter(function (k) { return form.elements[k].checked; }).map(function (k) { return T[k]; });
    var d = cur.starts_at ? cur.starts_at.slice(0, 10) : "";
    fetch(SB.url + "/rest/v1/rpc/submit_site_request", { method: "POST", headers: hdr(), body: JSON.stringify({ p: {
      kind: "service", service: "event", start_date: d, pax: v("pax"), contact_name: v("contact_name"), email: v("email"), phone: v("phone"), citizenship: v("citizenship"),
      details: { event_id: cur.id, event: nm(cur.name), venue: cur.venue || "", city: cur.city || "", date_tba: !!cur.date_tba, ticket_url: cur.ticket_url || "", price_uzs: cur.min_price || null, extras: extras },
      message: (extras.length ? "[" + extras.join(", ") + "] " : "") + v("message"), consent: true, lang: LANG } }) })
      .then(function (r) { return r.ok ? r.json() : r.text().then(function (t) { throw new Error(t); }); })
      .then(function (ref) {
        if (window.MN_TRACK) window.MN_TRACK("request", "event " + ref);
        form.hidden = true;
        var ok = document.createElement("div"); ok.className = "rq-ok";
        ok.innerHTML = '<div class="okbox"><div class="okbox__ic">✓</div><h3>' + esc(T.f_ok_title) + '</h3><p>' + esc(T.f_ok_text).replace("{ref}", "<b>" + esc(ref) + "</b>") + '</p><button type="button" class="btn btn--outline btn--sm">' + esc(T.f_close) + '</button></div>';
        form.parentNode.appendChild(ok);
        ok.querySelector("button").onclick = function () { close(); ok.remove(); form.hidden = false; form.reset(); btn.disabled = false; btn.textContent = T.f_send; msg(""); };
      })
      .catch(function () { msg(T.f_err, "err"); btn.disabled = false; btn.textContent = T.f_send; });
  };
})();
