/* Moviy Nomad — build your own tour. */
(function () {
  var E = window.MN_ENGINE, C = window.MN_CATALOG, CFG = window.MN || {}, TOURS = window.MN_TOURS, t = E.t;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var COUNTRY = { UZ: t("country_UZ"), KZ: t("country_KZ"), KG: t("country_KG"), TJ: t("country_TJ") };
  var st = { preset: "", route: [], pax: 2, hotel: "superior", transport: "", lang: (C.guide.languages[E.L.lang] !== undefined ? E.L.lang : "en"), single: false, month: "", interests: [] };
  if (C.sample && document.getElementById("sample")) { document.getElementById("sample").textContent = t("sample"); document.getElementById("sample").hidden = false; }

  // City picker
  var pick = document.getElementById("cities");
  pick.innerHTML = Object.keys(COUNTRY).map(function (cc) {
    var ids = Object.keys(C.cities).filter(function (id) { return C.cities[id].country === cc && !C.cities[id].hidden; });
    return '<div class="cgroup"><h4>' + COUNTRY[cc] + '</h4><div class="cchips">' + ids.map(function (id) {
      return '<button class="cchip" data-add="' + id + '" title="' + esc(C.cities[id].desc) + '"><img src="' + E.img(C.cities[id].img) + '" alt="">' + esc(C.cities[id].name) + '</button>';
    }).join("") + '</div></div>';
  }).join("");

  // Presets from ready tours
  document.getElementById("presets").innerHTML = Object.keys(TOURS).map(function (k) {
    return '<button class="preset" data-preset="' + k + '">' + esc(TOURS[k].title) + '</button>';
  }).join("");

  document.getElementById("hotel").innerHTML = C.hotelClasses.map(function (h) { return '<button class="card" data-hotel="' + h.id + '"><b>' + esc(h.name) + '</b><small>' + esc(h.desc) + '</small></button>'; }).join("");
  document.getElementById("transport").innerHTML = '<button class="card" data-tr=""><b>' + t("b_best") + '</b><small>' + t("b_best_sub") + '</small></button>' + C.transport.map(function (tr) { return '<button class="card" data-tr="' + tr.id + '"><b>' + esc(tr.name) + '</b><small>' + esc(tr.desc) + ' · ' + t("seats", { n: tr.seats }) + '</small></button>'; }).join("");
  document.getElementById("lang").innerHTML = Object.keys(C.guide.names).map(function (k) { return '<option value="' + k + '">' + C.guide.names[k] + '</option>'; }).join("");

  function toTour() {
    var days = [];
    st.route.forEach(function (r, i) {
      for (var n = 0; n < r.nights; n++) {
        var d = { title: C.cities[r.id].name, sleep: r.id, meals: "B", stops: [{ img: C.cities[r.id].img }] };
        if (n === 0 && i > 0) d.move = [[st.route[i - 1].id, r.id]];
        days.push(d);
      }
    });
    days.push({ title: t("departure"), sleep: null, meals: "B", stops: [{ img: "tashkent-sky" }] });
    return { title: t("b_custom"), days: days, hotel: st.hotel };
  }

  function render() {
    var list = document.getElementById("route");
    if (!st.route.length) {
      list.innerHTML = '<p class="muted">' + t("b_empty") + '</p>';
    } else {
      list.innerHTML = st.route.map(function (r, i) {
        var l = i > 0 ? E.leg(st.route[i - 1].id, r.id) : null;
        return (l ? '<div class="rleg">' + E.MODE_ICON[l.mode] + l.km + ' ' + t("km") + ' · ' + E.hours(l.h) + (l.known ? "" : " (" + t("b_approx") + ")") + '</div>' : '') +
          '<div class="ritem"><span class="ritem__n">' + (i + 1) + '</span><b>' + esc(C.cities[r.id].name) + '</b>' +
          '<div class="stepper stepper--sm"><button data-n="' + i + '" data-d="-1">−</button><span>' + r.nights + ' ' + (r.nights > 1 ? t("b_nights") : t("b_night")) + '</span><button data-n="' + i + '" data-d="1">+</button></div>' +
          '<div class="ritem__act"><button data-up="' + i + '" aria-label="' + t("b_up") + '">↑</button><button data-rm="' + i + '" aria-label="' + t("b_rm") + '">✕</button></div></div>';
      }).join("");
    }
    document.querySelectorAll("[data-add]").forEach(function (b) { b.classList.toggle("is-on", st.route.some(function (r) { return r.id === b.getAttribute("data-add"); })); });
    document.querySelectorAll("[data-hotel]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-hotel") === st.hotel); });
    document.querySelectorAll("[data-tr]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-tr") === st.transport); });
    document.getElementById("pax").textContent = st.pax;

    var sum = document.getElementById("result");
    var ids = st.route.map(function (r) { return r.id; });
    if (st.route.length < 1) {
      sum.classList.add("is-empty");
      document.getElementById("bmap").innerHTML = "";
      document.getElementById("bstats").innerHTML = "";
      document.getElementById("bprice").textContent = "—";
      document.getElementById("btotal").textContent = t("b_add_one");
      document.getElementById("send").classList.add("is-disabled");
      if (window.MN_ON_QUOTE) window.MN_ON_QUOTE(null);
      return;
    }
    sum.classList.remove("is-empty");
    var t = toTour(), p = E.price(t, st);
    var km = 0; for (var i = 1; i < ids.length; i++) km += E.leg(ids[i - 1], ids[i]).km;
    var extent = ids.map(function (id) { return C.cities[id]; });
    if (extent.length === 1) extent = extent.concat([{ lat: extent[0].lat + 1.5, lon: extent[0].lon + 2 }, { lat: extent[0].lat - 1.5, lon: extent[0].lon - 2 }]);
    E.drawMap(document.getElementById("bmap"), ids, { h: 560, extent: extent });
    document.getElementById("bstats").innerHTML = '<div><b>' + p.days + '</b><small>' + t("days") + '</small></div><div><b>' + p.nights + '</b><small>' + t("nights") + '</small></div><div><b>' + ids.length + '</b><small>' + t("b_places") + '</small></div><div><b>' + km.toLocaleString("en") + '</b><small>' + t("km") + '</small></div>';
    document.getElementById("bprice").textContent = "$" + p.pp.toLocaleString("en");
    document.getElementById("btotal").textContent = t("per_person") + " · $" + p.total.toLocaleString("en") + " " + t("b_for") + " " + st.pax + " · " + p.hotel.name + " · " + p.transport.name + (p.vehicles > 1 ? " × " + p.vehicles : "");
    var send = document.getElementById("send"); send.classList.remove("is-disabled");
    var msg = t("b_msg") + "\n" +
      "• " + t("b_route") + ": " + st.route.map(function (r) { return C.cities[r.id].name + " (" + r.nights + "n)"; }).join(" → ") + "\n" +
      "• " + p.days + " " + t("days") + " / " + p.nights + " " + t("nights") + "\n" +
      "• " + t("sum_travellers") + ": " + st.pax + (st.single ? ", " + t("sum_single") : "") + "\n" +
      "• " + t("sum_hotels") + ": " + p.hotel.name + "\n• " + t("sum_transport") + ": " + p.transport.name + "\n• " + t("sum_guide") + ": " + C.guide.names[st.lang] + "\n" +
      (st.month ? "• " + t("b_month_l") + ": " + st.month + "\n" : "") +
      (st.interests.length ? "• " + t("b_interests_l") + ": " + st.interests.join(", ") + "\n" : "") +
      "• " + t("b_price_l") + ": $" + p.pp + " " + t("per_person") + "\n" + t("b_full");
    send.href = "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(msg);
    document.getElementById("sendtg").href = "https://t.me/" + (CFG.telegram || "");
    if (window.MN_ON_QUOTE) window.MN_ON_QUOTE({
      tour_id: st.preset || "custom",
      tour_title: st.preset ? TOURS[st.preset].title : t("b_custom") + ": " + st.route.map(function (r) { return C.cities[r.id].name; }).join(" – "),
      price: p, km: km,
      config: { route: st.route.map(function (r) { return { city: r.id, name: C.cities[r.id].name, nights: r.nights }; }),
        hotel: p.hotel.name, transport: p.transport.name + (p.vehicles > 1 ? " × " + p.vehicles : ""), guide: C.guide.names[st.lang],
        single: st.single, month: st.month, interests: st.interests, days: p.days, nights: p.nights }
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var a;
    if (!b.hasAttribute("data-preset") && (b.hasAttribute("data-add") || b.hasAttribute("data-d") || b.hasAttribute("data-up") || b.hasAttribute("data-rm"))) st.preset = "";
    if ((a = b.getAttribute("data-add"))) {
      var idx = st.route.map(function (r) { return r.id; }).indexOf(a);
      if (idx > -1) st.route.splice(idx, 1); else st.route.push({ id: a, nights: 2 });
    } else if (b.hasAttribute("data-d")) {
      var r = st.route[+b.getAttribute("data-n")]; r.nights = Math.max(1, Math.min(10, r.nights + +b.getAttribute("data-d")));
    } else if ((a = b.getAttribute("data-up")) !== null) {
      var i = +a; if (i > 0) { var t = st.route[i]; st.route[i] = st.route[i - 1]; st.route[i - 1] = t; }
    } else if ((a = b.getAttribute("data-rm")) !== null) {
      st.route.splice(+a, 1);
    } else if (b.hasAttribute("data-hotel")) { st.hotel = b.getAttribute("data-hotel");
    } else if (b.hasAttribute("data-tr")) { st.transport = b.getAttribute("data-tr");
    } else if (b.hasAttribute("data-pax")) { st.pax = Math.max(1, Math.min(40, st.pax + +b.getAttribute("data-pax")));
    } else if ((a = b.getAttribute("data-preset"))) {
      var tour = TOURS[a], counts = {}, order = [];
      tour.days.forEach(function (d) { if (d.sleep) { if (!(d.sleep in counts)) { counts[d.sleep] = 0; order.push(d.sleep); } counts[d.sleep]++; } });
      st.route = order.map(function (id) { return { id: id, nights: counts[id] }; });
      st.hotel = tour.hotel; st.preset = a;
    } else return;
    render();
  });
  document.getElementById("lang").onchange = function (e) { st.lang = e.target.value; render(); };
  document.getElementById("single").onchange = function (e) { st.single = e.target.checked; render(); };
  document.getElementById("month").onchange = function (e) { st.month = e.target.value; render(); };
  document.querySelectorAll("[name=interest]").forEach(function (c) { c.onchange = function () {
    st.interests = [].slice.call(document.querySelectorAll("[name=interest]:checked")).map(function (x) { return x.value; }); render(); }; });
  window.MN_BUILDER = { render: render, state: st };
  render();
  E.onPrices(render);
})();
