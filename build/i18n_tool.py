# -*- coding: utf-8 -*-
"""Moviy Nomad — string tables for the 20 new site languages (2026-11-28).

Pages of a new language are first built with English text (every module falls back to English).
Then this tool swaps every visible English text / attribute for the translation kept in
build/i18n/<lang>.json → "S": {"English text": "translation", ...}.

  python3 build/i18n_tool.py extract <built-site-dir> <lang>   # list the English strings of that language's pages → build/i18n/_source.json
  python3 build/i18n_tool.py apply <site-dir> <lang>           # translate that language's built pages in place
  python3 build/i18n_tool.py missing <lang>                    # which source strings still have no translation
"""
import glob, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATTRS = ("alt", "title", "placeholder", "aria-label", "content")
TEXT_RE = re.compile(r"(<(script|style)\b.*?</\2>)|(>)([^<]+)(<)", re.S | re.I)
ATTR_RE = re.compile(r'(\s(?:%s)=")([^"]*)(")' % "|".join(ATTRS))
WORDS = re.compile(r"[A-Za-z]{2}")


SKIP = {"FAQPage", "Question", "Answer", "TravelAgency", "Organization", "WebSite", "Place", "Offer", "Event", "Restaurant", "PostalAddress", "noindex, nofollow", "index, follow", "data-theme", "width=device-width, initial-scale=1", "Moviy Nomad", "MOVIY", "NOMAD", "WhatsApp", "Telegram", "Instagram", "E-mail"}
LSTR = re.compile(r'"((?:[^"\\]|\\.){2,600})"')


def _names():
    try:
        sys.path.insert(0, HERE); import content
        return {content.T[l]["name"] for l in content.T}
    except Exception: return set()
NAMES = _names()


def _ok(s):
    s = s.strip()
    return (len(s) > 1 and WORDS.search(s) and s not in SKIP and s not in NAMES and not re.fullmatch(r"[A-Z]{2}", s)
            and not s.startswith(("http", "{", "#", "@", "+998", "window.", "mailto:", "(prefers", "application/", "image/", "text/"))
            and not re.fullmatch(r"[a-z]+[A-Z]\w*|[A-Z][a-z]+[A-Z]\w*", s) and "@gmail.com" not in s and "moviy-travel.uz/" not in s[:30])


def _human(s):  # a JSON string inside an inline script that is real UI text (not a key, class, url or code)
    return (" " in s or len(s) > 3) and re.search(r"[A-Za-z]{3}", s) and not re.search(r"[{};=<>]|^[a-z_]+$|^\.|/\w+\.\w+|^\w+\.\w+", s) and not s.startswith(("http", "#", "@", "+"))


def pages(root, lang):
    return sorted(glob.glob(os.path.join(root, lang, "**", "*.html"), recursive=True))


