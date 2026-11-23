/* Moviy Nomad — guaranteed group departures: schedule table with free seats in 3 colours.
   Used on the public group page (B2C), in the agent portal (B2B) and in the admin panel (founder + managers).
   green = seats available, yellow = few seats left, red = no seats left. */
(function () {
  var T = {
    en: { title: "Departure schedule", date: "Dates", small: "Small group 12–17", medium: "Medium group 30–35", large: "Large group 45–50", left: "{n} left", full: "Full", green: "Seats available", yellow: "Few seats left", red: "No seats left", pp: "per person", none: "No departures yet." },
    uz: { title: "Reyslar jadvali", date: "Sanalar", small: "Kichik guruh 12–17", medium: "O'rta guruh 30–35", large: "Katta guruh 45–50", left: "{n} ta bo'sh", full: "Joy yo'q", green: "Joy bor", yellow: "Joy kam qoldi", red: "Joy qolmadi", pp: "1 kishi", none: "Hali reys yo'q." }
  };
  function seats(x) { return Math.max(0, (x.capacity || 0) - (x.booked || 0)); }
  // colour rule: red = 0 or closed; yellow = 20% of the group or less (at least 3 seats); green = more
  function color(x) {
    var s = seats(x);
    if (x.status === "full" || x.status === "cancelled" || s <= 0) return "red";
    return s <= Math.max(3, Math.ceil((x.capacity || 0) * 0.2)) ? "yellow" : "green";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function tf(s, o) { return String(s || "").replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ""; }); }
  /* opts: { lang, labels (override), title(tourId)->name, range(row)->text, onPick(row) , showPrice } */
  function render(holder, rows, opts) {
    opts = opts || {};
    var L = Object.assign({}, T[opts.lang] || T.en, opts.labels || {});
    if (!rows || !rows.length) { holder.innerHTML = '<p class="gds-none">' + esc(L.none) + '</p>'; return; }
    var by = {}, order = [];
    rows.forEach(function (x) { var k = x.tour_id + "|" + x.start_date; if (!by[k]) { by[k] = {}; order.push(k); } by[k][x.group_kind || "large"] = x; });
    order.sort(function (a, b) { return a.split("|")[1] < b.split("|")[1] ? -1 : 1; });
    var tours = {}; order.forEach(function (k) { tours[k.split("|")[0]] = 1; });
    var multi = Object.keys(tours).length > 1;
    var cell = function (x) {
      if (!x) return '<td class="gds-c gds-c--na">—</td>';
      var c = color(x), s = seats(x);
      return '<td class="gds-c gds-c--' + c + '"' + (opts.onPick && c !== "red" ? ' data-pick="' + esc(x.id) + '" tabindex="0" role="button"' : '') + '><b>' + esc(c === "red" ? L.full : tf(L.left, { n: s })) + '</b>' +
        (opts.showPrice !== false && x.price_pp ? '<small>$' + Math.round(x.price_pp).toLocaleString("en") + '</small>' : '') + '</td>';
    };
    var h = '<div class="gds-legend"><span class="gds-dot gds-dot--green"></span>' + esc(L.green) + '<span class="gds-dot gds-dot--yellow"></span>' + esc(L.yellow) + '<span class="gds-dot gds-dot--red"></span>' + esc(L.red) + '</div>' +
      '<div class="gds-wrap"><table class="gds-t"><thead><tr><th>' + esc(L.date) + '</th><th>' + esc(L.small) + '</th><th>' + esc(L.medium) + '</th><th>' + esc(L.large) + '</th></tr></thead><tbody>' +
      order.map(function (k) {
        var g = by[k], any = g.small || g.medium || g.large, tid = k.split("|")[0];
        return '<tr><th scope="row">' + esc(opts.range ? opts.range(any) : any.start_date) + (multi && opts.title ? '<br><small>' + esc(opts.title(tid)) + '</small>' : '') + '</th>' + cell(g.small) + cell(g.medium) + cell(g.large) + '</tr>';
      }).join("") + '</tbody></table></div>';
    holder.innerHTML = h;
    if (opts.onPick) [].forEach.call(holder.querySelectorAll("[data-pick]"), function (td) {
      var go = function () { var id = td.getAttribute("data-pick"); opts.onPick(rows.filter(function (r) { return String(r.id) === id; })[0]); };
      td.onclick = go; td.onkeydown = function (e) { if (e.key === "Enter") go(); };
    });
  }
  window.MN_GDS = { render: render, color: color, seats: seats };
})();
