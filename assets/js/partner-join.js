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
  function citySel(label) {
    return '<label class="mf-f"><span>' + esc(label) + ' *</span><select name="city" required><option value=""></option>' +
      CITIES.map(function (c) { return '<option value="' + esc(c[1]) + '">' + esc(window.MNCities.label(c[0], CL)) + '</option>'; }).join("") + '</select></label>';
  }
  function cityChips(label, req) {
    return '<div class="mf-f mf-f--full"><span>' + esc(label) + (req ? " *" : "") + '</span><div class="pchips jf-cities"' + (req ? ' data-req="1"' : '') + '>' +
      CITIES.map(function (c) { return '<label><input type="checkbox" name="cities_x" value="' + esc(c[1]) + '"> ' + esc(window.MNCities.label(c[0], CL)) + '</label>'; }).join("") + '</div></div>';
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
      fld("home_area", ho ? J.area_h : J.area, 1, "text", ' maxlength="120"') + fld("home_address", J.addr, 1, "text", ' maxlength="250"') + fld("languages", J.languages, g || ot, "text", ' maxlength="200"') +
      (ho ? fld("inn", J.inn, 1, "text", ' maxlength="30"') + fld("license_no", J.license.hotel, 0, "text", ' maxlength="80"') + fld("hotel_stars", J.stars, 0, "number", ' min="0" max="5"') + fld("hotel_rooms", J.rooms, 1, "number", ' min="1" max="999"')
          : fld("license_no", J.license[kind], g || dr, "text", ' maxlength="80"') + fld("experience_years", J.exp, g || dr, "number", ' min="0" max="60"')) +
      (dr ? fld("vehicle_type", J.vtype, 1, "text", ' maxlength="60"') + fld("vehicle_seats", J.vseats, 1, "number", ' min="1" max="60"') + fld("vehicle_year", J.vyear, 1, "number", ' min="1990" max="2030"') : "") +
      (ot ? fld("spec", J.spec, 1, "text", ' maxlength="60"') + fld("inn", J.inn, 0, "text", ' maxlength="30"') : "") +
      fld("price_day", J.price[kind], 1, "number", ' min="1" max="5000"') + fld("bio", J.bio[kind], 1, "textarea") + '</div></fieldset>' +
      '<fieldset><legend>' + esc(J.sec_photo) + '</legend>' + slots.map(function (s) {
        var t = J.ph[s[0]], hint = typeof t[1] === "string" ? t[1] : t[1][kind];
        return '<label class="jf-ph"><b>' + esc(t[0]) + ' *</b><small>' + esc(hint) + (s[1] > 1 ? ' — ' + esc(J.min) + ' ' + s[1] : '') + '</small>' +
          '<input type="file" accept="image/*" data-slot="' + s[0] + '" data-min="' + s[1] + '"' + (s[1] > 1 ? " multiple" : "") + '><span class="jf-cnt" data-cnt="' + s[0] + '">0 / ' + s[1] + '</span><span class="jf-thumbs" data-th="' + s[0] + '"></span></label>';
      }).join("") + '</fieldset>' +
      '<fieldset><legend>' + esc(J.sec_login) + '</legend><div class="mf-grid">' + fld("email", J.email, 1, "email", ' maxlength="160" autocomplete="email"') +
      fld("password", J.password, 1, "password", ' minlength="8" maxlength="72" autocomplete="new-password"') + '</div><p class="jf-note" style="margin:6px 0 0">' + esc(J.login_note) + '</p></fieldset>' +
      '<label class="jf-agree"><input type="checkbox" name="a1" required> ' + esc(J.agree1) + '</label><label class="jf-agree"><input type="checkbox" name="a2" required> ' + esc(J.agree2) + '</label>' +
      '<div class="mf-msg" role="status"></div><div class="jf-prog"><i></i></div><button class="btn btn--gold" type="submit">' + esc(J.send) + '</button></form>';
    body.innerHTML = f; open();
    var fm = $("#jn-form");
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
    try {
      var img = await createImageBitmap(file), s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var b = await new Promise(function (r) { c.toBlob(r, "image/webp", 0.85); });
      return b ? new File([b], (file.name || "photo").replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }) : file;
    } catch (e) { return file; }
  }
  async function up(tok, bucket, pid, file, tag) {
    var path = pid + "/" + tag + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + ".webp";
    var r = await fetch(SB.url + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: H(tok, { "Content-Type": file.type || "image/webp", "x-upsert": "false" }), body: file });
    if (!r.ok) throw new Error("upload " + r.status + " " + (await r.text()).slice(0, 120)); return path;
  }
  // "@name", "name", "t.me/name", "https://t.me/name" → "@name"; phone numbers kept as "+998…"
  function normTg(v) {
    v = String(v || "").trim().replace(/^https?:\/\//i, "").replace(/^(t\.me|telegram\.me)\//i, "").replace(/\s+/g, "");
    if (/^\+?\d[\d\-()]{8,}$/.test(v)) return "+" + v.replace(/\D/g, "");
    v = v.replace(/^@/, ""); return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v) ? "@" + v : "";
  }
  function list(v) { return String(v || "").split(/[,;]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12); }
  async function submit(kind, fm) {
    var miss = $$("[required]", fm).filter(function (i) { return i.type === "checkbox" ? !i.checked : !String(i.value).trim() || (i.minLength > 0 && i.value.length < i.minLength) || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value.trim())); })
      .map(function (i) { var l = i.closest("label"); return l ? (l.querySelector("span") || l).textContent.replace(/\s*\*$/, "").trim() : i.name; });
    var cc = $(".jf-cities[data-req]", fm); if (cc && !$$("input:checked", cc).length) miss.push(cc.parentNode.querySelector("span").textContent.replace(/\s*\*$/, ""));
    var tgv = normTg(fm.elements.telegram.value); if (!miss.length && !tgv) { msg(fm, J.tg_bad, "err"); fm.elements.telegram.focus(); return; }
    if (miss.length) { msg(fm, J.need + " " + miss.slice(0, 4).join(", ") + (miss.length > 4 ? "…" : ""), "err"); return; }
    var ph = $$("input[type=file]", fm).filter(function (i) { return i.files.length < +i.getAttribute("data-min"); })
      .map(function (i) { return J.ph[i.getAttribute("data-slot")][0] + " (" + i.files.length + "/" + i.getAttribute("data-min") + ")"; });
    if (ph.length) { msg(fm, J.need_ph + " " + ph.join(", "), "err"); return; }
    var btn = $("button[type=submit]", fm), bar = $(".jf-prog", fm); btn.disabled = true; bar.style.display = "block"; msg(fm, J.sending);
    var v = function (n) { var el = fm.elements[n]; return el ? String(el.value).trim() : ""; };
    try {
      var email = v("email").replace(/\s+/g, "").toLowerCase();
      var meta = { partner_kind: kind, partner_name: v("name"), phone: v("phone"), whatsapp: v("whatsapp"), city: v("city"), license_no: v("license_no"), company: kind === "hotel" ? v("name") : "", inn: v("inn") };
      var r = await fetch(SB.url + "/auth/v1/signup", { method: "POST", headers: H(null, { "Content-Type": "application/json" }), body: JSON.stringify({ email: email, password: fm.elements.password.value, data: meta }) });
      var a = await r.json().catch(function () { return {}; });
      if (!r.ok) { var em = (a.msg || a.message || a.error_description || "") + ""; throw new Error(/already|registered|exists/i.test(em + (a.error_code || "")) ? J.exists : em || r.status); }
      var tok = a.access_token, uid = a.user && a.user.id;
      if (!tok || !uid) throw new Error(J.exists);
      var pid = null;
      for (var i = 0; i < 3 && !pid; i++) {
        var pr = await fetch(SB.url + "/rest/v1/partners?select=id&user_id=eq." + uid, { headers: H(tok) }); var rows = pr.ok ? await pr.json() : [];
        pid = rows[0] && rows[0].id; if (!pid) await new Promise(function (ok) { setTimeout(ok, 900); });
      }
      if (!pid) throw new Error("partner row");
      var files = []; $$("input[type=file]", fm).forEach(function (inp) { [].slice.call(inp.files).forEach(function (f) { files.push([inp.getAttribute("data-slot"), f]); }); });
      var done = 0, photo = null, photos = [], docs = [];
      for (var k = 0; k < files.length; k++) {
        var slot = files[k][0], fl = await resize(files[k][1], slot === "main" ? 1400 : 1600);
        var pub = slot === "main" || ((slot === "solo" || slot === "car" || slot === "rooms") && photos.length < 8);
        var path = await up(tok, pub ? "partner-photos" : "partner-docs", pid, fl, slot);
        if (slot === "main") photo = path; else if (pub) photos.push(path);
        else docs.push({ kind: slot === "trip" ? "trip" : "extra", path: path, name: files[k][1].name || slot, at: new Date().toISOString() });
        done++; $("i", bar).style.width = Math.round(done / files.length * 100) + "%";
      }
      var p = { telegram: normTg(v("telegram")), name: v("name"), company: meta.company, inn: v("inn"), license_no: v("license_no"), phone: v("phone"), whatsapp: v("whatsapp"), city: v("city"),
        cities: $$("[name=cities_x]:checked", fm).map(function (x) { return x.value; }), languages: list(v("languages")), specialties: v("spec") ? [v("spec")] : [], bio: v("bio"), photo: photo, photos: photos,
        price_day: v("price_day"), price_note: "", vehicle_type: v("vehicle_type"), vehicle_seats: v("vehicle_seats"), vehicle_year: v("vehicle_year"),
        hotel_stars: v("hotel_stars"), hotel_rooms: v("hotel_rooms"), experience_years: v("experience_years"), docs: docs,
        birth_year: v("birth_year"), home_area: v("home_area"), home_address: v("home_address") };
      var s = await fetch(SB.url + "/rest/v1/rpc/partner_save", { method: "POST", headers: H(tok, { "Content-Type": "application/json" }), body: JSON.stringify({ p: p }) });
      if (!s.ok) throw new Error("save " + s.status + " " + (await s.text()).slice(0, 160));
      if (window.MN_TRACK) try { window.MN_TRACK("partner_apply", kind); } catch (x) {}
      var base = document.documentElement.getAttribute("data-base") || "";
      body.innerHTML = '<div class="jf-done"><b>✓</b><h3>' + esc(J.done_t) + '</h3><p class="jf-note">' + esc(J.done) + '</p><a class="btn btn--gold" href="' + base + 'partner/">' + esc(J.cab) + '</a></div>';
    } catch (err) {
      btn.disabled = false; bar.style.display = "none"; msg(fm, (String(err.message) === J.exists ? "" : J.err) + err.message, "err");
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-join]"); if (!b) return;
    e.preventDefault(); var k = b.getAttribute("data-join"); k ? form(k) : chooser();
  });
  if (location.hash === "#join") setTimeout(function () { D.kind ? form(D.kind) : chooser(); }, 400);
})();
