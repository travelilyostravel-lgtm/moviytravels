// Moviy Nomad — Telegram bot for partners (2026-11-27).
//   POST (from Telegram)       /start <code>  → links the partner's chat; any other text → short help
//   GET  ?send=1               sends the waiting messages (the database knocks every 2 minutes when something waits)
//   GET  ?setup=1              points the bot's webhook to this address (the founder presses it once in the admin)
// Secrets only in Vercel → Settings → Environment Variables (the founder sets them):
//   TELEGRAM_BOT_TOKEN   from @BotFather
//   TG_DB_KEY            the long key the founder also saved once in Admin → Hamkorlar → «📲 Telegram bot»
const crypto = require("crypto");
const SB_URL = "https://qlytfxwxauvlrbfnwzod.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXRmeHd4YXV2bHJiZm53em9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMTU2NDMsImV4cCI6MjExMDY5MTY0M30.BYSd6Fal0Rf7fX5BqrITBYkI8NrCMcY74FsbqsJnI0o";
const SITE = "https://moviy-travel.uz";

function rpc(name, body) {
  return fetch(SB_URL + "/rest/v1/rpc/" + name, { method: "POST", headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(async function (r) { var t = await r.text(); if (!r.ok) throw new Error(t.slice(0, 200)); try { return JSON.parse(t); } catch (e) { return t; } });
}
function tg(token, method, body) {
  return fetch("https://api.telegram.org/bot" + token + "/" + method, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
}
// the webhook secret is derived from the bot token, so nothing extra has to be stored
function hookSecret(token) { return crypto.createHash("sha256").update("mn-hook:" + token).digest("hex").slice(0, 48); }
function readBody(req) {
  return new Promise(function (ok) {
    if (req.body && typeof req.body === "object") return ok(req.body);
    var d = ""; req.on("data", function (c) { d += c; if (d.length > 65536) req.destroy(); }); req.on("end", function () { try { ok(JSON.parse(d || "{}")); } catch (e) { ok({}); } }); req.on("error", function () { ok({}); });
  });
}
const BTN = { inline_keyboard: [[{ text: "🔑 Kabinet / Кабинет", url: SITE + "/partner/" }]] };
const HELLO = "👋 Assalomu alaykum! Bu — Moviy Nomad hamkorlar boti.\nBu yerga kartochkangiz, buyurtmalar va muhim ogohlantirishlar haqida xabar keladi.\n\nUlash uchun saytdagi kabinetingizda «📲 Telegram» tugmasini bosing.\n\n— — —\n\nЗдравствуйте! Это бот партнёров Moviy Nomad. Чтобы подключить уведомления, нажмите «📲 Telegram» в своём кабинете на сайте.";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  var token = process.env.TELEGRAM_BOT_TOKEN, key = process.env.TG_DB_KEY;
  if (!token || !key) return res.status(503).json({ ok: false, error: "not configured" });
  var q = req.query || {};

  if (req.method === "GET" && q.setup) {
    var r = await tg(token, "setWebhook", { url: SITE + "/api/tg-bot", secret_token: hookSecret(token), allowed_updates: ["message"], drop_pending_updates: true });
    var me = await tg(token, "getMe", {});
    return res.status(200).json({ ok: !!r.ok, webhook: r.description || "", bot: me.result ? me.result.username : "" });
  }

  if (req.method === "GET" && q.send) {
    var sent = 0, failed = 0, list = [];
    try { list = await rpc("tg_outbox_take", { p_key: key }); } catch (e) { return res.status(500).json({ ok: false, error: String(e.message || e) }); }
    for (var i = 0; i < (list || []).length; i++) {
      var m = list[i], out = await tg(token, "sendMessage", { chat_id: m.chat, text: m.text, disable_web_page_preview: true, reply_markup: m.button ? { inline_keyboard: [[{ text: "🔑 Kabinet / Кабинет", url: m.button }]] } : undefined });
      try { await rpc("tg_outbox_done", { p_key: key, p_id: m.id, p_ok: !!out.ok, p_err: out.ok ? null : String(out.description || "error") }); } catch (e) {}
      if (out.ok) sent++; else failed++;
      await new Promise(function (r2) { setTimeout(r2, 60); });   // stay well under Telegram's speed limit
    }
    return res.status(200).json({ ok: true, sent: sent, failed: failed });
  }

  if (req.method === "POST") {
    if (req.headers["x-telegram-bot-api-secret-token"] !== hookSecret(token)) return res.status(401).end();
    var u = await readBody(req), msg = u.message || {}, chat = msg.chat && msg.chat.id, text = String(msg.text || "").trim();
    if (!chat || (msg.chat.type && msg.chat.type !== "private")) return res.status(200).end();
    var mm = /^\/start(?:\s+(p[0-9a-f]{18}))?$/.exec(text);
    if (mm && mm[1]) {
      var lk = null; try { lk = await rpc("tg_link", { p_key: key, p_code: mm[1], p_chat: chat }); } catch (e) {}
      if (lk && lk.ok) await tg(token, "sendMessage", { chat_id: chat, reply_markup: BTN,
        text: "✅ " + (lk.name || "") + ", Telegram xabarnomalar ulandi! Endi kartochkangiz va buyurtmalar haqidagi muhim xabarlar shu yerga keladi.\n\n— — —\n\n✅ Уведомления подключены! Важные сообщения о карточке и заказах будут приходить сюда." });
      else await tg(token, "sendMessage", { chat_id: chat, reply_markup: BTN, text: "⚠ Havola eskirgan. Kabinetingizda «📲 Telegram» tugmasini qayta bosing.\n\n⚠ Ссылка устарела. Нажмите «📲 Telegram» в кабинете ещё раз." });
    } else {
      await tg(token, "sendMessage", { chat_id: chat, text: HELLO, reply_markup: BTN });
    }
    return res.status(200).end();
  }
  res.status(405).end();
};
