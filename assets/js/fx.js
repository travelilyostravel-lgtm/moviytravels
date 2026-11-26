/* Moviy Nomad — currency switcher for visitors (26.11.2026).
   Prices on the site are kept in USD. This script shows them in the visitor's chosen currency
   using today's Central Bank of Uzbekistan (cbu.uz) rates. Payment terms do not change. */
(function () {
  "use strict";
  if (window.MN_FX) return;
  var CUR = ["USD","EUR","UZS","RUB","KZT","KGS","TJS","AZN","TMT","AMD","GEL","BYN","UAH","MDL","TRY",
             "AED","SAR","CNY","INR","KRW","JPY","MYR","GBP","CHF","SEK","PLN","CZK","HUF","CAD","AUD"];
  var LANG = (document.documentElement.lang || "en").slice(0, 2);
  var NOTE = {
    en: "≈ by the Central Bank of Uzbekistan rate on {d}. Payment is in USD.",
    ru: "≈ по курсу ЦБ Узбекистана на {d}. Оплата — в USD.",
    uz: "≈ O'zbekiston Markaziy banki kursi bo'yicha, {d}. To'lov USD'da.",
    tr: "≈ Özbekistan Merkez Bankası kuruyla, {d}. Ödeme USD ile.",
    ar: "≈ حسب سعر البنك المركزي الأوزبكي في {d}. الدفع بالدولار الأمريكي.",
    de: "≈ zum Kurs der Zentralbank Usbekistans am {d}. Zahlung in USD.",
    sv: "≈ enligt Uzbekistans centralbanks kurs {d}. Betalning i USD.",
    zh: "≈ 按乌兹别克斯坦央行 {d} 汇率换算。以美元付款。",
    hi: "≈ उज़्बेकिस्तान सेंट्रल बैंक की {d} की दर से। भुगतान USD में।",
    ko: "≈ 우즈베키스탄 중앙은행 {d} 환율 기준. 결제는 USD로 진행됩니다."
  };
  var TITLE = { en: "Currency", ru: "Валюта", uz: "Valyuta", tr: "Para birimi", ar: "العملة", de: "Währung", sv: "Valuta", zh: "货币", hi: "मुद्रा", ko: "통화" };
  var KEY = "mn_cur", RKEY = "mn_fx";
  var cur = "USD", rates = null, rdate = "";
  try { cur = localStorage.getItem(KEY) || "USD"; } catch (e) {}
  if (CUR.indexOf(cur) < 0) cur = "USD";

  function loadCached() { try { var c = JSON.parse(localStorage.getItem(RKEY) || "null"); if (c && c.r) { rates = c.r; rdate = c.d; return c; } } catch (e) {} return null; }
  function fetchRates() {
    return fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/").then(function (r) { return r.json(); }).then(function (j) {
      var r = { UZS: 1 }, d = "";
      j.forEach(function (x) { if (CUR.indexOf(x.Ccy) > -1) { r[x.Ccy] = (+x.Rate) / (+x.Nominal || 1); d = x.Date; } });
      if (r.USD) { rates = r; rdate = d; try { localStorage.setItem(RKEY, JSON.stringify({ r: r, d: d, t: Date.now() })); } catch (e) {} }
    }).catch(function () {});
  }
  function factor() { return rates && rates.USD && rates[cur] ? rates.USD / rates[cur] : null; }
  function fmt(usd) {
    var f = factor(); if (!f) return null;
    var v = usd * f, digits = 0;
    if (v >= 100000) v = Math.round(v / 1000) * 1000; else if (v >= 1000) v = Math.round(v / 10) * 10; else v = Math.round(v);
    try { return new Intl.NumberFormat(LANG === "ar" ? "en" : LANG, { style: "currency", currency: cur, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v); }
    catch (e) { return cur + " " + v.toLocaleString("en"); }
  }

  /* convert "$1,234" in text nodes; remember the original so switching back is exact */
  var RE = /\$\s?(\d{1,3}(?:[,   ]\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/g;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CODE|NOSCRIPT)$/;
  var seen = [];
  function okNode(n) {
    for (var p = n.parentNode; p && p !== document.body; p = p.parentNode) {
      if (p.nodeType === 1 && (SKIP.test(p.nodeName) || p.hasAttribute("data-no-fx") || p.isContentEditable)) return false;
    }
    return true;
  }
  function apply(root) {
    if (!document.body) return;
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      var src = t.__fxo !== undefined && t.data === t.__fxv ? t.__fxo : t.data;
      if (src.indexOf("$") < 0 || !okNode(t)) return;
      if (cur === "USD" || !factor()) { if (t.__fxo !== undefined && t.data === t.__fxv) { busy = true; t.data = t.__fxo; busy = false; } return; }
      var out = src.replace(RE, function (m, num) { var s = fmt(parseFloat(num.replace(/[,   ]/g, ""))); return s || m; });
      if (out !== src) { t.__fxo = src; t.__fxv = out; if (t.data !== out) { busy = true; t.data = out; busy = false; } if (seen.indexOf(t) < 0) seen.push(t); }
    });
  }
  var busy = false, timer = null;
  function schedule() { if (timer) return; timer = setTimeout(function () { timer = null; apply(); }, 120); }

  /* switcher next to the language button */
  function css() {
    if (document.getElementById("mn-fx-css")) return;
    var s = document.createElement("style"); s.id = "mn-fx-css";
    s.textContent = ".cur{position:relative}.cur__btn{display:flex;align-items:center;gap:4px;color:#fff;font-weight:700;font-size:13px;padding:8px 11px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:transparent;cursor:pointer;font-family:inherit}" +
      ".lang--deck~.cur .cur__btn,.cur--deck .cur__btn{background:rgba(255,255,255,.12)}" +
      ".cur__menu{position:absolute;inset-inline-end:0;top:calc(100% + 8px);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:10px;width:330px;max-width:92vw;display:none;z-index:1000;color:#1d2b3a}" +
      ".cur.is-open .cur__menu{display:block}.cur__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}" +
      ".cur__grid button{padding:8px 6px;border-radius:10px;border:0;background:#f4f1ea;font-weight:700;font-size:13px;cursor:pointer;color:#1d2b3a}.cur__grid button[aria-current]{background:#12355b;color:#fff}" +
      ".cur__note{font-size:11.5px;color:#6b7280;margin:8px 2px 0;line-height:1.4}.cur__ttl{font-weight:700;font-size:13px;margin:0 2px 8px}" +
      ".cur--float{position:fixed;inset-inline-start:12px;bottom:12px;z-index:900}.cur--float .cur__btn{background:#12355b;border-color:#12355b}.cur--float .cur__menu{top:auto;bottom:calc(100% + 8px);inset-inline-start:0;inset-inline-end:auto}" +
      "@media (max-width:640px){.cur__btn{padding:7px 9px;font-size:12px}.header .cur__menu{position:fixed;inset-inline:4vw;top:64px;width:auto}}";
    document.head.appendChild(s);
  }
  var boxes = [];
  function render(box) {
    var d = rdate || "";
    box.querySelector(".cur__btn").textContent = cur;
    box.querySelector(".cur__menu").innerHTML = '<div class="cur__ttl">' + (TITLE[LANG] || TITLE.en) + '</div><div class="cur__grid">' +
      CUR.map(function (c) { return '<button type="button" data-c="' + c + '"' + (c === cur ? ' aria-current="true"' : "") + ">" + c + "</button>"; }).join("") +
      '</div><p class="cur__note">' + (NOTE[LANG] || NOTE.en).replace("{d}", d || "—") + "</p>";
  }
  function mount() {
    css();
    var langs = document.querySelectorAll(".lang");
    var hosts = [];
    langs.forEach(function (l) { if (getComputedStyle(l).display !== "none" || l.closest(".header")) hosts.push(l); });
    if (!hosts.length && langs.length) hosts = [langs[0]];
    var make = function (cls) {
      var b = document.createElement("div"); b.className = "cur" + (cls ? " " + cls : ""); b.setAttribute("data-no-fx", "");
      b.innerHTML = '<button type="button" class="cur__btn" aria-label="Currency"></button><div class="cur__menu"></div>';
      b.querySelector(".cur__btn").onclick = function (e) { e.stopPropagation(); var o = b.classList.toggle("is-open"); if (o) document.querySelectorAll(".lang.is-open").forEach(function (x) { x.classList.remove("is-open"); }); };
      b.querySelector(".cur__menu").onclick = function (e) {
        e.stopPropagation(); var c = e.target.getAttribute && e.target.getAttribute("data-c"); if (!c) return;
        set(c); b.classList.remove("is-open");
      };
      render(b); boxes.push(b); return b;
    };
    if (hosts.length) hosts.forEach(function (l) { l.parentNode.insertBefore(make(l.classList.contains("lang--deck") ? "cur--deck" : ""), l); });
    else document.body.appendChild(make("cur--float"));
    document.addEventListener("click", function () { boxes.forEach(function (b) { b.classList.remove("is-open"); }); });
  }
  function set(c) {
    cur = c; try { localStorage.setItem(KEY, c); } catch (e) {}
    var go = function () { boxes.forEach(render); apply(); };
    if (c !== "USD" && !factor()) fetchRates().then(go); else go();
  }

  window.MN_FX = { set: set, get: function () { return cur; }, list: CUR, convert: function (usd) { return cur === "USD" ? "$" + Math.round(usd).toLocaleString("en") : fmt(usd); }, refresh: apply };

  function start() {
    var c = loadCached();
    var fresh = c && c.t && Date.now() - c.t < 6 * 3600 * 1000;
    mount();
    var after = function () { boxes.forEach(render); apply(); };
    if (!fresh) fetchRates().then(after); else after();
    new MutationObserver(function () { if (!busy) schedule(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
