/* Moviy Nomad — small month calendar (partner portal, public profile, admin).
   MNCal.render(el, { lang, months, busy: {"2026-12-05": "note"|true}, start: Date, onPick(day, isBusy), notes: bool })
   Colours: green = free, red = busy, grey = past. Monday first. */
(function () {
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function render(el, o) {
    o = o || {}; var lang = o.lang || document.documentElement.lang || "en", months = o.months || 2, busy = o.busy || {};
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var start = o.start ? new Date(o.start) : new Date(today.getFullYear(), today.getMonth(), 1);
    var off = o._off || 0; start = new Date(start.getFullYear(), start.getMonth() + off, 1);
    var mf, wf; try { mf = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }); wf = new Intl.DateTimeFormat(lang, { weekday: "short" }); } catch (e) { mf = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }); wf = new Intl.DateTimeFormat("en", { weekday: "short" }); }
    var wd = []; for (var i = 0; i < 7; i++) wd.push(wf.format(new Date(2024, 0, 1 + i)));   // 2024-01-01 is a Monday
    var h = '<div class="mcal__nav"><button type="button" class="mcal__prev" data-free aria-label="‹"' + (off <= 0 && !o.allowPast ? " disabled" : "") + '>‹</button><button type="button" class="mcal__next" data-free aria-label="›">›</button></div><div class="mcal__months">';
    for (var m = 0; m < months; m++) {
      var first = new Date(start.getFullYear(), start.getMonth() + m, 1), days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      var lead = (first.getDay() + 6) % 7;
      h += '<div class="mcal__m"><b class="mcal__t">' + mf.format(first) + '</b><div class="mcal__g">' + wd.map(function (w) { return '<i>' + w + '</i>'; }).join("");
      for (var b = 0; b < lead; b++) h += '<span></span>';
      for (var d = 1; d <= days; d++) {
        var dt = new Date(first.getFullYear(), first.getMonth(), d), k = key(dt), past = dt < today, isB = Object.prototype.hasOwnProperty.call(busy, k);
        var cls = past ? "is-past" : isB ? "is-busy" : "is-free"; if (+dt === +today) cls += " is-today";
        var note = isB && typeof busy[k] === "string" && busy[k] ? busy[k] : "";
        h += '<button type="button" data-free class="mcal__d ' + cls + (note ? " has-note" : "") + '" data-day="' + k + '"' + (past ? " disabled" : "") + (note ? ' title="' + note.replace(/"/g, "&quot;") + '"' : "") + '>' + d + '</button>';
      }
      h += '</div></div>';
    }
    h += '</div>';
    if (o.legend) h += '<div class="mcal__leg"><span><i class="is-free"></i>' + o.legend[0] + '</span><span><i class="is-busy"></i>' + o.legend[1] + '</span></div>';
    el.innerHTML = h; el.classList.add("mcal");
    el.querySelector(".mcal__prev").onclick = function () { o._off = off - months; render(el, o); };
    el.querySelector(".mcal__next").onclick = function () { o._off = off + months; render(el, o); };
    [].forEach.call(el.querySelectorAll(".mcal__d:not([disabled])"), function (btn) {
      btn.onclick = function () { var k = btn.getAttribute("data-day"); if (o.onPick) o.onPick(k, Object.prototype.hasOwnProperty.call(busy, k), btn); };
    });
  }
  window.MNCal = { render: render, key: key };
})();
