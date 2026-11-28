// Moviy Nomad — sends the letters waiting in public.notify_outbox by e-mail (Resend).
// Called every minute by pg_cron (see supabase/notify_auto.sql). Texts: <site>/assets/data/notify.json
// Secrets (Supabase → Edge Functions → Secrets): RESEND_API_KEY, MAIL_FROM (e.g. "Moviy Nomad <info@moviy-travel.uz>")
// Fallback until the domain is verified in Resend: GMAIL_USER + GMAIL_APP_PASSWORD (Google app password) — sent via smtp.gmail.com:465
// (Supabase Edge Functions block outbound ports 25 and 587; 465 with implicit TLS is allowed.)
import { createClient } from "jsr:@supabase/supabase-js@2";

// New projects: SUPABASE_SECRET_KEYS = {"default":"sb_secret_..."}; old projects: SUPABASE_SERVICE_ROLE_KEY
const SK = (() => { try { const j = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); return j.default || Object.values(j)[0] || ""; } catch { return ""; } })() || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, SK as string, { auth: { persistSession: false } });
const KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("MAIL_FROM") || "Moviy Nomad <info@moviy-travel.uz>";
const GUSER = Deno.env.get("GMAIL_USER") || "";
const GPASS = (Deno.env.get("GMAIL_APP_PASSWORD") || "").replace(/\s+/g, "");
const SITE = (Deno.env.get("SITE_URL") || "https://moviy-travel.uz").replace(/\/$/, "");
let CFG: any = null, cfgAt = 0;
async function conf() {
  if (!CFG || Date.now() - cfgAt > 10 * 60 * 1000) { CFG = await (await fetch(SITE + "/assets/data/notify.json", { cache: "no-store" })).json(); cfgAt = Date.now(); }
  return CFG;
}
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const dmy = (d?: string | null) => { if (!d) return ""; const [y, m, x] = String(d).slice(0, 10).split("-"); return `${x}.${m}.${y}`; };
const addDays = (d: string, n: number) => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);

