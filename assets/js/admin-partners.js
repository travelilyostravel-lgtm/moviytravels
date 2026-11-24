/* Moviy Nomad — admin: partners (guides, drivers, hotels, other) and their reviews. Founder and managers approve. UI in Uzbek. */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, $$ = P.$$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var KIND = { guide: "Gid", driver: "Haydovchi / transport", hotel: "Mehmonxona", other: "Boshqa xizmat" };
  var ST = { pending: "⏳ Tekshiruvda", approved: "✅ Saytda", rejected: "❌ Rad etilgan", paused: "⏸ Vaqtincha yopiq" };
  var DK = { license: "Litsenziya / guvohnoma", id: "Pasport / ID", car: "Texpasport", cert: "Sertifikat", other: "Boshqa", trip: "Sayyohlar bilan rasm", extra: "Qo'shimcha rasm" };
  var NEED = { guide: { main: 1, pub: 3, trip: 10 }, driver: { main: 1, pub: 6, trip: 10 }, hotel: { main: 1, pub: 8, trip: 0 }, other: { main: 1, pub: 3, trip: 10 } };
  var flt = "pending";
  function pub(p) { return p ? window.MN_SB.url + "/storage/v1/object/public/partner-photos/" + p : ""; }

  A.partnersBadge = async function () {
    var a = await sb.from("partners").select("id", { count: "exact", head: true }).eq("status", "pending");
    var r = await sb.from("partner_reviews").select("id", { count: "exact", head: true }).eq("status", "pending");
    var n = (a.count || 0) + (r.count || 0), b = $('#tabs button[data-view="partners"]');
    if (b) b.textContent = "Hamkorlar" + (n ? " 🔴 " + n : "");
  };

  A.partners = async function () {
    A.show("partners");
    var box = $("#v-partners"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var all = (await sb.from("partners").select("*").order("created_at", { ascending: false })).data || [];
    var rv = (await sb.from("partner_reviews").select("*, partners(name)").eq("status", "pending").order("created_at")).data || [];
    var cnt = {}; all.forEach(function (p) { cnt[p.status] = (cnt[p.status] || 0) + 1; });
    var list = all.filter(function (p) { return flt === "all" || p.status === flt; });
    var h = '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">Hamkorlar</h2>' +
      '<div><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="../partner/#reg">Ro\'yxatdan o\'tish sahifasi</a> <a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="../uz/partners.html">Saytda ko\'rish</a></div></div>' +
      '<p class="p-sub">Gid, haydovchi va mehmonxonalar o\'zlari ro\'yxatdan o\'tadi. Asoschi yoki menejer hujjat va rasmlarni tekshirib <b>Tasdiqlash</b>ni bosadi — shundan keyin kartochka saytda (bosh sahifada ham) chiqadi. Aloqa raqamlari saytda ko\'rinmaydi: mijoz so\'rovi bizga keladi.</p>' +
      '<div class="filters">' + [["pending", "Tekshiruvda"], ["approved", "Saytda"], ["paused", "Yopiq"], ["rejected", "Rad etilgan"], ["all", "Hammasi"]].map(function (f) { return '<button data-pf="' + f[0] + '" class="' + (flt === f[0] ? "is-on" : "") + '">' + f[1] + (f[0] !== "all" && cnt[f[0]] ? " (" + cnt[f[0]] + ")" : "") + '</button>'; }).join("") + '</div>' +
      (list.length ? '<table class="tbl" style="margin-top:10px"><thead><tr><th>Hamkor</th><th>Turi</th><th>Shahar</th><th>Reyting</th><th>Holat</th><th>Ro\'yxatdan</th></tr></thead><tbody>' + list.map(function (p) {
        return '<tr class="click" data-pid="' + p.id + '"><td><b>' + esc(p.name) + '</b><br><small>' + esc(p.email || "") + ' · ' + esc(p.phone || "") + '</small></td><td>' + esc(KIND[p.kind]) + '</td><td>' + esc(p.city || "") + '</td><td>' + (p.reviews_count ? "★ " + Number(p.rating).toFixed(1) + " (" + p.reviews_count + ")" : "—") + '</td><td>' + esc(ST[p.status]) + (p.license_ok ? '<br><small>✓ litsenziya</small>' : '') + '</td><td><small>' + P.date(p.created_at) + '</small></td></tr>';
      }).join("") + '</tbody></table>' : '<p class="p-sub" style="margin-top:10px">Bu ro\'yxatda hech kim yo\'q.</p>') + '</div>';
    if (rv.length) h += '<div class="p-card" style="border:2px solid #e9b949"><h3>Tasdiq kutayotgan sharhlar (' + rv.length + ')</h3><table class="tbl"><tbody>' + rv.map(function (r) {
      return '<tr><td><b>' + esc(r.partners && r.partners.name) + '</b><br><small>' + "★".repeat(r.rating) + ' · ' + esc(r.name) + ' (' + esc(r.country || "") + ') · bron ' + esc(r.trip_ref) + '</small><p style="margin:4px 0 0">' + esc(r.body || "") + '</p></td><td style="white-space:nowrap"><button class="btn btn--green btn--sm" data-rok="' + r.id + '">Chiqarish</button> <button class="btn btn--outline btn--sm" data-rno="' + r.id + '">Rad etish</button></td></tr>';
    }).join("") + '</tbody></table><p class="p-sub">Sharhni faqat to\'langan safari bor sayyoh yoza oladi (bron raqami + e-mail tekshiriladi).</p></div>';
    box.innerHTML = h;
    $$("[data-pf]", box).forEach(function (b) { b.onclick = function () { flt = b.dataset.pf; A.partners(); }; });
    $$("[data-pid]", box).forEach(function (tr) { tr.onclick = function () { A.partner(tr.dataset.pid); }; });
    $$("[data-rok]", box).forEach(function (b) { b.onclick = async function () { await sb.from("partner_reviews").update({ status: "approved" }).eq("id", b.dataset.rok); A.partnersBadge(); A.partners(); }; });
    $$("[data-rno]", box).forEach(function (b) { b.onclick = async function () { await sb.from("partner_reviews").update({ status: "rejected" }).eq("id", b.dataset.rno); A.partnersBadge(); A.partners(); }; });
    A.partnersBadge();
  };

  A.partner = async function (id) {
    A.show("partners");
    var box = $("#v-partners"); box.innerHTML = '<div class="p-card">Yuklanmoqda…</div>';
    var p = (await sb.from("partners").select("*").eq("id", id).single()).data; if (!p) return A.partners();
    var rq = (await sb.from("site_requests").select("id,ref,start_date,pax,status,contact_name,created_at").eq("tour_id", id).order("created_at", { ascending: false }).limit(50)).data || [];
    var rv = (await sb.from("partner_reviews").select("*").eq("partner_id", id).order("created_at", { ascending: false })).data || [];
    var reg = p.kind === "guide" ? "https://gov.uz/oz/uzbektourism/pages/gidlar-reestri" : p.kind === "hotel" ? "https://gov.uz/oz/uzbektourism/pages/joylashtirish-vositalarining-reyestri" : "";
    var info = [["Turi", KIND[p.kind]], ["E-mail", p.email], ["Telefon", p.phone], ["WhatsApp", p.whatsapp], ["Shahar", [p.city].concat(p.cities || []).filter(Boolean).join(", ")], ["Tillar", (p.languages || []).join(", ")],
      ["Narx", p.price_day ? "$" + p.price_day + (p.kind === "hotel" ? " / kecha" : " / kun") + (p.price_note ? " — " + p.price_note : "") : "—"], p.kind === "hotel" || p.kind === "other" ? ["Firma", p.company] : null, p.kind === "hotel" || p.kind === "other" ? ["INN", p.inn] : null, ["Litsenziya / guvohnoma", p.license_no],
      p.kind === "driver" ? ["Mashina", [p.vehicle_type, p.vehicle_seats ? p.vehicle_seats + " o'rin" : "", p.vehicle_year].filter(Boolean).join(", ")] : null,
      p.kind === "hotel" ? ["Mehmonxona", [p.hotel_stars ? p.hotel_stars + " yulduz" : "", p.hotel_rooms ? p.hotel_rooms + " xona" : ""].filter(Boolean).join(", ")] : null,
      p.kind === "guide" ? ["Tajriba", p.experience_years ? p.experience_years + " yil" : "—"] : null,
      p.kind !== "hotel" ? ["Tug'ilgan yil (yoshi)", p.birth_year ? p.birth_year + " (" + (new Date().getFullYear() - p.birth_year) + " yosh)" : "—"] : null,
      ["Yashash joyi (saytda)", p.home_area], ["To'liq manzil (faqat sizga)", p.home_address],
      ["Ko'rishlar · Layklar · Ulashishlar", (p.views_count || 0) + " · " + (p.likes_count || 0) + " · " + (p.shares_count || 0)]].filter(Boolean);
    var wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
    var h = '<div class="p-card"><button class="btn btn--outline btn--sm" id="pp-back">← Hamkorlar</button>' +
      '<div style="display:flex;gap:14px;align-items:center;margin-top:12px">' + (p.photo ? '<img src="' + pub(p.photo) + '" style="width:86px;height:86px;border-radius:14px;object-fit:cover" alt="">' : '') +
      '<div><h2 style="margin:0">' + esc(p.name) + '</h2><p class="p-sub" style="margin:4px 0 0">' + esc(ST[p.status]) + ' · ★ ' + (p.reviews_count ? Number(p.rating).toFixed(1) + " (" + p.reviews_count + ")" : "—") + '</p></div></div>' +
      '<div class="kv" style="margin-top:12px">' + info.map(function (r) { return '<div><small>' + r[0] + '</small><b>' + esc(r[1] || "—") + '</b></div>'; }).join("") + '</div>' +
      (p.bio ? '<p style="white-space:pre-line;margin-top:12px">' + esc(p.bio) + '</p>' : '') +
      ((p.photos || []).length ? '<div class="pgal">' + p.photos.map(function (x) { return '<img src="' + pub(x) + '" alt="">'; }).join("") + '</div>' : '') +
      '<div class="p-actions">' + (wa ? '<a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">WhatsApp</a>' : '') + (p.email ? '<a class="btn btn--outline btn--sm" href="mailto:' + esc(p.email) + '">E-mail</a>' : '') + '</div></div>';
    var nd = NEED[p.kind] || NEED.other, docs = p.docs || [], trips = docs.filter(function (d) { return d.kind === "trip"; }), extra = docs.filter(function (d) { return d.kind === "extra"; });
    var npub = (p.photos || []).length + extra.length;
    var chk = function (ok, txt) { return '<li style="color:' + (ok ? "#23794a" : "#b4541b") + '">' + (ok ? "✅ " : "❌ ") + txt + '</li>'; };
    h += '<div class="p-card"><h3>Talablar tekshiruvi</h3><ul class="pdocs">' +
      chk(!!p.photo, "Asosiy rasm (klassik yoki milliy kiyimda) — tepada, o'zingiz ko'ring") +
      chk(npub >= nd.pub, (p.kind === "driver" ? "Mashina rasmlari" : p.kind === "hotel" ? "Xona rasmlari" : "Yakka rasmlar") + ": " + npub + " / kamida " + (p.kind === "hotel" ? 10 : nd.pub)) +
      (nd.trip ? chk(trips.length >= nd.trip, "Sayyohlar bilan rasmlar: " + trips.length + " / kamida " + nd.trip) : "") +
      chk(!!p.license_no || p.kind === "other" || p.kind === "hotel", "Litsenziya / guvohnoma raqami: " + esc(p.license_no || "—")) +
      (p.kind === "guide" ? chk((p.languages || []).length > 0, "Tillar: " + esc((p.languages || []).join(", ") || "—")) : "") +
      (p.kind === "guide" ? chk((p.cities || []).length > 0 || !!p.city, "Gidlik qiladigan joylari: " + esc([p.city].concat(p.cities || []).filter(Boolean).join(", ") || "—")) : "") +
      (p.kind !== "hotel" ? chk(!!p.birth_year, "Yoshi: " + (p.birth_year ? (new Date().getFullYear() - p.birth_year) : "—")) : "") +
      chk(!!p.home_area && !!p.home_address, "Yashash joyi va manzili: " + esc([p.home_area, p.home_address].filter(Boolean).join(" — ") || "—")) + '</ul>' +
      (trips.length ? '<p class="p-sub" style="margin-top:10px">Sayyohlar bilan rasmlar (faqat sizga ko\'rinadi):</p><div class="pgal" id="pp-trips"></div>' : '') + '</div>';
    h += '<div class="p-card"><h3>Hujjatlar</h3>' + ((p.docs || []).length ? '<ul class="pdocs">' + p.docs.map(function (d, i) { return '<li>📄 <a href="#" data-doc="' + i + '">' + esc(DK[d.kind] || d.kind) + ' — ' + esc(d.name || "") + '</a></li>'; }).join("") + '</ul>' : '<p class="p-sub">Hali hujjat yuklamagan.</p>') +
      (reg ? '<p class="p-sub">Davlat reyestrida tekshirish: <a target="_blank" rel="noopener" href="' + reg + '">Turizm qo\'mitasi reyestri</a> (raqam: ' + esc(p.license_no || "—") + ')</p>' : '') + '</div>';
    h += '<div class="p-card"><h3>Qaror</h3><div class="p-grid">' +
      '<label class="chk"><input type="checkbox" id="pp-lic"' + (p.license_ok ? " checked" : "") + '> Litsenziya/guvohnoma tekshirildi (saytda "✓" belgisi)</label>' +
      '<label class="chk"><input type="checkbox" id="pp-feat"' + (p.featured ? " checked" : "") + '> Tavsiya etilgan (ro\'yxatda birinchi)</label>' +
      '<div class="fld"><label>Moviy Nomad bilan safarlar soni</label><input type="number" id="pp-trips" min="0" value="' + (p.trips_count || 0) + '"></div>' +
      '<div class="fld full"><label>Hamkorga izoh (rad etsangiz yoki yopsangiz u ko\'radi)</label><textarea id="pp-note" rows="2">' + esc(p.admin_note || "") + '</textarea></div></div>' +
      '<div class="msg" id="m-pp"></div><div class="p-actions">' +
      (p.status !== "approved" ? '<button class="btn btn--green" data-st="approved">✅ Tasdiqlash — saytga chiqarish</button>' : '<button class="btn btn--outline" data-st="paused">⏸ Vaqtincha yopish</button>') +
      (p.status !== "rejected" ? '<button class="btn btn--outline" data-st="rejected">❌ Rad etish</button>' : '') +
      '<button class="btn btn--gold" id="pp-save">Saqlash</button></div></div>';
    h += '<div class="p-card"><h3>📅 Bandlik kalendari</h3><p class="p-sub">Qizil — band, yashil — bo\'sh. Bron tasdiqlansa, kunni shu yerda bosib band qiling (hamkor ham o\'z kabinetida belgilaydi). Nuqtali kunda izoh bor — ustiga sichqonchani olib boring.</p><div id="pp-cal"></div><div class="msg" id="m-ppcal"></div></div>';
    h += '<div class="p-card"><h3>Shu hamkorga kelgan so\'rovlar (' + rq.length + ')</h3>' + (rq.length ? '<table class="tbl"><tbody>' + rq.map(function (x) { return '<tr class="click" data-rq="' + x.id + '"><td><b>' + esc(x.ref) + '</b></td><td>' + esc(x.contact_name) + '</td><td>' + P.date(x.start_date) + ' · ' + (x.pax || "") + ' kishi</td><td>' + esc(x.status) + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="p-sub">Hali yo\'q.</p>') + '</div>';
    h += '<div class="p-card"><h3>Sharhlar (' + rv.length + ')</h3>' + (rv.length ? rv.map(function (r) { return '<div class="pt-rv">' + "★".repeat(r.rating) + ' <b>' + esc(r.name) + '</b> <small>' + esc(r.status) + ' · ' + P.date(r.created_at) + '</small><p>' + esc(r.body || "") + '</p></div>'; }).join("") : '<p class="p-sub">Hali yo\'q.</p>') + '</div>';
    box.innerHTML = h;
    $("#pp-back").onclick = A.partners;
    if (window.MNCal) (async function () {
      var busy = {}, r = await sb.from("partner_busy").select("day,note").eq("partner_id", id);
      (r.data || []).forEach(function (x) { busy[x.day] = x.note || true; });
      var draw = function () { window.MNCal.render($("#pp-cal"), { lang: "uz", months: 2, busy: busy, legend: ["Bo'sh", "Band"], onPick: async function (day, isB) {
        var q = isB ? await sb.from("partner_busy").delete().eq("partner_id", id).eq("day", day) : await sb.from("partner_busy").insert({ partner_id: id, day: day, note: "Moviy Nomad bron" });
        if (q.error) return P.msg("#m-ppcal", q.error.message, "err");
        if (isB) delete busy[day]; else busy[day] = "Moviy Nomad bron"; draw(); P.msg("#m-ppcal", "Saqlandi", "ok");
      } }); };
      draw();
    })();
    if (trips.length) { var g = $("#pp-trips"); trips.forEach(async function (d) { try { var u = await P.signed("partner-docs", d.path, 30); var im = document.createElement("img"); im.src = u; im.alt = ""; im.style.cursor = "zoom-in"; im.onclick = function () { window.open(u, "_blank"); }; g.appendChild(im); } catch (e) {} }); }
    $$("[data-doc]", box).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); P.openFile("partner-docs", p.docs[+a.dataset.doc].path); }; });
    $$("[data-rq]", box).forEach(function (tr) { tr.onclick = function () { A.openRequest ? A.openRequest(tr.dataset.rq) : A.requests(); }; });
    async function save(extra) {
      var d = Object.assign({ license_ok: $("#pp-lic").checked, featured: $("#pp-feat").checked, trips_count: +$("#pp-trips").value || 0, admin_note: $("#pp-note").value.trim() || null, updated_at: new Date().toISOString() }, extra || {});
      var r = await sb.from("partners").update(d).eq("id", id);
      if (r.error) return P.msg("#m-pp", r.error.message, "err");
      P.msg("#m-pp", "Saqlandi", "ok"); A.partnersBadge(); setTimeout(function () { A.partner(id); }, 600);
    }
    $("#pp-save").onclick = function () { save(); };
    $$("[data-st]", box).forEach(function (b) { b.onclick = function () { var s = b.dataset.st; save({ status: s, approved_at: s === "approved" ? new Date().toISOString() : p.approved_at }); }; });
  };
})();
