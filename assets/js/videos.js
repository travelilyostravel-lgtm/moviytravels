/* Home "Discover Uzbekistan" videos: thumbnails first, the YouTube player loads only on click (fast page). */
(function () {
  var box = document.getElementById("videos"); if (!box) return;
  box.addEventListener("click", function (ev) {
    var tab = ev.target.closest("[data-vcat]");
    if (tab) {
      var c = tab.dataset.vcat;
      box.querySelectorAll("[data-vcat]").forEach(function (b) { b.classList.toggle("is-on", b === tab); });
      box.querySelectorAll(".vcard").forEach(function (f) { f.hidden = !(c === "all" || f.dataset.cat === c); });
      return;
    }
    var p = ev.target.closest("[data-yt]"); if (!p) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(p.dataset.yt) + "?autoplay=1&rel=0&hl=" + (document.documentElement.lang || "en");
    f.title = p.getAttribute("aria-label") || "YouTube"; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    f.setAttribute("loading", "lazy");
    p.replaceWith(f);
    try { window.MNtrack && window.MNtrack("video", p.dataset.yt); } catch (e) {}
  });
})();
