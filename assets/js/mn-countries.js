/* Moviy Nomad — searchable country list for forms.
   MNCountries.attach(input, lang) turns a text input into a searchable list (names in the page language + English),
   MNCountries.code(input) returns the ISO code of what was picked ("" if nothing valid). */
(function () {
  var ISO = ("UZ KZ KG TJ TM RU TR IN CN KR JP DE GB US FR IT ES NL BE CH AT SE NO DK FI PL CZ SK HU RO BG GR PT IE IS LU EE LV LT UA BY MD GE AM AZ " +
    "AE SA QA KW BH OM IL JO LB IQ IR AF PK BD LK NP MV MY SG ID TH VN PH KH LA MM MN TW HK MO AU NZ CA MX BR AR CL CO PE VE EC UY PY BO CR PA CU DO GT HN SV NI JM TT " +
    "EG MA DZ TN LY SD ET KE TZ UG RW NG GH CI SN CM ZA ZW ZM AO MZ NA BW MU MG SC " +
    "AL BA HR SI RS ME MK XK CY MT MC LI AD SM VA FO GL PR BS BB BZ GY SR HT KP YE SY PS BN TL PG FJ WS TO VU SB KI NR TV MH FM PW " +
    "ML NE TD BF BJ TG GN GW SL LR GM MR CV ST GQ GA CG CD CF SS ER DJ SO KM BI MW LS SZ").split(" ");
  var cache = {};
  function names(lang) {
    if (cache[lang]) return cache[lang];
    var dn = null, en = null;
    try { dn = new Intl.DisplayNames([lang], { type: "region" }); } catch (e) {}
    try { en = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) {}
    var UZ = { UZ: "O'zbekiston", KZ: "Qozog'iston", KG: "Qirg'iziston", TJ: "Tojikiston", TM: "Turkmaniston", RU: "Rossiya", TR: "Turkiya", IN: "Hindiston", CN: "Xitoy", KR: "Janubiy Koreya",
      JP: "Yaponiya", DE: "Germaniya", GB: "Buyuk Britaniya", US: "AQSh", FR: "Fransiya", IT: "Italiya", ES: "Ispaniya", AE: "BAA", SA: "Saudiya Arabistoni", AF: "Afg'oniston", PK: "Pokiston", IR: "Eron", AZ: "Ozarbayjon", UA: "Ukraina", BY: "Belarus", PL: "Polsha", NL: "Niderlandiya", MY: "Malayziya", ID: "Indoneziya", IL: "Isroil", EG: "Misr" };
    var list = ISO.map(function (c) {
      var en1 = en ? en.of(c) : c, loc = dn ? dn.of(c) : en1;
      if (/^uz/.test(lang)) loc = UZ[c] || en1;              // browsers have few Uzbek country names
      if (!loc || loc === c) loc = en1;
      return { c: c, n: loc, en: en1 };
    });
    var first = list.shift();                                  // Uzbekistan stays first, the rest alphabetical
    list.sort(function (a, b) { return a.n.localeCompare(b.n, lang); }); list.unshift(first);
    return (cache[lang] = list);
  }
  function norm(s) { return String(s || "").toLowerCase().replace(/[ʻʼ’`']/g, "'").trim(); }
  function attach(input, lang) {
    var id = "mn-countries-" + lang;
    if (!document.getElementById(id)) {
      var dl = document.createElement("datalist"); dl.id = id;
      dl.innerHTML = names(lang).map(function (x) { return '<option value="' + x.n.replace(/"/g, "&quot;") + '"' + (x.en !== x.n ? ' label="' + x.en.replace(/"/g, "&quot;") + '"' : "") + '></option>'; }).join("");
      document.body.appendChild(dl);
    }
    input.setAttribute("list", id); input.setAttribute("autocomplete", "off"); input.dataset.lang = lang;
  }
  function code(input) {
    var v = norm(input.value); if (!v) return "";
    var l = names(input.dataset.lang || "en");
    for (var i = 0; i < l.length; i++) if (norm(l[i].n) === v || norm(l[i].en) === v || norm(l[i].c) === v) return l[i].c;
    return "";
  }
  function name(c, lang) { var l = names(lang || "en"); for (var i = 0; i < l.length; i++) if (l[i].c === c) return l[i].n; return c; }
  window.MNCountries = { attach: attach, code: code, name: name };
})();
