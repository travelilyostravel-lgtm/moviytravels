/* Moviy Nomad admin — partner services pricing (founder decision 25.11.2026).
   Partner price = NETTO. Moviy Nomad service fee (default 20%) -> BRUTTO = netto × 1.20 (same on the site and in the agent portal).
   Agent commission = 10% of brutto. Example 100 -> 120 -> agent 12 -> Moviy Nomad 8.
   1) Narxlar: "Hamkor xizmatlari" card (fee % per kind + agent commission %) — only the founder can save.
   2) A.partnerCostCard(): partner price · brutto · agent commission · our profit for a B2B booking or a B2C request.
   3) A.partnerFeeBox(): per-partner fee % inside the partner card. */
(function () {
  var P = window.MNP, sb = P && P.sb, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var money = function (n) { return "$" + (Math.round((+n || 0) * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 }); };
  var KN = { guide: "Gid", driver: "Haydovchi / transport", hotel: "Mehmonxona", other: "Boshqa xizmat" };
  var cfg = null;
  function client() { return sb; }

  async function loadCfg() {
    var r = await client().from("partner_pricing").select("*").eq("id", "main").maybeSingle();
    cfg = r.data || null; return cfg;
  }
  A.partnerPricing = loadCfg;
  A.partnerFeeOf = function (p) {
    if (p && p.fee_pct != null && p.fee_pct !== "") return +p.fee_pct;
    if (!cfg) return 20;
    return +({ guide: cfg.fee_guide, driver: cfg.fee_driver, hotel: cfg.fee_hotel }[p && p.kind] != null ? { guide: cfg.fee_guide, driver: cfg.fee_driver, hotel: cfg.fee_hotel }[p.kind] : cfg.fee_other);
  };
  // one line of arithmetic for a price of 1 day / night
  A.partnerMath = function (netto, fee, comm) {
    var br = Math.round(netto * (1 + fee / 100) * 100) / 100, ac = Math.round(br * comm) / 100;
    return { netto: netto, brutto: br, agent: ac, profitB2B: Math.round((br - ac - netto) * 100) / 100, profitB2C: Math.round((br - netto) * 100) / 100 };
  };

  // ---------------------------------------------------------------- 1) Narxlar card
  var oldPrices = A.prices;
  A.prices = async function () {
    if (oldPrices) await oldPrices.apply(this, arguments);
    var sec = $("#v-prices"); if (!sec) return;
    var box = $("#pp-pricing");
    if (!box) { box = document.createElement("div"); box.id = "pp-pricing"; box.className = "p-card"; var nb = $("#np-body"); sec.insertBefore(box, nb); }
    box.innerHTML = '<p class="p-sub">Hamkor xizmatlari yuklanmoqda…</p>';
    var c = await loadCfg();
    if (!c) { box.innerHTML = '<div class="msg msg--err">partner_pricing jadvali topilmadi — supabase/partner_pricing.sql ni ishga tushiring.</div>'; return; }
    var owner = A.role === "admin";
    var inp = function (k, l, hint) { return '<div class="fld"><label>' + l + '</label><input type="number" min="0" max="300" step="0.5" id="pp-' + k + '" value="' + c[k] + '"' + (owner ? '' : ' disabled') + '>' + (hint ? '<small class="p-sub">' + hint + '</small>' : '') + '</div>'; };
    box.innerHTML = '<h2 style="margin-top:0">🤝 Hamkor xizmatlari (gid, transport, mehmonxona)</h2>' +
      '<p class="p-sub">Hamkor narxi = <b>netto</b> (unga to\'lanadi). Saytda va agent portalida bir xil <b>brutto = netto + xizmat haqi %</b> ko\'rinadi. Agent komissiyasi bruttodan olinadi. Netto va xizmat haqi % mijoz va agentga hech qachon ko\'rinmaydi.</p>' +
      '<div class="p-grid">' + inp("fee_guide", "Xizmat haqi — gid, %") + inp("fee_driver", "Xizmat haqi — transport (haydovchi), %") + inp("fee_hotel", "Xizmat haqi — mehmonxona, %") + inp("fee_other", "Xizmat haqi — boshqa xizmatlar, %") +
      inp("agent_comm", "Agent komissiyasi (bruttodan), %", "B2B: agent shu foizni oladi") + '</div>' +
      '<div class="msg msg--info" id="pp-ex" style="margin-top:12px"></div>' +
      '<p class="p-sub">Bitta hamkorga alohida foiz: Hamkorlar → hamkor kartasi → "Alohida xizmat haqi %". Oxirgi o\'zgarish: ' + (c.updated_at ? new Date(c.updated_at).toLocaleString("ru-RU") : "—") + '</p>' +
      (owner ? '<div class="p-actions"><button class="btn btn--gold btn--sm" id="pp-save">Hamkor narx qoidalarini saqlash</button></div>' : '<p class="p-sub">Faqat asoschi o\'zgartiradi.</p>') + '<div class="msg" id="pp-msg"></div>';
    function showEx() {
      var f = +$("#pp-fee_guide").value || 0, a = +$("#pp-agent_comm").value || 0, m = A.partnerMath(100, f, a);
      $("#pp-ex").innerHTML = '<b>Misol (gid, 1 kun):</b> hamkor narxi ' + money(m.netto) + ' → saytda va agent portalida ' + money(m.brutto) +
        ' → agent komissiyasi ' + money(m.agent) + ' → <b>bizga ' + money(m.profitB2B) + '</b> (agentsiz, saytdan: bizga ' + money(m.profitB2C) + ').';
    }
    box.oninput = showEx; showEx();
    if (owner) $("#pp-save").onclick = async function () {
      var row = {}; ["fee_guide", "fee_driver", "fee_hotel", "fee_other", "agent_comm"].forEach(function (k) { row[k] = +$("#pp-" + k).value; });
      if (row.agent_comm >= Math.min(row.fee_guide, row.fee_driver, row.fee_hotel, row.fee_other) * 100 / (100 + Math.min(row.fee_guide, row.fee_driver, row.fee_hotel, row.fee_other)) + 0.0001)
        return P.msg("#pp-msg", "Agent komissiyasi juda katta: bu foizda biz zarar qilamiz. Xizmat haqini oshiring yoki komissiyani kamaytiring.", "err");
      this.disabled = true;
      var u = await client().from("partner_pricing").update(row).eq("id", "main");
      this.disabled = false;
      P.msg("#pp-msg", u.error ? u.error.message : "Saqlandi ✅ Saytdagi va agent portalidagi narxlar darhol yangilandi.", u.error ? "err" : "ok");
    };
  };

  // ---------------------------------------------------------------- 2) cost card for a booking / request
  A.partnerCostCard = async function (q) {
    var r = await client().from("partner_costs").select("*, partners(name,kind,price_day,fee_pct)").match(q).maybeSingle();
    var x = r.data;
    if (!x) return '<div class="p-card"><h3>🤝 Hamkor hisobi</h3><p class="p-sub">Hisob hali yo\'q (hamkor narxi yozilmagan bo\'lishi mumkin).</p></div>';
    var p = x.partners || {}, unit = p.kind === "hotel" ? "kecha" : "kun";
    return '<div class="p-card"><h3>🤝 Hamkor hisobi — ' + esc(p.name || "") + ' (' + esc(KN[p.kind] || "") + ')</h3>' +
      '<div class="kv">' +
      '<div><small>Hamkor narxi (netto)</small><b>' + money(x.unit_cost) + ' / ' + unit + '</b></div>' +
      '<div><small>Soni</small><b>' + (+x.units) + ' ' + unit + (x.qty > 1 ? ' × ' + x.qty : '') + '</b></div>' +
      '<div><small>Hamkorga to\'lanadi</small><b>' + money(x.cost) + '</b></div>' +
      '<div><small>Brutto (xizmat haqi ' + (+x.fee_pct) + '%)</small><b>' + money(x.brutto) + '</b></div>' +
      '<div><small>Agent komissiyasi' + (x.source === "b2b" ? ' (' + (+x.agent_comm_pct) + '%)' : '') + '</small><b>' + (x.source === "b2b" ? money(x.agent_comm) : "— (saytdan)") + '</b></div>' +
      '<div class="hl"><small>Bizning foyda</small><b>' + money(x.profit) + '</b></div></div>' +
      (x.source === "b2c" ? '<p class="p-sub">Saytdan kelgan so\'rov: brutto = so\'rovdagi narx (yozilmagan bo\'lsa — hamkor narxi × kun + xizmat haqi). Kun sonini mijoz formada yozgan.</p>' : '') + '</div>';
  };

  // ---------------------------------------------------------------- 3) per-partner fee in the partner card
  A.partnerFeeBox = function (p) {
    var f = A.partnerFeeOf(p), comm = cfg ? +cfg.agent_comm : 10, n = +p.price_day || 0, m = A.partnerMath(n, f, comm);
    return '<div class="fld"><label>Alohida xizmat haqi % (bo\'sh = standart ' + A.partnerFeeOf({ kind: p.kind }) + '%)</label><input type="number" min="0" max="300" step="0.5" id="pp-fee" value="' + (p.fee_pct == null ? "" : p.fee_pct) + '"' + (A.role === "admin" ? '' : ' disabled') + '></div>' +
      (n ? '<div class="fld full"><small class="p-sub">1 ' + (p.kind === "hotel" ? "kecha" : "kun") + ': hamkor narxi <b>' + money(m.netto) + '</b> → brutto <b>' + money(m.brutto) + '</b> → agent ' + money(m.agent) + ' → bizga <b>' + money(m.profitB2B) + '</b> (saytdan: ' + money(m.profitB2C) + ')</small></div>' : '');
  };
  A.partnerFeeRead = function () { var el = $("#pp-fee"); if (!el || el.disabled) return undefined; return el.value === "" ? null : +el.value; };

  // load the settings once the admin is in (used by the partner card)
  setTimeout(function () { if (A.role) loadCfg(); }, 3000);
})();
