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


def _ok(s):
    s = s.strip()
    return len(s) > 1 and WORDS.search(s) and not s.startswith(("http", "{", "#", "@", "+998")) and "moviy-travel.uz/" not in s[:30]


def pages(root, lang):
    return sorted(glob.glob(os.path.join(root, lang, "**", "*.html"), recursive=True))


def extract(root, lang):
    seen = {}
    for f in pages(root, lang):
        h = open(f, encoding="utf-8").read()
        for m in TEXT_RE.finditer(h):
            if m.group(1): continue
            t = html.unescape(m.group(4)).strip()
            if _ok(t): seen.setdefault(t, os.path.relpath(f, root))
        for m in ATTR_RE.finditer(h):
            t = html.unescape(m.group(2)).strip()
            if _ok(t) and (not m.group(1).strip().startswith("content") or len(t) > 15): seen.setdefault(t, os.path.relpath(f, root))
    out = [{"en": k, "page": v} for k, v in seen.items()]
    json.dump(out, open(os.path.join(HERE, "i18n", "_source.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(len(out), "strings,", sum(len(x["en"]) for x in out), "chars")


def table(lang):
    p = os.path.join(HERE, "i18n", lang + ".json")
    return json.load(open(p, encoding="utf-8")).get("S", {}) if os.path.exists(p) else {}


def apply(root, lang):
    S = table(lang)
    if not S: return 0
    n = 0
    def tx(m):
        nonlocal n
        if m.group(1): return m.group(1)
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
