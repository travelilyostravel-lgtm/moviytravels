/* Moviy Nomad — build your own tour. */
(function () {
  var E = window.MN_ENGINE, C = window.MN_CATALOG, CFG = window.MN || {}, TOURS = window.MN_TOURS;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var COUNTRY = { UZ: "Uzbekistan", KZ: "Kazakhstan", KG: "Kyrgyzstan", TJ: "Tajikistan" };
  var st = { route: [], pax: 2, hotel: "superior", transport: "", lang: "en", single: false, month: "", interests: [] };
  if (C.sample) document.getElementById("sample").hidden = false;

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
  document.getElementById("transport").innerHTML = '<button class="card" data-tr=""><b>Best for my group</b><small>We choose the right vehicle</small></button>' + C.transport.map(function (t) { return '<button class="card" data-tr="' + t.id + '"><b>' + esc(t.name) + '</b><small>' + esc(t.desc) + ' · ' + t.seats + ' seats</small></button>'; }).join("");
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
    days.push({ title: "Departure", sleep: null, meals: "B", stops: [{ img: "tashkent-sky" }] });
    return { title: "Custom tour", days: days, hotel: st.hotel };
  }

  function render() {
    var list = document.getElementById("route");
    if (!st.route.length) {
      list.innerHTML = '<p class="muted">Tap the places you want to visit — or start from a ready tour above.</p>';
    } else {
      list.innerHTML = st.route.map(function (r, i) {
        var l = i > 0 ? E.leg(st.route[i - 1].id, r.id) : null;
        return (l ? '<div class="rleg">' + E.MODE_ICON[l.mode] + l.km + ' km · ' + E.hours(l.h) + (l.known ? "" : " (approx.)") + '</div>' : '') +
          '<div class="ritem"><span class="ritem__n">' + (i + 1) + '</span><b>' + esc(C.cities[r.id].name) + '</b>' +
          '<div class="stepper stepper--sm"><button data-n="' + i + '" data-d="-1">−</button><span>' + r.nights + ' night' + (r.nights > 1 ? "s" : "") + '</span><button data-n="' + i + '" data-d="1">+</button></div>' +
          '<div class="ritem__act"><button data-up="' + i + '" aria-label="Move up">↑</button><button data-rm="' + i + '" aria-label="Remove">✕</button></div></div>';
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
      document.getElementById("btotal").textContent = "Add at least one place";
      document.getElementById("send").classList.add("is-disabled");
      return;
    }
    sum.classList.remove("is-empty");
    var t = toTour(), p = E.price(t, st);
    var km = 0; for (var i = 1; i < ids.length; i++) km += E.leg(ids[i - 1], ids[i]).km;
    var extent = ids.map(function (id) { return C.cities[id]; });
    if (extent.length === 1) extent = extent.concat([{ lat: extent[0].lat + 1.5, lon: extent[0].lon + 2 }, { lat: extent[0].lat - 1.5, lon: extent[0].lon - 2 }]);
    E.drawMap(document.getElementById("bmap"), ids, { h: 560, extent: extent });
    document.getElementById("bstats").innerHTML = '<div><b>' + p.days + '</b><small>days</small></div><div><b>' + p.nights + '</b><small>nights</small></div><div><b>' + ids.length + '</b><small>places</small></div><div><b>' + km.toLocaleString("en") + '</b><small>km</small></div>';
    document.getElementById("bprice").textContent = "$" + p.pp.toLocaleString("en");
    document.getElementById("btotal").textContent = "per person · $" + p.total.toLocaleString("en") + " for " + st.pax + " · " + p.hotel.name + " · " + p.transport.name + (p.vehicles > 1 ? " × " + p.vehicles : "");
    var send = document.getElementById("send"); send.classList.remove("is-disabled");
    var msg = "Hello Moviy Nomad! I built my own tour:\n" +
      "• Route: " + st.route.map(function (r) { return C.cities[r.id].name + " (" + r.nights + "n)"; }).join(" → ") + "\n" +
      "• " + p.days + " days / " + p.nights + " nights\n" +
      "• Travellers: " + st.pax + (st.single ? ", single rooms" : "") + "\n" +
      "• Hotels: " + p.hotel.name + "\n• Transport: " + p.transport.name + "\n• Guide: " + C.guide.names[st.lang] + "\n" +
      (st.month ? "• Month: " + st.month + "\n" : "") +
      (st.interests.length ? "• Interests: " + st.interests.join(", ") + "\n" : "") +
      "• Estimated price: $" + p.pp + " per person\nPlease send me the full program.";
    send.href = "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(msg);
    document.getElementById("sendtg").href = "https://t.me/" + (CFG.telegram || "");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var a;
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
      st.hotel = tour.hotel;
    } else return;
    render();
  });
  document.getElementById("lang").onchange = function (e) { st.lang = e.target.value; render(); };
  document.getElementById("single").onchange = function (e) { st.single = e.target.checked; render(); };
  document.getElementById("month").onchange = function (e) { st.month = e.target.value; render(); };
  document.querySelectorAll("[name=interest]").forEach(function (c) { c.onchange = function () {
    st.interests = [].slice.call(document.querySelectorAll("[name=interest]:checked")).map(function (x) { return x.value; }); render(); }; });
  render();
})();
