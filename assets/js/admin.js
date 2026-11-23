/* Moviy Nomad — admin panel (UI in Uzbek) */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc, CFG = window.MN || {};
  var LANGS = { en: "English", ru: "Русский", uz: "O'zbekcha", tr: "Türkçe", ar: "العربية", de: "Deutsch", sv: "Svenska", zh: "中文", hi: "हिन्दी", ko: "한국어" };
  function addD(d, n) { if (!d) return null; var t = new Date(d + "T12:00:00"); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); }
  function vlink(b) { return location.origin + location.pathname.replace(/admin\/.*$/, "") + "voucher.html?ref=" + encodeURIComponent(b.ref) + "&k=" + b.voucher_key; }
  var L = "uz", bFilter = "active", aFilter = "pending";
  var DEFAULT_PAYMENT = "Bank: …\nBeneficiary: … (Moviy Travel)\nAccount / IBAN: …\nSWIFT: …\nPurpose: Tour services, booking {ref}";

  if (!P.configured) { $("#notcfg").hidden = false; show("login"); return; }

  function show(v) {
    ["login", "bookings", "booking", "agencies", "agency", "requests", "request", "posts", "prices", "groups", "group", "team"].forEach(function (x) { $("#v-" + x).classList.toggle("hidden", x !== v); });
    $$("#tabs button").forEach(function (b) { b.classList.toggle("is-on", b.dataset.view === v || b.dataset.view + "s" === v || (v === "booking" && b.dataset.view === "bookings") || (v === "agency" && b.dataset.view === "agencies") || (v === "request" && b.dataset.view === "requests") || (v === "group" && b.dataset.view === "groups")); });
    window.scrollTo(0, 0);
  }
  window.MNA = window.MNA || {}; window.MNA.show = show;
  $$("#tabs button").forEach(function (b) { b.onclick = function () { var v = b.dataset.view; v === "bookings" ? loadBookings() : v === "agencies" ? loadAgencies() : window.MNA[v] && window.MNA[v](); }; });

  // ---- staff login: e-mail + password, then a 6-digit code sent to that e-mail (founder's rule, 2026-11-23).
  // EMAIL_CODE is switched on once the site sends mail through its own Gmail (Supabase → SMTP settings).
  var EMAIL_CODE = false;
  function normEm(v) { return String(v || "").replace(/\s+/g, "").toLowerCase(); }
  function errUz(m) {
    return /invalid login/i.test(m) ? "E-mail yoki parol noto'g'ri." :
      /rate limit/i.test(m) ? "Pochta xizmati hozir band. 1–2 daqiqadan keyin qayta urining." :
      /not confirmed/i.test(m) ? "Bu e-mail hali tasdiqlanmagan — asoschiga ayting." :
      /signups not allowed|not found/i.test(m) ? "Bu e-mail jamoada yo'q — asoschiga ayting." : m;
  }
  $("#f-login").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target, em = normEm(f.email.value);
    if (!em || !f.password.value) return P.msg("#m-login", "E-mail va parolni yozing.", "err");
    P.msg("#m-login", "Tekshirilmoqda…");
    var r = await sb.auth.signInWithPassword({ email: em, password: f.password.value });
    if (r.error) return P.msg("#m-login", errUz(r.error.message) + " (" + em + ")", "err");
    var p = (await sb.from("profiles").select("role,active").eq("id", r.data.user.id).single()).data;
    if (!p || (p.role !== "admin" && p.role !== "manager") || p.active === false) { await sb.auth.signOut(); return P.msg("#m-login", "Bu e-mailga admin panelga kirish ruxsati berilmagan — asoschiga ayting.", "err"); }
    if (!EMAIL_CODE) { P.msg("#m-login", ""); return boot(); }
    await sb.auth.signOut({ scope: "local" });
    P.msg("#m-login", "Pochtangizga kod yuborilmoqda…");
    var o = await sb.auth.signInWithOtp({ email: em, options: { shouldCreateUser: false } });
    if (o.error) return P.msg("#m-login", errUz(o.error.message), "err");
    P.msg("#m-login", "");
    $("#f-login").classList.add("hidden"); $("#f-code").classList.remove("hidden"); $("#f-code").dataset.em = em;
    $("#code-em").textContent = em; $("#f-code").code.value = ""; $("#f-code").code.focus();
  };
  $("#f-code").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target;
    P.msg("#m-code", "Tekshirilmoqda…");
    var r = await sb.auth.verifyOtp({ email: f.dataset.em, token: f.code.value.replace(/\D/g, ""), type: "email" });
    if (r.error) return P.msg("#m-code", "Kod noto'g'ri yoki eskirgan. Pochtadagi eng oxirgi kodni yozing.", "err");
    P.msg("#m-code", ""); f.classList.add("hidden"); $("#f-login").classList.remove("hidden"); boot();
  };
  $("#b-code-resend").onclick = async function () {
    var em = $("#f-code").dataset.em; P.msg("#m-code", "Yangi kod yuborilmoqda…");
    var o = await sb.auth.signInWithOtp({ email: em, options: { shouldCreateUser: false } });
    P.msg("#m-code", o.error ? errUz(o.error.message) : "Yangi kod yuborildi.", o.error ? "err" : "ok");
  };
  $("#b-code-back").onclick = function () { $("#f-code").classList.add("hidden"); $("#f-login").classList.remove("hidden"); };
  // ---- forgot password: link by e-mail, then a new-password form on this page
  $("#b-forgot").onclick = async function () {
    var em = $("#f-login").email.value.trim();
    if (!em) return P.msg("#m-login", "Avval yuqoriga e-mailingizni yozing, keyin \"Parolni unutdim\" ni bosing.", "err");
    P.msg("#m-login", "Yuborilmoqda…");
    var r = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
    P.msg("#m-login", r.error ? r.error.message : "Pochtangizga parolni tiklash havolasi yuborildi (Spam papkasini ham tekshiring). Havolani bosing — shu sahifada yangi parol yozasiz.", r.error ? "err" : "ok");
  };
  var RECOV = /type=recovery/.test(location.hash + location.search);
  if (RECOV) { $("#f-login").classList.add("hidden"); $("#f-newpw").classList.remove("hidden"); }
  sb.auth.onAuthStateChange(function (ev) {
    if (ev === "PASSWORD_RECOVERY") { RECOV = true; $("#f-login").classList.add("hidden"); $("#f-signup").classList.add("hidden"); $("#f-newpw").classList.remove("hidden"); show("login"); }
  });
  $("#f-newpw").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target;
    if (f.pw.value !== f.pw2.value) return P.msg("#m-newpw", "Ikkala parol bir xil emas.", "err");
    var r = await sb.auth.updateUser({ password: f.pw.value });
    if (r.error) return P.msg("#m-newpw", r.error.message, "err");
    P.msg("#m-newpw", "Yangi parol saqlandi. Kirilmoqda…", "ok");
    RECOV = false; history.replaceState(null, "", location.pathname); $("#f-newpw").classList.add("hidden"); $("#f-login").classList.remove("hidden"); boot();
  };
  $("#logout").onclick = async function () { await sb.auth.signOut(); location.reload(); };

  // ---- new staff sign-up (only e-mails invited by the founder become managers)
  $("#b-staff-signup").onclick = function () { $("#f-login").classList.add("hidden"); $("#f-signup").classList.remove("hidden"); };
  $("#b-back-login").onclick = function () { $("#f-signup").classList.add("hidden"); $("#f-login").classList.remove("hidden"); };
  $("#f-signup").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target;
    var r = await sb.auth.signUp({ email: f.email.value.trim(), password: f.password.value, options: { data: { contact_name: f.full_name.value.trim() }, emailRedirectTo: location.href.split("?")[0] } });
    if (r.error) return P.msg("#m-signup", r.error.message, "err");
    P.msg("#m-signup", "Tayyor! E-mailingizga tasdiqlash xati keldi — havolani bosing, so'ng shu yerda kiring.", "ok");
  };

  // ---- 2-step login (authenticator app) for managers
  function twofa(html) { $("#f-login").classList.add("hidden"); $("#f-signup").classList.add("hidden"); var b = $("#v-2fa"); b.classList.remove("hidden"); b.innerHTML = html; show("login"); }
  async function ensureAal2() {
    var a = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (a.data && a.data.currentLevel === "aal2") return true;
    var lf = await sb.auth.mfa.listFactors(), tot = ((lf.data && lf.data.totp) || []).filter(function (f) { return f.status === "verified"; });
    return new Promise(async function (done) {
      var fid, qr = "", sec = "", uri = "";
      if (tot.length) fid = tot[0].id;
      else {
        ((lf.data && lf.data.all) || []).filter(function (f) { return f.status !== "verified"; }).forEach(function (f) { sb.auth.mfa.unenroll({ factorId: f.id }); });
        var en = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Moviy Nomad " + new Date().toISOString().slice(0, 10) });
        if (en.error) { twofa('<div class="msg msg--err">' + esc(en.error.message) + '</div>'); return done(false); }
        fid = en.data.id; qr = en.data.totp.qr_code; sec = en.data.totp.secret || ""; uri = en.data.totp.uri || "";
      }
      twofa('<h2>Ikki bosqichli kirish</h2>' + (qr ? '<p>1) Telefoningizga <b>Google Authenticator</b> (yoki Microsoft Authenticator) ilovasini o\'rnating.<br>2) Ilovada "+" → "QR kodni skanerlash" — shu kodni skanerlang:</p><div style="background:#fff;display:inline-block;padding:8px;border-radius:8px"><img alt="QR" style="width:200px;height:200px" src="' + qr + '"></div><p><b>Telefonda o\'zida ochgan bo\'lsangiz</b> (QR ni skanerlab bo\'lmasa):' + (uri ? ' <a class="btn btn--outline btn--sm" href="' + esc(uri) + '">Authenticator ilovasida ochish</a>' : '') + '<br>yoki ilovada "+" → "Kodni qo\'lda kiritish" (Enter a setup key) → hisob nomi: <b>Moviy Nomad</b>, kalit:<br><code style="font-size:16px;letter-spacing:2px;user-select:all;word-break:break-all">' + esc(sec) + '</code></p><p>3) Ilovadagi 6 xonali kodni yozing:</p>' : '<p>Telefoningizdagi Authenticator ilovasidan 6 xonali kodni yozing:</p>') +
        '<div class="fld"><input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="font-size:24px;letter-spacing:6px;width:180px"></div><div class="msg" id="m-otp"></div><div class="p-actions"><button class="btn btn--gold" id="b-otp">Tasdiqlash</button><button class="btn btn--outline" id="b-otp-out">Chiqish</button></div>');
      $("#b-otp-out").onclick = async function () { await sb.auth.signOut(); location.reload(); };
      $("#b-otp").onclick = async function () {
        var r = await sb.auth.mfa.challengeAndVerify({ factorId: fid, code: $("#otp").value.trim() });
        if (r.error) return P.msg("#m-otp", "Kod noto'g'ri yoki eskirgan. Ilovadagi yangi kodni yozing.", "err");
        done(true);
      };
    });
  }
  async function deviceOk() {
    var r = await sb.rpc("register_device", { p_label: navigator.userAgent.slice(0, 180) });
    if (r.data === "approved") return true;
    var em = (await sb.rpc("founder_emails")).data || "";
    twofa('<h2>Yangi qurilma</h2><div class="msg msg--info">Siz bu qurilmadan birinchi marta kiryapsiz. Xavfsizlik uchun <b>asoschi tasdiqlashi kerak</b>. Tasdiqlangach shu sahifani yangilang.</div>' +
      '<div class="p-actions">' + (em ? '<a class="btn btn--gold" href="mailto:' + esc(em) + '?subject=' + encodeURIComponent("Moviy Nomad: yangi qurilmani tasdiqlang") + '&body=' + encodeURIComponent("Assalomu alaykum! Admin panelga yangi qurilmadan kiryapman. Iltimos, admin → Jamoa bo'limida tasdiqlang.\n" + navigator.userAgent) + '">Asoschiga xat yuborish</a>' : '') +
      '<button class="btn btn--outline" onclick="location.reload()">Tekshirish</button><button class="btn btn--outline" id="b-dev-out">Chiqish</button></div>');
    $("#b-dev-out").onclick = async function () { await sb.auth.signOut(); location.reload(); };
    return false;
  }

  async function boot() {
    if (RECOV) { show("login"); return; }
    var s = await sb.auth.getSession(), u = s.data.session && s.data.session.user;
    if (!u) return show("login");
    var p = (await sb.from("profiles").select("*").eq("id", u.id).single()).data;
    if (!p || (p.role !== "admin" && p.role !== "manager") || p.active === false) { await sb.auth.signOut(); show("login"); return P.msg("#m-login", "Bu akkaunt admin panel uchun emas.", "err"); }
    // 2026-11-23: no authenticator app / device approval any more — e-mail code or password is enough
    window.MNA.role = p.role; window.MNA.me = p;
    $("#v-2fa").classList.add("hidden");
    document.body.classList.toggle("is-manager", p.role === "manager");
    $("#who").innerHTML = "<b>" + esc(p.full_name || "Admin") + (p.role === "manager" ? " · menejer" : " · asoschi") + "</b>" + esc(u.email);
    $("#who").classList.remove("hidden"); $("#logout").classList.remove("hidden"); $("#tabs").classList.remove("hidden");
    if (p.role === "manager") {
      $$("#tabs button").forEach(function (b) { if (["agencies", "posts", "team"].indexOf(b.dataset.view) > -1) b.remove(); });
      // prices and group dates: view only for managers (the database refuses changes anyway)
      ["#v-prices", "#v-groups", "#v-group"].forEach(function (q) {
        var el = $(q); if (!el) return;
        var lock = function () {
          if (!$(".ro-note", el)) { var n = document.createElement("div"); n.className = "msg msg--info ro-note"; n.textContent = "Faqat ko'rish rejimi: narx va sanalarni faqat asoschi o'zgartiradi."; el.prepend(n); }
          $$("input,select,textarea", el).forEach(function (i) { if (!i.closest(".filters") && i.id !== "gd-month") i.disabled = true; });
          $$("button", el).forEach(function (bt) { if (/btn--(gold|green|red|danger|navy)/.test(bt.className) || /saqla|yarat|o'chir|e'lon|nashr|qo'sh/i.test(bt.textContent)) bt.style.display = "none"; });
        };
        new MutationObserver(function () { clearTimeout(el._ro); el._ro = setTimeout(lock, 60); }).observe(el, { childList: true, subtree: true });
      });
    }
    if (window.MNA.teamBadge && p.role === "admin") window.MNA.teamBadge();
    loadBookings();
  }

  // ---------------------------------------------------------------- bookings list
  var BF = [["active", "Faol"], ["request", "Yangi so'rov"], ["awaiting_payment", "To'lov kutilmoqda"], ["payment_reported", "To'lov qilindi"], ["paid", "To'langan"], ["confirmed", "Tayyor"], ["cancelled", "Bekor"], ["all", "Hammasi"]];
  async function loadBookings() {
    show("bookings");
    $("#bf").innerHTML = BF.map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === bFilter ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("");
    $$("#bf button").forEach(function (b) { b.onclick = function () { bFilter = b.dataset.f; loadBookings(); }; });
    var mh = $("#bm"); if (!mh) { mh = document.createElement("div"); mh.id = "bm"; mh.className = "filters"; $("#bf").after(mh); }
    if (window.MNA.mgrChips) await window.MNA.mgrChips(mh, loadBookings);
    var isOwner = window.MNA.role === "admin";
    var q = sb.from("bookings").select("id,ref,tour_title,start_date,pax,brutto,netto,commission_pct,status,created_at,agencies(name,country,manager_id)").order("created_at", { ascending: false }).limit(300);
    if (bFilter === "active") q = q.in("status", ["request", "awaiting_payment", "payment_reported", "paid"]);
    else if (bFilter !== "all") q = q.eq("status", bFilter);
    var r = await q, box = $("#blist");
    if (r.error && /manager_id/.test(r.error.message)) { var q2 = sb.from("bookings").select("id,ref,tour_title,start_date,pax,brutto,netto,commission_pct,status,created_at,agencies(name,country)").order("created_at", { ascending: false }).limit(300); if (bFilter === "active") q2 = q2.in("status", ["request", "awaiting_payment", "payment_reported", "paid"]); else if (bFilter !== "all") q2 = q2.eq("status", bFilter); r = await q2; }
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (isOwner) r.data = r.data.filter(function (b) { return window.MNA.mgrPass(b.agencies && b.agencies.manager_id); });
    if (!r.data.length) { box.innerHTML = '<div class="empty">Bron yo\'q.</div>'; return; }
    box.innerHTML = '<table class="tbl"><thead><tr><th>Raqam</th><th>Agentlik</th><th>Tur</th><th>Boshlanish</th><th>Kishi</th><th class="num">Brutto</th><th class="num">Netto</th><th>Holat</th>' + (isOwner ? '<th>Menejer</th>' : '') + '</tr></thead><tbody>' +
      r.data.map(function (b) { return '<tr class="click" data-id="' + b.id + '"><td><b>' + esc(b.ref) + '</b><br><small>' + P.date(b.created_at) + '</small></td><td>' + esc(b.agencies ? b.agencies.name : "") + '<br><small>' + esc(b.agencies ? b.agencies.country : "") + '</small></td><td>' + esc(b.tour_title) + '</td><td>' + P.date(b.start_date) + '</td><td>' + b.pax + '</td><td class="num">' + P.money(b.brutto) + '</td><td class="num"><b>' + P.money(b.netto) + '</b><br><small>' + b.commission_pct + '%</small></td><td>' + P.badge(b.status, L) + '</td>' + (isOwner ? '<td><small>' + esc(window.MNA.staffName(b.agencies && b.agencies.manager_id) || "— tayinlanmagan") + '</small></td>' : '') + '</tr>'; }).join("") + '</tbody></table>';
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { openBooking(tr.dataset.id); }; });
  }

  // ---------------------------------------------------------------- booking detail
  var SVC = [["hotel", "Mehmonxona"], ["transport", "Transport"], ["guide", "Gid"], ["insurance", "Sug'urta"], ["train", "Poyezd"], ["flight", "Aviareys"], ["other", "Boshqa"]];
  async function openBooking(id) {
    show("booking");
    var box = $("#v-booking"); box.innerHTML = '<div class="p-card empty">Yuklanmoqda…</div>';
    var b = (await sb.from("bookings").select("*, agencies(*)").eq("id", id).single()).data;
    if (!b) { box.innerHTML = '<div class="p-card msg msg--err">Topilmadi.</div>'; return; }
    var a = b.agencies || {};
    var tr = (await sb.from("travellers").select("*").eq("booking_id", id).order("created_at")).data || [];
    var sv = (await sb.from("booking_services").select("*").eq("booking_id", id).order("sort")).data || [];
    var vc = (await sb.from("vouchers").select("*").eq("booking_id", id).order("created_at")).data || [];
    var c = b.config || {}, route = (c.route || []).map(function (r) { return esc(r.name) + " (" + r.nights + " tun)"; }).join(" → ");
    var wa = (a.whatsapp || a.phone || "").replace(/\D/g, "");

    var h = '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><button class="btn btn--outline btn--sm" id="back">← Bronlar</button>' + P.badge(b.status, L) + '</div>' +
      '<h2 style="margin-top:14px">' + esc(b.ref) + ' · ' + esc(b.tour_title) + '</h2>' + P.flowLine(b.status, L) +
      '<div class="kv" style="margin-top:14px"><div><small>Agentlik</small><b>' + esc(a.name) + '</b></div><div><small>Boshlanish</small><b>' + P.date(b.start_date) + '</b></div><div><small>Brutto</small><b>' + P.money(b.brutto) + '</b></div><div class="hl"><small>Netto (' + b.commission_pct + '%)</small><b>' + P.money(b.netto) + '</b></div></div>' +
      '<p class="p-sub" style="margin-top:12px">' + route + '<br>' + esc(c.hotel || "") + ' · ' + esc(c.transport || "") + ' · Gid: ' + esc(c.guide || "") + (c.single ? " · 1 kishilik xonalar" : "") + ' · ' + (c.days || "?") + ' kun</p>' +
      (c.departure_id ? '<div class="msg ' + (b.seats_held ? 'msg--ok' : 'msg--info') + '">👥 Guruh reysi (' + esc({ small: "kichik 12–17", medium: "o'rta 30–35", large: "katta 45–50" }[c.group_kind] || "") + (c.room === "single" ? ", bir kishilik xona" : "") + '). ' + (b.seats_held ? '✅ Jadvalda <b>' + b.seats_held + ' ta joy</b> band qilindi.' : '30% tasdiqlanganda jadvaldan joy o\'zi band qilinadi.') + '</div>' : '') +
      (b.agent_note ? '<div class="msg msg--info"><b>Agent izohi:</b> ' + esc(b.agent_note) + '</div>' : '') +
      '<p>Kontakt: <b>' + esc(a.contact_name) + '</b> · ' + esc(a.email) + (wa ? ' · <a class="link" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">WhatsApp ' + esc(a.whatsapp || a.phone) + '</a>' : '') + '</p></div>';

    // Step actions
    h += '<div class="p-card"><h3>Keyingi qadam</h3>';
    if (b.status === "request") {
      h += '<p>Bronni tekshiring (mehmonxona bo\'shligi, narx). Kerak bo\'lsa brutto narxni o\'zgartiring, keyin agentga to\'lov rekvizitlarini yuboring.</p>' +
        '<div class="p-grid"><div class="fld"><label>Brutto (jami, $)</label><input type="number" step="0.01" id="e-brutto" value="' + b.brutto + '"></div><div class="fld"><label>Komissiya, %</label><input type="number" step="0.5" id="e-comm" value="' + b.commission_pct + '"></div>' +
        '<div class="fld full"><label>To\'lov rekvizitlari (agent ko\'radi)</label><textarea id="e-pay">' + esc(b.payment_details || DEFAULT_PAYMENT.replace("{ref}", b.ref)) + '</textarea></div></div>' +
        '<div class="p-actions"><button class="btn btn--gold" id="a-invoice">Rekvizitlarni yuborish → “To\'lov kutilmoqda”</button></div>';
    } else if (b.status === "awaiting_payment" || b.status === "deposit_paid" || b.status === "payment_reported") {
      var dep = Math.round(b.netto * 0.3), due = b.balance_due || addD(b.start_date, -14), paidT = +b.paid_total || 0;
      h += '<table class="tbl"><tr><th style="width:230px">30% oldindan</th><td><b>' + P.money(dep) + '</b> — rekvizit yuborilgandan keyin 3 ish kunida</td></tr><tr><th>Qolgan 70%</th><td><b>' + P.money(b.netto - dep) + '</b> — ' + P.date(due) + ' gacha</td></tr><tr><th>Tushgan</th><td><b>' + P.money(paidT) + '</b> / ' + P.money(b.netto) + '</td></tr></table>';
      if (b.status === "payment_reported") h += '<div class="msg msg--info">Agent ' + P.date(b.payment_reported_at) + ' kuni to\'lov qilganini bildirdi. Hisobingizni tekshiring, maqsad: <b>' + esc(b.ref) + '</b>.</div>';
      h += '<div class="p-actions">' + (paidT < dep ? '<button class="btn btn--green" id="a-dep">30% tushdi (' + P.money(dep) + ')</button>' : '') + '<button class="btn btn--green" id="a-paid">100% tushdi — to\'lov to\'liq</button>' + (b.status === "payment_reported" ? '<button class="btn btn--outline" id="a-back-pay">Pul kelmadi — qaytarish</button>' : '') + '</div>';
    } else if (b.status === "paid") {
      h += '<p>Pastda mehmonxona, transport, gid va sug\'urta ma\'lumotlarini kiriting, keyin vaucherlarni yarating. Vaucherlar tayyor bo\'lgach, agent ularni yuklab oladi.</p>';
    } else if (b.status === "confirmed") {
      h += '<p class="msg msg--ok">Vaucherlar tayyor, agent yuklab olishi mumkin.</p>' + (b.voucher_key ? '<div class="p-actions" style="align-items:center"><b>Hujjat tili:</b> <select id="vb-lang">' + Object.keys(LANGS).map(function (k) { return '<option value="' + k + '">' + LANGS[k] + '</option>'; }).join("") + '</select>' +
        '<a class="btn btn--outline btn--sm" id="vb-main" target="_blank" rel="noopener" href="' + esc(vlink(b) + "&lang=en") + '">Umumiy vaucher</a><a class="btn btn--green btn--sm" id="vb-svc" target="_blank" rel="noopener" href="' + esc(vlink(b) + "&lang=en&doc=services") + '">Har bir xizmat vaucheri</a></div>' : '');
    } else h += '<p>Bekor qilingan.</p>';
    h += '<div class="fld" style="margin-top:14px"><label>Ichki izoh (agent ko\'rmaydi)</label><textarea id="e-note">' + esc(b.admin_note || "") + '</textarea></div>' +
      '<div class="msg" id="m-b"></div><div class="p-actions"><button class="btn btn--outline btn--sm" id="a-note">Izohni saqlash</button>' + (b.status !== "cancelled" && b.status !== "confirmed" ? '<button class="btn btn--red btn--sm" id="a-cancel">Bronni bekor qilish</button>' : '') + '</div></div>';

    // Travellers
    h += '<div class="p-card"><h3>Sayyohlar (' + tr.length + ' / ' + b.pax + ')</h3>' + (tr.length ? '<table class="tbl"><thead><tr><th>Ism</th><th>Pasport</th><th>Fuqarolik</th><th>Tug\'ilgan</th><th>Skan</th></tr></thead><tbody>' + tr.map(function (t) {
      return '<tr><td><b>' + esc(t.last_name) + ' ' + esc(t.first_name) + '</b> ' + esc(t.gender || "") + '</td><td>' + esc(t.passport_no) + (t.passport_expiry ? '<br><small>muddati ' + P.date(t.passport_expiry) + '</small>' : '') + '</td><td>' + esc(t.nationality || "") + '</td><td>' + P.date(t.birth_date) + '</td><td>' + (t.passport_file ? '<button class="link" data-p="' + esc(t.passport_file) + '">Ochish</button>' : '<span style="color:#a8392f">yo\'q</span>') + '</td></tr>';
    }).join("") + '</tbody></table>' : '<div class="empty">Agent hali sayyohlarni kiritmagan.</div>') + '</div>';

    // Services + vouchers
    if (b.status === "paid" || b.status === "confirmed") {
      h += '<div class="p-card"><h3>Xizmatlar (vaucherlar uchun)</h3><p class="p-sub">Lotin harflarida yozing — vaucherlar ingliz tilida chiqadi.</p><div id="svc-list">' + sv.map(svcRow).join("") + '</div>' +
        '<div class="p-actions"><select id="svc-kind" class="btn btn--outline btn--sm">' + SVC.map(function (k) { return '<option value="' + k[0] + '">' + k[1] + '</option>'; }).join("") + '</select><button class="btn btn--outline btn--sm" id="svc-add">+ Xizmat qo\'shish</button><button class="btn btn--navy btn--sm" id="svc-save">Xizmatlarni saqlash</button></div>' +
        '<div class="msg" id="m-svc"></div><div class="p-actions"><button class="btn btn--gold" id="a-vouch">Vaucherlarni yaratish va agentga berish (PDF)</button></div>' +
        (vc.length ? '<h3 style="margin-top:20px">Yaratilgan vaucherlar</h3><div class="files">' + vc.map(function (v) { return '<div class="file"><b>📄 ' + esc(v.title || v.kind) + ' <small>' + P.date(v.created_at) + '</small></b><button data-v="' + esc(v.file_path) + '">Ochish</button></div>'; }).join("") + '</div>' : '') + '</div>';
    }
    box.innerHTML = h + '<div class="p-card" id="auto-log-b"></div>';
    if (window.MN_AUTOLOG) window.MN_AUTOLOG(id, $("#auto-log-b"));

    $("#back").onclick = loadBookings;
    $$("[data-p]", box).forEach(function (x) { x.onclick = function () { P.openFile("passports", x.dataset.p); }; });
    $$("[data-v]", box).forEach(function (x) { x.onclick = function () { P.openFile("vouchers", x.dataset.v); }; });
    async function upd(fields, ok) {
      var r = await sb.from("bookings").update(fields).eq("id", id);
      if (r.error) return P.msg("#m-b", r.error.message, "err");
      if (ok) P.msg("#m-b", ok, "ok"); openBooking(id);
    }
    var x;
    if ((x = $("#a-invoice"))) x.onclick = function () {
      var br = parseFloat($("#e-brutto").value), cm = parseFloat($("#e-comm").value), pay = $("#e-pay").value.trim();
      if (!(br > 0) || isNaN(cm) || !pay) return P.msg("#m-b", "Narx, komissiya va rekvizitlarni to'ldiring.", "err");
      if (tr.length < b.pax && !confirm("Sayyohlar to'liq kiritilmagan (" + tr.length + "/" + b.pax + "). Baribir yuborilsinmi?")) return;
      upd({ brutto: br, commission_pct: cm, payment_details: pay, status: "awaiting_payment", balance_due: addD(b.start_date, -14) });
    };
    if ((x = $("#vb-lang"))) x.onchange = function () { var l = this.value; $("#vb-main").href = vlink(b) + "&lang=" + l; $("#vb-svc").href = vlink(b) + "&lang=" + l + "&doc=services"; };
    if ((x = $("#a-paid"))) x.onclick = function () { if (confirm(P.money(b.netto) + " (100%) hisobingizga tushganini tasdiqlaysizmi?")) upd({ status: "paid", paid_total: b.netto }); };
    if ((x = $("#a-dep"))) x.onclick = function () { var dep = Math.round(b.netto * 0.3); if (confirm(P.money(dep) + " (30%) tushganini tasdiqlaysizmi?")) upd({ status: "deposit_paid", paid_total: dep, payment_reported_at: null }); };
    if ((x = $("#a-back-pay"))) x.onclick = function () { if (confirm("Holat “To'lov kutilmoqda”ga qaytarilsinmi?")) upd({ status: "awaiting_payment", payment_reported_at: null }); };
    if ((x = $("#a-cancel"))) x.onclick = function () { if (confirm(b.ref + " bekor qilinsinmi? Buni qaytarib bo'lmaydi.")) upd({ status: "cancelled" }); };
    $("#a-note").onclick = function () { upd({ admin_note: $("#e-note").value.trim() || null }, "Saqlandi"); };

    if ($("#svc-add")) {
      $("#svc-add").onclick = function () { var d = document.createElement("div"); d.innerHTML = svcRow({ kind: $("#svc-kind").value }); $("#svc-list").appendChild(d.firstChild); };
      $("#svc-list").addEventListener("click", function (e) { var r = e.target.closest("[data-rm]"); if (r) r.closest(".svc").remove(); });
      $("#svc-save").onclick = async function () { await saveServices(id, true); };
      $("#a-vouch").onclick = async function () {
        var btn = this; btn.disabled = true; P.msg("#m-svc", "Saqlanmoqda…");
        try {
          var list = await saveServices(id, false);
          if (!list.length) throw new Error("Avval kamida bitta xizmat kiriting.");
          if (!tr.length) throw new Error("Sayyohlar ro'yxati bo'sh.");
          P.msg("#m-svc", "PDF yaratilmoqda…");
          var contact = [CFG.whatsapp ? "+" + CFG.whatsapp + " (WhatsApp)" : "", CFG.telegram ? "t.me/" + CFG.telegram : ""].filter(Boolean).join(", ");
          var files = window.MN_VOUCHER.make(b, a, tr, list, contact);
          for (var i = 0; i < files.length; i++) {
            var f = files[i], path = b.agency_id + "/" + id + "/" + Date.now().toString(36) + "-" + f.name;
            var up = await sb.storage.from("vouchers").upload(path, f.blob, { contentType: "application/pdf" });
            if (up.error) throw up.error;
            var ins = await sb.from("vouchers").insert({ booking_id: id, kind: f.kind, title: f.title, file_path: path });
            if (ins.error) throw ins.error;
          }
          var kb = new Uint8Array(18); crypto.getRandomValues(kb);
          var st = await sb.from("bookings").update({ status: "confirmed", voucher_key: b.voucher_key || Array.from(kb, function (n) { return ("0" + n.toString(16)).slice(-2); }).join("") }).eq("id", id);
          if (st.error) throw st.error;
          openBooking(id);
        } catch (e) { btn.disabled = false; P.msg("#m-svc", P.err(e), "err"); }
      };
    }
  }

  function svcRow(s) {
    var opts = SVC.map(function (k) { return '<option value="' + k[0] + '"' + (k[0] === s.kind ? " selected" : "") + '>' + k[1] + '</option>'; }).join("");
    return '<div class="svc"><div class="fld"><label>Turi</label><select data-k="kind">' + opts + '</select></div>' +
      '<div class="fld"><label>Nomi *</label><input data-k="title" value="' + esc(s.title || "") + '" placeholder="Hotel Asia Bukhara, 2 DBL"></div>' +
      '<div class="fld"><label>Shahar</label><input data-k="city" value="' + esc(s.city || "") + '"></div>' +
      '<div class="fld"><label>Dan</label><input type="date" data-k="date_from" value="' + esc(s.date_from || "") + '"></div>' +
      '<div class="fld"><label>Gacha</label><input type="date" data-k="date_to" value="' + esc(s.date_to || "") + '"></div>' +
      '<div class="fld"><label>Tasdiq raqami</label><input data-k="confirmation_no" value="' + esc(s.confirmation_no || "") + '"></div>' +
      '<div class="fld"><label>Aloqa (tel., ism)</label><input data-k="contact" value="' + esc(s.contact || "") + '"></div>' +
      '<div class="fld wide"><label>Tafsilot</label><input data-k="details" value="' + esc(s.details || "") + '" placeholder="Room type, meals, car model, guide language…"></div>' +
      '<div class="fld"><label>&nbsp;</label><button class="btn btn--red btn--sm" data-rm type="button">O\'chirish</button></div></div>';
  }

  async function saveServices(id, reload) {
    var list = $$("#svc-list .svc").map(function (row, n) {
      var o = { booking_id: id, sort: n };
      $$("[data-k]", row).forEach(function (i) { o[i.dataset.k] = i.value.trim() || null; });
      return o;
    }).filter(function (o) { return o.title; });
    var del = await sb.from("booking_services").delete().eq("booking_id", id);
    if (del.error) { P.msg("#m-svc", del.error.message, "err"); throw del.error; }
    if (list.length) {
      var ins = await sb.from("booking_services").insert(list).select();
      if (ins.error) { P.msg("#m-svc", ins.error.message, "err"); throw ins.error; }
      list = ins.data;
    }
    if (reload) { P.msg("#m-svc", "Saqlandi", "ok"); }
    return list;
  }

  // ---------------------------------------------------------------- agencies
  var AF = [["pending", "Tekshiruvda"], ["approved", "Tasdiqlangan"], ["rejected", "Rad etilgan"], ["blocked", "Bloklangan"], ["all", "Hammasi"]];
  async function loadAgencies() {
    show("agencies");
    $("#af").innerHTML = AF.map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === aFilter ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("");
    $$("#af button").forEach(function (b) { b.onclick = function () { aFilter = b.dataset.f; loadAgencies(); }; });
    var q = sb.from("agencies").select("*").order("created_at", { ascending: false });
    if (aFilter !== "all") q = q.eq("status", aFilter);
    var r = await q, box = $("#alist");
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (!r.data.length) { box.innerHTML = '<div class="empty">Agentlik yo\'q.</div>'; return; }
    box.innerHTML = '<table class="tbl"><thead><tr><th>Agentlik</th><th>Davlat</th><th>Kontakt</th><th>Komissiya</th><th>Holat</th><th>Sana</th></tr></thead><tbody>' +
      r.data.map(function (a) { return '<tr class="click" data-id="' + a.id + '"><td><b>' + esc(a.name) + '</b></td><td>' + esc(a.country) + '</td><td>' + esc(a.contact_name) + '<br><small>' + esc(a.email) + '</small></td><td>' + a.commission_pct + '%</td><td>' + P.badge(a.status, L) + '</td><td>' + P.date(a.created_at) + '</td></tr>'; }).join("") + '</tbody></table>';
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { openAgency(tr.dataset.id); }; });
  }

  async function openAgency(id) {
    show("agency");
    var box = $("#v-agency"); box.innerHTML = '<div class="p-card empty">Yuklanmoqda…</div>';
    var a = (await sb.from("agencies").select("*").eq("id", id).single()).data;
    var docs = (await sb.from("agency_documents").select("*").eq("agency_id", id).order("created_at")).data || [];
    var cnt = (await sb.from("bookings").select("id", { count: "exact", head: true }).eq("agency_id", id)).count || 0;
    var info = [["Davlat / shahar", [a.country, a.city].filter(Boolean).join(", ")], ["Manzil", a.address], ["Sayt", a.website], ["Litsenziya", a.license_no], ["Kontakt", a.contact_name], ["E-mail", a.email], ["Telefon", a.phone], ["WhatsApp", a.whatsapp], ["Bronlar soni", cnt]];
    box.innerHTML = '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:12px"><button class="btn btn--outline btn--sm" id="back">← Agentliklar</button>' + P.badge(a.status, L) + '</div>' +
      '<h2 style="margin-top:14px">' + esc(a.name) + '</h2><table class="tbl" style="margin:10px 0 20px">' + info.map(function (i) { return '<tr><td style="width:200px;color:var(--muted)">' + i[0] + '</td><td><b>' + esc(i[1] == null || i[1] === "" ? "—" : i[1]) + '</b></td></tr>'; }).join("") + '</table>' +
      '<h3>Hujjatlar</h3><div class="files">' + (docs.length ? docs.map(function (d) { return '<div class="file"><b>' + esc(d.kind) + ' — ' + esc(d.file_name || "") + '</b><button data-d="' + esc(d.file_path) + '">Ochish</button></div>'; }).join("") : '<div class="empty">Hujjat yuklanmagan.</div>') + '</div>' +
      '<div class="p-grid" style="margin-top:20px"><div class="fld"><label>Komissiya, %</label><input type="number" step="0.5" min="0" max="50" id="ag-comm" value="' + a.commission_pct + '"></div>' +
      '<div class="fld"><label>Izoh (rad etilsa agent ko\'radi)</label><input id="ag-note" value="' + esc(a.admin_note || "") + '"></div>' +
      '<div class="fld"><label>Menejer (shu agentlik bronlari kimda)</label>' + (await window.MNA.mgrSelect(a.manager_id, "ag-mgr")) + '</div></div>' +
      '<div class="msg" id="m-ag"></div><div class="p-actions"><button class="btn btn--green" data-st="approved">Tasdiqlash</button><button class="btn btn--navy" data-st="">Faqat saqlash</button><button class="btn btn--outline" data-st="rejected">Rad etish</button><button class="btn btn--red" data-st="blocked">Bloklash</button></div></div>';
    $("#back").onclick = loadAgencies;
    $$("[data-d]", box).forEach(function (x) { x.onclick = function () { P.openFile("agency-docs", x.dataset.d); }; });
    $$("[data-st]", box).forEach(function (x) {
      x.onclick = async function () {
        var cm = parseFloat($("#ag-comm").value);
        if (isNaN(cm) || cm < 0 || cm > 50) return P.msg("#m-ag", "Komissiya 0–50% oralig'ida bo'lsin.", "err");
        var f = { commission_pct: cm, admin_note: $("#ag-note").value.trim() || null, manager_id: $("#ag-mgr").value || null };
        if (x.dataset.st) f.status = x.dataset.st;
        if (x.dataset.st === "approved" && !docs.length && !confirm("Hujjat yuklanmagan. Baribir tasdiqlansinmi?")) return;
        var r = await sb.from("agencies").update(f).eq("id", id);
        if (r.error) return P.msg("#m-ag", r.error.message, "err");
        openAgency(id);
      };
    });
  }

  boot();
})();
