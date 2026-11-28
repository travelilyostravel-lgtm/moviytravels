# Merge translation chunks "id<TAB>text" (ids = rows of build/i18n/_source.json) into build/i18n/<lang>.json "S".
# usage: python3 build/i18n/merge_tsv.py <lang> chunk1.tsv [chunk2.tsv ...]
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
lang, files = sys.argv[1], sys.argv[2:]
src = json.load(open(os.path.join(HERE, "_source.json"), encoding="utf-8"))
p = os.path.join(HERE, lang + ".json")
d = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {"live": False, "S": {}}
for f in files:
    for line in open(f, encoding="utf-8"):
        line = line.rstrip("\n")
        if "\t" not in line: continue
        i, t = line.split("\t", 1)
        if i.strip().isdigit() and t.strip(): d["S"][src[int(i)]["en"]] = t.replace("\\n", "\n")
json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)
print(lang, len(d["S"]), "/", len(src))
