/* Admin: list of automatic e-mails (table notify_outbox) for one request or booking */
(function () {
  var EV = { request_new: "So'rov qabul qilindi", booking_new: "Bron so'rovi qabul qilindi", confirm: "Bron tasdiqlandi — 30% to'lang", received: "To'lov qabul qilindi", voucher: "To'liq to'landi — vaucherlar", cancel: "Bekor qilindi", reminder: "Eslatma: qolgan to'lov", final: "Oxirgi eslatma (48 soat)", admin_new: "Ofisga: yangi so'rov", admin_paid: "Ofisga: agent to'lov qildim dedi" };
  var ST = { pending: ["⏳", "navbatda"], sent: ["✅", "yuborildi"], error: ["⚠️", "xato"], expired: ["⌛", "muddati o'tdi"] };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  window.MN_AUTOLOG = async function (refId, el) {
    if (!el || !window.MN_SB_CLIENT) return;
    var r = await window.MN_SB_CLIENT.from("notify_outbox").select("event,to_email,lang,status,created_at,sent_at,error").eq("ref_id", refId).order("id");
    if (r.error) { el.innerHTML = ""; return; }
    var rows = r.data || [];
    el.innerHTML = '<div class="autolog"><b>📧 Avtomatik xatlar</b> <small class="p-sub">— har bosqichda mijozga / agentga o\'zi yuboriladi</small>' +
      (rows.length ? '<ul>' + rows.map(function (x) { var s = ST[x.status] || ["", x.status], d = new Date(x.sent_at || x.created_at);
        return '<li>' + s[0] + ' ' + esc(EV[x.event] || x.event) + ' → ' + esc(x.to_email) + ' <small>(' + esc((x.lang || "").toUpperCase()) + ', ' + d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + ', ' + s[1] + ')</small>' + (x.status === "error" && x.error ? '<br><small style="color:#b5482f">' + esc(x.error.slice(0, 160)) + '</small>' : '') + '</li>'; }).join("") + '</ul>'
        : '<p class="p-sub">Hali avtomatik xat yo\'q.</p>') + '</div>';
  };
})();
