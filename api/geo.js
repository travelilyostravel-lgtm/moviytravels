// Moviy Nomad — visitor country for the statistics (2026-11-27).
// Vercel adds the visitor's country to every request; we return only the 2-letter code. No IP is read or stored.
module.exports = function handler(req, res) {
  var c = String(req.headers["x-vercel-ip-country"] || "").slice(0, 2).toUpperCase();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.status(200).send(JSON.stringify({ c: /^[A-Z]{2}$/.test(c) ? c : "" }));
};
