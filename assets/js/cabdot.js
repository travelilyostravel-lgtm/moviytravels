/* Moviy Nomad — red mark on "My cabinet" in the header when Moviy Nomad has written to the client. */
(function () {
  var SB = window.MN_SB || {}; if (!SB.url) return;
  var s; try { s = JSON.parse(localStorage.getItem("mn_cab") || "null"); } catch (e) {} if (!s || !s.refresh_token) return;
  function H(t) { return { "Content-Type": "application/json", apikey: SB.anonKey, Authorization: "Bearer " + (t || SB.anonKey) }; }
  (s.expires_at - 60 > Date.now() / 1000 ? Promise.resolve(s.access_token) :
    fetch(SB.url + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: H(), body: JSON.stringify({ refresh_token: s.refresh_token }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (!j || !j.access_token) { localStorage.removeItem("mn_cab"); return null; } s = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), email: s.email }; localStorage.setItem("mn_cab", JSON.stringify(s)); return s.access_token; }))
  .then(function (tok) {
    if (!tok) return null;
    return fetch(SB.url + "/rest/v1/rpc/my_unread", { method: "POST", headers: H(tok), body: "{}" }).then(function (r) { return r.ok ? r.json() : 0; });
  }).then(function (n) {
    n = +n || 0; if (!n) return;
    document.querySelectorAll(".acct-dot").forEach(function (d) { d.hidden = false; d.textContent = n > 9 ? "9+" : String(n); });
    if (/account\.html/.test(location.pathname) || sessionStorage.getItem("mn_cab_toast")) return;
    sessionStorage.setItem("mn_cab_toast", "1");
    var a = document.querySelector(".acct-link"); if (!a) return;
    var t = document.createElement("a"); t.className = "acct-toast"; t.href = a.getAttribute("href"); t.setAttribute("data-free", "");
    t.innerHTML = "🔴 <b>" + n + "</b> · " + (a.querySelector("span") ? a.querySelector("span").textContent : "") + " →";
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 9000);
  }).catch(function () {});
})();
