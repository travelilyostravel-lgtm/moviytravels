/* Moviy Nomad — admin: list of PAID clients for each group departure (deposit confirmed or more).
   Built automatically from website requests (B2C) and agent bookings (B2B) that hold seats.
   Download any time as Excel (.xlsx), PDF or Word (.doc). Managers get only their own clients (database rules). */
(function () {
  var P = window.MNP, sb = P && P.sb, $ = P.$, esc = P.esc, A = window.MNA = window.MNA || {};
  if (!sb) return;
  var KN = { small: "Kichik guruh 12–17", medium: "O'rta guruh 30–35", large: "Katta guruh 45–50" };
  var RM = { twin_share: "2 kishilik (sherik bilan)", twin: "2 kishilik", single: "1 kishilik" };
  var ST = { deposit_paid: "30% to'langan", paid: "100% to'langan", confirmed: "To'liq to'langan", closed: "Yopilgan" };
  var COLS = ["№", "Ism familiya", "Fuqarolik", "Tug'ilgan sana", "Pasport", "Xona", "Manba / raqam", "Aloqa", "To'langan / jami (USD)", "Holat"];

  function tourName(id) { var L = window.MN_L || {}; return ((L.tours || {})[id] || [id])[0]; }
  function endDate(x) { var T = (window.MN_TOURS || {})[x.tour_id], d = new Date(x.start_date + "T12:00:00"); d.setDate(d.getDate() + ((T ? T.days.length : 8) - 1)); return isNaN(d) ? "" : d.toISOString().slice(0, 10); }
  function title(x) { return tourName(x.tour_id) + " · " + P.date(x.start_date) + " — " + P.date(endDate(x)) + " · " + (KN[x.group_kind] || ""); }
  function money(n) { return n == null ? "" : "$" + Math.round(n).toLocaleString("en"); }

  // rows for one departure
  A.rosterRows = async function (dep) {
    var rq = (await sb.from("site_requests").select("ref,contact_name,email,phone,citizenship,pax,travellers,details,price_total,paid_total,status,seats_held").eq("seats_dep", dep.id).gt("seats_held", 0)).data || [];
    var bk = (await sb.from("bookings").select("id,ref,pax,brutto,netto,paid_total,status,config,seats_held,agencies(name,phone,email)").eq("seats_dep", dep.id).gt("seats_held", 0)).data || [];
    var tr = {};
    if (bk.length) ((await sb.from("travellers").select("booking_id,first_name,last_name,nationality,birth_date,passport_no").in("booking_id", bk.map(function (b) { return b.id; }))).data || []).forEach(function (t) { (tr[t.booking_id] = tr[t.booking_id] || []).push(t); });
    var out = [];
    rq.forEach(function (r) {
      var list = (r.travellers || []).filter(function (t) { return t && (t.first || t.last); }), room = RM[(r.details || {}).room] || "";
      var n = Math.max(r.seats_held || r.pax || 1, list.length);
      for (var i = 0; i < n; i++) {
        var t = list[i];
        out.push([0, t ? ((t.last || "") + " " + (t.first || "")).trim() : (i === 0 ? r.contact_name : r.contact_name + " — hamroh " + i), (t && (t.nationality || t.citizenship)) || r.citizenship || "", (t && t.dob) || "", "",
          room, "Sayt · " + r.ref, i === 0 ? [r.phone, r.email].filter(Boolean).join(", ") : "", i === 0 ? money(r.paid_total) + " / " + money(r.price_total) : "", ST[r.status] || r.status]);
      }
    });
    bk.forEach(function (b) {
      var list = tr[b.id] || [], room = (b.config || {}).room === "single" ? "1 kishilik" : "2 kishilik", ag = b.agencies || {};
      var n = Math.max(b.seats_held || b.pax || 1, list.length);
      for (var i = 0; i < n; i++) {
        var t = list[i];
        out.push([0, t ? ((t.last_name || "") + " " + (t.first_name || "")).trim() : ag.name + " — sayohatchi " + (i + 1) + " (ism kiritilmagan)", (t && t.nationality) || "", (t && t.birth_date) || "", (t && t.passport_no) || "",
          room, "Agent " + (ag.name || "") + " · " + b.ref, i === 0 ? [ag.phone, ag.email].filter(Boolean).join(", ") : "", i === 0 ? money(b.paid_total) + " / " + money(b.netto) + " (netto)" : "", ST[b.status] || b.status]);
      }
    });
    out.sort(function (a, b) { return a[1].localeCompare(b[1]); });
    out.forEach(function (r, i) { r[0] = i + 1; });
    return out;
  };
  function fname(dep, ext) { return "Guruh_" + dep.start_date + "_" + (dep.group_kind || "") + "." + ext; }
  function head(dep, rows) { return [["MOVIY NOMAD (MOVIY TRAVEL XK) — guruh ro'yxati"], [title(dep)], ["Sig'im: " + dep.capacity + " · Band: " + dep.booked + " · Bo'sh: " + Math.max(0, dep.capacity - dep.booked) + " · Ro'yxatda: " + rows.length + " kishi · Gid tili: " + (dep.guide_lang || "English")], ["Tuzilgan: " + new Date().toLocaleString("ru-RU")], []]; }

  A.rosterXlsx = function (dep, rows) {
    var ws = XLSX.utils.aoa_to_sheet(head(dep, rows).concat([COLS], rows));
    ws["!cols"] = [5, 28, 14, 13, 13, 18, 30, 30, 22, 16].map(function (w) { return { wch: w }; });
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Ro'yxat"); XLSX.writeFile(wb, fname(dep, "xlsx"));
  };
  A.rosterPdf = function (dep, rows) {
    var doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFillColor(18, 53, 91); doc.rect(0, 0, 297, 22, "F"); doc.setTextColor(255); doc.setFontSize(14); doc.text("MOVIY NOMAD — Group list / Guruh ro'yxati", 12, 10);
    doc.setFontSize(10); doc.text(title(dep), 12, 17); doc.setTextColor(30);
    doc.text("Capacity " + dep.capacity + " · booked " + dep.booked + " · free " + Math.max(0, dep.capacity - dep.booked) + " · listed " + rows.length + " · guide: " + (dep.guide_lang || "English") + " · " + new Date().toLocaleString("ru-RU"), 12, 29);
    doc.autoTable({ startY: 33, head: [["#"].concat(COLS.slice(1))], body: rows, styles: { fontSize: 8, cellPadding: 1.6 }, headStyles: { fillColor: [18, 53, 91] }, alternateRowStyles: { fillColor: [250, 246, 236] }, margin: { left: 8, right: 8 } });
    doc.setFontSize(8); doc.text("MOVIY TRAVEL XK · Licence No. 887333 · +998 97 542 77 99", 12, 205);
    doc.save(fname(dep, "pdf"));
  };
  A.rosterDoc = function (dep, rows) {
    var h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:29.7cm 21cm;mso-page-orientation:landscape;margin:1.5cm}body{font-family:Calibri,Arial;font-size:10pt}table{border-collapse:collapse;width:100%}th{background:#12355b;color:#fff}th,td{border:1px solid #999;padding:3px 5px}</style></head><body>' +
      head(dep, rows).filter(function (r) { return r.length; }).map(function (r, i) { return i === 0 ? '<h2 style="color:#12355b">' + esc(r[0]) + '</h2>' : '<p>' + esc(r[0]) + '</p>'; }).join("") +
      '<table><tr>' + COLS.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join("") + '</tr>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>' +
      '<p style="margin-top:12pt;font-size:8pt">MOVIY TRAVEL XK · Licence № 887333 · +998 97 542 77 99</p></body></html>';
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿", h], { type: "application/msword" })); a.download = fname(dep, "doc"); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };

  // card inside the departure page
  A.rosterBox = async function (dep, holder) {
    holder.innerHTML = '<div class="p-card"><h3>To\'lov qilgan mijozlar ro\'yxati</h3><p class="p-sub">Yuklanmoqda…</p></div>';
    var rows = await A.rosterRows(dep);
    holder.innerHTML = '<div class="p-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h3 style="margin:0">To\'lov qilgan mijozlar ro\'yxati (' + rows.length + ' kishi)</h3>' +
      '<div class="p-actions" style="margin:0"><button class="btn btn--green btn--sm" data-x="xlsx">⬇ Excel</button><button class="btn btn--navy btn--sm" data-x="pdf">⬇ PDF</button><button class="btn btn--outline btn--sm" data-x="doc">⬇ Word</button></div></div>' +
      '<p class="p-sub">30% yoki ko\'proq to\'lagan mijozlar (sayt va agentlar) o\'zi qo\'shiladi. Ism kiritilmagan bo\'lsa, mijoz yoki agentdan so\'rab qo\'shing.</p>' +
      (rows.length ? '<div style="overflow:auto"><table class="tbl"><thead><tr>' + COLS.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>' : '<p class="empty">Hali to\'lov qilgan mijoz yo\'q.</p>') + '</div>';
    [].forEach.call(holder.querySelectorAll("[data-x]"), function (b) {
      b.onclick = function () { var k = b.getAttribute("data-x"); if (k === "xlsx") A.rosterXlsx(dep, rows); else if (k === "pdf") A.rosterPdf(dep, rows); else A.rosterDoc(dep, rows); };
    });
  };

  // one Excel file with every departure that has paid clients (one sheet each) + a summary sheet
  A.rosterAll = async function (deps) {
    var wb = XLSX.utils.book_new(), sum = [["Sana", "Tugash", "Guruh", "Sig'im", "Band", "Bo'sh", "Ro'yxatda"]], used = {};
    for (var i = 0; i < deps.length; i++) {
      var d = deps[i], rows = await A.rosterRows(d);
      sum.push([d.start_date, endDate(d), KN[d.group_kind] || "", d.capacity, d.booked, Math.max(0, d.capacity - d.booked), rows.length]);
      if (!rows.length) continue;
      var name = (d.start_date + " " + (d.group_kind || "")).slice(0, 31); if (used[name]) name = name.slice(0, 28) + "_" + i; used[name] = 1;
      var ws = XLSX.utils.aoa_to_sheet(head(d, rows).concat([COLS], rows)); ws["!cols"] = [5, 28, 14, 13, 13, 18, 30, 30, 22, 16].map(function (w) { return { wch: w }; });
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
    var s = XLSX.utils.aoa_to_sheet(sum); s["!cols"] = [12, 12, 20, 8, 8, 8, 10].map(function (w) { return { wch: w }; });
    XLSX.utils.book_append_sheet(wb, s, "Umumiy");
    wb.SheetNames.unshift(wb.SheetNames.pop());
    XLSX.writeFile(wb, "Guruhlar_royxati_" + new Date().toISOString().slice(0, 10) + ".xlsx");
  };
})();
