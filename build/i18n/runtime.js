/* New languages: translate English texts that page scripts draw after load (forms, cabinet, schedule…) using window.MN_RT. */
(function () {
  var D = window.MN_RT; if (!D) return; for (var k in D) if (D[k] === k || D[D[k]] !== undefined) delete D[k]; /* never loop */ var A = ["placeholder", "title", "aria-label"];
  function tn(n) { var v = n.nodeValue, t = v && v.trim(); if (t && D[t]) n.nodeValue = v.replace(t, D[t]); }
  function el(e) {
    if (!e.getAttribute) return;
    for (var i = 0; i < A.length; i++) { var a = e.getAttribute(A[i]); if (a && D[a.trim()]) e.setAttribute(A[i], D[a.trim()]); }
    if (e.tagName === "INPUT" && (e.type === "submit" || e.type === "button") && D[e.value]) e.value = D[e.value];
  }
  function walk(r) {
    if (r.nodeType === 3) return tn(r);
    if (r.nodeType !== 1 || r.tagName === "SCRIPT" || r.tagName === "STYLE") return;
    el(r); var w = document.createTreeWalker(r, 5, null, false), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) { if (n.parentNode && n.parentNode.tagName !== "SCRIPT") tn(n); } else el(n); }
  }
  function go() {
    walk(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "characterData") tn(m.target); else if (m.type === "attributes") el(m.target); else for (var i = 0; i < m.addedNodes.length; i++) walk(m.addedNodes[i]); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: A });
  }
  if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
})();
