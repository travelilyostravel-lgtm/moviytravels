/* Moviy Nomad — languages partners speak. One key per language; partners typed them in different ways
   ("Ingliz tili", "English", "Английский"), MNLangs.key() maps them all to the same key, MNLangs.label() shows it in the page language. */
(function () {
  // key, flag, Uzbek name, aliases (lower case)
  var L = [
    ["en", "🇬🇧", "Ingliz", ["english", "ingliz", "inglizcha", "английский", "англ", "eng", "anglais", "englisch", "ingilizce", "الإنجليزية", "英语", "영어", "अंग्रेज़ी", "engelska"]],
    ["ru", "🇷🇺", "Rus", ["russian", "rus", "ruscha", "русский", "russe", "russisch", "rusça", "الروسية", "俄语", "러시아어", "रूसी", "ryska"]],
    ["uz", "🇺🇿", "O'zbek", ["uzbek", "o'zbek", "ozbek", "o'zbekcha", "узбекский", "özbekçe", "ouzbek", "usbekisch"]],
    ["de", "🇩🇪", "Nemis", ["german", "nemis", "nemischa", "немецкий", "deutsch", "allemand", "almanca", "الألمانية", "德语", "독일어", "जर्मन", "tyska"]],
    ["fr", "🇫🇷", "Fransuz", ["french", "fransuz", "fransuzcha", "французский", "français", "francais", "französisch", "fransızca", "الفرنسية", "法语", "프랑스어", "फ़्रेंच", "franska"]],
    ["it", "🇮🇹", "Italyan", ["italian", "italyan", "italyancha", "итальянский", "italiano", "italien", "italienisch", "italyanca", "الإيطالية", "意大利语", "이탈리아어", "इतालवी", "italienska"]],
    ["es", "🇪🇸", "Ispan", ["spanish", "ispan", "ispancha", "испанский", "español", "espanol", "espagnol", "spanisch", "ispanyolca", "الإسبانية", "西班牙语", "스페인어", "स्पेनिश", "spanska"]],
    ["tr", "🇹🇷", "Turk", ["turkish", "turk", "turkcha", "турецкий", "türkçe", "turkce", "turc", "türkisch", "التركية", "土耳其语", "터키어", "तुर्की", "turkiska"]],
    ["ar", "🇸🇦", "Arab", ["arabic", "arab", "arabcha", "арабский", "العربية", "arabe", "arabisch", "arapça", "阿拉伯语", "아랍어", "अरबी", "arabiska"]],
    ["zh", "🇨🇳", "Xitoy", ["chinese", "xitoy", "xitoycha", "китайский", "中文", "汉语", "mandarin", "chinois", "chinesisch", "çince", "الصينية", "중국어", "चीनी", "kinesiska"]],
    ["ja", "🇯🇵", "Yapon", ["japanese", "yapon", "японский", "日本語", "japonais", "japanisch", "japonca", "일본어", "japanska"]],
    ["ko", "🇰🇷", "Koreys", ["korean", "koreys", "koreyscha", "корейский", "한국어", "coréen", "koreanisch", "korece", "韩语", "koreanska"]],
    ["hi", "🇮🇳", "Hind", ["hindi", "hind", "хинди", "हिन्दी", "हिंदी", "印地语", "힌디어"]],
    ["fa", "🇮🇷", "Fors", ["persian", "farsi", "fors", "forscha", "персидский", "фарси", "فارسی", "farsça"]],
    ["tg", "🇹🇯", "Tojik", ["tajik", "tojik", "tojikcha", "таджикский", "тоҷикӣ"]],
    ["kk", "🇰🇿", "Qozoq", ["kazakh", "qozoq", "казахский", "қазақ"]],
    ["pt", "🇵🇹", "Portugal", ["portuguese", "portugal", "portugalcha", "португальский", "português", "portugais"]],
    ["pl", "🇵🇱", "Polyak", ["polish", "polyak", "польский", "polski"]],
    ["nl", "🇳🇱", "Golland", ["dutch", "golland", "niderland", "нидерландский", "голландский", "nederlands"]],
    ["sv", "🇸🇪", "Shved", ["swedish", "shved", "шведский", "svenska"]],
    ["he", "🇮🇱", "Ivrit", ["hebrew", "ivrit", "иврит", "עברית"]]
  ];
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[ʻʼ’`‘]/g, "'")
      .replace(/\b(tili|tilida|tilini|language|lang\.?)\b/g, "").replace(/(язык|языке)/g, "").replace(/[()\[\]]/g, " ").replace(/\s+/g, " ").trim();
  }
  var idx = {};
  L.forEach(function (l) { [l[0], l[2]].concat(l[3]).forEach(function (a) { idx[norm(a)] = l[0]; idx[norm(a).replace(/'/g, "")] = l[0]; }); });
  function key(s) { var n = norm(s); if (!n) return ""; return idx[n] || idx[n.replace(/'/g, "")] || idx[n.split(" ")[0]] || "x:" + n; }
  function label(k, lang) {
    if (/^x:/.test(k)) return k.slice(2).replace(/^./, function (m) { return m.toUpperCase(); });
    var l = null; for (var i = 0; i < L.length; i++) if (L[i][0] === k) l = L[i];
    if (lang === "uz" && l) return l[2] + " tili";
    try { var dn = new Intl.DisplayNames([lang || "en"], { type: "language" }).of(k); if (dn && dn !== k) return dn.replace(/^./, function (m) { return m.toUpperCase(); }); } catch (e) {}
    return l ? l[2] : k;
  }
  function flag(k) { for (var i = 0; i < L.length; i++) if (L[i][0] === k) return L[i][1]; return "🗣"; }
  window.MNLangs = { list: L, key: key, label: label, flag: flag };
})();
