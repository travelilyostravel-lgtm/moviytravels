/* Agent portal languages: the page is written in English; AG_DICT (per language) translates texts on the screen.
   AGT("Only {0} seats left.", 3) is used in the code for texts with numbers. */
(function () {
  var D = window.AG_DICT || {}, LANG = window.AG_LANG || "en";
  var fill = function (s, a) { return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i] !== undefined ? a[+i] : ""; }); };
  window.AGT = function (s) { var a = [].slice.call(arguments, 1); return fill(D[s] || s, a); };
  if (LANG === "en") return;
  // template keys -> regex, so texts with numbers built anywhere on the page are translated too
  var TPL = Object.keys(D).filter(function (k) { return /\{\d\}/.test(k) && k.indexOf("<") < 0; }).map(function (k) {
    var re = new RegExp("^" + k.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\\?\{(\d)\\?\}/g, "(.+?)") + "$");
    var order = (k.match(/\{(\d)\}/g) || []).map(function (x) { return +x[1]; });
    return [re, k, order];
  });
  function tr(text) {
    var t = text.trim(); if (!t || t.length > 600) return null;
    if (D[t]) return text.replace(t, D[t]);
    for (var i = 0; i < TPL.length; i++) { var m = TPL[i][0].exec(t); if (m) { var a = []; TPL[i][2].forEach(function (n, j) { a[n] = m[j + 1]; }); return text.replace(t, fill(D[TPL[i][1]], a)); } }
    return null;
  }
  function walk(root) {
    if (root.nodeType === 3) { var r = tr(root.nodeValue); if (r !== null && r !== root.nodeValue) root.nodeValue = r; return; }
    if (root.nodeType !== 1 || root.closest && root.closest("[data-notr]")) return;
    ["placeholder", "aria-label", "title"].forEach(function (at) { var v = root.getAttribute && root.getAttribute(at); if (v) { var r = tr(v); if (r !== null) root.setAttribute(at, r); } });
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue; var r = tr(n.nodeValue); if (r !== null && r !== n.nodeValue) n.nodeValue = r; }
      else ["placeholder", "aria-label", "title"].forEach(function (at) { var v = n.getAttribute(at); if (v) { var r = tr(v); if (r !== null && r !== v) n.setAttribute(at, r); } });
    }
  }
  var start = function () {
    walk(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "characterData") walk(m.target); else m.addedNodes.forEach(walk); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  ["alert", "confirm", "prompt"].forEach(function (fn) { var o = window[fn]; window[fn] = function (m) { var r = tr(String(m || "")); arguments[0] = r === null ? m : r; return o.apply(window, arguments); }; });
})();
