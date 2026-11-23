/* Moviy Nomad — agent portal */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc, CFG = window.MN || {};
  var me = { user: null, profile: null, agency: null }, quote = null;

  // ---------------------------------------------------------------- views
  function show(v) {
    ["auth", "pending", "quote", "list", "booking", "agency", "groups"].forEach(function (x) { $("#v-" + x).classList.toggle("hidden", x !== v); });
    $$("#tabs button").forEach(function (b) { b.classList.toggle("is-on", b.dataset.view === v || (v === "booking" && b.dataset.view === "list")); });
    window.scrollTo(0, 0);
  }
  $$("#tabs button").forEach(function (b) { b.onclick = function () { go(b.dataset.view); }; });
  async function loadGroups() {
    var box = $("#ag-sched"); box.innerHTML = '<p class="p-sub">Loading…</p>';
    var r = await sb.from("group_departures").select("id,tour_id,start_date,capacity,booked,price_pp,status,group_kind").gte("start_date", new Date().toISOString().slice(0, 10)).order("start_date");
    var L = window.MN_L || {}, T = window.MN_TOURS || {};
    window.MN_GDS.render(box, r.data || [], { lang: "en", title: function (id) { return ((L.tours || {})[id] || [id])[0]; },
      range: function (x) { var d = new Date(x.start_date + "T12:00:00"), n = (T[x.tour_id] ? T[x.tour_id].days.length : 8) - 1, e = new Date(d); e.setDate(e.getDate() + n); var f = function (z) { return z.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }; return f(d) + " – " + f(e) + " " + e.getFullYear(); } });
  }
  function go(v) {
    if (v === "list") loadList();
    if (v === "agency") renderAgency();
    if (v === "groups") loadGroups();
    show(v);
  }

  // ---------------------------------------------------------------- auth
  $$("[data-auth]").forEach(function (b) {
    b.onclick = function () {
      $$("[data-auth]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      $("#f-login").classList.toggle("hidden", b.dataset.auth !== "login");
      $("#f-register").classList.toggle("hidden", b.dataset.auth !== "register");
    };
  });
  if (!P.configured) { $("#notcfg").hidden = false; show("auth"); return; }

  $("#f-login").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target;
    P.msg("#m-login", "Logging in…");
    var r = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    if (r.error) return P.msg("#m-login", r.error.message, "err");
    P.msg("#m-login", ""); boot();
  };
  $("#forgot").onclick = async function () {
    var email = $("#f-login").email.value.trim();
    if (!email) return P.msg("#m-login", "Type your e-mail first.", "err");
    var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] });
    P.msg("#m-login", r.error ? r.error.message : "We sent you a link to set a new password.", r.error ? "err" : "ok");
  };
  $("#f-register").onsubmit = async function (e) {
    e.preventDefault(); var f = e.target, data = {};
    ["agency_name", "country", "city", "address", "website", "license_no", "contact_name", "phone", "whatsapp"].forEach(function (k) { data[k] = f[k].value.trim(); });
    P.msg("#m-register", "Sending…");
    var r = await sb.auth.signUp({ email: f.email.value.trim(), password: f.password.value, options: { data: data, emailRedirectTo: location.href.split("#")[0] } });
    if (r.error) return P.msg("#m-register", r.error.message, "err");
    if (r.data.session) { boot(); return; }
    P.msg("#m-register", "Thank you! Please confirm your e-mail with the link we just sent, then log in and upload your documents.", "ok");
    f.reset();
  };
  $("#logout").onclick = async function () { await sb.auth.signOut(); location.reload(); };
  sb.auth.onAuthStateChange(function (ev) {
    if (ev === "PASSWORD_RECOVERY") {
      var pw = prompt("Enter a new password (min. 8 characters):");
      if (pw) sb.auth.updateUser({ password: pw }).then(function (r) { alert(r.error ? r.error.message : "Password updated."); });
    }
  });

  // ---------------------------------------------------------------- boot
  async function boot() {
    var s = await sb.auth.getSession();
    me.user = s.data.session && s.data.session.user;
    if (!me.user) { $("#tabs").classList.add("hidden"); show("auth"); return; }
    var p = await sb.from("profiles").select("*").eq("id", me.user.id).single();
    me.profile = p.data;
    if (me.profile && me.profile.agency_id) {
      var a = await sb.from("agencies").select("*").eq("id", me.profile.agency_id).single();
      me.agency = a.data;
    }
    $("#who").innerHTML = "<b>" + esc(me.agency ? me.agency.name : me.user.email) + "</b>" + esc(me.profile && me.profile.full_name || me.user.email);
    $("#who").classList.remove("hidden"); $("#logout").classList.remove("hidden");
    if (!me.agency) { show("pending"); $("#pend-title").textContent = "No agency is linked to this account"; $("#pend-text").textContent = "Please contact Moviy Nomad."; return; }
    if (me.agency.status !== "approved") { renderPending(); return; }
    $("#tabs").classList.remove("hidden");
    show("quote");
    if (window.MN_BUILDER) window.MN_BUILDER.render();
  }

  // ---------------------------------------------------------------- pending + documents
  async function loadDocs(box) {
    var r = await sb.from("agency_documents").select("*").eq("agency_id", me.agency.id).order("created_at");
    var KIND = { registration: "Company registration", license: "Tourism license", id: "ID of the director", other: "Other" };
    box.innerHTML = (r.data || []).length ? r.data.map(function (d) {
      return '<div class="file"><b>' + esc(KIND[d.kind] || d.kind) + ' — ' + esc(d.file_name || "") + '</b><button data-open="' + esc(d.file_path) + '">Open</button></div>';
    }).join("") : '<div class="empty">No documents uploaded yet.</div>';
    $$("[data-open]", box).forEach(function (b) { b.onclick = function () { P.openFile("agency-docs", b.dataset.open); }; });
  }
  function renderPending() {
    show("pending");
    var st = me.agency.status;
    if (st === "rejected" || st === "blocked") {
      $("#pend-title").textContent = st === "rejected" ? "Your application was not approved" : "Your account is blocked";
      $("#pend-text").textContent = (me.agency.admin_note || "") + " Please contact Moviy Nomad for details.";
    }
    loadDocs($("#pend-docs"));
  }
  $("#doc-up").onclick = async function () {
    var file = $("#doc-file").files[0];
    if (!file) return P.msg("#m-docs", "Choose a file first.", "err");
    if (file.size > 10 * 1024 * 1024) return P.msg("#m-docs", "The file is larger than 10 MB.", "err");
    P.msg("#m-docs", "Uploading…");
    try {
      var path = await P.upload("agency-docs", me.agency.id, file);
      var r = await sb.from("agency_documents").insert({ agency_id: me.agency.id, kind: $("#doc-kind").value, file_path: path, file_name: file.name });
      if (r.error) throw r.error;
      P.msg("#m-docs", "Uploaded. Thank you!", "ok"); $("#doc-file").value = ""; loadDocs($("#pend-docs"));
    } catch (e) { P.msg("#m-docs", P.err(e), "err"); }
  };

  // ---------------------------------------------------------------- quote (builder hook)
  window.MN_ON_QUOTE = function (q) {
    quote = q;
    $("#q-empty").classList.toggle("hidden", !!q); $("#q-body").classList.toggle("hidden", !q);
    if (!q || !me.agency) return;
    var c = window.MN_ENGINE && window.MN_ENGINE.commission ? window.MN_ENGINE.commission(q.tour_id, me.agency.commission_pct) : Number(me.agency.commission_pct || 0), brutto = q.price.total, netto = Math.round(brutto * (1 - c / 100) * 100) / 100;
    $("#q-title").textContent = q.tour_title + " · " + q.price.days + " days";
    $("#q-pax").textContent = q.price.pax + (q.config.single ? " (single rooms)" : "");
    $("#q-brutto").textContent = P.money(brutto) + " (" + P.money(q.price.pp) + " pp)";
    $("#q-netto").textContent = P.money(netto);
    $("#q-comm").textContent = "Your commission: " + c + "% = " + P.money(brutto - netto) + ". Sell to your client at the brutto price — the same price travellers see on our website.";
  };
  $("#q-book").onclick = async function () {
    if (!quote) return;
    var d = $("#q-date").value;
    if (!d) return P.msg("#m-quote", "Choose the start date.", "err");
    if (new Date(d) < new Date(new Date().toDateString())) return P.msg("#m-quote", "The start date is in the past.", "err");
    this.disabled = true; P.msg("#m-quote", "Creating the booking…");
    var row = { agency_id: me.agency.id, tour_id: quote.tour_id, tour_title: quote.tour_title, config: quote.config, start_date: d,
      pax: quote.price.pax, brutto: quote.price.total, agent_note: $("#q-note").value.trim() || null };
    var r = await sb.from("bookings").insert(row).select().single();
    this.disabled = false;
    if (r.error) return P.msg("#m-quote", r.error.message, "err");
    P.msg("#m-quote", ""); $("#q-note").value = "";
    openBooking(r.data.id);
  };

  // ---------------------------------------------------------------- list
  async function loadList() {
    var box = $("#list"); box.innerHTML = '<div class="empty">Loading…</div>';
    var r = await sb.from("bookings").select("id,ref,tour_title,start_date,pax,brutto,netto,status,created_at").order("created_at", { ascending: false });
    if (r.error) { box.innerHTML = '<div class="msg msg--err">' + esc(r.error.message) + '</div>'; return; }
    if (!r.data.length) { box.innerHTML = '<div class="empty">No bookings yet. Make your first quote in “New quote”.</div>'; return; }
    box.innerHTML = '<table class="tbl"><thead><tr><th>Ref</th><th>Tour</th><th>Start</th><th>Pax</th><th class="num">Brutto</th><th class="num">Netto</th><th>Status</th></tr></thead><tbody>' +
      r.data.map(function (b) { return '<tr class="click" data-id="' + b.id + '"><td><b>' + esc(b.ref) + '</b></td><td>' + esc(b.tour_title) + '</td><td>' + P.date(b.start_date) + '</td><td>' + b.pax + '</td><td class="num">' + P.money(b.brutto) + '</td><td class="num"><b>' + P.money(b.netto) + '</b></td><td>' + P.badge(b.status) + '</td></tr>'; }).join("") + '</tbody></table>';
    $$("tr[data-id]", box).forEach(function (tr) { tr.onclick = function () { openBooking(tr.dataset.id); }; });
  }

  // ---------------------------------------------------------------- booking detail
  async function openBooking(id) {
    show("booking");
    var box = $("#v-booking"); box.innerHTML = '<div class="p-card empty">Loading…</div>';
    var b = (await sb.from("bookings").select("*").eq("id", id).single()).data;
    var tr = (await sb.from("travellers").select("*").eq("booking_id", id).order("created_at")).data || [];
    var sv = (await sb.from("booking_services").select("*").eq("booking_id", id).order("sort")).data || [];
    var vc = (await sb.from("vouchers").select("*").eq("booking_id", id).order("created_at")).data || [];
    if (!b) { box.innerHTML = '<div class="p-card msg msg--err">Booking not found.</div>'; return; }
    var editable = b.status === "request" || b.status === "awaiting_payment";
    var route = (b.config.route || []).map(function (r) { return esc(r.name) + " (" + r.nights + "n)"; }).join(" → ");

    var h = '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><button class="btn btn--outline btn--sm" id="back">← All bookings</button></div>' + P.badge(b.status) + '</div>' +
      '<h2 style="margin-top:14px">' + esc(b.ref) + ' · ' + esc(b.tour_title) + '</h2>' + P.flowLine(b.status) +
      '<div class="kv" style="margin-top:14px"><div><small>Start</small><b>' + P.date(b.start_date) + '</b></div><div><small>Travellers</small><b>' + b.pax + '</b></div><div><small>Brutto</small><b>' + P.money(b.brutto) + '</b></div><div class="hl"><small>Netto to pay (' + b.commission_pct + '% commission)</small><b>' + P.money(b.netto) + '</b></div></div>' +
      '<p class="p-sub" style="margin-top:12px">' + route + ' · ' + esc(b.config.hotel || "") + ' · ' + esc(b.config.transport || "") + ' · Guide: ' + esc(b.config.guide || "") + '</p>' +
      (b.agent_note ? '<p><b>Your note:</b> ' + esc(b.agent_note) + '</p>' : '') + '</div>';

    // Payment
    if (b.status === "request") h += '<div class="p-card"><h3>Next step</h3><p>Add all travellers with their passports below. Moviy Nomad will check availability and send you the payment details here.</p></div>';
    if (b.status === "awaiting_payment" || b.status === "payment_reported" || b.status === "deposit_paid") {
      var dep = Math.round(b.netto * 0.3), due = b.balance_due ? P.date(b.balance_due) : "14 days before the start";
      h += '<div class="p-card"><h3>Payment</h3><div class="msg msg--info" style="white-space:pre-wrap">' + esc(b.payment_details || "") + '</div><p>Total netto: <b>' + P.money(b.netto) + '</b> · Reference: <b>' + esc(b.ref) + '</b></p>' +
        '<table class="tbl"><tr><th>30% deposit</th><td><b>' + P.money(dep) + '</b> — within 3 working days of the invoice' + ((+b.paid_total || 0) >= dep ? ' ✅ received' : '') + '</td></tr><tr><th>70% balance</th><td><b>' + P.money(b.netto - dep) + '</b> — by ' + esc(due) + '</td></tr><tr><th>Received</th><td><b>' + P.money(+b.paid_total || 0) + '</b></td></tr></table>';
      if (b.status === "awaiting_payment" || b.status === "deposit_paid") h += '<div class="p-actions"><button class="btn btn--green" id="paid">I have paid</button></div>';
      else h += '<p class="msg msg--ok">You reported the payment. We will confirm it as soon as the money arrives.</p>';
      var txt = encodeURIComponent("Moviy Nomad, payment sent for booking " + b.ref + ": " + P.money(b.netto) + " (" + (me.agency && me.agency.name) + ")");
      h += '<div class="p-actions"><a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + esc(CFG.whatsapp || "") + '?text=' + txt + '">Notify on WhatsApp</a><a class="btn btn--tg btn--sm" target="_blank" rel="noopener" href="https://t.me/' + esc(CFG.telegram || "") + '">Notify on Telegram</a></div></div>';
    }

    // Vouchers
    if (vc.length || sv.length || b.voucher_key) {
      h += '<div class="p-card"><h3>Services & vouchers</h3>' +
        (sv.length ? '<table class="tbl"><thead><tr><th>Service</th><th>City</th><th>Dates</th><th>Confirmation</th></tr></thead><tbody>' + sv.map(function (s) { return '<tr><td><b>' + esc(s.title) + '</b><br><small>' + esc(s.kind) + '</small></td><td>' + esc(s.city || "") + '</td><td>' + P.date(s.date_from) + (s.date_to ? " – " + P.date(s.date_to) : "") + '</td><td>' + esc(s.confirmation_no || "") + '</td></tr>'; }).join("") + '</tbody></table>' : '') +
        (b.voucher_key ? '<div class="p-actions" style="margin-top:12px;align-items:center"><b>Client language:</b> <select id="vl">' + [["en","English"],["ru","Русский"],["uz","O\'zbekcha"],["tr","Türkçe"],["ar","العربية"],["de","Deutsch"],["sv","Svenska"],["zh","中文"],["hi","हिन्दी"],["ko","한국어"]].map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join("") + '</select>' +
          '<a class="btn btn--gold btn--sm" id="vl-a" target="_blank" rel="noopener" href="../voucher.html?ref=' + encodeURIComponent(b.ref) + '&k=' + esc(b.voucher_key) + '&lang=en">🧾 Travel voucher (PDF)</a>' +
          '<a class="btn btn--green btn--sm" id="vl-b" target="_blank" rel="noopener" href="../voucher.html?ref=' + encodeURIComponent(b.ref) + '&k=' + esc(b.voucher_key) + '&lang=en&doc=services">Service vouchers (PDF)</a></div>' : '') +
        (vc.length ? '<div class="files" style="margin-top:14px">' + vc.map(function (v) { return '<div class="file"><b>📄 ' + esc(v.title || v.kind) + '</b><button data-v="' + esc(v.file_path) + '">Download PDF</button></div>'; }).join("") + '</div>' : '') + '</div>';
    }

    // Travellers
    h += '<div class="p-card"><h3>Travellers (' + tr.length + ' of ' + b.pax + ')</h3>';
    h += tr.length ? '<table class="tbl"><thead><tr><th>Name</th><th>Passport</th><th>Nationality</th><th>Birth date</th><th>Scan</th>' + (editable ? '<th></th>' : '') + '</tr></thead><tbody>' + tr.map(function (t) {
      return '<tr><td><b>' + esc(t.last_name) + ' ' + esc(t.first_name) + '</b> ' + esc(t.gender || "") + '</td><td>' + esc(t.passport_no) + (t.passport_expiry ? '<br><small>exp. ' + P.date(t.passport_expiry) + '</small>' : '') + '</td><td>' + esc(t.nationality || "") + '</td><td>' + P.date(t.birth_date) + '</td><td>' + (t.passport_file ? '<button class="link" data-p="' + esc(t.passport_file) + '">View</button>' : '—') + '</td>' + (editable ? '<td><button class="link" data-del="' + t.id + '">Remove</button></td>' : '') + '</tr>';
    }).join("") + '</tbody></table>' : '<div class="empty">No travellers yet.</div>';
    if (editable) {
      h += '<form id="f-trav" style="margin-top:18px"><div class="trav">' +
        '<div class="fld"><label>First name *</label><input name="first_name" required></div><div class="fld"><label>Last name *</label><input name="last_name" required></div>' +
        '<div class="fld"><label>Sex</label><select name="gender"><option value="">–</option><option>M</option><option>F</option></select></div>' +
        '<div class="fld"><label>Birth date</label><input type="date" name="birth_date"></div><div class="fld"><label>Nationality</label><input name="nationality"></div>' +
        '<div class="fld"><label>Passport no. *</label><input name="passport_no" required></div><div class="fld"><label>Passport expiry</label><input type="date" name="passport_expiry"></div>' +
        '</div><div class="fld" style="margin-top:10px"><label>Passport scan (photo page, PDF or image) </label><input type="file" name="scan" accept=".pdf,image/*"></div>' +
        '<div class="msg" id="m-trav"></div><div class="p-actions"><button class="btn btn--navy" type="submit">Add traveller</button>' +
        '<button class="btn btn--red" type="button" id="cancel-b">Cancel booking</button></div></form>';
    }
    h += '</div>';
    box.innerHTML = h;
    if ($("#vl")) $("#vl").onchange = function () { var l = this.value; ["#vl-a", "#vl-b"].forEach(function (q) { var a = $(q); a.href = a.href.replace(/lang=[a-z]+/, "lang=" + l); }); };

    $("#back").onclick = function () { go("list"); };
    $$("[data-v]", box).forEach(function (x) { x.onclick = function () { P.openFile("vouchers", x.dataset.v); }; });
    $$("[data-p]", box).forEach(function (x) { x.onclick = function () { P.openFile("passports", x.dataset.p); }; });
    $$("[data-del]", box).forEach(function (x) { x.onclick = async function () { if (!confirm("Remove this traveller?")) return; var r = await sb.from("travellers").delete().eq("id", x.dataset.del); if (r.error) alert(r.error.message); openBooking(id); }; });
    var paid = $("#paid", box);
    if (paid) paid.onclick = async function () {
      if (!confirm("Confirm that you have sent " + P.money(b.netto) + " for " + b.ref + "?")) return;
      var r = await sb.from("bookings").update({ status: "payment_reported" }).eq("id", id);
      if (r.error) return alert(r.error.message); openBooking(id);
    };
    var cancel = $("#cancel-b", box);
    if (cancel) cancel.onclick = async function () {
      if (!confirm("Cancel booking " + b.ref + "? This cannot be undone.")) return;
      var r = await sb.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (r.error) return alert(r.error.message); openBooking(id);
    };
    var f = $("#f-trav", box);
    if (f) f.onsubmit = async function (e) {
      e.preventDefault();
      if (tr.length >= b.pax && !confirm("This booking is for " + b.pax + " travellers. Add one more anyway?")) return;
      P.msg("#m-trav", "Saving…");
      try {
        var row = { booking_id: id }, file = f.scan.files[0];
        ["first_name", "last_name", "gender", "birth_date", "nationality", "passport_no", "passport_expiry"].forEach(function (k) { row[k] = f[k].value.trim() || null; });
        row.first_name = row.first_name.toUpperCase(); row.last_name = row.last_name.toUpperCase(); row.passport_no = row.passport_no.toUpperCase();
        if (file) {
          if (file.size > 10 * 1024 * 1024) throw new Error("The scan is larger than 10 MB.");
          row.passport_file = await P.upload("passports", b.agency_id + "/" + id, file);
        }
        var r = await sb.from("travellers").insert(row);
        if (r.error) throw r.error;
        openBooking(id);
      } catch (e2) { P.msg("#m-trav", P.err(e2), "err"); }
    };
  }

  // ---------------------------------------------------------------- agency
  function renderAgency() {
    var a = me.agency, box = $("#agency-box");
    box.innerHTML = '<h2>' + esc(a.name) + '</h2><p class="p-sub">' + esc([a.city, a.country].filter(Boolean).join(", ")) + ' · ' + P.badge(a.status) + '</p>' +
      '<div class="kv"><div class="hl"><small>Your commission</small><b>' + a.commission_pct + '%</b></div><div><small>Contact</small><b>' + esc(a.contact_name) + '</b></div><div><small>E-mail</small><b>' + esc(a.email) + '</b></div><div><small>WhatsApp</small><b>' + esc(a.whatsapp || a.phone || "—") + '</b></div></div>' +
      '<h3 style="margin-top:22px">Documents</h3><div class="files" id="ag-docs"></div><p class="p-sub" style="margin-top:12px">To change your details or commission, contact Moviy Nomad.</p>';
    loadDocs($("#ag-docs"));
  }

  boot();
})();
