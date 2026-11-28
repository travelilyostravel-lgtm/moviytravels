// prints JSON list of English strings from account-i18n.js (en block) — used by build/i18n_tool.py extract_js2
const fs = require("fs"), vm = require("vm"); const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2], "utf8"), ctx);
const out = []; (function walk(o) { for (const k in o) { const v = o[k]; if (typeof v === "string") out.push(v); else if (v && typeof v === "object") walk(v); } })(ctx.window.MN_CAB_TX.en);
console.log(JSON.stringify(out));
