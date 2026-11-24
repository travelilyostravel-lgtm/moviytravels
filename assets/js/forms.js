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
  // ---- extra checks: citizenship from the list, birth dates, no duplicate travellers, trip-date warning
  var V = {
    en: ["Choose the citizenship from the list.", "Enter first name, last name and date of birth for every traveller.", "Check the date of birth.", "This traveller is listed twice.", "Less than 14 days before the trip: the full price is paid at once after confirmation."],
    ru: ["Выберите гражданство из списка.", "Укажите имя, фамилию и дату рождения каждого путешественника.", "Проверьте дату рождения.", "Этот путешественник указан дважды.", "До поездки меньше 14 дней: после подтверждения оплачивается вся сумма сразу."],
    uz: ["Fuqarolikni ro'yxatdan tanlang.", "Har bir sayohatchining ismi, familiyasi va tug'ilgan sanasini kiriting.", "Tug'ilgan sanani tekshiring.", "Bu sayohatchi ikki marta yozilgan.", "Sayohatgacha 14 kundan kam: tasdiqlangandan keyin butun summa birdaniga to'lanadi."],
    tr: ["Vatandaşlığı listeden seçin.", "Her yolcu için ad, soyad ve doğum tarihi girin.", "Doğum tarihini kontrol edin.", "Bu yolcu iki kez yazılmış.", "Seyahate 14 günden az: onaydan sonra tutarın tamamı tek seferde ödenir."],
    ar: ["اختر الجنسية من القائمة.", "أدخل الاسم واللقب وتاريخ الميلاد لكل مسافر.", "تحقق من تاريخ الميلاد.", "هذا المسافر مكتوب مرتين.", "أقل من 14 يومًا قبل الرحلة: يُدفع المبلغ كاملًا بعد التأكيد."],
    de: ["Wählen Sie die Staatsangehörigkeit aus der Liste.", "Vorname, Nachname und Geburtsdatum für jeden Reisenden angeben.", "Geburtsdatum prüfen.", "Dieser Reisende steht doppelt in der Liste.", "Weniger als 14 Tage vor der Reise: der volle Preis wird nach Bestätigung sofort gezahlt."],
    sv: ["Välj medborgarskap från listan.", "Ange förnamn, efternamn och födelsedatum för varje resenär.", "Kontrollera födelsedatumet.", "Denna resenär finns två gånger.", "Mindre än 14 dagar före resan: hela priset betalas direkt efter bekräftelse."],
    zh: ["请从列表中选择国籍。", "请填写每位旅客的名、姓和出生日期。", "请检查出生日期。", "该旅客重复填写。", "距出发不足 14 天：确认后需一次性付清全款。"],
    hi: ["सूची से नागरिकता चुनें।", "हर यात्री का नाम, उपनाम और जन्म तिथि लिखें।", "जन्म तिथि जाँचें।", "यह यात्री दो बार लिखा है।", "यात्रा में 14 दिन से कम: पुष्टि के बाद पूरी राशि एक साथ चुकाई जाती है।"],
    ko: ["목록에서 국적을 선택하세요.", "모든 여행자의 이름, 성, 생년월일을 입력하세요.", "생년월일을 확인하세요.", "이 여행자가 두 번 입력되었습니다.", "출발까지 14일 미만: 확정 후 전액을 한 번에 결제합니다."]
  }[LANG] || null;
  if (!V) V = ["Choose the citizenship from the list.", "Enter first name, last name and date of birth for every traveller.", "Check the date of birth.", "This traveller is listed twice.", "Less than 14 days before the trip: the full price is paid at once after confirmation."];
  var cits = $$('input[name="citizenship"]');
  if (cits.length) {
    var go = function () { cits.forEach(function (i) { window.MNCountries.attach(i, LANG); }); };
    if (window.MNCountries) go(); else { var me = $('script[src*="forms.js"]'); if (me) { var sc = document.createElement("script"); sc.src = me.src.replace(/forms\.js.*$/, "mn-countries.js"); sc.onload = go; document.head.appendChild(sc); } }
  }
  function bad(el, text, form) { (el.closest(".mf-f") || el).classList.add("is-bad"); msg(form, text, "err"); el.focus(); return false; }
  function checkCitizenship(form) {
    var el = form.elements.citizenship; if (!el || !window.MNCountries || !String(el.value || "").trim()) return true;
    var c = window.MNCountries.code(el); if (c) { el.value = window.MNCountries.name(c, LANG); return true; }
    return bad(el, V[0], form);
  }
  window.MN_CHECK_CIT = checkCitizenship;
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
      ev.preventDefault(); if (!check(sf) || !checkCitizenship(sf)) return;
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
        '<label class="mf-f mf-f--s"><span>' + esc(X.bk_dob) + ' *</span><input type="date" data-k="dob" required min="1920-01-01" max="' + new Date().toISOString().slice(0, 10) + '"></label>' +
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
    var near = document.createElement("p"); near.className = "mf-near"; near.hidden = true; near.style.cssText = "background:#fff4e0;border-radius:8px;padding:8px 12px;font-size:14px;margin:6px 0";
    near.textContent = "⚠ " + V[4]; var sd = bf.elements.start_date; (sd.closest(".mf-f") || sd).after(near);
    sd.addEventListener("change", function () { var t = new Date(); t.setDate(t.getDate() + 14); near.hidden = !sd.value || sd.value > t.toISOString().slice(0, 10); });
    // "Correct and send again" from the client cabinet: fill the form with the cancelled request
    if (/[?&]resubmit=/.test(location.search)) {
      try {
        var R = JSON.parse(sessionStorage.getItem("mn_resubmit") || "null");
        if (R) {
          var setv = function (n, v) { if (bf.elements[n] && v != null && v !== "") bf.elements[n].value = v; };
          if (R.tour_id && $('option[value="' + CSS.escape(R.tour_id) + '"]', bf.elements.tour_id)) bf.elements.tour_id.value = R.tour_id;
          setv("adults", R.adults); setv("children", R.children); setv("hotel", R.hotel); setv("guide_lang", R.guide_lang);
          setv("contact_name", R.contact_name); setv("email", R.email); setv("phone", R.phone); setv("citizenship", R.citizenship);
          setv("message", R.message ? "(" + R.ref + ") " + R.message : "(" + R.ref + ")");
          if (R.start_date && R.start_date >= sd.min) sd.value = R.start_date;
          list.innerHTML = ""; (R.travellers || []).forEach(function (t) { travRow(); var r = $$(".trav", list).pop(); ["first", "last", "gender", "dob"].forEach(function (k) { var i = $('[data-k="' + k + '"]', r); if (i && t[k]) i.value = t[k]; }); });
          syncRows(); sd.dispatchEvent(new Event("change")); sessionStorage.removeItem("mn_resubmit");
          setTimeout(function () { bf.scrollIntoView({ behavior: "smooth" }); }, 300);
        }
      } catch (e) {}
    }
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
      if (!checkCitizenship(bf)) return;
      var seen = {}, rows = $$(".trav", list), today0 = new Date().toISOString().slice(0, 10);
      for (var ri = 0; ri < rows.length; ri++) {
        var g = function (k) { return $('[data-k="' + k + '"]', rows[ri]); };
        if (!g("first").value.trim() || !g("last").value.trim() || !g("dob").value) return bad(!g("first").value.trim() ? g("first") : !g("last").value.trim() ? g("last") : g("dob"), V[1], bf);
        var dob = g("dob").value; if (dob < "1920-01-01" || dob > today0) return bad(g("dob"), V[2], bf);
        var key = (g("first").value + "|" + g("last").value + "|" + dob).toLowerCase().replace(/\s+/g, " ").trim();
        if (seen[key]) return bad(g("first"), V[3], bf); seen[key] = 1;
      }
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
  // Services page: "from $X" taken from the admin prices (Narxlar → 8), selling price only
  var sp = document.querySelectorAll("[data-svcp]");
  if (sp.length && SB.url) fetch(SB.url + "/rest/v1/price_config?id=eq.public&select=data", { headers: hdr() })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      var d = rows && rows[0] && rows[0].data && rows[0].data.svcPrice || {};
      sp.forEach(function (el) {
        var x = d[el.getAttribute("data-svcp")];
        if (x && x.brutto > 0) { el.textContent = el.getAttribute("data-tpl").replace("{n}", Math.round(x.brutto).toLocaleString("en")); el.hidden = false; }
      });
    }).catch(function () {});
})();
