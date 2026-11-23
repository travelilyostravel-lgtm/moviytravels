/* Moviy Nomad — shared helpers for the agent portal and the admin panel. */
(function () {
  var cfg = window.MN_SB || {};
  var configured = !!(cfg.url && cfg.anonKey && window.supabase);
  // a random id for this browser/device (managers must log in from approved devices)
  var dev = null;
  try { dev = localStorage.getItem("mn_dev"); if (!dev || dev.length < 32) { var a = new Uint8Array(16); crypto.getRandomValues(a); dev = Array.from(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join(""); localStorage.setItem("mn_dev", dev); } } catch (e) {}
  var sb = configured ? window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true }, global: { headers: dev ? { "x-device-id": dev } : {} } }) : null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n, cur) { if (n == null || isNaN(n)) return "—"; return (cur === "EUR" ? "€" : "$") + Number(n).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function date(d) { if (!d) return "—"; var x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function msg(el, text, kind) { if (typeof el === "string") el = $(el); if (!el) return; el.className = "msg msg--" + (kind || "info"); el.textContent = text || ""; }
  function err(e) { return (e && (e.message || e.error_description || e.error)) || String(e); }

  async function signed(bucket, path, mins) {
    var r = await sb.storage.from(bucket).createSignedUrl(path, (mins || 10) * 60);
    if (r.error) throw r.error; return r.data.signedUrl;
  }
  function safeName(n) { return String(n || "file").normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-80); }
  async function upload(bucket, folder, file) {
    var path = folder + "/" + Date.now().toString(36) + "-" + safeName(file.name);
    var r = await sb.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (r.error) throw r.error; return path;
  }
  // Open a private file in a new tab
  async function openFile(bucket, path) {
    var w = window.open("", "_blank");
    try { var u = await signed(bucket, path, 10); if (w) w.location = u; else location.href = u; }
    catch (e) { if (w) w.close(); alert(err(e)); }
  }

  var STATUS = {
    en: { request: "Request", awaiting_payment: "Awaiting payment", payment_reported: "Payment reported", deposit_paid: "Deposit paid (30%)", paid: "Paid", confirmed: "Confirmed", cancelled: "Cancelled",
          pending: "Pending review", approved: "Approved", rejected: "Rejected", blocked: "Blocked" },
    uz: { request: "Yangi so'rov", awaiting_payment: "To'lov kutilmoqda", payment_reported: "To'lov qilindi (tekshirish)", deposit_paid: "30% to'landi", paid: "To'lov tasdiqlandi", confirmed: "Vaucherlar tayyor", cancelled: "Bekor qilingan",
          pending: "Tekshiruvda", approved: "Tasdiqlangan", rejected: "Rad etilgan", blocked: "Bloklangan" }
  };
  function badge(s, lang) { return '<span class="badge-s st-' + esc(s) + '">' + esc((STATUS[lang || "en"] || STATUS.en)[s] || s) + '</span>'; }
  var FLOW = ["request", "awaiting_payment", "deposit_paid", "paid", "confirmed"];
  function flowLine(s, lang) {
    var i = FLOW.indexOf(s === "payment_reported" ? "awaiting_payment" : s);
    if (s === "cancelled") return '<div class="steps-line"><span class="now">' + esc(STATUS[lang || "en"].cancelled) + '</span></div>';
    return '<div class="steps-line">' + FLOW.map(function (f, n) { return '<span class="' + (n < i ? "done" : n === i ? "now" : "") + '">' + esc(STATUS[lang || "en"][f]) + '</span>'; }).join("") + '</div>';
  }

  window.MNP = { sb: sb, configured: configured, esc: esc, money: money, date: date, $: $, $$: $$, msg: msg, err: err, signed: signed, upload: upload, openFile: openFile, badge: badge, flowLine: flowLine, STATUS: STATUS };
})();
