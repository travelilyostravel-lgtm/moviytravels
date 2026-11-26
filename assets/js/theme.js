/* Moviy Nomad — night / day mode switch (26.11.2026).
   The choice is applied before paint by a tiny script in <head>; this file adds the ☀/🌙 button. */
(function () {
  "use strict";
  var H = document.documentElement;
  var TIP = { en: ["Night mode", "Day mode"], ru: ["Ночной режим", "Дневной режим"], uz: ["Tungi rejim", "Kunduzgi rejim"], tr: ["Gece modu", "Gündüz modu"], ar: ["الوضع الليلي", "الوضع النهاري"], de: ["Nachtmodus", "Tagmodus"], sv: ["Mörkt läge", "Ljust läge"], zh: ["夜间模式", "日间模式"], hi: ["नाइट मोड", "डे मोड"], ko: ["야간 모드", "주간 모드"] };
  var tip = TIP[(H.lang || "en").slice(0, 2)] || TIP.en;
  function cur() { return H.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function meta(t) { var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "dark" ? "#0e1824" : "#12355b"); }
  var btns = [];
  function paint() { var d = cur() === "dark"; btns.forEach(function (b) { b.textContent = d ? "☀" : "🌙"; b.title = d ? tip[1] : tip[0]; b.setAttribute("aria-label", b.title); }); }
  function set(t) { H.setAttribute("data-theme", t); try { localStorage.setItem("mn_theme", t); } catch (e) {} meta(t); paint(); }
  function mount() {
    var hosts = [].slice.call(document.querySelectorAll(".lang"));
    var mk = function (cls) { var b = document.createElement("button"); b.type = "button"; b.className = "thm" + (cls ? " " + cls : ""); b.onclick = function () { set(cur() === "dark" ? "light" : "dark"); }; btns.push(b); return b; };
    if (hosts.length) hosts.forEach(function (l) { l.parentNode.insertBefore(mk(l.classList.contains("lang--deck") ? "thm--deck" : ""), l); });
    else document.body.appendChild(mk("thm--float"));
    meta(cur()); paint();
  }
  /* follow the phone/computer setting until the visitor chooses */
  try { var mq = matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener("change", function (e) { if (!localStorage.getItem("mn_theme")) { H.setAttribute("data-theme", e.matches ? "dark" : "light"); meta(cur()); paint(); } }); } catch (e) {}
  window.MN_THEME = { set: set, get: cur };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
