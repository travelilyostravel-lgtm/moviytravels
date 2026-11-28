/* Moviy Nomad — PDF vouchers (jsPDF). Latin text only (passport names are Latin). */
(function () {
  var NAVY = [18, 53, 91], GOLD = [243, 180, 67], SKY = [47, 164, 199], INK = [15, 34, 56], MUTED = [91, 107, 127];
  var KIND = { hotel: "HOTEL VOUCHER", transport: "TRANSFER & TRANSPORT VOUCHER", guide: "GUIDE SERVICE VOUCHER", insurance: "TRAVEL INSURANCE", train: "TRAIN TICKETS", flight: "FLIGHT", other: "SERVICE VOUCHER", summary: "BOOKING CONFIRMATION" };

  function clean(s) { // keep jsPDF's standard font happy
    return String(s == null ? "" : s).replace(/[‘’ʻʼ`]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/→/g, "->").replace(/★/g, "*").replace(/·/g, "-").replace(/×/g, "x")
      .normalize("NFKD").replace(/[^\x20-\x7E\n]/g, "");
  }
  function d(x) { if (!x) return "-"; var t = new Date(x); return isNaN(t) ? x : t.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

  function logo(doc, x, y) {
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(1.6);
    doc.lines([[7, -8], [2, 2]], x, y + 12); doc.line(x + 17, y + 3, x + 26, y + 12);
    doc.setFillColor.apply(doc, SKY); doc.roundedRect(x + 10, y, 9, 12, 4.5, 4.5, "F"); doc.rect(x + 10, y + 5, 9, 7, "F");
    doc.setFillColor.apply(doc, GOLD); doc.rect(x + 8.5, y + 11.2, 12, 1.6, "F"); doc.circle(x + 14.5, y - 2.5, 1.2, "F");
  }

  function header(doc, title, b) {
    var W = doc.internal.pageSize.getWidth();
    doc.setFillColor.apply(doc, NAVY); doc.rect(0, 0, W, 34, "F");
    logo(doc, 14, 11);
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text("MOVIY NOMAD", 46, 17);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(207, 220, 236); doc.text("Inbound tours - Uzbekistan - Kazakhstan - Kyrgyzstan - Tajikistan", 46, 23);
    doc.setTextColor.apply(doc, GOLD); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(title, W - 14, 17, { align: "right" });
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("Booking " + clean(b.ref), W - 14, 23, { align: "right" });
  }

  function section(doc, y, label) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor.apply(doc, SKY); doc.text(label.toUpperCase(), 14, y);
    doc.setDrawColor.apply(doc, GOLD); doc.setLineWidth(0.6); doc.line(14, y + 2, 34, y + 2); return y + 8;
  }
  function rows(doc, y, list) {
    var W = doc.internal.pageSize.getWidth();
    list.forEach(function (r) {
      if (!r[1]) return;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor.apply(doc, MUTED); doc.text(clean(r[0]), 14, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor.apply(doc, INK);
      var lines = doc.splitTextToSize(clean(r[1]), W - 74); doc.text(lines, 60, y); y += Math.max(6.5, lines.length * 5.2 + 1.5);
    });
    return y + 2;
  }
  function travellers(doc, y, tr) {
    y = section(doc, y, "Travellers (" + tr.length + ")");
    doc.setFontSize(9); doc.setTextColor.apply(doc, MUTED); doc.setFont("helvetica", "normal");
    doc.text("Name", 14, y); doc.text("Passport", 95, y); doc.text("Nationality", 135, y); doc.text("Birth date", 172, y); y += 5;
    doc.setTextColor.apply(doc, INK); doc.setFontSize(10);
    tr.forEach(function (t, i) {
      doc.setFont("helvetica", "bold"); doc.text((i + 1) + ". " + clean(t.last_name + " " + t.first_name), 14, y);
      doc.setFont("helvetica", "normal"); doc.text(clean(t.passport_no), 95, y); doc.text(clean(t.nationality || "-"), 135, y); doc.text(t.birth_date ? d(t.birth_date) : "-", 172, y); y += 6;
    });
    return y + 4;
  }
  function footer(doc, contact) {
    var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    doc.setDrawColor(228, 224, 216); doc.setLineWidth(0.3); doc.line(14, H - 24, W - 14, H - 24);
    doc.setFontSize(8.5); doc.setTextColor.apply(doc, MUTED); doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(clean("Please present this voucher together with your passport. 24/7 assistance: " + contact), W - 28), 14, H - 18);
    doc.text("Issued " + d(new Date()) + " by Moviy Nomad (Moviy Travel)", 14, H - 9);
  }

  function base(b, agency) {
    var r = b.config && b.config.route ? b.config.route.map(function (x) { return x.name + " (" + x.nights + "n)"; }).join(" -> ") : "";
    return [["Booking", b.ref], ["Tour", b.tour_title], ["Start date", d(b.start_date)], ["Route", r], ["Travellers", String(b.pax)], ["Agency", agency ? agency.name : ""]];
  }

  // One PDF per service + one booking confirmation
  function make(b, agency, travellersList, services, contact) {
    var jsPDF = window.jspdf.jsPDF, out = [];
    services.forEach(function (s, n) {
      var doc = new jsPDF({ unit: "mm", format: "a4" });
      header(doc, KIND[s.kind] || KIND.other, b);
      var y = section(doc, 48, "Service");
      y = rows(doc, y, [["Service", s.title], ["City", s.city], ["Check-in / from", s.date_from ? d(s.date_from) : ""], ["Check-out / to", s.date_to ? d(s.date_to) : ""],
        ["Confirmation no.", s.confirmation_no], ["Contact", s.contact], ["Details", s.details]]);
      y = travellers(doc, y + 4, travellersList);
      y = section(doc, y, "Booking"); rows(doc, y, base(b, agency));
      footer(doc, contact);
      out.push({ kind: s.kind, title: (KIND[s.kind] || "Voucher").replace(/ VOUCHER| & TRANSPORT/g, "") + " - " + s.title, name: s.kind + "-" + (n + 1) + ".pdf", blob: doc.output("blob") });
    });
    var doc = new jsPDF({ unit: "mm", format: "a4" });
    header(doc, KIND.summary, b);
    var y = section(doc, 48, "Booking"); y = rows(doc, y, base(b, agency).concat([["Hotels", b.config && b.config.hotel], ["Transport", b.config && b.config.transport], ["Guide", b.config && b.config.guide]]));
    y = travellers(doc, y + 2, travellersList);
    y = section(doc, y, "Services");
    doc.setFontSize(10);
    services.forEach(function (s) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setTextColor.apply(doc, INK); doc.text(clean(s.title), 14, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor.apply(doc, MUTED);
      doc.text(clean([s.kind, s.city, s.date_from ? d(s.date_from) + (s.date_to ? " - " + d(s.date_to) : "") : "", s.confirmation_no ? "conf. " + s.confirmation_no : ""].filter(Boolean).join("  |  ")), 14, y + 5); y += 12;
    });
    footer(doc, contact);
    out.unshift({ kind: "summary", title: "Booking confirmation", name: "confirmation.pdf", blob: doc.output("blob") });
    return out;
  }

  window.MN_VOUCHER = { make: make, clean: clean };
})();
