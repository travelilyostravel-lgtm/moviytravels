/* Home hero: animated background slides + live weather for Uzbekistan (Open-Meteo, no key) + monthly averages */
(function () {
  var hero = document.querySelector(".hero"); if (!hero) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. Background slides (nature, history, national life)
  var host = hero.querySelector("[data-slides]");
  if (host) {
    var A = host.getAttribute("data-base"), list = host.getAttribute("data-slides").split(","), layers = [], cur = 0;
    var dots = document.createElement("div"); dots.className = "hero__dots"; hero.appendChild(dots);
    list.forEach(function (src, i) {
      var d = document.createElement("div"); d.className = "hero__slide" + (i === 0 ? " is-on" : "");
      if (i === 0) d.style.backgroundImage = "url(" + A + src + ".webp)"; else d.dataset.src = A + src + ".webp";
      host.appendChild(d); layers.push(d);
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", String(i + 1)); if (i === 0) b.className = "is-on";
      b.onclick = function () { go(i); restart(); }; dots.appendChild(b);
    });
    var load = function (d) { if (d.dataset.src) { d.style.backgroundImage = "url(" + d.dataset.src + ")"; delete d.dataset.src; } };
    var go = function (i) {
      load(layers[i]); load(layers[(i + 1) % layers.length]);
      layers[cur].classList.remove("is-on"); dots.children[cur].classList.remove("is-on");
      cur = i; layers[cur].classList.add("is-on"); dots.children[cur].classList.add("is-on");
    };
    var timer, restart = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!document.hidden) go((cur + 1) % layers.length); }, 6500); };
    setTimeout(function () { load(layers[1]); }, 1500); restart();
  }

  // ---- 2. Weather
  var box = document.getElementById("wx"), T = (window.MNX && MNX.wx) || null; if (!box || !T) return;
  var LANG = window.MN_LANG || "en";
  var C = [ // lat, lon, monthly avg max, min, rainy days (long-term approx.)
    [41.31, 69.28, [6,9,16,22,28,34,36,34,29,21,14,8], [-3,-1,5,10,15,19,21,19,13,7,3,-1], [12,11,13,12,8,3,1,1,2,6,9,11]],
    [39.65, 66.96, [7,9,15,21,27,32,34,33,28,21,14,9], [-3,-1,4,9,13,17,19,17,12,6,2,-1], [11,11,12,10,7,2,1,0,1,5,8,10]],
    [39.77, 64.42, [8,11,17,24,30,35,37,35,30,22,15,9], [-3,-1,5,11,16,20,22,20,14,7,2,-2], [8,8,9,7,5,1,0,0,1,3,5,7]],
    [41.38, 60.36, [3,6,14,22,29,34,36,34,28,20,11,5], [-6,-4,3,9,15,20,22,20,13,6,0,-4], [6,5,6,5,4,1,1,0,1,2,4,5]],
    [40.39, 71.79, [4,8,15,23,28,33,35,34,29,21,13,6], [-4,-2,5,11,15,19,21,19,13,7,2,-2], [8,8,9,8,7,3,1,1,1,4,6,8]],
    [42.46, 59.60, [1,4,12,21,28,33,35,33,27,19,10,3], [-8,-6,1,8,15,19,22,19,12,5,-1,-5], [5,5,5,4,3,1,1,0,1,2,3,4]]
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var grp = function (c) { return c === 0 ? 0 : c <= 2 ? 1 : c === 3 ? 2 : c <= 48 ? 3 : c <= 57 ? 4 : c <= 67 || (c >= 80 && c <= 82) ? 5 : c <= 77 || c === 85 || c === 86 ? 6 : 7; };
  var P = { sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/>',
    rain: '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7zM8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    snow: '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7zM8 19h.01M12 20h.01M16 19h.01"/>',
    storm: '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7zM12 15l-2 4h3l-2 4"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    partD: '<circle cx="8" cy="8" r="3"/><path d="M8 2v1M2 8h1M3.8 3.8l.7.7M12.2 3.8l-.7.7M9 19h8a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 13a3 3 0 0 0 1 6z"/>',
    partN: '<path d="M11 7.5A4.5 4.5 0 1 1 5.5 3a3.6 3.6 0 0 0 5.5 4.5zM9 20h8a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 14a3 3 0 0 0 1 6z"/>' };
  var ic = function (code, day) { var g = grp(code), k = g === 0 ? (day ? "sun" : "moon") : g === 1 ? (day ? "partD" : "partN") : ["", "", "cloud", "fog", "rain", "rain", "snow", "storm"][g];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + "</svg>"; };
  var clock = function () { try { return new Date().toLocaleTimeString(LANG === "uz" ? "uz-Latn" : LANG, { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false }); } catch (e) { return ""; } };
  var UZM = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"], UZD = ["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"];
  var monthName = function (m, f) { if (LANG === "uz") return f === "short" ? UZM[m].slice(0, 3) : UZM[m]; try { var s = new Date(2026, m, 15).toLocaleString(LANG === "uz" ? "uz-Latn" : LANG, { month: f || "long" }); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return String(m + 1); } };
  var dayName = function (iso) { if (LANG === "uz") return UZD[new Date(iso + "T12:00:00").getDay()]; try { return new Date(iso + "T12:00:00").toLocaleString(LANG === "uz" ? "uz-Latn" : LANG, { weekday: "short" }); } catch (e) { return iso.slice(5); } };
  var D = null, sel = 0;

  function card() {
    var c = D[sel].current;
    box.innerHTML = '<div class="wx__top"><span>' + esc(T.title) + '</span><span class="wx__clock">' + esc(clock()) + "</span></div>" +
      '<div class="wx__city">' + esc(T.cities[sel]) + "</div>" +
      '<div class="wx__now"><span class="wx__big">' + ic(c.weather_code, c.is_day) + "<b>" + Math.round(c.temperature_2m) + "</b><sup>°C</sup></span>" +
      '<span class="wx__desc"><b>' + esc(T.codes[grp(c.weather_code)]) + "</b><small>" + esc(T.feels) + " " + Math.round(c.apparent_temperature) + "°</small></span></div>" +
      '<div class="wx__stats"><span><b>' + Math.round(D[sel].daily.temperature_2m_max[0]) + "°</b>" + esc(T.max) + "</span><span><b>" + Math.round(D[sel].daily.temperature_2m_min[0]) + "°</b>" + esc(T.min) + "</span><span><b>" + Math.round(c.relative_humidity_2m) + "%</b>" + esc(T.hum) + "</span><span><b>" + Math.round(c.wind_speed_10m) + "<small> " + esc(T.kmh) + "</small></b>" + esc(T.wind) + "</span></div>" +
      '<div class="wx__cities">' + D.map(function (d, i) { return '<button type="button" data-c="' + i + '"' + (i === sel ? ' class="is-on"' : "") + "><small>" + esc(T.cities[i]) + "</small><b>" + ic(d.current.weather_code, d.current.is_day) + Math.round(d.current.temperature_2m) + "°</b></button>"; }).join("") + "</div>" +
      '<button type="button" class="wx__more">' + esc(T.more) + "</button>";
    box.hidden = false;
    box.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { sel = +b.dataset.c; card(); }; });
    box.querySelector(".wx__more").onclick = function () { modal(new Date().getMonth()); };
  }

  function modal(month) {
    var m = document.getElementById("wxm");
    if (!m) { m = document.createElement("div"); m.id = "wxm"; m.className = "wxm"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest(".wxm__x")) m.classList.remove("is-open"); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") m.classList.remove("is-open"); }); }
    var c = C[sel], d = D && D[sel], hi = Math.max.apply(null, c[2]), lo = Math.min.apply(null, c[3]), span = hi - lo || 1;
    var verdict = function (i) { var h = c[2][i]; return h >= 34 ? ["hot", T.hot] : h < 10 ? ["cold", T.cold] : h >= 18 && h <= 30 ? ["great", T.great] : ["ok", T.ok]; };
    var v = verdict(month);
    var f7 = d ? '<h4>' + esc(T.f7) + '</h4><div class="wxm__days">' + d.daily.time.map(function (t, i) { return "<span><small>" + esc(dayName(t)) + "</small>" + ic(d.daily.weather_code[i], 1) + "<b>" + Math.round(d.daily.temperature_2m_max[i]) + "°</b><em>" + Math.round(d.daily.temperature_2m_min[i]) + "°</em></span>"; }).join("") + "</div>" : "";
    var bars = c[2].map(function (h, i) { var l = c[3][i], top = (hi - h) / span * 100, ht = (h - l) / span * 100;
      return '<button type="button" data-m="' + i + '" class="' + (i === month ? "is-on " : "") + "wxm__bar--" + verdict(i)[0] + '"><b>' + h + '°</b><i><s style="top:' + top + "%;height:" + Math.max(ht, 6) + '%"></s></i><em>' + l + "°</em><small>" + esc(monthName(i, "short")) + "</small></button>"; }).join("");
    m.innerHTML = '<div class="wxm__box"><button type="button" class="wxm__x" aria-label="' + esc(T.close) + '">×</button>' +
      '<div class="wxm__tabs">' + T.cities.map(function (n, i) { return '<button type="button" data-c="' + i + '"' + (i === sel ? ' class="is-on"' : "") + ">" + esc(n) + "</button>"; }).join("") + "</div>" + f7 +
      '<h4>' + esc(T.pick) + '</h4><div class="wxm__pick"><select>' + c[2].map(function (_, i) { return '<option value="' + i + '"' + (i === month ? " selected" : "") + ">" + esc(monthName(i)) + "</option>"; }).join("") + "</select>" +
      '<div class="wxm__res wxm__res--' + v[0] + '"><b>' + esc(T.cities[sel]) + ", " + esc(monthName(month)) + ": " + c[2][month] + "° / " + c[3][month] + "°</b><span>" + esc(v[1]) + " · " + c[4][month] + " " + esc(T.rain_days) + "</span></div></div>" +
      '<h4>' + esc(T.monthly) + '</h4><div class="wxm__bars">' + bars + "</div><p class=\"wxm__note\">" + esc(T.avg_note) + "</p></div>";
    m.querySelectorAll(".wxm__tabs [data-c]").forEach(function (b) { b.onclick = function () { sel = +b.dataset.c; if (D) card(); modal(month); }; });
    m.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { modal(+b.dataset.m); }; });
    m.querySelector("select").onchange = function () { modal(+this.value); };
    m.classList.add("is-open");
  }

  var url = "https://api.open-meteo.com/v1/forecast?latitude=" + C.map(function (c) { return c[0]; }).join(",") + "&longitude=" + C.map(function (c) { return c[1]; }).join(",") +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTashkent&forecast_days=7";
  var get = function () { fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.length) { D = j; card(); } }).catch(function () {}); };
  get(); setInterval(function () { if (!document.hidden) get(); }, 15 * 60 * 1000);
  setInterval(function () { var k = box.querySelector(".wx__clock"); if (k) k.textContent = clock(); }, 30000);
})();
