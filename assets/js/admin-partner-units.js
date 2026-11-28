/* Admin → Hamkorlar: hotel room types and transport vehicles (25.11.2026).
   Every new or changed room/vehicle waits here; only approved ones are shown on the site (brutto price). */
(function () {
  var A = window.MNA; if (!A) return;
  var P = window.MNP, sb = P.sb, esc = P.esc, $ = P.$, $$ = P.$$;
  function pub(p) { return p ? window.MN_SB.url + "/storage/v1/object/public/partner-photos/" + p : ""; }
  var ST = { pending: "⏳ tekshiruvda", approved: "✅ saytda", rejected: "❌ rad etilgan", hidden: "⏸ yopiq" };
  var CL = { standard: "Standart", deluxe: "Deluxe", suite: "Lyuks", family: "Oilaviy", single: "Bir kishilik", dorm: "Hostel", economy: "Ekonom", comfort: "Komfort", business: "Biznes", premium: "Premium", minivan: "Miniven", minibus: "Mikroavtobus", bus: "Avtobus" };
  var AM = { wifi: "Wi-Fi", breakfast: "Nonushta", parking: "Avtoturargoh", ac: "Konditsioner", transfer: "Aeroport transferi", restaurant: "Restoran", pool: "Basseyn", laundry: "Kir yuvish", reception24: "24 soat qabulxona", family: "Oilaviy xonalar", courtyard: "Milliy hovli", elevator: "Lift", terrace: "Terassa", nosmoking: "Chekilmaydigan xonalar" };
  var m = function (n) { return n ? "$" + Math.round(n) : "—"; };

  function row(u) {
    var room = u.unit_kind === "room";
    var spec = room ? [CL[u.class] || u.class, (u.capacity || "?") + " kishi", u.beds, "×" + u.qty, u.breakfast ? "nonushta bilan" : "nonushtasiz"]
                    : [CL[u.class] || u.class, (u.capacity || "?") + " o'rin", (u.luggage == null ? "" : u.luggage + " chamadon"), u.year, u.plate, u.ac ? "konditsioner" : "konditsionersiz", u.qty > 1 ? "×" + u.qty : ""];
    return '<div class="pp-unit" style="border:1px solid #e5e0d5;border-radius:12px;padding:10px 12px;margin:8px 0"><b>' + esc(u.name) + '</b> · ' + ST[u.status] +
      '<br><small>' + esc(spec.filter(Boolean).join(" · ")) + '</small><br>Netto: <b>' + m(u.price_netto) + '</b>' + (room ? " / kecha" : " / kun") + (u.price_transfer ? ' · transfer netto <b>' + m(u.price_transfer) + '</b>' : '') +
      ((u.photos || []).length ? '<div class="pgal" style="margin-top:6px">' + u.photos.map(function (x) { return '<a href="' + pub(x) + '" target="_blank" rel="noopener"><img src="' + pub(x) + '" alt=""></a>'; }).join("") + '</div>' : '<br><small style="color:#b4541b">Rasm yo\'q</small>') +
      '<div class="p-actions" style="margin-top:6px">' + (u.status !== "approved" ? '<button class="btn btn--green btn--sm" data-uok="' + u.id + '">✅ Tasdiqlash</button>' : '<button class="btn btn--outline btn--sm" data-uhd="' + u.id + '">⏸ Yopish</button>') +
      (u.status !== "rejected" ? '<button class="btn btn--outline btn--sm" data-uno="' + u.id + '">❌ Rad etish</button>' : '') + '</div>' +
      (u.admin_note ? '<small class="p-sub">Izohimiz: ' + esc(u.admin_note) + '</small>' : '') + '</div>';
  }

  var orig = A.partner;
  A.partner = async function (id) {
    await orig(id);
    var p = (await sb.from("partners").select("kind,extra,rates,rates_new,rates_at,rates_ok_at,price_day").eq("id", id).single()).data || {};
    if (p.kind === "guide") return guideRates(id, p);
    if (p.kind !== "hotel" && p.kind !== "driver") return;
    var us = (await sb.from("partner_units").select("*").eq("partner_id", id).order("sort").order("created_at")).data || [];
    var x = p.extra || {}, pend = us.filter(function (u) { return u.status === "pending"; }).length;
    var h = '<div class="p-card" id="pp-units" style="' + (pend ? "border:2px solid #e9b949" : "") + '"><h3>' + (p.kind === "hotel" ? "🛏 Xona turlari" : "🚐 Mashinalar") + ' (' + us.length + (pend ? ', ' + pend + ' ta tekshiruvda' : '') + ')</h3>' +
      '<p class="p-sub">Netto — hamkorga to\'lanadi. Saytda faqat tasdiqlanganlari brutto narx bilan chiqadi (hamkor tasdiqlangan bo\'lsa).</p>' +
      (p.kind === "hotel" ? '<p><small>' + [x.registry_no ? "Reyestr: " + x.registry_no : "", x.check_in ? "Check-in " + x.check_in : "", x.check_out ? "check-out " + x.check_out : "", (x.amenities || []).map(function (k) { return AM[k] || k; }).join(", ")].filter(Boolean).map(esc).join(" · ") + '</small>' +
        (x.map_url ? ' · <a href="' + esc(x.map_url) + '" target="_blank" rel="noopener">Xaritada</a>' : '') + (x.policies ? '<br><small>Qoidalar: ' + esc(x.policies) + '</small>' : '') + '</p>' : (x.company_type ? '<p><small>' + (x.company_type === "company" ? "Transport kompaniyasi" : "Shaxsiy haydovchi") + '</small></p>' : '')) +
      (us.length ? us.map(row).join("") : '<p class="p-sub">Hali qo\'shmagan.</p>') +
      (pend > 1 ? '<button class="btn btn--green btn--sm" id="uok-all">✅ Barchasini tasdiqlash (' + pend + ')</button>' : '') +
      '<div class="fld" style="margin-top:8px"><label>Rad etsangiz — sababi (hamkor ko\'radi)</label><input id="u-note" maxlength="300"></div><div class="msg" id="m-units"></div></div>';
    var cards = $$("#v-partners .p-card, .p-card"), qa = cards.filter(function (c) { return /Talablar tekshiruvi/.test(c.textContent); })[0];
    if (qa) qa.insertAdjacentHTML("beforebegin", h); else document.querySelector("#v-partners").insertAdjacentHTML("beforeend", h);
    var setSt = async function (ids, st) {
      var note = ($("#u-note") || {}).value || "";
      if (st === "rejected" && !note.trim()) { $("#u-note").focus(); return P.msg("#m-units", "Rad etish sababini yozing", "err"); }
      var r = await sb.from("partner_units").update({ status: st, admin_note: st === "rejected" ? note.trim() : null }).in("id", ids);
      if (r.error) return P.msg("#m-units", r.error.message, "err");
      if (A.partnersBadge) A.partnersBadge(); A.partner(id);
    };
    $$("[data-uok]").forEach(function (b) { b.onclick = function () { setSt([b.dataset.uok], "approved"); }; });
    $$("[data-uno]").forEach(function (b) { b.onclick = function () { setSt([b.dataset.uno], "rejected"); }; });
    $$("[data-uhd]").forEach(function (b) { b.onclick = function () { setSt([b.dataset.uhd], "hidden"); }; });
    if ($("#uok-all")) $("#uok-all").onclick = function () { setSt(us.filter(function (u) { return u.status === "pending"; }).map(function (u) { return u.id; }), "approved"); };
  };

  // Guide price list (NETTO, private) — what we pay the guide when we order
  var RL = [["full_day", "To'liq kun (8 soat)"], ["half_day", "Yarim kun (4 soat)"], ["extra_hour", "Qo'shimcha soat"], ["meet", "Aeroport/vokzalda kutib olish"], ["out_of_town", "Shahar tashqarisiga safar kuni"], ["tour_day", "Butun tur bilan (kunlik)"], ["big_group", "Katta guruh (16+) qo'shimchasi"]];
  var GC = { havaskor: "Havaskor gid", ixtisoslashgan: "Ixtisoslashgan gid", professional: "Professional gid", oltin_fond: "«Oltin fond» gidi" };
  function guideRates(id, p) {
    var r = p.rates || {}, n = p.rates_new;
    if (r.full_day == null && p.price_day != null) r = Object.assign({ full_day: p.price_day }, r);
    var cell = function (o, k) { return o && o[k] != null ? "$" + o[k] : "—"; };
    var h = '<div class="p-card" id="pp-rates" style="' + (n ? "border:2px solid #e9b949" : "") + '"><h3>💵 Gid narxlari (NETTO — gidga to\'lanadi, saytda ko\'rinmaydi)</h3>' +
      '<p class="p-sub">Malaka toifasi: <b>' + esc(GC[(p.extra || {}).guide_cat] || "ko\'rsatilmagan") + '</b>' + (p.rates_ok_at ? ' · oxirgi tasdiq: ' + P.date(p.rates_ok_at) : '') + '</p>' +
      '<table class="tbl"><thead><tr><th>Xizmat</th><th>Amaldagi narx</th>' + (n ? '<th>Yangi (tekshiruvda)</th>' : '') + '</tr></thead><tbody>' +
      RL.map(function (x) { var ch = n && String((n || {})[x[0]]) !== String(r[x[0]]); return '<tr><td>' + x[1] + '</td><td>' + cell(r, x[0]) + '</td>' + (n ? '<td' + (ch ? ' style="font-weight:700;color:#b4541b"' : '') + '>' + cell(n, x[0]) + '</td>' : '') + '</tr>'; }).join("") +
      '</tbody></table>' + (n ? '<div class="p-actions"><button class="btn btn--green btn--sm" id="rt-ok">✅ Yangi narxlarni tasdiqlash</button><button class="btn btn--outline btn--sm" id="rt-no">❌ Rad etish</button></div>' : '') + '<div class="msg" id="m-rates"></div></div>';
    var cards = $$(".p-card"), qa = cards.filter(function (c) { return /Talablar tekshiruvi/.test(c.textContent); })[0];
    if (qa) qa.insertAdjacentHTML("beforebegin", h); else document.querySelector("#v-partners").insertAdjacentHTML("beforeend", h);
    var go = async function (ok) { var x = await sb.rpc("admin_rates_decide", { p_partner: id, p_ok: ok }); if (x.error) return P.msg("#m-rates", x.error.message, "err"); if (A.partnersBadge) A.partnersBadge(); A.partner(id); };
    if ($("#rt-ok")) { $("#rt-ok").onclick = function () { go(true); }; $("#rt-no").onclick = function () { go(false); }; }
  }

  var origBadge = A.partnersBadge;
  A.partnersBadge = async function () {
    await origBadge();
    var u = await sb.from("partner_units").select("id", { count: "exact", head: true }).eq("status", "pending");
    var g = await sb.from("partners").select("id", { count: "exact", head: true }).not("rates_new", "is", null);
    var add = (u.count || 0) + (g.count || 0);
    var b = $('#tabs button[data-view="partners"]'); if (!b || !add) return;
    var n = parseInt((b.textContent.match(/🔴 (\d+)/) || [0, 0])[1], 10) + add;
    b.textContent = "Hamkorlar 🔴 " + n;
  };

  var origList = A.partners;
  A.partners = async function () {
    await origList();
    var gr = (await sb.from("partners").select("id,name").not("rates_new", "is", null).limit(50)).data || [];
    if (gr.length) {
      var gh = '<div class="p-card" style="border:2px solid #e9b949;margin:12px 0"><h3 style="margin-top:0">💵 Gid narxlari — tasdiq kutyapti (' + gr.length + ')</h3><table class="tbl"><tbody>' +
        gr.map(function (x) { return '<tr class="click" data-grid="' + x.id + '"><td><b>' + esc(x.name) + '</b></td><td>yangi narxlar</td></tr>'; }).join("") + '</tbody></table></div>';
      var f0 = document.querySelector("#v-partners .filters"); if (f0) f0.insertAdjacentHTML("beforebegin", gh);
      $$("[data-grid]").forEach(function (tr) { tr.onclick = function () { A.partner(tr.dataset.grid); }; });
    }
    var r = await sb.from("partner_units").select("partner_id,name,unit_kind,partners(name)").eq("status", "pending").limit(50);
    var L = r.data || []; if (!L.length) return;
    var by = {}; L.forEach(function (u) { (by[u.partner_id] = by[u.partner_id] || { name: u.partners && u.partners.name, items: [] }).items.push(u.name); });
    var h = '<div class="p-card" style="border:2px solid #e9b949;margin:12px 0"><h3 style="margin-top:0">🛏🚐 Xona / mashinalar — tasdiq kutyapti (' + L.length + ')</h3><table class="tbl"><tbody>' +
      Object.keys(by).map(function (k) { return '<tr class="click" data-upid="' + k + '"><td><b>' + esc(by[k].name || "") + '</b></td><td>' + esc(by[k].items.join(", ")) + '</td></tr>'; }).join("") + '</tbody></table></div>';
    var f = document.querySelector("#v-partners .filters"); if (f) f.insertAdjacentHTML("beforebegin", h);
    $$("[data-upid]").forEach(function (tr) { tr.onclick = function () { A.partner(tr.dataset.upid); }; });
  };
})();
