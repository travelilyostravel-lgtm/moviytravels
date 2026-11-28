/* Moviy Nomad — eSIM page (27.11.2026). Shows the plans; «Buy» gets a tracking number from our database
 * and sends the tourist to our partner Qulay SIM with that number. Qulay SIM sells; we never see payment data. */
(function () {
  "use strict";
  var SB = window.MN_SB || {}, T = window.MNESIM || {}, LANG = (document.documentElement.lang || "en").slice(0, 2);
  var grid = document.getElementById("es-grid"); if (!grid || !SB.url) return;
  function hdr() { return { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey, "Content-Type": "application/json" }; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n, cur) { n = +n || 0; return (cur === "USD" || !cur ? "$" : "") + (n % 1 ? n.toFixed(2) : n) + (cur && cur !== "USD" ? " " + cur : ""); }
  var cfg = null, plans = [];
  function src() { var u = /[?&]utm_source=([^&]+)/.exec(location.search); return (u ? decodeURIComponent(u[1]) : document.referrer ? document.referrer.replace(/^https?:\/\//, "").split("/")[0] : "direct").slice(0, 60); }
  function cc() { try { return ((JSON.parse(localStorage.getItem("mn_cc") || "null") || {}).c || "").slice(0, 2); } catch (e) { return ""; } }

  Promise.all([
    fetch(SB.url + "/rest/v1/rpc/esim_public", { method: "POST", headers: hdr(), body: "{}" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
    fetch(SB.url + "/rest/v1/esim_plans?select=id,name,gb,days,price,currency,partner_plan,popular&active=is.true&order=sort.asc,price.asc", { headers: hdr() }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
  ]).then(function (res) {
    cfg = res[0] || {}; plans = res[1] || [];
    if (!cfg.enabled || !plans.length) { grid.innerHTML = ""; document.getElementById("es-soon").hidden = false; return; }
    if (cfg.promo) { var pr = document.getElementById("es-promo"); pr.hidden = false; pr.innerHTML = "🎁 " + esc(T.promo) + ": <b>" + esc(cfg.promo) + "</b>"; }
    grid.innerHTML = plans.map(function (p) {
      var data = p.gb == null ? T.unl : (+p.gb) + " " + T.gb;
      return '<article class="es-card' + (p.popular ? " is-pop" : "") + '">' + (p.popular ? '<span class="es-pop">★ ' + esc(T.pop) + '</span>' : '') +
        '<div class="es-data">' + esc(data) + '</div><div class="es-days">' + esc((T.per ? T.per + " " : "") + p.days + " " + T.days) + '</div>' +
        '<div class="es-name">' + esc(p.name) + '</div><div class="es-price">' + esc(money(p.price, p.currency)) + '</div>' +
        '<button type="button" class="btn btn--gold es-buy" data-plan="' + p.id + '">' + esc(T.buy) + ' →</button></article>';
    }).join("");
  });

  grid.addEventListener("click", function (ev) {
    var b = ev.target.closest(".es-buy"); if (!b || !cfg || !cfg.url) return;
    var p = plans.filter(function (x) { return String(x.id) === b.getAttribute("data-plan"); })[0]; if (!p) return;
    // open the tab first (pop-up blockers allow it only inside the click), then send it to Qulay SIM
    var w = window.open("", "_blank"); b.disabled = true; b.textContent = T.go;
    if (w) { try { w.document.write("<p style='font:16px sans-serif;padding:24px'>" + esc(T.go) + "</p>"); } catch (e) {} }
    fetch(SB.url + "/rest/v1/rpc/esim_click", { method: "POST", headers: hdr(), body: JSON.stringify({ p_plan: p.id, p_lang: LANG, p_country: cc(), p_src: src() }) })
      .then(function (r) { return r.ok ? r.json() : ""; }).catch(function () { return ""; })
      .then(function (sub) {
        var url = String(cfg.url).replace(/\{sub\}/g, encodeURIComponent(sub || "")).replace(/\{plan\}/g, encodeURIComponent(p.partner_plan || ""))
          .replace(/\{lang\}/g, LANG).replace(/\{promo\}/g, encodeURIComponent(cfg.promo || ""));
        if (w) w.location.href = url; else location.href = url;
        b.disabled = false; b.textContent = T.buy + " →";
      });
  });
})();
