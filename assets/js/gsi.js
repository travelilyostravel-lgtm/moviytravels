/* Moviy Nomad — one-click "Sign in with Google" (2026-11-26).
   Uses Google's own window (Google Identity Services): the visitor sees his Gmail accounts (or the one account
   already signed in on the device) and confirms with one tap / Face ID / passkey — no name, no password.
   Google gives an ID token → Supabase Auth (grant_type=id_token) → a normal Supabase session.
   Only the public Client ID is used here; no secret. The session is shared with the cabinet (localStorage "mn_cab"). */
(function () {
  var SB = window.MN_SB || {}; if (!SB.url || !SB.gid) return;
  var LANG = (window.MN_LANG || document.documentElement.lang || "en").slice(0, 2);
  var loading = null, inited = false, waiters = [], raw = "", busy = false;

  function load() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (ok, no) {
      var s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client?hl=" + LANG; s.async = true;
      s.onload = function () { ok(); }; s.onerror = function () { loading = null; no(new Error("gsi")); };
      document.head.appendChild(s);
    });
    return loading;
  }
  async function sha256(t) {
    var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
  }
  function H(tok) { return { "Content-Type": "application/json", apikey: SB.anonKey, Authorization: "Bearer " + (tok || SB.anonKey) }; }
  function saveSession(j) {
    var s = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), email: (j.user && j.user.email) || "" };
    try { localStorage.setItem("mn_cab", JSON.stringify(s)); localStorage.setItem("mn_cust", "1"); } catch (e) {}
    return s;
  }
  async function onCredential(resp) {
    if (busy) return; busy = true;
    try {
      var r = await fetch(SB.url + "/auth/v1/token?grant_type=id_token", { method: "POST", headers: H(), body: JSON.stringify({ provider: "google", id_token: resp.credential, nonce: raw }) });
      var j = await r.json();
      if (!r.ok || !j.access_token) throw new Error((j && (j.msg || j.error_description || j.message)) || r.status);
      var s = saveSession(j);
      var vid = ""; try { vid = localStorage.getItem("mn_vid") || ""; } catch (e) {}
      // visitor base + cabinet (opens at once for a Google-verified e-mail)
      await fetch(SB.url + "/rest/v1/rpc/register_customer", { method: "POST", headers: H(s.access_token), body: JSON.stringify({ p: { vid: vid, provider: "google", lang: LANG, page: location.pathname } }) }).catch(function () {});
      await fetch(SB.url + "/rest/v1/rpc/cabinet_register", { method: "POST", headers: H(s.access_token), body: JSON.stringify({ p: { lang: LANG } }) }).catch(function () {});
      try { window.MN_TRACK && window.MN_TRACK("signin", "google (one tap)"); } catch (e) {}
      var w = waiters.slice(); waiters = []; w.forEach(function (f) { try { f(null, s); } catch (e) {} });
    } catch (e) {
      var w2 = waiters.slice(); waiters = []; w2.forEach(function (f) { try { f(e); } catch (x) {} });
    } finally { busy = false; await fresh(); }
  }
  async function fresh() {       // a new nonce for every attempt
    raw = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
    var hashed = await sha256(raw);
    google.accounts.id.initialize({ client_id: SB.gid, callback: onCredential, nonce: hashed, auto_select: false, cancel_on_tap_outside: false, itp_support: true, use_fedcm_for_prompt: true, context: "signin", ux_mode: "popup" });
    inited = true;
  }
  async function ready() { await load(); if (!inited) await fresh(); }

  window.MN_GSI = {
    // draws Google's own button (shows "Continue as <name> / <gmail>" when the visitor is signed in to Google)
    button: async function (el, done) {
      await ready(); if (done) waiters = [done];
      var w = Math.min(400, Math.max(220, el.clientWidth || 320));
      google.accounts.id.renderButton(el, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", logo_alignment: "center", width: w, locale: LANG });
    },
    // Google's account list in the corner / bottom sheet (One Tap)
    prompt: async function (done) { await ready(); if (done) waiters = [done]; google.accounts.id.prompt(); },
    cancel: function () { try { google.accounts.id.cancel(); } catch (e) {} },
    signedIn: function () { try { var s = JSON.parse(localStorage.getItem("mn_cab") || "null"); return !!(s && s.access_token); } catch (e) { return false; } }
  };
})();
