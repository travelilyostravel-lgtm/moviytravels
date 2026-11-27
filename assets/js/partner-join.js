/* Moviy Nomad — "Gid bo'lish" / partner application right on the Guides, Transport, Hotels and Partners pages.
   Creates the partner account (e-mail + password), uploads the photos and saves the profile — status stays "pending"
   until the founder approves it in Admin → Hamkorlar. Photos with travellers go to the PRIVATE bucket. */
(function () {
  var SB = window.MN_SB || {}, D = window.MNJ; if (!D || !SB.url) return;
  var J = D.J, modal = document.getElementById("jn-modal"), body = document.getElementById("jn-body"); if (!modal) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function H(tok, x) { var h = { apikey: SB.anonKey, Authorization: "Bearer " + (tok || SB.anonKey) }; for (var k in x || {}) h[k] = x[k]; return h; }
  function open() { modal.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function close() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }
  modal.setAttribute("data-free", "");
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".modal__close")) close(); });

  // ------------------------------------------------------------ step 1: who are you (only on the "all partners" page)
  function chooser() {
    body.innerHTML = '<div class="jf"><h3>' + esc(J.choose) + '</h3><p class="jf-note">' + esc(J.note) + '</p><div class="pt-tiles" style="grid-template-columns:repeat(2,1fr)">' +
      ["guide", "driver", "hotel", "other"].map(function (k) { return '<button type="button" class="pt-tile" data-jk="' + k + '" style="aspect-ratio:auto;padding:22px 16px"><b>' + esc(J.kinds[k]) + '</b></button>'; }).join("") + '</div></div>';
    $$("[data-jk]", body).forEach(function (b) { b.onclick = function () { form(b.getAttribute("data-jk")); }; });
    open();
  }

  // ------------------------------------------------------------ step 2: the form
  var CL = D.lang === "ru" ? "ru" : "uz", CITIES = (window.MNCities && window.MNCities.list) || [];
  function langPick(label, req) {
    var LL = (window.MNLangs && window.MNLangs.list) || [];
    return '<div class="mf-f mf-f--full"><span>' + esc(label.replace(/\s*\(.*\)\s*$/, "")) + (req ? " *" : "") + '</span><div class="pchips jf-cities jf-langs"' + (req ? ' data-req="1"' : '') + '>' +
      LL.map(function (l) { return '<label><input type="checkbox" name="lang_x" value="' + esc(window.MNLangs.label(l[0], "en")) + '"> ' + l[1] + ' ' + esc(window.MNLangs.label(l[0], D.lang)) + '</label>'; }).join("") +
      '</div><input name="languages" maxlength="200" placeholder="+ ' + esc(D.lang === "ru" ? "другие языки" : D.lang === "uz" ? "boshqa tillar" : "other languages") + '" style="margin-top:6px"></div>';
  }
  function citySel(label) {
    return '<label class="mf-f"><span>' + esc(label) + ' *</span><select name="city" required><option value=""></option>' +
      CITIES.map(function (c) { return '<option value="' + esc(c[1]) + '">' + esc(window.MNCities.label(c[0], CL)) + '</option>'; }).join("") + '</select></label>';
  }
  function cityChips(label, req) {
    return '<div class="mf-f mf-f--full"><span>' + esc(label) + (req ? " *" : "") + '</span><div class="pchips jf-cities"' + (req ? ' data-req="1"' : '') + '>' +
      CITIES.map(function (c) { return '<label><input type="checkbox" name="cities_x" value="' + esc(c[1]) + '"> ' + esc(window.MNCities.label(c[0], CL)) + '</label>'; }).join("") + '</div></div>';
  }
  function opts(o, sel) { return Object.keys(o).map(function (k) { return '<option value="' + esc(k) + '"' + (k === sel ? " selected" : "") + '>' + esc(o[k]) + '</option>'; }).join(""); }
  function uf(n, label, type, extra, full) { return '<label class="mf-f"' + (full ? ' style="grid-column:1/-1"' : '') + '><span>' + esc(label) + '</span><input data-u="' + n + '" type="' + (type || "text") + '"' + (extra || "") + '></label>'; }
  function unitRow(room) {
    return '<div class="jf-unit" style="border:1px solid var(--line,#e5e0d5);border-radius:14px;padding:12px;margin:0 0 10px"><div class="mf-grid">' +
      (room
        ? '<label class="mf-f"><span>' + esc(J.r_class) + '</span><select data-u="class">' + opts(J.rc, "standard") + '</select></label>' + uf("name", J.r_name, "text", ' maxlength="120"') +
          uf("capacity", J.r_cap, "number", ' min="1" max="20" value="2"') + '<label class="mf-f"><span>' + esc(J.r_beds) + '</span><select data-u="beds">' + opts(J.beds, "1 double") + '</select></label>' +
          uf("qty", J.r_qty, "number", ' min="1" max="999" value="1"') + uf("price_netto", J.r_price + " *", "number", ' min="1" max="20000"') +
          '<label class="mf-f"><span>&nbsp;</span><span style="font-weight:500"><input type="checkbox" data-u="breakfast" checked> ' + esc(J.r_bf) + '</span></label>'
        : '<label class="mf-f"><span>' + esc(J.v_class) + '</span><select data-u="class">' + opts(J.vc, "comfort") + '</select></label>' + uf("name", J.v_model + " *", "text", ' maxlength="120" placeholder="Chevrolet Malibu"') +
          uf("capacity", J.v_seats, "number", ' min="1" max="60" value="4"') + uf("luggage", J.v_lug, "number", ' min="0" max="60" value="3"') + uf("year", J.v_year, "number", ' min="1990" max="2030"') +
          uf("plate", J.v_plate, "text", ' maxlength="20" placeholder="01 A 123 BC"') + uf("price_netto", J.v_day + " *", "number", ' min="1" max="20000"') + uf("price_transfer", J.v_tr, "number", ' min="1" max="5000"') +
          '<label class="mf-f"><span>&nbsp;</span><span style="font-weight:500"><input type="checkbox" data-u="ac" checked> ' + esc(J.v_ac) + '</span></label>') +
      '</div><button type="button" class="btn btn--outline btn--sm" data-udel style="margin-top:6px">✕ ' + esc(J.unit_del) + '</button></div>';
  }
  var USD_BAD = { uz: "Narxni AQSH dollarida yozing (masalan: 45). So'mdagi narx qabul qilinmaydi — uni dollarga aylantirib yozing.", ru: "Укажите цену в долларах США (например: 45). Цена в сумах не принимается — переведите её в доллары.", en: "Enter the price in US dollars (e.g. 45), not in local currency." };
  function usdBad(units) { return units.some(function (u) { return u.price_netto > (u.unit_kind === "room" ? 1500 : 3000) || (u.price_transfer || 0) > 1000; }); }
  function usdMsg() { var l = (document.documentElement.lang || "en").slice(0, 2); return USD_BAD[l] || USD_BAD.en; }
  function readUnits(fm, room) {
    return $$(".jf-unit", fm).map(function (u, i) {
      var g = function (n) { var el = u.querySelector('[data-u="' + n + '"]'); return el ? (el.type === "checkbox" ? el.checked : String(el.value).trim()) : ""; };
      var num = function (n) { var x = parseFloat(g(n)); return isNaN(x) ? null : x; };
      var name = g("name") || (room ? J.rc[g("class")] : "");
      return { unit_kind: room ? "room" : "vehicle", class: g("class"), name: name, capacity: num("capacity"), beds: room ? g("beds") : null, qty: num("qty") || 1,
        luggage: room ? null : num("luggage"), year: room ? null : num("year"), plate: room ? null : g("plate"), ac: room ? true : !!g("ac"), breakfast: room ? !!g("breakfast") : false,
        price_netto: num("price_netto"), price_transfer: room ? null : num("price_transfer"), sort: i };
    }).filter(function (x) { return x.name && x.price_netto > 0; });
  }
  function fld(name, label, req, type, extra) {
    return '<label class="mf-f' + (type === "textarea" ? " mf-f--full" : "") + '"><span>' + esc(label) + (req ? " *" : "") + '</span>' +
      (type === "textarea" ? '<textarea name="' + name + '" rows="4" maxlength="1500"' + (req ? " required" : "") + '></textarea>'
        : '<input name="' + name + '" type="' + (type || "text") + '"' + (req ? " required" : "") + (extra || "") + '>') + '</label>';
  }
  function form(kind) {
    var slots = D.SLOTS[kind], g = kind === "guide", dr = kind === "driver", ho = kind === "hotel", ot = kind === "other";
    var f = '<form class="jf mf" id="jn-form" novalidate data-noreg><h3>' + esc(J.title[kind]) + '</h3><p class="jf-note">' + esc(J.note) + '</p>' +
      '<details style="margin:0 0 14px"><summary style="cursor:pointer;font-weight:700;color:var(--navy)">' + esc(J.req_t) + ' (' + D.REQ[kind].length + ')' + '</summary><ol style="font-size:13.5px;line-height:1.5;margin:8px 0 0">' + D.REQ[kind].map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ol></details>' +
      '<fieldset><legend>' + esc(J.sec_about) + '</legend><div class="mf-grid">' +
      fld("name", J.name[kind], 1, "text", ' maxlength="120"') + fld("phone", J.phone, 1, "tel", ' maxlength="40" placeholder="+998"') + fld("telegram", J.tg, 1, "text", ' maxlength="64" placeholder="@username"') +
      fld("whatsapp", J.whatsapp, 0, "tel", ' maxlength="40" placeholder="+998"') + citySel(J.city) +
      (ho ? "" : cityChips(g ? J.works : J.cities, g)) +
      (ho ? "" : fld("birth_year", J.birth, 1, "number", ' min="1940" max="' + (new Date().getFullYear() - 18) + '"')) +
      fld("home_area", ho ? J.area_h : J.area, 1, "text", ' maxlength="120"') + fld("home_address", J.addr, 1, "text", ' maxlength="250"') + langPick(J.languages, g || ot) +
      (ho ? fld("inn", J.inn, 1, "text", ' maxlength="30"') + fld("license_no", J.registry || J.license.hotel, 0, "text", ' maxlength="80"') + fld("hotel_stars", J.stars, 0, "number", ' min="0" max="5"') +
            fld("check_in", J.check_in, 0, "time", ' value="14:00"') + fld("check_out", J.check_out, 0, "time", ' value="12:00"') + fld("map_url", J.map_url, 0, "url", ' maxlength="400" placeholder="https://maps.google.com/…"')
          : fld("license_no", J.license[kind], g || dr, "text", ' maxlength="80"') + fld("experience_years", J.exp, g || dr, "number", ' min="0" max="60"')) +
      (dr ? '<label class="mf-f"><span>' + esc(J.ctype) + ' *</span><select name="company_type" required><option value="person">' + esc(J.ct.person) + '</option><option value="company">' + esc(J.ct.company) + '</option></select></label>' + fld("inn", J.inn, 0, "text", ' maxlength="30"') : "") +
      (ot ? fld("spec", J.spec, 1, "text", ' maxlength="60"') + fld("inn", J.inn, 0, "text", ' maxlength="30"') : "") +
      (ho || dr || g ? "" : fld("price_day", J.price[kind], 1, "number", ' min="1" max="5000"')) + fld("bio", J.bio[kind], 1, "textarea") +
      (ho ? fld("policies", J.policies, 0, "textarea") : "") + '</div></fieldset>' +
      (g ? '<fieldset><legend>' + esc(J.sec_rates) + '</legend><p class="jf-note">' + esc(J.rates_note) + '</p><div class="mf-grid">' +
        '<label class="mf-f"><span>' + esc(J.gcat) + '</span><select name="guide_cat">' + Object.keys(J.gcats).map(function (k) { return '<option value="' + k + '">' + esc(J.gcats[k]) + '</option>'; }).join("") + '</select></label>' +
        fld("price_day", J.r_full, 1, "number", ' min="1" max="5000"') + fld("r_half_day", J.r_half, 0, "number", ' min="0" max="5000"') + fld("r_extra_hour", J.r_hour, 0, "number", ' min="0" max="1000"') +
        fld("r_meet", J.r_meet, 0, "number", ' min="0" max="1000"') + fld("r_out_of_town", J.r_out, 0, "number", ' min="0" max="5000"') + fld("r_tour_day", J.r_tour, 0, "number", ' min="0" max="5000"') + fld("r_big_group", J.r_big, 0, "number", ' min="0" max="1000"') +
        '</div></fieldset>' : "") +
      (ho ? '<fieldset><legend>' + esc(J.sec_amen) + '</legend><div class="pchips jf-cities">' + Object.keys(J.amen).map(function (k) { return '<label><input type="checkbox" name="amen_x" value="' + k + '"> ' + esc(J.amen[k]) + '</label>'; }).join("") + '</div></fieldset>' : "") +
      (ho || dr ? '<fieldset><legend>' + esc(ho ? J.sec_rooms : J.sec_cars) + '</legend><p class="jf-note">' + esc(J.netto_note) + '</p><div class="jf-units" id="jf-units"></div>' +
        '<button type="button" class="btn btn--outline btn--sm" id="jf-add">' + esc(ho ? J.room_add : J.car_add) + '</button></fieldset>' : "") +
      '<fieldset><legend>' + esc(J.sec_photo) + '</legend>' + slots.map(function (s) {
        var t = J.ph[s[0]], hint = typeof t[1] === "string" ? t[1] : t[1][kind];
        return '<label class="jf-ph"><b>' + esc(t[0]) + ' *</b><small>' + esc(hint) + (s[1] > 1 ? ' — ' + esc(J.min) + ' ' + s[1] : '') + '</small>' +
          '<input type="file" accept="image/*" data-slot="' + s[0] + '" data-min="' + s[1] + '"' + (s[1] > 1 ? " multiple" : "") + '><span class="jf-cnt" data-cnt="' + s[0] + '">0 / ' + s[1] + '</span><span class="jf-thumbs" data-th="' + s[0] + '"></span></label>';
      }).join("") + '</fieldset>' +
      '<fieldset><legend>' + esc(J.sec_login) + '</legend><div class="mf-grid">' + fld("email", J.email, 1, "email", ' maxlength="160" autocomplete="email"') +
      fld("password", J.pw_opt || J.password, 0, "password", ' minlength="8" maxlength="72" autocomplete="new-password"') + '</div><p class="jf-note" style="margin:6px 0 0">' + esc(J.login_note2 || J.login_note) + '</p></fieldset>' +
      '<label class="jf-agree"><input type="checkbox" name="a1" required> ' + esc(J.agree1) + '</label><label class="jf-agree"><input type="checkbox" name="a2" required> ' + esc(J.agree2) + '</label>' +
      '<div class="mf-msg" role="status"></div><div class="jf-prog"><i></i></div><button class="btn btn--gold" type="submit">' + esc(J.send) + '</button></form>';
    body.innerHTML = f; open();
    var fm = $("#jn-form");
    if (ho || dr) { var add = function () { $("#jf-units", fm).insertAdjacentHTML("beforeend", unitRow(ho)); }; add(); $("#jf-add", fm).onclick = add;
      $("#jf-units", fm).addEventListener("click", function (e) { var d = e.target.closest("[data-udel]"); if (d && $$(".jf-unit", fm).length > 1) d.closest(".jf-unit").remove(); }); }
    $$("input[type=file]", fm).forEach(function (inp) {
      inp.onchange = function () {
        var s = inp.getAttribute("data-slot"), n = inp.files.length, m = +inp.getAttribute("data-min"), c = $('[data-cnt="' + s + '"]', fm);
        c.textContent = n + " / " + m + " " + J.sel; c.classList.toggle("ok", n >= m);
        $('[data-th="' + s + '"]', fm).innerHTML = [].slice.call(inp.files, 0, 14).map(function (x) { return '<img alt="" src="' + URL.createObjectURL(x) + '">'; }).join("");
      };
    });
    fm.onsubmit = function (e) { e.preventDefault(); submit(kind, fm); };
  }

  // ------------------------------------------------------------ step 3: send
  function msg(fm, t, cls) { var m = $(".mf-msg", fm); m.textContent = t; m.className = "mf-msg" + (cls ? " is-" + cls : ""); }
  async function resize(file, max) {
    // 1) createImageBitmap; 2) if the phone browser can't, load it as an <img>; 3) if both fail, send the original
    var src = null;
    try { src = await createImageBitmap(file); } catch (e) {
      try { src = await new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = URL.createObjectURL(file); }); } catch (e2) { src = null; }
    }
    if (!src) return file;
    try {
      var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, s = Math.min(1, max / Math.max(w, h));
      var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
      c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
      var b = await new Promise(function (r) { c.toBlob(r, "image/webp", 0.8); });
      if (!b || b.type !== "image/webp") b = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.82); });   // old Safari: no WebP encoder
      return b ? new File([b], (file.name || "photo").replace(/\.\w+$/, "") + (b.type === "image/jpeg" ? ".jpg" : ".webp"), { type: b.type }) : file;
    } catch (e) { return file; }
  }

  async function up(tok, bucket, pid, file, tag) {
    var path = pid + "/" + tag + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + (file.type === "image/jpeg" ? ".jpg" : file.type === "image/png" ? ".png" : ".webp");
    var r = await fetch(SB.url + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: H(tok, { "Content-Type": file.type || "image/webp", "x-upsert": "false" }), body: file });
    if (!r.ok) throw new Error("upload " + r.status + " " + (await r.text()).slice(0, 120)); return path;
  }
  // "@name", "name", "t.me/name", "https://t.me/name" → "@name"; phone numbers kept as "+998…"
  function normTg(v) {
    v = String(v || "").trim().replace(/^https?:\/\//i, "").replace(/^(t\.me|telegram\.me)\//i, "").replace(/\s+/g, "");
    if (/^\+?\d[\d\-()]{8,}$/.test(v)) return "+" + v.replace(/\D/g, "");
    v = v.replace(/^@/, ""); return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v) ? "@" + v : "";
  }
  function v0(fm, n) { var el = fm.elements[n]; return el ? String(el.value).trim() : ""; }
  function list(v) { return String(v || "").split(/[,;]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12); }
  async function submit(kind, fm) {
    var miss = $$("[required]", fm).filter(function (i) { return i.type === "checkbox" ? !i.checked : !String(i.value).trim() || (i.minLength > 0 && i.value.length < i.minLength) || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value.trim())); })
      .map(function (i) { var l = i.closest("label"); return l ? (l.querySelector("span") || l).textContent.replace(/\s*\*$/, "").trim() : i.name; });
    $$(".jf-cities[data-req]", fm).forEach(function (cc) { if (!$$("input:checked", cc).length && !(cc.classList.contains("jf-langs") && v0(fm, "languages"))) miss.push(cc.parentNode.querySelector("span").textContent.replace(/\s*\*$/, "")); });
    var tgv = normTg(fm.elements.telegram.value); if (!miss.length && !tgv) { msg(fm, J.tg_bad, "err"); fm.elements.telegram.focus(); return; }
    if (miss.length) { msg(fm, J.need + " " + miss.slice(0, 4).join(", ") + (miss.length > 4 ? "…" : ""), "err"); return; }
    var ph = $$("input[type=file]", fm).filter(function (i) { return i.files.length < +i.getAttribute("data-min"); })
      .map(function (i) { return J.ph[i.getAttribute("data-slot")][0] + " (" + i.files.length + "/" + i.getAttribute("data-min") + ")"; });
    if (ph.length) { msg(fm, J.need_ph + " " + ph.join(", "), "err"); return; }
    var units = (kind === "hotel" || kind === "driver") ? readUnits(fm, kind === "hotel") : [];
    if ((kind === "hotel" || kind === "driver") && !units.length) { msg(fm, J.need_unit, "err"); return; }
    if (usdBad(units)) { msg(fm, usdMsg(), "err"); var pi = $(".jf-unit [data-u=price_netto]", fm); if (pi) pi.focus(); return; }
    var pwIn = fm.elements.password.value; if (pwIn && pwIn.length < 8) { msg(fm, J.pw_opt, "err"); fm.elements.password.focus(); return; }
    var btn = $("button[type=submit]", fm), bar = $(".jf-prog", fm); btn.disabled = true; bar.style.display = "block"; msg(fm, J.sending);
    var v = function (n) { var el = fm.elements[n]; return el ? String(el.value).trim() : ""; };
    var warnLeave = function (e) { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warnLeave);
    try {
      var email = v("email").replace(/\s+/g, "").toLowerCase(), pw = fm.elements.password.value, ownPw = !!pw;
      if (!ownPw) { var rb = new Uint8Array(24); crypto.getRandomValues(rb); pw = Array.prototype.map.call(rb, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("") + "Aa1!"; }
      var meta = { partner_kind: kind, partner_name: v("name"), phone: v("phone"), whatsapp: v("whatsapp"), city: v("city"), license_no: v("license_no"), company: kind === "hotel" ? v("name") : "", inn: v("inn") };
      // 1) account: new sign-up, or — if this e-mail was already used (e.g. a first try broke half way) — sign in with the same password and continue
      var r = await fetch(SB.url + "/auth/v1/signup", { method: "POST", headers: H(null, { "Content-Type": "application/json" }), body: JSON.stringify({ email: email, password: pw, data: meta }) });
      var a = await r.json().catch(function () { return {}; });
      if (!r.ok) {
        var em = (a.msg || a.message || a.error_description || "") + "";
        if (!/already|registered|exists/i.test(em + (a.error_code || ""))) throw new Error(em || r.status);
        if (!ownPw) throw new Error(J.exists2 || J.exists);
        var li = await fetch(SB.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: H(null, { "Content-Type": "application/json" }), body: JSON.stringify({ email: email, password: pw }) });
        a = await li.json().catch(function () { return {}; });
        if (!li.ok) throw new Error(J.exists);
      }
      var tok = a.access_token, uid = a.user && a.user.id;
      if (!tok || !uid) throw new Error(J.exists);
      var pid = null, old = null;
      for (var i = 0; i < 4 && !pid; i++) {
        var pr = await fetch(SB.url + "/rest/v1/partners?select=id,photo,photos,docs&user_id=eq." + uid, { headers: H(tok) }); var rows = pr.ok ? await pr.json() : [];
        old = rows[0] || null; pid = old && old.id; if (!pid) await new Promise(function (ok) { setTimeout(ok, 900); });
      }
      if (!pid) throw new Error(J.exists);
      var p = { telegram: normTg(v("telegram")), name: v("name"), company: meta.company, inn: v("inn"), license_no: v("license_no"), phone: v("phone"), whatsapp: v("whatsapp"), city: v("city"),
        cities: $$("[name=cities_x]:checked", fm).map(function (x) { return x.value; }), languages: $$("[name=lang_x]:checked", fm).map(function (x) { return x.value; }).concat(list(v("languages"))).slice(0, 12), specialties: v("spec") ? [v("spec")] : [], bio: v("bio"),
        photo: old.photo || null, photos: old.photos || [], docs: old.docs || [],
        price_day: units.length ? String(Math.min.apply(null, units.map(function (u) { return u.price_netto; }))) : v("price_day"), price_note: "",
        vehicle_type: kind === "driver" ? units[0].name : v("vehicle_type"), vehicle_seats: kind === "driver" ? String(units[0].capacity || "") : v("vehicle_seats"), vehicle_year: kind === "driver" ? String(units[0].year || "") : v("vehicle_year"),
        hotel_stars: v("hotel_stars"), hotel_rooms: kind === "hotel" ? String(units.reduce(function (s, u) { return s + (u.qty || 1); }, 0)) : v("hotel_rooms"), experience_years: v("experience_years"),
        birth_year: v("birth_year"), home_area: v("home_area"), home_address: v("home_address"),
        resubmit: true };   // a rejected partner who fills the form again sends the application back for review
      var save = async function () {
        var sv = await fetch(SB.url + "/rest/v1/rpc/partner_save", { method: "POST", headers: H(tok, { "Content-Type": "application/json" }), body: JSON.stringify({ p: p }) });
        if (!sv.ok) throw new Error("save " + sv.status + " " + (await sv.text()).slice(0, 160));
      };
      // 2) save the text first — nothing typed is lost even if the photos fail later
      await save();
      if (kind === "guide") {
        var rt = { full_day: v("price_day") }; ["half_day", "extra_hour", "meet", "out_of_town", "tour_day", "big_group"].forEach(function (k) { var x = v("r_" + k); if (x !== "") rt[k] = x; });
        await fetch(SB.url + "/rest/v1/rpc/partner_save_rates", { method: "POST", headers: H(tok, { "Content-Type": "application/json" }), body: JSON.stringify({ p: rt }) });
        await fetch(SB.url + "/rest/v1/rpc/partner_save_extra", { method: "POST", headers: H(tok, { "Content-Type": "application/json" }), body: JSON.stringify({ p: { guide_cat: v("guide_cat") } }) });
      }
      if (kind === "hotel" || kind === "driver") {
        var ex = { amenities: $$("[name=amen_x]:checked", fm).map(function (x) { return x.value; }), check_in: v("check_in"), check_out: v("check_out"), map_url: v("map_url"), policies: v("policies"),
                   company_type: v("company_type"), registry_no: kind === "hotel" ? v("license_no") : "" };
        await fetch(SB.url + "/rest/v1/rpc/partner_save_extra", { method: "POST", headers: H(tok, { "Content-Type": "application/json" }), body: JSON.stringify({ p: ex }) });
        // rooms / vehicles: replace what an earlier half-finished try left (only pending ones)
        await fetch(SB.url + "/rest/v1/partner_units?partner_id=eq." + pid + "&status=eq.pending", { method: "DELETE", headers: H(tok) });
        var ur = await fetch(SB.url + "/rest/v1/partner_units", { method: "POST", headers: H(tok, { "Content-Type": "application/json", Prefer: "return=minimal" }),
          body: JSON.stringify(units.map(function (u) { u.partner_id = pid; return u; })) });
        if (!ur.ok) throw new Error("units " + ur.status + " " + (await ur.text()).slice(0, 160));
      }
      // 3) photos: 3 at a time, each tried up to 3 times; the profile is saved again after each finished photo
      var files = []; $$("input[type=file]", fm).forEach(function (inp) { [].slice.call(inp.files).forEach(function (f) { files.push([inp.getAttribute("data-slot"), f]); }); });
      var done = 0, failed = 0, next = 0, pubCount = p.photos.length, dirty = false;
      var one = async function (slot, file) {
        var fl = await resize(file, slot === "main" ? 1280 : 1400), isPub = slot === "main" || (slot !== "lic" && slot !== "tech" && pubCount < 30);
        if (isPub && slot !== "main") pubCount++;
        for (var t = 0; t < 3; t++) {
          try {
            var path = await up(tok, isPub ? "partner-photos" : "partner-docs", pid, fl, slot);
            if (slot === "main") p.photo = path; else if (isPub) p.photos.push(path);
            else p.docs.push({ kind: slot === "trip" ? "trip" : slot === "lic" ? "license" : slot === "tech" ? "vehicle" : "extra", path: path, name: file.name || slot, at: new Date().toISOString() });
            dirty = true; return true;
          } catch (e) { await new Promise(function (ok) { setTimeout(ok, 1500 * (t + 1)); }); }
        }
        if (isPub && slot !== "main") pubCount--;
        return false;
      };
      var worker = async function () {
        while (next < files.length) {
          var f = files[next++], ok = await one(f[0], f[1]);
          done++; if (!ok) failed++;
          $("i", bar).style.width = Math.round(done / files.length * 100) + "%"; msg(fm, J.sending + " " + done + " / " + files.length);
          if (dirty && done % 3 === 0) { dirty = false; try { await save(); } catch (e) {} }
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      await save();
      window.removeEventListener("beforeunload", warnLeave);
      if (window.MN_TRACK) try { window.MN_TRACK("partner_apply", kind); } catch (x) {}
      var base = document.documentElement.getAttribute("data-base") || "";
      body.innerHTML = '<div class="jf-done"><b>✓</b><h3>' + esc(J.done_t) + '</h3><p class="jf-note">' + esc(J.done) + '</p>' +
        (failed ? '<p class="jf-note" style="color:#b4541b;font-weight:600">⚠ ' + esc(J.part.replace("{n}", failed)) + '</p>' : '') +
        (D.group ? '<div class="jf-grp" style="margin:16px 0;padding:16px;border:2px solid #2aabee;border-radius:16px;background:#f2faff;text-align:left"><b style="font-size:16px">✈️ ' + esc(J.grp_t) + '</b><p class="jf-note" style="margin:6px 0 12px">' + esc(J.grp) + '</p>' +
          '<a class="btn" style="background:#2aabee;color:#fff" href="' + esc(D.group) + '" target="_blank" rel="noopener" data-free>' + esc(J.grp_btn) + '</a></div>' : '') +
        '<a class="btn btn--gold" href="' + base + 'partner/">' + esc(J.cab) + '</a></div>';
    } catch (err) {
      window.removeEventListener("beforeunload", warnLeave);
      btn.disabled = false; bar.style.display = "none"; msg(fm, (String(err.message) === J.exists ? "" : J.err + " ") + err.message + (String(err.message) === J.exists ? "" : " — " + J.retry), "err");
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-join]"); if (!b) return;
    e.preventDefault(); var k = b.getAttribute("data-join"); k ? form(k) : chooser();
  });
  if (location.hash === "#join") setTimeout(function () { D.kind ? form(D.kind) : chooser(); }, 400);
})();