function render(c: any, ev: string, lang: string, x: any) {
  const T = c.msg[lang] || c.msg.en, t = T[ev] || c.msg.en[ev];
  if (!t) throw new Error("no template " + ev);
  const C = c.co, tot = +x.total || 0, paid = +x.paid_total || 0, dep = Math.round(tot * 0.3), left = Math.max(0, tot - paid);
  const due = x.balance_due ? dmy(x.balance_due) : (x.start_date ? dmy(addDays(x.start_date, -14)) : "");
  const vurl = x.voucher_key ? `${SITE}/voucher.html?ref=${encodeURIComponent(x.ref)}&k=${encodeURIComponent(x.voucher_key)}&lang=${lang}` : "";
  const V: Record<string, string> = {
    ref: x.ref, name: x.name || "", tour: x.tour || "", date: dmy(x.start_date), pax: String(x.pax || ""),
    total: money(tot), dep: money(dep), bal: money(tot - dep), due, paid: money(paid), last: money(paid),
    left: left > 0 ? `${T.w.bal}: ${money(left)}${due ? " — " + T.w.by + " " + due : ""}` : T.w.full, left_amt: money(left),
    doc: vurl, svc: vurl ? vurl + "&doc=services" : "", lic: C.license || "", phone: C.phone || "", email: C.email || "",
    terms: `${SITE}/${lang === "en" ? "" : lang + "/"}terms.html`, site: SITE, kind: x.kind_label || "", contact: x.contact || "",
    bank: `${C.company}\nINN ${C.inn} · ${C.bank} · MFO ${C.mfo}\nAccount (UZS): ${C.account}`,
    cab: `${SITE}/${lang === "en" ? "" : lang + "/"}account.html`, msg: x.msg || "",
  };
  const f = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => V[k] ?? "");
  const subject = f(t[0]), text = f(t[1]);
  const body = esc(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#1f6fb2">$1</a>').replace(/\n/g, "<br>");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html dir="${dir}"><body style="margin:0;background:#f5f1ea;font-family:Arial,Helvetica,sans-serif;color:#1b2a3a">
<div style="max-width:600px;margin:0 auto;padding:24px 14px"><div style="background:#12355b;color:#fff;padding:16px 22px;border-radius:14px 14px 0 0;font-weight:bold;letter-spacing:.08em">MOVIY <span style="color:#7cc4dd">NOMAD</span></div>
<div style="background:#fff;padding:24px 22px;border-radius:0 0 14px 14px;font-size:15px;line-height:1.6">${body}</div>
<p style="font-size:12px;color:#7a8796;text-align:center;margin-top:14px">${esc(C.company)} · ${esc(C.phone)} · ${esc(C.email || "")} · <a href="${SITE}" style="color:#7a8796">${SITE.replace("https://", "")}</a></p></div></body></html>`;
  return { subject, text, html };
}

// ---- minimal SMTP client (implicit TLS, AUTH LOGIN) for the Gmail fallback
const te = new TextEncoder(), td = new TextDecoder();
function b64(s: string | Uint8Array) {
  const u = typeof s === "string" ? te.encode(s) : s; let bin = "";
  for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(bin);
}
const wrap = (s: string) => s.replace(/.{1,76}/g, "$&\r\n");
async function gmailSend(to: string, subject: string, html: string, text: string, replyTo?: string) {
  const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
  let acc = "";
  const buf = new Uint8Array(8192);
  const reply = async (want: number) => {
    const t0 = Date.now();
    while (true) {
      const m = acc.match(/(^|\r\n)(\d{3}) [^\r\n]*\r\n$/);
      if (m) { const code = +m[2], all = acc; acc = ""; if (code !== want) throw new Error("Gmail SMTP " + code + ": " + all.trim().slice(0, 200)); return; }
      if (Date.now() - t0 > 20000) throw new Error("Gmail SMTP timeout");
      const n = await conn.read(buf); if (n === null) throw new Error("Gmail SMTP closed: " + acc.slice(0, 200));
      acc += td.decode(buf.subarray(0, n));
    }
  };
  const cmd = async (line: string, want: number) => { await conn.write(te.encode(line + "\r\n")); await reply(want); };
  try {
    await reply(220);
    await cmd("EHLO moviy-travel.uz", 250);
    await cmd("AUTH LOGIN", 334);
    await cmd(b64(GUSER), 334);
    await cmd(b64(GPASS), 235);
    await cmd(`MAIL FROM:<${GUSER}>`, 250);
    await cmd(`RCPT TO:<${to}>`, 250);
    await cmd("DATA", 354);
    const bd = "mn" + crypto.randomUUID().replace(/-/g, "");
    const msg = [
      `From: =?UTF-8?B?${b64("Moviy Nomad")}?= <${GUSER}>`, `To: <${to}>`, replyTo ? `Reply-To: <${replyTo}>` : "",
      `Subject: =?UTF-8?B?${b64(subject)}?=`, `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
      `Message-ID: <${crypto.randomUUID()}@moviy-travel.uz>`, "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${bd}"`, "",
      `--${bd}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(b64(text)),
      `--${bd}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(b64(html)),
      `--${bd}--`, "",
    ].filter((l, i) => l !== "" || i > 3).join("\r\n");
    await conn.write(te.encode(msg + "\r\n.\r\n")); await reply(250);
    await conn.write(te.encode("QUIT\r\n"));
  } finally { try { conn.close(); } catch { /* closed */ } }
}

async function record(row: any) {
  if (row.ref_table === "site_customers") {
    // client cabinet letters: new message / cabinet approved / office alerts
    const { data: c } = await sb.from("site_customers").select("*").eq("id", row.ref_id).single();
    if (!c) return null;
    const author = row.event === "admin_msg" ? "client" : "admin";
    const { data: m } = await sb.from("request_messages").select("body").eq("customer_id", c.id).eq("author", author).order("created_at", { ascending: false }).limit(1);
    const body = m && m[0] ? String(m[0].body) : "";
    return { ref: "", name: c.name || c.email, tour: "", start_date: null, pax: "", total: 0, paid_total: 0, balance_due: null, voucher_key: null,
      kind_label: "Mijoz kabineti", contact: [c.email, c.phone].filter(Boolean).join(", "), msg: body.length > 600 ? body.slice(0, 600) + "…" : body };
  }
  if (row.ref_table === "site_requests") {
    const { data: r } = await sb.from("site_requests").select("*").eq("id", row.ref_id).single();
    if (!r) return null;
    return { ref: r.ref, name: r.contact_name, tour: r.tour_title || r.service || r.tour_id || "", start_date: r.start_date, pax: r.pax,
      total: r.price_total, paid_total: r.paid_total, balance_due: r.balance_due, voucher_key: r.voucher_key,
      kind_label: "Sayt so'rovi (B2C)", contact: [r.phone, r.email].filter(Boolean).join(", ") };
  }
  const { data: b } = await sb.from("bookings").select("*, agencies(name, contact_name, phone, email)").eq("id", row.ref_id).single();
  if (!b) return null;
  return { ref: b.ref, name: b.agencies?.contact_name || b.agencies?.name || "", tour: b.tour_title, start_date: b.start_date, pax: b.pax,
    total: b.netto, paid_total: b.paid_total, balance_due: b.balance_due, voucher_key: b.voucher_key,
    kind_label: "Agent broni (B2B) — " + (b.agencies?.name || ""), contact: [b.agencies?.phone, b.agencies?.email].filter(Boolean).join(", ") };
}

Deno.serve(async () => {
  const GM = !!(GUSER && GPASS);
  if (!KEY && !GM) return Response.json({ ok: false, reason: "RESEND_API_KEY is not set" });
  let useGmail = !KEY;
  const c = await conf();
  const { data: rows, error: qerr } = await sb.from("notify_outbox").select("*").eq("status", "pending").order("id").limit(20);
  if (qerr) return Response.json({ ok: false, reason: "db: " + qerr.message });
  let sent = 0;
  for (const row of rows || []) {
    try {
      if (Date.now() - new Date(row.created_at).getTime() > 7 * 864e5) { await sb.from("notify_outbox").update({ status: "expired" }).eq("id", row.id); continue; }
      const x = await record(row);
      if (!x) { await sb.from("notify_outbox").update({ status: "error", error: "record not found" }).eq("id", row.id); continue; }
      const m = render(c, row.event, row.lang in c.msg ? row.lang : "en", x);
      let via = "resend";
      if (!useGmail) {
        const res = await fetch("https://api.resend.com/emails", { method: "POST",
          headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [row.to_email], reply_to: c.co.email || undefined, subject: m.subject, html: m.html, text: m.text }) });
        if (!res.ok) {
          const t = (await res.text()).slice(0, 300);
          if (GM && /domain is not verified/i.test(t)) useGmail = true; else throw new Error("Resend " + res.status + ": " + t);
        }
      }
      if (useGmail) { await gmailSend(row.to_email, m.subject, m.html, m.text, c.co.email || undefined); via = "gmail"; }
      await sb.from("notify_outbox").update({ status: "sent", sent_at: new Date().toISOString(), subject: m.subject, error: via === "gmail" ? "Gmail orqali yuborildi (Resend domeni tasdiqlanguncha)" : null }).eq("id", row.id);
      sent++;
    } catch (e) {
      // Domain not verified yet in Resend and no Gmail fallback: keep the letter waiting (no attempt counted; expires after 7 days).
      if (/domain is not verified/i.test(String(e))) { await sb.from("notify_outbox").update({ error: "Resend: domen hali tasdiqlanmagan — kutmoqda" }).eq("id", row.id); continue; }
      const a = (row.attempts || 0) + 1;
      await sb.from("notify_outbox").update({ attempts: a, status: a >= 5 ? "error" : "pending", error: String(e).slice(0, 500) }).eq("id", row.id);
    }
  }
  return Response.json({ ok: true, pending: rows?.length || 0, sent });
});
