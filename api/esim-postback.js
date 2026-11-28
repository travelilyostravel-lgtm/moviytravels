// Moviy Nomad — eSIM sale / top-up / refund report from the partner Qulay SIM (2026-11-27).
// Qulay SIM calls  https://moviy-travel.uz/api/esim-postback  after each payment (POST JSON or GET query).
// Two secrets live only in Vercel → Settings → Environment Variables (the founder sets them, they are never in the code):
//   ESIM_INGEST_KEY      the same long key the founder typed once in Admin → eSIM («Kalitni saqlash»)
//   ESIM_WEBHOOK_SECRET  (optional) shared secret from Qulay SIM; when set, the request must carry a valid
//                        HMAC-SHA256 signature of the raw body in the header  X-Signature  (hex)
// The function only forwards the numbers to the database; no card or passport data is accepted or stored.
const crypto = require("crypto");

const SB_URL = "https://qlytfxwxauvlrbfnwzod.supabase.co";
// public "anon" key (same as in assets/js/sb-config.js) — the database itself checks ESIM_INGEST_KEY
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXRmeHd4YXV2bHJiZm53em9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMTU2NDMsImV4cCI6MjExMDY5MTY0M30.BYSd6Fal0Rf7fX5BqrITBYkI8NrCMcY74FsbqsJnI0o";
const ALLOWED = ["order_id", "orderId", "transaction_id", "id", "sub", "sub_id", "subid", "click_id", "clickId", "event", "type", "kind",
  "plan", "plan_name", "package", "gb", "data_gb", "days", "validity", "amount", "price", "total", "currency", "commission", "payout", "status", "country"];

function readBody(req) {
  return new Promise(function (ok) {
    if (typeof req.body === "string") return ok(req.body);
    if (req.body && typeof req.body === "object") return ok(JSON.stringify(req.body));
    var d = ""; req.on("data", function (c) { d += c; if (d.length > 65536) req.destroy(); }); req.on("end", function () { ok(d); }); req.on("error", function () { ok(""); });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  var key = process.env.ESIM_INGEST_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "not configured" });
  var raw = req.method === "POST" ? await readBody(req) : "";
  var secret = process.env.ESIM_WEBHOOK_SECRET;
  if (secret) {
    var sig = String(req.headers["x-signature"] || "").toLowerCase();
    var want = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return res.status(401).json({ ok: false, error: "bad signature" });
  }
  var src = {};
  try { src = raw ? JSON.parse(raw) : {}; } catch (e) { src = Object.fromEntries(new URLSearchParams(raw)); }
  if (req.method !== "POST") src = Object.assign({}, req.query || {});
  // keep only the expected numbers/labels — nothing personal is forwarded
  var p = {}; ALLOWED.forEach(function (k) { if (src[k] != null && src[k] !== "") p[k] = String(src[k]).slice(0, 120); });
  var r = await fetch(SB_URL + "/rest/v1/rpc/esim_ingest", {
    method: "POST", headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ p_key: key, p: p })
  });
  if (!r.ok) return res.status(400).json({ ok: false, error: (await r.text()).slice(0, 200) });
  return res.status(200).json({ ok: true });
};
