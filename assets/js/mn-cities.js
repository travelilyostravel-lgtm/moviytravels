/* Moviy Nomad — Uzbekistan cities for partner filters and the partner application.
   One key per city; aliases catch other spellings ("Samarkand", "Самарканд" → samarqand). */
(function () {
  var C = [
    ["toshkent", "Toshkent", "Ташкент", "Tashkent", ["tashkent", "ташкент", "taşkent"]],
    ["samarqand", "Samarqand", "Самарканд", "Samarkand", ["samarkand", "самарканд", "semerkant"]],
    ["buxoro", "Buxoro", "Бухара", "Bukhara", ["bukhara", "бухара", "buhara", "buchara"]],
    ["xiva", "Xiva", "Хива", "Khiva", ["khiva", "хива", "hiva", "chiwa"]],
    ["shahrisabz", "Shahrisabz", "Шахрисабз", "Shakhrisabz", ["shakhrisabz", "шахрисабз", "sahrisebz"]],
    ["namangan", "Namangan", "Наманган", "Namangan", ["наманган"]],
    ["andijon", "Andijon", "Андижан", "Andijan", ["andijan", "андижан"]],
    ["fargona", "Farg'ona", "Фергана", "Fergana", ["fergana", "farg'ona", "fargona", "фергана", "fargʻona"]],
    ["qoqon", "Qo'qon", "Коканд", "Kokand", ["kokand", "qo'qon", "qoqon", "коканд", "hokand", "qoʻqon"]],
    ["margilon", "Marg'ilon", "Маргилан", "Margilan", ["margilan", "marg'ilon", "маргилан", "margʻilon"]],
    ["urganch", "Urganch", "Ургенч", "Urgench", ["urgench", "ургенч"]],
    ["nukus", "Nukus", "Нукус", "Nukus", ["нукус"]],
    ["termiz", "Termiz", "Термез", "Termez", ["termez", "термез"]],
    ["qarshi", "Qarshi", "Карши", "Karshi", ["karshi", "карши"]],
    ["navoiy", "Navoiy", "Навои", "Navoi", ["navoi", "навои"]],
    ["jizzax", "Jizzax", "Джизак", "Jizzakh", ["jizzakh", "джизак", "jizzah"]],
    ["guliston", "Guliston", "Гулистан", "Gulistan", ["gulistan", "гулистан"]],
    ["moynoq", "Mo'ynoq", "Муйнак", "Muynak", ["muynak", "mo'ynoq", "муйнак", "moynaq"]],
    ["chimyon", "Chimyon / Chorvoq", "Чимган / Чарвак", "Chimgan / Charvak", ["chimgan", "charvak", "chorvoq", "chimyon", "чимган", "чарвак"]]
  ];
  function norm(s) { return String(s || "").toLowerCase().replace(/[ʻʼ’`']/g, "'").trim(); }
  var idx = {};
  C.forEach(function (c) { [c[0], c[1], c[2], c[3]].concat(c[4]).forEach(function (n) { idx[norm(n)] = c[0]; idx[norm(n).replace(/'/g, "")] = c[0]; }); });
  function key(name) { var n = norm(name).split(/[,(]/)[0].trim(); return idx[n] || idx[n.replace(/'/g, "")] || (n ? "x:" + n : ""); }
  function label(k, lang) {
    for (var i = 0; i < C.length; i++) if (C[i][0] === k) return lang === "uz" ? C[i][1] : lang === "ru" ? C[i][2] : C[i][3];
    return String(k).replace(/^x:/, "").replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }
  window.MNCities = { list: C, key: key, label: label, uz: function (k) { return label(k, "uz"); } };
})();