def extract(root, lang):
    seen = {}
    for f in pages(root, lang):
        h = open(f, encoding="utf-8").read()
        for m in TEXT_RE.finditer(h):
            if m.group(1):
                if "src=" not in m.group(1)[:80] and m.group(2).lower() == "script":
                    for q in LSTR.finditer(m.group(1)):
                        try: t = json.loads('"' + q.group(1) + '"')
                        except Exception: continue
                        if _ok(t) and _human(t): seen.setdefault(t, os.path.relpath(f, root))
                continue
            t = html.unescape(m.group(4)).strip()
            if _ok(t): seen.setdefault(t, os.path.relpath(f, root))
        for m in ATTR_RE.finditer(h):
            t = html.unescape(m.group(2)).strip()
            if _ok(t) and (not m.group(1).strip().startswith("content") or len(t) > 15): seen.setdefault(t, os.path.relpath(f, root))
    out = [{"en": k, "page": v} for k, v in seen.items()]
    json.dump(out, open(os.path.join(HERE, "i18n", "_source.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(len(out), "strings,", sum(len(x["en"]) for x in out), "chars")


def extract_js(root):
    """Append the UI/tour strings of assets/data/l10n/en.js to _source.json (existing ids stay the same)."""
    sp = os.path.join(HERE, "i18n", "_source.json"); src = json.load(open(sp, encoding="utf-8")); have = {x["en"] for x in src}
    js = open(os.path.join(root, "assets", "data", "l10n", "en.js"), encoding="utf-8").read(); add = 0
    for q in LSTR.finditer(js):
        if js[q.end():q.end() + 3].lstrip().startswith(":"): continue      # object key
        try: t = json.loads('"' + q.group(1) + '"')
        except Exception: continue
        tt = re.sub(r"\{\w+\}", "", t)
        if t in have or not _ok(tt) or not re.search(r"[A-Za-z]{2}", tt) or re.search(r"[;=<>]|^\.|/\w+\.\w+|^\w+\.\w+$|^[a-z]+_[A-Za-z0-9_]+$", tt) or t.startswith(("http", "#", "@", "+")): continue
        src.append({"en": t, "page": "l10n"}); have.add(t); add += 1
    json.dump(src, open(sp, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("added", add, "→", len(src))


JS_FRONT_SKIP = ("admin", "portal", "partner.js", "agent", "msg-", "voucher", "account-i18n")
JS_LIT = re.compile(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'')


def js_front_strings(root):
    """English UI strings rendered by the visitor-facing scripts (forms, cabinet, subscribe, schedule…)."""
    import subprocess
    out = json.loads(subprocess.check_output(["node", os.path.join(HERE, "i18n", "js_strings.js"), os.path.join(root, "assets", "js", "account-i18n.js")]))
    for f in sorted(glob.glob(os.path.join(root, "assets", "js", "*.js"))):
        if os.path.basename(f).startswith(JS_FRONT_SKIP): continue
        for m in JS_LIT.finditer(open(f, encoding="utf-8").read()):
            t = m.group(1) if m.group(1) is not None else m.group(2)
            try: t = json.loads('"' + t.replace("\\'", "'") + '"')
            except Exception: continue
            if not re.fullmatch(r"[A-Za-z0-9 ,.!?'’:;()\-–—+/%&{}…→←·“”$€ⓘ✓✔×\n]+", t): continue
            if " " not in t or not re.search("[a-z]{3}", t) or re.search(r"[<>=;]|\.\w+\(|^\w+\.\w+|\b(var|function|return)\b", t): continue
            out.append(t)
    seen = []; [seen.append(x) for x in out if x not in seen and x.strip()]
    return seen


def extract_js2(root):
    sp = os.path.join(HERE, "i18n", "_source.json"); src = json.load(open(sp, encoding="utf-8")); have = {x["en"] for x in src}; add = 0
    for t in js_front_strings(root):
        if t not in have: src.append({"en": t, "page": "js"}); have.add(t); add += 1
    json.dump(src, open(sp, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("added", add, "→", len(src))


RT_JS = open(os.path.join(HERE, "i18n", "runtime.js"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "i18n", "runtime.js")) else ""


def table(lang):
    p = os.path.join(HERE, "i18n", lang + ".json")
    return json.load(open(p, encoding="utf-8")).get("S", {}) if os.path.exists(p) else {}


def apply(root, lang):
    S = table(lang)
    if not S: return 0
    n = 0
    def js(q):
        nonlocal n
        try: t = json.loads('"' + q.group(1) + '"')
        except Exception: return q.group(0)
        if t in S and S[t]: n += 1; return json.dumps(S[t], ensure_ascii=False)
        return q.group(0)
    def tx(m):
        nonlocal n
        if m.group(1):
            return LSTR.sub(js, m.group(1)) if m.group(2).lower() == "script" and "src=" not in m.group(1)[:80] else m.group(1)
        raw = m.group(4); t = html.unescape(raw).strip()
        if t in S and S[t]:
            n += 1; lead = raw[:len(raw) - len(raw.lstrip())]; tail = raw[len(raw.rstrip()):]
            return ">" + lead + html.escape(S[t], quote=False) + tail + "<"
        return m.group(0)
    def ta(m):
        nonlocal n
        t = html.unescape(m.group(2)).strip()
        if t in S and S[t]: n += 1; return m.group(1) + html.escape(S[t], quote=True) + m.group(3)
        return m.group(0)
    for f in pages(root, lang):
        h = open(f, encoding="utf-8").read()
        h2 = ATTR_RE.sub(ta, TEXT_RE.sub(tx, h))
        if h2 != h: open(f, "w", encoding="utf-8").write(h2)
    return n


def apply_l10n(root, lang):
    """assets/data/l10n/<lang>.js for a new language = the English file with translated strings (tour texts, UI)."""
    S = table(lang); src = os.path.join(root, "assets", "data", "l10n", "en.js")
    js = open(src, encoding="utf-8").read().replace('"lang":"en"', '"lang":"%s"' % lang, 1)
    n = 0
    def rep(q):
        nonlocal n
        if js[q.end():q.end() + 3].lstrip().startswith(":"): return q.group(0)   # an object key, not a text
        try: t = json.loads('"' + q.group(1) + '"')
        except Exception: return q.group(0)
        if t in S and S[t]: n += 1; return json.dumps(S[t], ensure_ascii=False)
        return q.group(0)
    js = LSTR.sub(rep, js)
    # strings drawn by the page scripts: runtime table + cabinet texts (account.js reads window.MN_CAB_X)
    rt = {x: S[x] for x in js_front_strings(root) if S.get(x) and S[x] != x}
    cab = json.loads(__import__("subprocess").check_output(["node", "-e", "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);console.log(JSON.stringify(c.window.MN_CAB_TX.en))", os.path.join(root, "assets", "js", "account-i18n.js")]))
    def tr(o):
        if isinstance(o, str): return S.get(o) or o
        if isinstance(o, dict): return {k: tr(v) for k, v in o.items()}
        if isinstance(o, list): return [tr(v) for v in o]
        return o
    js += "\nwindow.MN_CAB_X=" + json.dumps(tr(cab), ensure_ascii=False) + ";\nwindow.MN_RT=" + json.dumps(rt, ensure_ascii=False) + ";\n" + RT_JS
    n += len(rt)
    open(os.path.join(root, "assets", "data", "l10n", lang + ".js"), "w", encoding="utf-8").write(js)
    return n


def missing(lang):
    src = json.load(open(os.path.join(HERE, "i18n", "_source.json"), encoding="utf-8")); S = table(lang)
    miss = [x for x in src if x["en"] not in S]
    print(lang, "translated", len(src) - len(miss), "/", len(src), "· missing chars", sum(len(x["en"]) for x in miss))
    return miss


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "extract": extract(sys.argv[2], sys.argv[3])
    elif cmd == "apply": print(apply(sys.argv[2], sys.argv[3]), "replacements")
    elif cmd == "missing": missing(sys.argv[2])
    elif cmd == "extract_js": extract_js(sys.argv[2])
    elif cmd == "extract_js2": extract_js2(sys.argv[2])
