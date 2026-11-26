/* Moviy Nomad — client cabinet ("Mening kabinetim", account.html).
   Sign in: e-mail + password or Google (Supabase Auth, REST). A new cabinet waits for approval in the admin panel.
   All data comes from safe database functions (my_cabinet, cabinet_send…): the client sees only his own requests and
   messages — never internal notes, netto prices or other clients. */
(function () {
  var SB = window.MN_SB || {}, root = document.getElementById("cab"); if (!root || !SB.url) return;
  var LANG = (document.documentElement.lang || "en").slice(0, 2), T = (window.MN_CAB_TX || {})[LANG] || window.MN_CAB_TX.en;
  var BASE = document.documentElement.getAttribute("data-base") || "";
  var KEY = "mn_cab";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "$" + Math.round(+n || 0).toLocaleString("en-US"); }
  function dmy(d) { if (!d) return ""; var p = String(d).slice(0, 10).split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function when(t) { try { return new Date(t).toLocaleString(LANG === "uz" ? "ru" : LANG, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return t; } }
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function put(s) { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch (e) {} }
  function H(tok) { return { "Content-Type": "application/json", apikey: SB.anonKey, Authorization: "Bearer " + (tok || SB.anonKey) }; }
  function save(j) { if (!j || !j.access_token) return null; var s = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), email: (j.user && j.user.email) || "" }; put(s); return s; }
  async function token() {
    var s = get(); if (!s) return null;
    if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
    var r = await fetch(SB.url + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: H(), body: JSON.stringify({ refresh_token: s.refresh_token }) });
    if (!r.ok) { put(null); return null; }
    return save(await r.json()).access_token;
  }
  async function rpc(fn, p) {
    var tok = await token(); if (!tok) throw new Error("auth");
    var r = await fetch(SB.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: H(tok), body: JSON.stringify(p === undefined ? {} : { p: p }) });
    var txt = await r.text(); var j = txt ? JSON.parse(txt) : null;
    if (!r.ok) throw new Error((j && (j.message || j.msg)) || r.status);
    return j;
  }
  function track(ev, d) { try { window.MN_TRACK && window.MN_TRACK(ev, d); } catch (e) {} }

  // ------------------------------------------------------------------ back from Google
  var hp = new URLSearchParams(location.hash.slice(1));
  if (hp.get("access_token")) {
    save({ access_token: hp.get("access_token"), refresh_token: hp.get("refresh_token"), expires_in: hp.get("expires_in") || 3600 });
    history.replaceState(null, "", location.pathname + location.search);
    sessionStorage.setItem("mn_cab_new", "1");
  }

  // ------------------------------------------------------------------ sign in / sign up
  function authView(mode, err) {
    mode = mode || "login";
    var more = !!err || authView.more;
    root.innerHTML = '<div class="cab-auth"><div class="cab-gsi" id="cab-gsi"></div><button type="button" class="cab-more" id="cab-more"' + (more ? ' hidden' : '') + '>' + esc(T.or) + '</button><div id="cab-pw"' + (more ? '' : ' hidden') + '><div class="cab-tabs"><button data-m="login" class="' + (mode === "login" ? "is-on" : "") + '">' + esc(T.login) + '</button><button data-m="register" class="' + (mode === "register" ? "is-on" : "") + '">' + esc(T.register) + '</button></div>' +
      
      '<form id="cab-f" novalidate>' + (mode === "register" ? '<input name="name" autocomplete="name" placeholder="' + esc(T.name) + '" required minlength="2" maxlength="120">' : '') +
      '<input name="email" type="email" autocomplete="email" placeholder="' + esc(T.email) + '" required>' +
      '<input name="password" type="password" autocomplete="' + (mode === "register" ? "new-password" : "current-password") + '" placeholder="' + esc(T.password) + '" required minlength="8">' +
      (mode === "register" ? '<input name="phone" type="tel" autocomplete="tel" placeholder="' + esc(T.phone) + '" maxlength="40">' : '') +
      '<div class="cab-err" role="alert">' + esc(err || "") + '</div><button class="btn btn--gold" type="submit">' + esc(mode === "register" ? T.signup_btn : T.signin_btn) + '</button></form>' +
      '<p class="cab-note">' + esc(mode === "register" ? T.reg_note : T.forgot) + '</p></div></div>';
    root.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { authView(b.getAttribute("data-m")); }; });
    root.querySelectorAll("[data-m]").forEach(function (b) { b.addEventListener("click", function () { authView.more = true; }); });
    root.querySelector("#cab-more").onclick = function () { authView.more = true; root.querySelector("#cab-pw").hidden = false; this.hidden = true; };
    // Google's own button: the visitor's Gmail account(s), confirm with one tap / Face ID — no password
    (function gsi(n) {
      var box = root.querySelector("#cab-gsi"); if (!box) return;
      if (!window.MN_GSI) { if ((n || 0) < 40) setTimeout(function () { gsi((n || 0) + 1); }, 250); return; }
      var done = function (e2) { if (e2) { var er0 = root.querySelector(".cab-err"); root.querySelector("#cab-pw").hidden = false; if (er0) er0.textContent = T.err; return; } track("signin", "cabinet: google"); load(); };
      window.MN_GSI.button(box, done).catch(function () {});
      window.MN_GSI.prompt(done).catch(function () {});
    })();
    root.querySelector("#cab-f").onsubmit = async function (e) {
      e.preventDefault(); var f = e.target, em = f.email.value.trim().toLowerCase(), pw = f.password.value, er = f.querySelector(".cab-err"), btn = f.querySelector("button");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { er.textContent = T.email + "?"; return; }
      if (pw.length < 8) { er.textContent = T.err_pw; return; }
      btn.disabled = true; er.textContent = "";
      try {
        if (mode === "register") {
          var r = await fetch(SB.url + "/auth/v1/signup", { method: "POST", headers: H(), body: JSON.stringify({ email: em, password: pw, data: { kind: "customer", name: f.name.value.trim(), phone: f.phone.value.trim(), lang: LANG } }) });
          var j = await r.json();
          if (!r.ok) { btn.disabled = false; er.textContent = /registered|exists/i.test(JSON.stringify(j)) ? T.err_exists : T.err; return; }
          if (j.access_token) save(j); else if (j.session) save(j.session);
          if (!get()) { root.innerHTML = state(T.pending_t, T.pending_p); return; }
          await rpc("cabinet_register", { name: f.name.value.trim(), phone: f.phone.value.trim(), lang: LANG });
          track("signin", "cabinet: registration");
        } else {
          var r2 = await fetch(SB.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: H(), body: JSON.stringify({ email: em, password: pw }) });
          var j2 = await r2.json();
          if (!r2.ok) { btn.disabled = false; er.textContent = /confirm/i.test(JSON.stringify(j2)) ? T.pending_t : T.err_login; return; }
          save(j2); track("signin", "cabinet");
        }
        load();
      } catch (x) { btn.disabled = false; er.textContent = T.err; }
    };
  }
  function state(t, p) { return '<div class="cab-state"><div class="cab-state__ico">⏳</div><h2>' + esc(t) + '</h2><p>' + esc(p) + '</p><button class="btn btn--outline btn--sm" id="cab-out">' + esc(T.logout) + '</button></div>'; }

  // ------------------------------------------------------------------ the cabinet
  var DATA = null;
  async function load() {
    root.innerHTML = '<div class="cab-loading">…</div>';
    if (!(await token())) return authView("login");
    var d;
    try {
      d = await rpc("my_cabinet");
      if (d.status === "none") { await rpc("cabinet_register", { lang: LANG }); d = await rpc("my_cabinet"); }
    } catch (e) { if (/auth|JWT|401/.test(String(e))) { put(null); return authView("login"); } root.innerHTML = '<div class="msg msg--err">' + esc(T.err) + '</div>'; return; }
    if (d.status === "pending" || d.status === "none") { root.innerHTML = state(T.pending_t, T.pending_p); bindOut(); return; }
    if (d.status === "blocked") { root.innerHTML = state(T.blocked_t, T.blocked_p); bindOut(); return; }
    DATA = d; draw();
    if (d.stats && d.stats.unread) rpc("cabinet_read").then(function () { var dot = document.querySelector(".acct-dot"); if (dot) dot.hidden = true; }).catch(function () {});
  }
  function bindOut() { var b = root.querySelector("#cab-out"); if (b) b.onclick = function () { put(null); authView("login"); }; }

  function statusText(r) {
    var s = (T.status[r.status] || r.status).replace("{date}", dmy(r.balance_due));
    if (r.status === "awaiting_payment" && r.full_now) s += " (100%)"; else if (r.status === "awaiting_payment") s += " (30%)";
    return s;
  }
  function thread(list) {
    if (!list.length) return '<p class="cab-empty">' + esc(T.no_msgs) + '</p>';
    return '<div class="cab-thread">' + list.map(function (m) {
      return '<div class="cab-msg cab-msg--' + m.author + '"><div class="cab-msg__b">' + esc(m.body).replace(/\n/g, "<br>") + '</div><small>' + esc(m.author === "admin" ? T.us : T.you) + ' · ' + esc(when(m.at)) +
        (m.author === "admin" && !m.read ? ' <b class="cab-new">🔴 ' + esc(T.isnew) + '</b>' : '') + '</small></div>';
    }).join("") + '</div>';
  }
  function reply(rid, ph) { return '<form class="cab-reply" data-rid="' + (rid || "") + '"><textarea name="body" rows="2" maxlength="3000" required placeholder="' + esc(ph) + '"></textarea><button class="btn btn--gold btn--sm" type="submit">' + esc(T.send) + '</button><small class="cab-ok"></small></form>'; }

  function reqCard(r, msgs) {
    var dates = r.start_date ? dmy(r.start_date) + (r.end_date ? " — " + dmy(r.end_date) : "") : "";
    var price = +r.price || 0, paid = +r.paid || 0, left = Math.max(0, price - paid);
    var payRows = price ? '<div class="cab-pay"><div><small>' + esc(T.price) + '</small><b>' + money(price) + '</b></div><div><small>' + esc(T.paid) + '</small><b>' + money(paid) + '</b></div><div><small>' + esc(T.left) + '</small><b class="' + (left ? "is-due" : "is-ok") + '">' + money(left) + '</b></div>' +
      (left && r.balance_due ? '<div><small>' + esc(T.due) + '</small><b>' + dmy(r.balance_due) + '</b></div>' : '') + '</div>' : '';
    var need = "";
    if (r.status === "awaiting_payment" && price && paid < (+r.deposit || 0) - 0.5) need = '<p class="cab-need">' + esc((r.full_now ? T.full_need : T.dep_need).replace("{amt}", money((+r.deposit || 0) - paid))) + '</p>';
    var docs = "";
    if (r.voucher_key) {
      var u = BASE + "voucher.html?ref=" + encodeURIComponent(r.ref) + "&k=" + encodeURIComponent(r.voucher_key) + "&lang=" + LANG;
      docs = '<div class="cab-docs"><b>' + esc(T.docs) + ':</b> <a href="' + esc(u) + '" target="_blank" rel="noopener">📄 ' + esc(T.doc_main) + '</a>' +
        (r.services && paid >= price - 0.5 ? ' · <a href="' + esc(u + "&doc=services") + '" target="_blank" rel="noopener">🎫 ' + esc(T.doc_svc) + '</a>' : '') + '</div>';
    }
    var cancel = r.status === "cancelled" ? (r.cancel_reason ? '<p class="cab-cancel"><b>' + esc(T.cancel_reason) + ':</b> ' + esc(r.cancel_reason) + '</p>' : '') +
      '<button class="btn btn--outline btn--sm" data-resub="' + esc(r.id) + '">↻ ' + esc(T.resubmit) + '</button>' : '';
    var title = r.tour_title || r.service || r.tour_id || r.kind;
    return '<article class="cab-req cab-req--' + esc(r.status) + '"><header><div><small>' + esc(T.ref) + ' ' + esc(r.ref) + ' · ' + esc(dmy(r.created_at)) + '</small><h3>' + esc(title) + '</h3></div><span class="cab-st cab-st--' + esc(r.status) + '">' + esc(statusText(r)) + '</span></header>' +
      '<p class="cab-meta">' + (dates ? '📅 ' + esc(dates) + ' · ' : '') + (r.pax ? '👥 ' + esc(r.pax) + ' · ' : '') + esc(r.contact_name || "") + '</p>' +
      payRows + need + docs + cancel +
      '<details class="cab-th"' + (msgs.some(function (m) { return m.author === "admin" && !m.read; }) ? " open" : "") + '><summary>💬 ' + esc(T.thread) + ' (' + msgs.length + ')</summary>' + thread(msgs) + reply(r.id, T.write_about) + '</details></article>';
  }

  function draw() {
    var d = DATA, c = d.customer || {}, st = d.stats || {}, msgs = d.messages || [];
    var general = msgs.filter(function (m) { return !m.request_id; });
    var h = '<div class="cab-top"><div><h2>' + esc(T.hello) + ', ' + esc(c.name || c.email) + '!</h2><p class="cab-sub">' + esc(c.email) + (c.since ? ' · ' + esc(T.since) + ' ' + esc(dmy(c.since)) : '') + '</p></div><button class="btn btn--outline btn--sm" id="cab-out">' + esc(T.logout) + '</button></div>' +
      '<div class="cab-stats"><div><b>' + (st.requests || 0) + '</b><small>' + esc(T.st_requests) + '</small></div><div><b>' + (st.trips || 0) + '</b><small>' + esc(T.st_trips) + '</small></div><div><b>' + money(st.paid || 0) + '</b><small>' + esc(T.st_paid) + '</small></div><div class="' + (st.unread ? "is-red" : "") + '"><b>' + (st.unread ? "🔴 " : "") + (st.unread || 0) + '</b><small>' + esc(T.st_unread) + '</small></div></div>';
    h += '<section class="cab-sec"><h3>' + esc(T.sec_reqs) + '</h3>' + ((d.requests || []).length ? d.requests.map(function (r) { return reqCard(r, msgs.filter(function (m) { return m.request_id === r.id; })); }).join("") : '<p class="cab-empty">' + esc(T.no_reqs) + '</p>') +
      '<p><a class="btn btn--gold btn--sm" href="booking.html">+ ' + esc(T.new_req) + '</a></p></section>';
    h += '<section class="cab-sec"><h3>💬 ' + esc(T.sec_msgs) + ' — ' + esc(T.general) + '</h3>' + thread(general) + reply("", T.msg_ph) + '</section>';
    h += '<section class="cab-sec cab-two"><div><h3>' + esc(T.sec_profile) + '</h3><form id="cab-prof"><input name="name" value="' + esc(c.name || "") + '" placeholder="' + esc(T.name) + '" maxlength="120"><input name="phone" value="' + esc(c.phone || "") + '" placeholder="' + esc(T.phone) + '" maxlength="40"><input value="' + esc(c.email) + '" disabled><button class="btn btn--outline btn--sm" type="submit">' + esc(T.save) + '</button> <small class="cab-ok"></small></form></div>' +
      '<div><h3>' + esc(T.sec_hist) + '</h3><ul class="cab-hist">' + (d.history || []).slice(0, 25).map(function (x) { return '<li><small>' + esc(when(x.at)) + '</small> ' + esc((T.ev[x.event] || x.event) + (x.detail ? ": " + x.detail : "")) + '</li>'; }).join("") + '</ul></div></section>';
    root.innerHTML = h;
    bindOut();
    root.querySelectorAll(".cab-reply").forEach(function (f) {
      f.onsubmit = async function (e) {
        e.preventDefault(); var b = f.body.value.trim(); if (!b) return; var btn = f.querySelector("button"); btn.disabled = true;
        try { await rpc("cabinet_send", { request_id: f.getAttribute("data-rid") || null, body: b }); track("contact", "cabinet message"); f.querySelector(".cab-ok").textContent = T.sent; setTimeout(load, 700); }
        catch (x) { btn.disabled = false; f.querySelector(".cab-ok").textContent = T.err; }
      };
    });
    root.querySelector("#cab-prof").onsubmit = async function (e) {
      e.preventDefault(); var f = e.target;
      try { await rpc("cabinet_update", { name: f.name.value, phone: f.phone.value, lang: LANG }); f.querySelector(".cab-ok").textContent = T.saved; } catch (x) { f.querySelector(".cab-ok").textContent = T.err; }
    };
    root.querySelectorAll("[data-resub]").forEach(function (b) {
      b.onclick = function () {
        var r = (DATA.requests || []).filter(function (x) { return x.id === b.getAttribute("data-resub"); })[0]; if (!r) return;
        var det = r.details || {};
        try { sessionStorage.setItem("mn_resubmit", JSON.stringify({ ref: r.ref, tour_id: r.tour_id, start_date: r.start_date, adults: det.adults, children: det.children, hotel: det.hotel, guide_lang: det.guide_lang,
          contact_name: r.contact_name, email: (DATA.customer || {}).email, phone: r.phone, citizenship: r.citizenship, travellers: r.travellers || [], message: r.message })); } catch (x) {}
        location.href = r.kind === "tour" ? "booking.html?resubmit=" + encodeURIComponent(r.ref) : r.kind === "group" ? "group-tours.html" : "services.html";
      };
    });
  }
  load();
})();
