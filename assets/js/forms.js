/* Moviy Nomad — public forms: service requests, online booking, travellers' stories + gallery.
 * Talks to Supabase over plain REST with the public anon key. Visitors can only call the two
 * submit_* functions and read approved stories — everything else is closed by database rules. */
(function () {
  var SB = window.MN_SB || {}, X = window.MNX || {}, LANG = window.MN_LANG || "en";
  var BUCKET = "traveller-photos";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hdr(extra) { var h = { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey }; for (var k in extra || {}) h[k] = extra[k]; return h; }

  async function rpc(name, payload) {
    var r = await fetch(SB.url + "/rest/v1/rpc/" + name, { method: "POST", headers: hdr({ "Content-Type": "application/json" }), body: JSON.stringify({ p: payload }) });
    var body = await r.json().catch(function () { return null; });
    if (!r.ok) throw new Error((body && body.message) || ("HTTP " + r.status));
    return body;
  }
  function photoUrl(path) { return SB.url + "/storage/v1/object/public/" + BUCKET + "/" + path.split("/").map(encodeURIComponent).join("/"); }

  function msg(form, text, kind) { var m = $(".mf-msg", form); if (m) { m.className = "mf-msg" + (kind ? " mf-msg--" + kind : ""); m.textContent = text || ""; } }
  function check(form) {
    var bad = $$("[required]", form).filter(function (el) { return el.type === "checkbox" ? !el.checked : !String(el.value || "").trim(); });
    $$(".is-bad", form).forEach(function (el) { el.classList.remove("is-bad"); });
    bad.forEach(function (el) { (el.closest(".mf-f") || el.closest(".mf-check") || el).classList.add("is-bad"); });
    if (bad.length) { msg(form, X.f_required, "err"); bad[0].focus(); return false; }
    return true;
  }
  function val(form, n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function busy(form, on, label) { var b = $("button[type=submit]", form); if (!b) return; if (on) { b.dataset.t = b.textContent; b.textContent = label || X.f_sending; } else if (b.dataset.t) b.textContent = b.dataset.t; b.disabled = !!on; }
  function niceErr(e) { var m = String(e && e.message || e); return /too_many/.test(m) ? X.f_err : X.f_err; }

  // ---- modals
  function openModal(m) { m.classList.add("is-open"); var f = $("input,select,textarea,button", m); if (f) setTimeout(function () { f.focus(); }, 50); }
  function closeModal(m) { m.classList.remove("is-open"); }
  $$(".modal").forEach(function (m) {
    if (m.id === "contact") return;
    m.addEventListener("click", function (e) { if (e.target === m || e.target.closest(".modal__close")) closeModal(m); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $$(".modal.is-open").forEach(closeModal); });
  function success(ref, extra) {
    return '<div class="okbox"><div class="okbox__ic">✓</div><h3>' + esc(X.f_ok_title) + '</h3><p>' + esc(X.f_ok_text).replace("{ref}", "<b>" + esc(ref) + "</b>") + '</p>' + (extra || "") + '</div>';
  }

  // ---- service request
  var sm = $("#svc-modal"), sf = $("#svc-form");
  if (sm && sf) {
    function openSvc(id) { sf.elements.service.value = id; $("#svc-title").textContent = (X.services || {})[id] || ""; msg(sf, ""); openModal(sm); }
    $$("[data-svc]").forEach(function (b) { b.onclick = function () { openSvc(b.getAttribute("data-svc")); }; });
    sf.elements.service.onchange = function () { $("#svc-title").textContent = (X.services || {})[sf.elements.service.value] || ""; };
    sf.onsubmit = async function (ev) {
      ev.preventDefault(); if (!check(sf)) return;
      busy(sf, true);
      try {
        var ref = await rpc("submit_site_request", {
          kind: "service", service: val(sf, "service"), start_date: val(sf, "start_date"), pax: val(sf, "pax"),
          contact_name: val(sf, "contact_name"), phone: val(sf, "phone"), email: val(sf, "email"), citizenship: val(sf, "citizenship"),
          details: { city: val(sf, "city") }, message: val(sf, "message"), consent: sf.elements.consent.checked, lang: LANG
        });
        $(".modal__box", sm).innerHTML = '<button class="modal__close" aria-label="' + esc(X.f_close) + '">×</button>' + success(ref);
      } catch (e) { msg(sf, niceErr(e), "err"); busy(sf, false); }
    };
  }

  // ---- booking
  var bf = $("#bk-form");
  if (bf) {
    var list = $("#trav-list"), n = 0;
    function travRow() {
      n++;
      var d = document.createElement("div"); d.className = "trav";
      d.innerHTML = '<b class="trav__n"></b>' +
        '<label class="mf-f"><span>' + esc(X.bk_first) + ' *</span><input data-k="first" required maxlength="60" autocomplete="off"></label>' +
        '<label class="mf-f"><span>' + esc(X.bk_last) + ' *</span><input data-k="last" required maxlength="60" autocomplete="off"></label>' +
        '<label class="mf-f mf-f--s"><span>' + esc(X.bk_gender) + '</span><select data-k="gender"><option value="M">' + esc(X.bk_m) + '</option><option value="F">' + esc(X.bk_f) + '</option></select></label>' +
        '<label class="mf-f mf-f--s"><span>' + esc(X.bk_dob) + '</span><input type="date" data-k="dob"></label>' +
        '<button type="button" class="trav__rm" aria-label="' + esc(X.bk_remove) + '" title="' + esc(X.bk_remove) + '">×</button>';
      list.appendChild(d); renumber();
    }
    function renumber() { $$(".trav", list).forEach(function (r, i) { $(".trav__n", r).textContent = (i + 1) + "."; $(".trav__rm", r).hidden = $$(".trav", list).length < 2; }); }
    list.addEventListener("click", function (e) { var b = e.target.closest(".trav__rm"); if (b) { b.closest(".trav").remove(); renumber(); } });
    $("#trav-add").onclick = function () { if ($$(".trav", list).length < 60) travRow(); };
    function syncRows() {
      var want = Math.min(60, (parseInt(val(bf, "adults"), 10) || 1) + (parseInt(val(bf, "children"), 10) || 0));
      var have = $$(".trav", list);
      // only add/remove empty rows, never delete typed names
      while (have.length < want) { travRow(); have = $$(".trav", list); }
      for (var i = have.length - 1; i >= want; i--) { var r = have[i]; if (!$$("input", r).some(function (x) { return x.value; })) r.remove(); }
      renumber();
    }
    bf.elements.adults.onchange = syncRows; bf.elements.children.onchange = syncRows; syncRows();
    var q = new URLSearchParams(location.search).get("tour");
    if (q && $('option[value="' + CSS.escape(q) + '"]', bf.elements.tour_id)) bf.elements.tour_id.value = q;
    var today = new Date(); today.setDate(today.getDate() + 3); bf.elements.start_date.min = today.toISOString().slice(0, 10);
    // Online booking + payment can be switched on from the admin panel (Narxlar → "Onlayn bron va to'lov yoqilgan").
    // While it is off, the page works as a request form: payment options are shown as "coming soon".
    var online = false;
    function setOnline(on) {
      online = !!on; bf.dataset.online = online ? "1" : "0";
      $("#bk-soon").hidden = online;
      $("#pays-wrap").classList.toggle("is-soon", !online);
      $$("input[name=pay_method]", bf).forEach(function (r) { r.disabled = !online; });
      if (!online) bf.querySelector("input[name=pay_method][value=contact]").checked = true;
      var bw = $("#bank-wrap"); if (bw) bw.hidden = !online;
      $("button[type=submit]", bf).textContent = online ? X.bk_submit : X.bk_submit_req;
    }
    setOnline(false);
    if (SB.url) fetch(SB.url + "/rest/v1/price_config?id=eq.public&select=data", { headers: hdr() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { if (rows && rows[0] && rows[0].data && rows[0].data.booking_online) setOnline(true); })
      .catch(function () {});

    bf.onsubmit = async function (ev) {
      ev.preventDefault(); if (!check(bf)) return;
      var opt = bf.elements.tour_id.selectedOptions[0];
      var pm = online ? ((bf.querySelector("input[name=pay_method]:checked") || {}).value || "contact") : "contact";
      var trav = $$(".trav", list).map(function (r) { var o = {}; $$("[data-k]", r).forEach(function (i) { o[i.dataset.k] = i.value.trim(); }); return o; });
      busy(bf, true);
      try {
        var ad = parseInt(val(bf, "adults"), 10) || 1, ch = parseInt(val(bf, "children"), 10) || 0;
        var ref = await rpc("submit_site_request", {
          kind: "tour", tour_id: val(bf, "tour_id"), tour_title: opt ? opt.textContent : "", start_date: val(bf, "start_date"), pax: ad + ch,
          contact_name: val(bf, "contact_name"), phone: val(bf, "phone"), email: val(bf, "email"), citizenship: val(bf, "citizenship"), messenger: val(bf, "messenger"),
          travellers: trav, details: { adults: ad, children: ch, hotel: val(bf, "hotel"), guide_lang: val(bf, "guide_lang") },
          message: val(bf, "message"), pay_method: pm, consent: bf.elements.consent.checked, lang: LANG
        });
        var extra = '<p class="okbox__next">' + esc(online ? ((X.bk_ok || {})[pm] || "") : X.bk_ok_req) + '</p>';
        if (online && pm === "bank" && $(".bank")) extra += $(".bank").outerHTML;
        $("#ok-body").innerHTML = success(ref, extra);
        openModal($("#ok-modal"));
        bf.reset(); list.innerHTML = ""; syncRows(); busy(bf, false); msg(bf, ""); setOnline(online);
      } catch (e) { msg(bf, niceErr(e), "err"); busy(bf, false); }
    };
  }

  // ---- travellers' stories: form
  var tf = $("#ts-form");
  if (tf) {
    var files = [], prev = $("#ts-prev"), inp = tf.elements.photos;
    function drawPrev() {
      prev.innerHTML = files.map(function (f, i) { return '<span class="ts-th"><img src="' + URL.createObjectURL(f) + '" alt=""><button type="button" data-i="' + i + '" aria-label="×">×</button></span>'; }).join("");
    }
    inp.onchange = function () {
      [].slice.call(inp.files).forEach(function (f) { if (/^image\/(jpeg|png|webp)$/.test(f.type) && files.length < 6) files.push(f); });
      if (inp.files.length + files.length > 6 && files.length >= 6) msg(tf, X.ts_too_many, "err");
      inp.value = ""; drawPrev();
    };
    prev.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) { files.splice(+b.dataset.i, 1); drawPrev(); } });

    // resize to max 1600px and re-encode: this also strips EXIF (GPS location, camera data)
    function shrink(file) {
      return new Promise(function (ok, no) {
        var img = new Image(), u = URL.createObjectURL(file);
        img.onload = function () {
          var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
          c.toBlob(function (b) { b ? ok(b) : no(new Error("encode")); }, "image/webp", 0.82);
        };
        img.onerror = function () { no(new Error("image")); }; img.src = u;
      });
    }
    function rid() { var a = new Uint8Array(12); crypto.getRandomValues(a); return [].map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
    async function up(blob) {
      var path = "u/" + Date.now().toString(36) + "-" + rid() + ".webp";
      var r = await fetch(SB.url + "/storage/v1/object/" + BUCKET + "/" + path, { method: "POST", headers: hdr({ "Content-Type": "image/webp", "x-upsert": "false" }), body: blob });
      if (!r.ok) throw new Error("upload " + r.status);
      return path;
    }
    tf.onsubmit = async function (ev) {
      ev.preventDefault(); if (!check(tf)) return;
      busy(tf, true);
      try {
        var paths = [];
        for (var i = 0; i < files.length; i++) { busy(tf, true, X.ts_uploading.replace("{n}", i + 1).replace("{t}", files.length)); paths.push(await up(await shrink(files[i]))); }
        busy(tf, true);
        await rpc("submit_traveller_post", { name: val(tf, "name"), country: val(tf, "country"), trip: val(tf, "trip"), body: val(tf, "body"),
          rating: (tf.querySelector("input[name=rating]:checked") || {}).value || "", photos: paths, consent: tf.elements.consent.checked, lang: LANG });
        tf.innerHTML = '<div class="okbox"><div class="okbox__ic">✓</div><p>' + esc(X.ts_ok) + '</p></div>';
      } catch (e) { msg(tf, niceErr(e), "err"); busy(tf, false); }
    };
  }

  // ---- travellers' stories: gallery (approved only)
  $$("[data-gallery]").forEach(async function (box) {
    if (!SB.url) return;
    try {
      var lim = parseInt(box.getAttribute("data-gallery"), 10) || 6;
      var r = await fetch(SB.url + "/rest/v1/traveller_posts?select=id,name,country,trip,body,rating,photos,created_at&status=eq.approved&order=created_at.desc&limit=" + lim, { headers: hdr() });
      if (!r.ok) return;
      var rows = await r.json();
      if (!rows.length) return;
      box.innerHTML = rows.map(function (p) {
        var ph = (p.photos || []);
        return '<article class="story">' +
          (ph.length ? '<div class="story__ph story__ph--' + Math.min(ph.length, 3) + '">' + ph.slice(0, 3).map(function (x) { return '<a href="' + esc(photoUrl(x)) + '" target="_blank" rel="noopener"><img src="' + esc(photoUrl(x)) + '" alt="" loading="lazy"></a>'; }).join("") + '</div>' : '') +
          '<div class="story__b">' + (p.rating ? '<div class="rev__stars">' + "★★★★★".slice(0, p.rating) + '</div>' : '') +
          '<p>' + esc(p.body) + '</p><div class="story__who"><b>' + esc(p.name) + '</b><span>' + esc([p.country, p.trip].filter(Boolean).join(" · ")) + '</span></div></div></article>';
      }).join("");
    } catch (e) { /* keep the empty state */ }
  });
})();
