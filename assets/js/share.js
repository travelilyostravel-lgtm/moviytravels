/* Moviy Nomad — share menu (tour or whole website). Uses the phone's native share sheet when available. */
(function () {
  var t = (window.MN_ENGINE && window.MN_ENGINE.t) || function (k) { return (window.MN_SHARE_TXT || {})[k] || k; };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function siteUrl() {
    var p = location.href.split("#")[0].split("?")[0];
    return p.replace(/tours\/[^\/]*$/, "").replace(/[^\/]*$/, "");
  }
  function toast(msg) {
    var el = document.createElement("div"); el.className = "mn-toast"; el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.classList.add("is-on"); }, 10);
    setTimeout(function () { el.classList.remove("is-on"); setTimeout(function () { el.remove(); }, 300); }, 2600);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { toast(t("copied")); });
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(t("copied")); } catch (e) {} ta.remove();
    return Promise.resolve();
  }
  var pop = null;
  function close() { if (pop) { pop.remove(); pop = null; } }
  function links(url, text) {
    var u = encodeURIComponent(url), m = encodeURIComponent(text + " " + url);
    return [
      ["wa", "WhatsApp", "https://wa.me/?text=" + m],
      ["tg", "Telegram", "https://t.me/share/url?url=" + u + "&text=" + encodeURIComponent(text)],
      ["fb", "Facebook", "https://www.facebook.com/sharer/sharer.php?u=" + u],
      ["mail", "Email", "mailto:?subject=" + encodeURIComponent(text) + "&body=" + m]
    ];
  }
  // opts: { anchor, tour: {title, url} (optional) }
  function open(opts) {
    if (pop) { close(); return; }
    var tour = opts.tour, site = { title: "Moviy Nomad", url: siteUrl() };
    var mode = tour ? "tour" : "site";
    pop = document.createElement("div"); pop.className = "mn-share"; pop.setAttribute("role", "dialog");
    function draw() {
      var cur = mode === "tour" ? tour : site;
      var text = mode === "tour" ? t("share_msg") + " " + cur.title : t("site_msg");
      pop.innerHTML =
        '<div class="mn-share__head"><b>' + esc(t("share")) + '</b><button class="mn-share__x" aria-label="' + esc(t("close")) + '">×</button></div>' +
        (tour ? '<div class="mn-share__seg"><button data-m="tour" class="' + (mode === "tour" ? "is-on" : "") + '">' + esc(t("share_tour")) + '</button><button data-m="site" class="' + (mode === "site" ? "is-on" : "") + '">' + esc(t("share_site")) + '</button></div>' : "") +
        (navigator.share ? '<button class="mn-share__native">' + esc(t("share")) + '…</button>' : "") +
        '<div class="mn-share__grid">' + links(cur.url, text).map(function (l) {
          return '<a class="mn-share__i mn-share__i--' + l[0] + '" href="' + esc(l[2]) + '" target="_blank" rel="noopener">' + esc(l[1]) + '</a>';
        }).join("") + '</div>' +
        '<div class="mn-share__copy"><input readonly value="' + esc(cur.url) + '"><button>' + esc(t("copy_link")) + '</button></div>';
      pop.querySelector(".mn-share__x").onclick = close;
      pop.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { mode = b.getAttribute("data-m"); draw(); }; });
      pop.querySelector(".mn-share__copy button").onclick = function () { copy(cur.url); };
      var nat = pop.querySelector(".mn-share__native");
      if (nat) nat.onclick = function () { navigator.share({ title: cur.title, text: text, url: cur.url }).then(close, function () {}); };
    }
    draw();
    document.body.appendChild(pop);
    var r = opts.anchor.getBoundingClientRect();
    pop.style.top = (r.bottom + 10) + "px";
    var rtl = document.documentElement.dir === "rtl";
    if (rtl) pop.style.left = Math.max(10, r.left) + "px"; else pop.style.right = Math.max(10, window.innerWidth - r.right) + "px";
  }
  document.addEventListener("click", function (e) { if (pop && !pop.contains(e.target) && !e.target.closest("[data-share]")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  window.MNShare = { open: open, close: close, toast: toast };

  // Generic buttons: <button data-share> (site) — tour pages wire their own.
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-share='site']"); if (!b) return;
    e.preventDefault();
    if (navigator.share && window.matchMedia("(pointer:coarse)").matches) { navigator.share({ title: "Moviy Nomad", text: t("site_msg"), url: siteUrl() }).catch(function () {}); return; }
    open({ anchor: b });
  });
})();
