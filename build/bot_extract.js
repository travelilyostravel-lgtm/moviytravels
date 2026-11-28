// lists every Uzbek bot text (with its Russian pair) -> build/i18n/portal/bot_src.tsv
const fs = require("fs"), path = require("path");
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "x";
const src = fs.readFileSync(path.join(__dirname, "../api/_reg.js"), "utf8");
const R = require("../api/_reg.js")._i18n, seen = new Map();
function add(uz, ru) { if (uz == null || typeof uz !== "string" || !/[A-Za-z]/.test(uz) || seen.has(uz)) return; seen.set(uz, ru || ""); }
Object.keys(R.T.uz).forEach(function (k) { add(R.T.uz[k], R.T.ru[k]); });
Object.keys(R.Q).forEach(function (k) { add(R.Q[k].uz, R.Q[k].ru); });
R.SUB.room.concat(R.SUB.vehicle).forEach(function (q) { add(q.uz, q.ru); });
R.lists.forEach(function (li) { li.forEach(function (o) { add(o[1], o[2]); }); });
add(" kishi", " чел.");
var re = /X\(l, ("(?:[^"\\]|\\.)*"), ("(?:[^"\\]|\\.)*")\)/g, m;
while ((m = re.exec(src))) add(JSON.parse(m[1]), JSON.parse(m[2]));
const esc = function (s) { return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\t/g, " "); };
var out = [], i = 0; seen.forEach(function (ru, uz) { out.push(i++ + "\t" + esc(uz) + "\t" + esc(ru)); });
fs.writeFileSync(path.join(__dirname, "i18n/portal/bot_src.tsv"), out.join("\n") + "\n");
console.log("bot texts:", out.length);
