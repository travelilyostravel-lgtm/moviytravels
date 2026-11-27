/* Moviy Nomad — admin: Restaurants (2026-11-27). The list comes from OpenStreetMap by itself (weekly, per region).
   Here staff add photos and a menu, confirm "halal", fix the cuisine type, pin a place to the top, hide it, or add a place by hand. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var REG = { tashkent_city: "Toshkent shahri", samarkand: "Samarqand", bukhara: "Buxoro", khorezm: "Xiva / Xorazm", tashkent: "Toshkent viloyati", fergana: "Farg'ona", andijan: "Andijon",
    namangan: "Namangan", kashkadarya: "Qashqadaryo", surkhandarya: "Surxondaryo", navoi: "Navoiy", jizzakh: "Jizzax", syrdarya: "Sirdaryo", karakalpakstan: "Qoraqalpog'iston" };
  var CAT = { national: "🍲 Milliy", european: "🍝 Yevropa", asian: "🍜 Osiyo", middle: "🥙 Turk / Sharq", fastfood: "🍔 Fast-fud", cafe: "☕ Kafe", other: "🍽 Boshqa" };
  var st = { region: "tashkent_city", q: "", f: "" };
  function nm(o) { o = o || {}; return o.uz || o["default"] || o.en || o.ru || ""; }
  A.food = async function () {
    A.show("food");
    var box = $("#v-food"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var u = sb.from("restaurants").select("id,source,region,name,cat,cuisine,halal,halal_ok,address,phone,photos,menu,pinned,hidden,score").eq("region", st.region);
    if (st.q) u = u.ilike("name->>default", "%" + st.q + "%");
    if (st.f === "photos") u = u.neq("photos", "{}"); if (st.f === "pinned") u = u.eq("pinned", true); if (st.f === "hidden") u = u.eq("hidden", true);
    if (st.f === "halal") u = u.eq("halal_ok", true); if (st.f === "manual") u = u.eq("source", "manual");
    var r = await u.order("pinned", { ascending: false }).order("score", { ascending: false }).limit(60);
    var reg = (await sb.from("food_regions").select("region,fetched_at,last_count")).data || [];
    if (r.error) { box.innerHTML = '<div class="p-card">Xatolik: ' + esc(r.error.message) + '</div>'; return; }
    box.innerHTML = '<div class="p-card"><h2 style="margin:0 0 4px">🍽 Restoranlar</h2>' +
      '<p class="p-sub">Ro\'yxat <b>OpenStreetMap</b> dan har hafta o\'zi yangilanadi (har soatda bitta viloyat). Siz rasm, menyu, «halol tasdiqlangan» belgisini qo\'shasiz, oshxona turini to\'g\'rilaysiz, yaxshi joylarni 📌 tepaga chiqarasiz. Saytda: <a href="../uz/food.html" target="_blank">moviy-travel.uz/uz/food.html</a></p>' +
      '<div class="filters" style="flex-wrap:wrap"><select id="fa-reg" style="padding:7px 10px;border-radius:10px">' + Object.keys(REG).map(function (k) {
        var x = reg.filter(function (y) { return y.region === k; })[0] || {}; return '<option value="' + k + '"' + (k === st.region ? " selected" : "") + '>' + REG[k] + (x.last_count ? " (" + x.last_count + ")" : " (yuklanmoqda…)") + '</option>'; }).join("") + '</select>' +
        [["", "Eng to'liqlari"], ["photos", "Rasmi borlar"], ["halal", "Halol tasdiqlangan"], ["pinned", "📌 Tepadagilar"], ["hidden", "Yashirilganlar"], ["manual", "Qo'lda qo'shilganlar"]].map(function (f) { return '<button data-f="' + f[0] + '" class="' + (f[0] === st.f ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("") +
        ' <input id="fa-q" placeholder="Nomi bo\'yicha qidirish…" value="' + esc(st.q) + '" style="padding:7px 10px;border-radius:10px;border:1px solid #e5e0d5;min-width:200px">' +
        ' <button class="btn btn--gold btn--sm" id="fa-new">＋ Restoran qo\'shish</button></div>' +
      '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nomi</th><th>Turi</th><th>Manzil / telefon</th><th>Rasm</th><th>Menyu</th><th>Belgilar</th><th></th></tr></thead><tbody>' +
      (r.data || []).map(function (x) {
        return '<tr' + (x.hidden ? ' style="opacity:.5"' : '') + '><td><b>' + esc(nm(x.name)) + '</b><br><small>' + esc(x.cuisine || "") + '</small></td><td>' + esc(CAT[x.cat] || x.cat) + '</td>' +
          '<td><small>' + esc(x.address || "") + '<br>' + esc(x.phone || "") + '</small></td><td>' + ((x.photos || []).length || "—") + '</td><td>' + ((x.menu || []).length || "—") + '</td>' +
          '<td>' + (x.pinned ? "📌 " : "") + (x.halal_ok ? "☪ halol ✓ " : "") + (x.hidden ? "yashirin" : "") + '</td><td><button class="btn btn--outline btn--sm" data-edit="' + x.id + '">Tahrirlash</button></td></tr>';
      }).join("") + '</tbody></table></div><p class="p-sub">Eng to\'liq ma\'lumotli 60 tasi ko\'rsatilgan — boshqasini qidiruv orqali toping.</p></div><div id="fa-ed"></div>';
    $("#fa-reg").onchange = function () { st.region = this.value; A.food(); };
    $("#fa-q").onchange = function () { st.q = this.value.trim(); A.food(); };
    $$("[data-f]", box).forEach(function (b) { b.onclick = function () { st.f = b.dataset.f; A.food(); }; });
    $$("[data-edit]", box).forEach(function (b) { b.onclick = async function () { var d = await sb.from("restaurants").select("*").eq("id", +b.dataset.edit).single(); if (d.data) edit(d.data); }; });
    $("#fa-new").onclick = function () { edit(null); };
  };
  async function upload(file) {
    var ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z]/g, "") || "jpg";
    var path = st.region + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + ext;
    var up = await sb.storage.from("food-photos").upload(path, file, { contentType: file.type || "image/jpeg" });
    if (up.error) throw up.error;
    return sb.storage.from("food-photos").getPublicUrl(path).data.publicUrl;
  }
  function edit(x) {
    var isNew = !x; x = x || { source: "manual", region: st.region, name: {}, about: {}, photos: [], menu: [], cat: "national" };
    var photos = (x.photos || []).slice(), menu = (x.menu || []).map(function (m) { return { name: m.name || {}, price: m.price || "", photo: m.photo || "" }; });
    var f = function (id, label, val, type) { return '<div class="fld"><label>' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '"></div>'; };
    function photosHtml() { return photos.map(function (p, i) { return '<span style="position:relative;display:inline-block;margin:4px"><img src="' + esc(p) + '" style="width:110px;height:80px;object-fit:cover;border-radius:10px"><button type="button" data-rmp="' + i + '" style="position:absolute;top:2px;right:2px;border-radius:50%;width:24px;height:24px;background:#fff">×</button></span>'; }).join("") || '<small>Hali rasm yo\'q</small>'; }
    function menuHtml() { return menu.map(function (m, i) {
      return '<div style="display:grid;grid-template-columns:2fr 2fr 1fr auto auto;gap:6px;align-items:center;margin:4px 0"><input data-mn="' + i + '" data-k="uz" value="' + esc(m.name.uz || "") + '" placeholder="Taom (o\'zbekcha)"><input data-mn="' + i + '" data-k="en" value="' + esc(m.name.en || "") + '" placeholder="Dish (English)">' +
        '<input data-mp="' + i + '" type="number" value="' + esc(m.price) + '" placeholder="Narx, so\'m"><label class="btn btn--outline btn--sm" style="cursor:pointer">' + (m.photo ? '<img src="' + esc(m.photo) + '" style="width:26px;height:26px;object-fit:cover;border-radius:6px">' : '📷') + '<input type="file" accept="image/*" data-mph="' + i + '" hidden></label><button type="button" data-mrm="' + i + '" class="btn btn--outline btn--sm">×</button></div>'; }).join(""); }
    $("#fa-ed").innerHTML = '<div class="p-card" id="fa-card"><h3 style="margin-top:0">' + (isNew ? "Yangi restoran" : esc(nm(x.name))) + '</h3>' +
      (x.source === "osm" ? '<p class="p-sub">Nomi, manzili, telefoni OpenStreetMap\'dan keladi va o\'zi yangilanadi. Siz quyidagilarni qo\'shasiz.</p>' : '') +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">' +
      (x.source === "manual" ? f("fa-n", "Nomi *", x.name["default"] || x.name.uz) + '<div class="fld"><label>Viloyat</label><select id="fa-r">' + Object.keys(REG).map(function (k) { return '<option value="' + k + '"' + (k === x.region ? " selected" : "") + '>' + REG[k] + '</option>'; }).join("") + '</select></div>' +
        f("fa-loc", "Joylashuv * — Google Maps havolasi yoki «41.311, 69.279»", x.lat ? x.lat + ", " + x.lon : "") + f("fa-addr", "Manzil", x.address) + f("fa-ph", "Telefon", x.phone) + f("fa-hr", "Ish vaqti (masalan: Mo-Su 09:00-23:00)", x.hours) + f("fa-web", "Sayt", x.website) + f("fa-ig", "Instagram", x.instagram) : '') +
      '<div class="fld"><label>Oshxona turi</label><select id="fa-cat">' + Object.keys(CAT).map(function (k) { return '<option value="' + k + '"' + (k === x.cat ? " selected" : "") + '>' + CAT[k] + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld"><label>Narx darajasi</label><select id="fa-pl"><option value="">—</option>' + [1, 2, 3, 4].map(function (k) { return '<option value="' + k + '"' + (k === x.price_level ? " selected" : "") + '>' + "$".repeat(k) + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld"><label><input type="checkbox" id="fa-hal"' + (x.halal_ok ? " checked" : "") + '> ☪ Halol — biz tekshirdik</label><label><input type="checkbox" id="fa-pin"' + (x.pinned ? " checked" : "") + '> 📌 Ro\'yxat boshida</label><label><input type="checkbox" id="fa-vis"' + (x.hidden ? "" : " checked") + '> Saytda ko\'rinadi</label></div>' +
      '<div class="fld" style="grid-column:1/-1"><label>Qisqa tavsif (o\'zbekcha / inglizcha / ruscha)</label><textarea id="fa-a-uz" rows="2" placeholder="o\'zbekcha">' + esc((x.about || {}).uz || "") + '</textarea><textarea id="fa-a-en" rows="2" placeholder="English">' + esc((x.about || {}).en || "") + '</textarea><textarea id="fa-a-ru" rows="2" placeholder="русский">' + esc((x.about || {}).ru || "") + '</textarea></div>' +
      '</div><h4>📷 Rasmlar</h4><div id="fa-ph-list">' + photosHtml() + '</div><label class="btn btn--outline btn--sm" style="cursor:pointer;margin-top:6px">＋ Rasm yuklash<input type="file" accept="image/*" multiple id="fa-ph-in" hidden></label>' +
      '<h4>📋 Menyu</h4><div id="fa-menu">' + menuHtml() + '</div><button type="button" class="btn btn--outline btn--sm" id="fa-madd">＋ Taom qo\'shish</button>' +
      '<div class="msg" id="m-fa"></div><div class="p-actions"><button class="btn btn--gold" id="fa-save">Saqlash</button><button class="btn btn--outline" id="fa-x">Yopish</button>' +
      (!isNew && x.source === "manual" ? '<button class="btn btn--outline" id="fa-del" style="margin-inline-start:auto">O\'chirish</button>' : '') + '</div></div>';
    $("#fa-card").scrollIntoView({ behavior: "smooth" });
    function bind() {
      $$("[data-rmp]").forEach(function (b) { b.onclick = function () { photos.splice(+b.dataset.rmp, 1); $("#fa-ph-list").innerHTML = photosHtml(); bind(); }; });
      $$("[data-mn]").forEach(function (i) { i.oninput = function () { menu[+i.dataset.mn].name[i.dataset.k] = i.value; }; });
      $$("[data-mp]").forEach(function (i) { i.oninput = function () { menu[+i.dataset.mp].price = i.value; }; });
      $$("[data-mrm]").forEach(function (b) { b.onclick = function () { menu.splice(+b.dataset.mrm, 1); $("#fa-menu").innerHTML = menuHtml(); bind(); }; });
      $$("[data-mph]").forEach(function (i) { i.onchange = async function () { if (!i.files[0]) return; P.msg("#m-fa", "Rasm yuklanmoqda…", ""); try { menu[+i.dataset.mph].photo = await upload(i.files[0]); P.msg("#m-fa", "", ""); $("#fa-menu").innerHTML = menuHtml(); bind(); } catch (e) { P.msg("#m-fa", "Xatolik: " + e.message, "err"); } }; });
    }
    bind();
    $("#fa-ph-in").onchange = async function () {
      var fs = [].slice.call(this.files); P.msg("#m-fa", "Rasmlar yuklanmoqda… (" + fs.length + ")", "");
      try { for (var i = 0; i < fs.length; i++) photos.push(await upload(fs[i])); P.msg("#m-fa", "Yuklandi ✓ — «Saqlash»ni bosing", "ok"); } catch (e) { P.msg("#m-fa", "Xatolik: " + e.message, "err"); }
      $("#fa-ph-list").innerHTML = photosHtml(); bind();
    };
    $("#fa-madd").onclick = function () { menu.push({ name: {}, price: "", photo: "" }); $("#fa-menu").innerHTML = menuHtml(); bind(); };
    $("#fa-x").onclick = function () { $("#fa-ed").innerHTML = ""; };
    var v = function (id) { var el = $("#" + id); return el ? el.value.trim() : ""; };
    $("#fa-save").onclick = async function () {
      var row = { cat: v("fa-cat"), cat_fixed: v("fa-cat") !== x.cat || !!x.cat_fixed, price_level: v("fa-pl") ? +v("fa-pl") : null, halal_ok: $("#fa-hal").checked, pinned: $("#fa-pin").checked, hidden: !$("#fa-vis").checked,
        about: { uz: v("fa-a-uz"), en: v("fa-a-en"), ru: v("fa-a-ru") }, photos: photos,
        menu: menu.filter(function (m) { return m.name.uz || m.name.en; }).map(function (m) { return { name: m.name, price: m.price ? +m.price : null, photo: m.photo || null }; }),
        score: (x.score || 0) + (photos.length && !(x.photos || []).length ? 5 : 0), updated_at: new Date().toISOString() };
      if (x.source === "manual") {
        var loc = v("fa-loc"), mm = /(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/.exec(loc) || /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(loc) || /[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/.exec(loc);
        if (!v("fa-n") || !mm) { P.msg("#m-fa", "Nomi va joylashuvni yozing (masalan: 41.311, 69.279 yoki Google Maps havolasi).", "err"); return; }
        Object.assign(row, { source: "manual", region: v("fa-r"), name: { "default": v("fa-n"), uz: v("fa-n") }, lat: +mm[1], lon: +mm[2], address: v("fa-addr") || null, phone: v("fa-ph") || null,
          hours: v("fa-hr") || null, website: v("fa-web") || null, instagram: v("fa-ig") || null, score: 10 + (photos.length ? 5 : 0) });
      }
      var res = isNew ? await sb.from("restaurants").insert(row) : await sb.from("restaurants").update(row).eq("id", x.id);
      if (res.error) { P.msg("#m-fa", "Xatolik: " + res.error.message, "err"); return; }
      P.msg("#m-fa", "Saqlandi ✓", "ok"); setTimeout(A.food, 700);
    };
    if ($("#fa-del")) $("#fa-del").onclick = async function () {
      if (this.dataset.sure !== "1") { this.dataset.sure = "1"; this.textContent = "Rostdan o'chirilsinmi? Yana bosing"; return; }
      var d = await sb.from("restaurants").delete().eq("id", x.id); if (d.error) { P.msg("#m-fa", "Xatolik: " + d.error.message, "err"); return; } A.food();
    };
  }
})();
