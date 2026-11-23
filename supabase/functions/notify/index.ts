// Moviy Nomad — sends the letters waiting in public.notify_outbox by e-mail (Resend).
// Called every minute by pg_cron (see supabase/notify_auto.sql). Texts: <site>/assets/data/notify.json
// Secrets (Supabase → Edge Functions → Secrets): RESEND_API_KEY, MAIL_FROM (e.g. "Moviy Nomad <info@moviy-travel.uz>")
import { createClient } from "jsr:@supabase/supabase-js@2";

// New projects: SUPABASE_SECRET_KEYS = {"default":"sb_secret_..."}; old projects: SUPABASE_SERVICE_ROLE_KEY
const SK = (() => { try { const j = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); return j.default || Object.values(j)[0] || ""; } catch { return ""; } })() || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, SK as string, { auth: { persistSession: false } });
const KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("MAIL_FROM") || "Moviy Nomad <info@moviy-travel.uz>";
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

async function record(row: any) {
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
  if (!KEY) return Response.json({ ok: false, reason: "RESEND_API_KEY is not set" });
  const c = await conf();
  const { data: rows, error: qerr } = await sb.from("notify_outbox").select("*").eq("status", "pending").order("id").limit(20);
  if (qerr) return Response.json({ ok: false, reason: "db: " + qerr.message });
  let sent = 0;
  for (const row of rows || []) {
    try {
      if (Date.now() - new Date(row.created_at).getTime() > 3 * 864e5) { await sb.from("notify_outbox").update({ status: "expired" }).eq("id", row.id); continue; }
      const x = await record(row);
      if (!x) { await sb.from("notify_outbox").update({ status: "error", error: "record not found" }).eq("id", row.id); continue; }
      const m = render(c, row.event, row.lang in c.msg ? row.lang : "en", x);
      const res = await fetch("https://api.resend.com/emails", { method: "POST",
        headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [row.to_email], reply_to: c.co.email || undefined, subject: m.subject, html: m.html, text: m.text }) });
      if (!res.ok) throw new Error("Resend " + res.status + ": " + (await res.text()).slice(0, 300));
      await sb.from("notify_outbox").update({ status: "sent", sent_at: new Date().toISOString(), subject: m.subject, error: null }).eq("id", row.id);
      sent++;
    } catch (e) {
      const a = (row.attempts || 0) + 1;
      await sb.from("notify_outbox").update({ attempts: a, status: a >= 5 ? "error" : "pending", error: String(e).slice(0, 500) }).eq("id", row.id);
    }
  }
  return Response.json({ ok: true, pending: rows?.length || 0, sent });
});
