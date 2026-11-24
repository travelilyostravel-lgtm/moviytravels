/* Moviy Nomad — partner portal (guides, drivers, hotels, other services). UI: O'zbekcha / Русский.
   1) register  2) wait for the founder's check  3) fill the profile → it appears on the site. Simple on purpose. */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc;
  var L = (function () { try { return localStorage.getItem("mn_plang") || ((navigator.language || "").slice(0, 2) === "ru" ? "ru" : "uz"); } catch (e) { return "uz"; } })();
  var D = {
    uz: {
      title: "Hamkorlar portali", notP: "Bu akkaunt hamkor sifatida ro'yxatdan o'tmagan. Hamkor bo'lish uchun «Chiqish»ni bosing va boshqa e-mail bilan ro'yxatdan o'ting.", sub: "Gidlar, haydovchilar, mehmonxonalar va boshqa xizmat egalari uchun.",
      login: "Kirish", reg: "Hamkor bo'lish", cal: "Kalendarim (band kunlarim)", calHint: "Band kunlaringizni bosing — qizil bo'ladi. Yana bossangiz izoh yozishingiz yoki kunni bo'shatishingiz mumkin. Mijozlar saytda yashil (bo'sh) kunlarni ko'rib so'rov qoldiradi, menejer siz bilan bog'lanadi. Izohlarni faqat siz va Moviy Nomad ko'radi.", calFree: "Bo'sh", calBusy: "Band", calNote: "Izoh (masalan: Germaniya guruhi, 8 kishi)", calSave: "Saqlash", calClear: "Bo'sh qilish", calUp: "Yaqin band kunlar", stats: "Ko'rishlar · Layklar · Ulashishlar", birth: "Tug'ilgan yil", area: "Yashash joyi (shahar, tuman) — saytda ko'rinadi", addr: "To'liq manzil — faqat Moviy Nomad ko'radi", regGo: "Ariza saytning tegishli bo'limida beriladi: talablarni o'qiysiz, rasmlarni yuklaysiz va shu yerda kabinet ochiladi. Kim sifatida ariza berasiz?", email: "E-mail", pass: "Parol", pass8: "Parol (kamida 8 belgi)", forgot: "Parolni unutdim", logout: "Chiqish",
      how: ["Ro'yxatdan o'ting — 2 daqiqa", "Hujjatlaringizni yuklang — biz 1–2 kunda tekshiramiz", "Profilingizni to'ldiring — saytda chiqasiz, mijozlarni biz olib kelamiz"],
      why: "Nega Moviy Nomad bilan?", whys: ["Chet ellik sayyohlar va agentliklar — 10 tilda", "Mijozni biz topamiz va to'lovni biz qabul qilamiz", "Yaxshi baho olsangiz — ro'yxatda birinchi turasiz", "Ro'yxatdan o'tish bepul"],
      kind: "Kim sifatida?", kinds: { guide: "Gid", driver: "Haydovchi / transport", hotel: "Mehmonxona / mehmon uyi", other: "Boshqa xizmat" },
      name: "Ism familiya yoki mehmonxona nomi", phone: "Telefon", wa: "WhatsApp (ixtiyoriy)", tg: "Telegram (@username yoki raqam)", city: "Asosiy shahar", lic: "Litsenziya / gid guvohnomasi / sertifikat raqami", inn: "INN (bo'lsa)", company: "Firma nomi (bo'lsa)",
      agree: "Moviy Nomad ma'lumotlarimni tekshirishiga va saytda (aloqa raqamlarimsiz) ko'rsatishiga roziman.",
      send: "Ro'yxatdan o'tish", done: "Tayyor! Endi kiring va hujjatlaringizni yuklang.",
      pending: "Arizangiz tekshirilmoqda", pendingTxt: "Hujjatlaringizni yuklang (litsenziya/guvohnoma, pasport yoki ID, transport uchun texpasport, mehmonxona uchun sertifikat). Odatda 1–2 ish kunida tekshiramiz.",
      rejected: "Ariza rad etildi", paused: "Profilingiz vaqtincha yopilgan", contactUs: "Savol bo'lsa menejerga yozing:",
      docs: "Hujjatlar", docKind: "Hujjat turi", docKinds: { license: "Litsenziya / guvohnoma", id: "Pasport / ID", car: "Texpasport", cert: "Sertifikat", other: "Boshqa" }, file: "Fayl (PDF yoki rasm)", upload: "Yuklash",
      approved: "Profilingiz tasdiqlangan ✅", approvedTxt: "Ma'lumotlarni to'ldiring va saqlang — saytda shu ko'rinishda chiqadi.",
      profile: "Profil", photo: "Asosiy rasm", gallery: "Qo'shimcha rasmlar (8 tagacha)", bio: "O'zingiz haqingizda (inglizcha yozsangiz yaxshi — mijozlar chet ellik)",
      cities: "Qaysi shaharlarda ishlaysiz (vergul bilan)", langs: "Tillar", spec: "Yo'nalishlar", price: "Narx, USD", perDay: "kuniga", perNight: "bir kechaga", priceNote: "Narx izohi (masalan: 8 soat, yoqilg'i bilan)",
      exp: "Tajriba (yil)", vType: "Mashina rusumi", seats: "O'rinlar soni", year: "Yili", stars: "Yulduz", rooms: "Xonalar soni",
      save: "Saqlash", saved: "Saqlandi ✅", view: "Saytda ko'rish", rating: "Reyting", reviews: "sharh", trips: "Moviy Nomad bilan safarlar",
      bad: "Xatolik: "
    },
    ru: {
      title: "Портал партнёров", notP: "Этот аккаунт не зарегистрирован как партнёр. Нажмите «Выйти» и зарегистрируйтесь с другим e-mail.", sub: "Для гидов, водителей, гостиниц и других поставщиков услуг.",
      login: "Вход", reg: "Стать партнёром", cal: "Мой календарь (занятые дни)", calHint: "Нажмите на занятый день — он станет красным. Нажмите ещё раз, чтобы написать заметку или освободить день. Туристы на сайте видят зелёные (свободные) дни и оставляют заявку, менеджер свяжется с вами. Заметки видите только вы и Moviy Nomad.", calFree: "Свободно", calBusy: "Занято", calNote: "Заметка (например: группа из Германии, 8 чел.)", calSave: "Сохранить", calClear: "Освободить", calUp: "Ближайшие занятые дни", stats: "Просмотры · Лайки · Репосты", birth: "Год рождения", area: "Где живёте (город, район) — видно на сайте", addr: "Полный адрес — видит только Moviy Nomad", regGo: "Заявка подаётся в нужном разделе сайта: читаете требования, загружаете фото — и здесь открывается кабинет. Кем вы подаёте заявку?", email: "E-mail", pass: "Пароль", pass8: "Пароль (не менее 8 символов)", forgot: "Забыли пароль", logout: "Выйти",
      how: ["Зарегистрируйтесь — 2 минуты", "Загрузите документы — проверим за 1–2 дня", "Заполните профиль — вы на сайте, клиентов приводим мы"],
      why: "Почему Moviy Nomad?", whys: ["Иностранные туристы и агентства — на 10 языках", "Клиента находим мы и оплату принимаем мы", "Хорошие отзывы — вы первые в списке", "Регистрация бесплатная"],
      kind: "Кто вы?", kinds: { guide: "Гид", driver: "Водитель / транспорт", hotel: "Гостиница / гостевой дом", other: "Другая услуга" },
      name: "Имя и фамилия или название гостиницы", phone: "Телефон", wa: "WhatsApp (необязательно)", tg: "Telegram (@username или номер)", city: "Основной город", lic: "Номер лицензии / удостоверения гида / сертификата", inn: "ИНН (если есть)", company: "Название фирмы (если есть)",
      agree: "Согласен, что Moviy Nomad проверит мои данные и покажет профиль на сайте (без моих контактов).",
      send: "Зарегистрироваться", done: "Готово! Теперь войдите и загрузите документы.",
      pending: "Заявка на проверке", pendingTxt: "Загрузите документы (лицензия/удостоверение, паспорт или ID, техпаспорт для транспорта, сертификат для гостиницы). Обычно проверяем за 1–2 рабочих дня.",
      rejected: "Заявка отклонена", paused: "Профиль временно скрыт", contactUs: "Вопросы — пишите менеджеру:",
      docs: "Документы", docKind: "Тип документа", docKinds: { license: "Лицензия / удостоверение", id: "Паспорт / ID", car: "Техпаспорт", cert: "Сертификат", other: "Другое" }, file: "Файл (PDF или фото)", upload: "Загрузить",
      approved: "Профиль подтверждён ✅", approvedTxt: "Заполните данные и сохраните — так вас увидят на сайте.",
      profile: "Профиль", photo: "Главное фото", gallery: "Дополнительные фото (до 8)", bio: "О себе (лучше по-английски — клиенты иностранцы)",
      cities: "В каких городах работаете (через запятую)", langs: "Языки", spec: "Направления", price: "Цена, USD", perDay: "в день", perNight: "за ночь", priceNote: "Пояснение к цене (например: 8 часов, с топливом)",
      exp: "Опыт (лет)", vType: "Марка авто", seats: "Мест", year: "Год", stars: "Звёзд", rooms: "Номеров",
      save: "Сохранить", saved: "Сохранено ✅", view: "Посмотреть на сайте", rating: "Рейтинг", reviews: "отзывов", trips: "Поездок с Moviy Nomad",
      bad: "Ошибка: "
    }
  };
  var LANGS = ["English", "Русский", "O'zbek", "Türkçe", "Deutsch", "Français", "Español", "Italiano", "العربية", "中文", "한국어", "日本語", "हिन्दी", "Svenska"];
  var SPEC = ["History", "Culture", "Architecture", "Food", "Nature", "Photography", "Shopping", "Religion", "Adventure", "Family"];
  var t = function (k) { return D[L][k]; };
  var me = { user: null, partner: null };
  var WA = (window.MN_CFG || {}).whatsapp || "998999804214", TG = (window.MN_CFG || {}).telegram || "moviy_safina";
  var box = $("#pv");

  function langBtn() {
    var b = $("#plang"); b.textContent = L === "uz" ? "Русский" : "O'zbekcha";
    b.onclick = function () { L = L === "uz" ? "ru" : "uz"; try { localStorage.setItem("mn_plang", L); } catch (e) {} render(); };
  }
  function help() { return '<div class="ag-help"><p class="p-sub">' + t("contactUs") + '</p><div class="p-actions"><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + WA + '">WhatsApp</a><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="https://t.me/' + TG + '">Telegram</a></div></div>'; }

  // ---------------------------------------------------------------- not logged in
  function authView(tab) {
    var kinds = Object.keys(t("kinds")).map(function (k) { return '<label class="pk"><input type="radio" name="kind" value="' + k + '"' + (k === "guide" ? " checked" : "") + '><span>' + esc(t("kinds")[k]) + '</span></label>'; }).join("");
    box.innerHTML = '<div class="p-card p-auth-card"><div class="seg"><button data-t="login" class="' + (tab !== "reg" ? "is-on" : "") + '">' + t("login") + '</button><button data-t="reg" class="' + (tab === "reg" ? "is-on" : "") + '">' + t("reg") + '</button></div>' +
      (tab === "reg" ?
        '<h2>' + t("reg") + '</h2><ol class="psteps">' + t("how").map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("") + '</ol>' +
        '<p class="p-sub">' + t("regGo") + '</p><div class="pkinds" style="grid-template-columns:repeat(2,1fr)">' + [["guide", "guides.html"], ["driver", "transport.html"], ["hotel", "hotels.html"], ["other", "partners.html"]].map(function (x) { return '<a class="pk" style="text-align:center;padding:16px" href="../' + L + '/' + x[1] + '#join"><span>' + esc(t("kinds")[x[0]]) + ' →</span></a>'; }).join("") + '</div>' +
        '<div class="pwhy"><h3>' + t("why") + '</h3><ul>' + t("whys").map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("") + '</ul></div>'
      :
        '<h2>' + t("title") + '</h2><p class="p-sub">' + t("sub") + '</p><form id="f-log"><div class="fld"><label>' + t("email") + '</label><input name="email" type="email" required autocomplete="email"></div>' +
        '<div class="fld" style="margin-top:12px"><label>' + t("pass") + '</label><input name="password" type="password" required autocomplete="current-password"></div><div class="msg" id="m-log"></div>' +
        '<div class="p-actions"><button class="btn btn--gold" type="submit">' + t("login") + '</button><button class="btn btn--outline" type="button" id="p-forgot">' + t("forgot") + '</button></div></form>') +
      help() + '</div>';
    $$("[data-t]", box).forEach(function (b) { b.onclick = function () { authView(b.dataset.t); }; });
    var fl = $("#f-log"); if (fl) {
      fl.onsubmit = async function (e) {
        e.preventDefault(); P.msg("#m-log", "…");
        var r = await sb.auth.signInWithPassword({ email: fl.email.value.replace(/\s+/g, "").toLowerCase(), password: fl.password.value });
        if (r.error) return P.msg("#m-log", t("bad") + r.error.message, "err"); boot();
      };
      $("#p-forgot").onclick = async function () {
        var em = fl.email.value.trim(); if (!em) return P.msg("#m-log", t("email") + "?", "err");
        var r = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
        P.msg("#m-log", r.error ? t("bad") + r.error.message : "✓", r.error ? "err" : "ok");
      };
    }
    var fr = $("#f-reg"); if (fr) fr.onsubmit = async function (e) {
      e.preventDefault(); P.msg("#m-reg", "…");
      var d = { partner_kind: fr.querySelector("[name=kind]:checked").value };
      ["partner_name", "phone", "whatsapp", "city", "license_no", "company", "inn"].forEach(function (k) { d[k] = fr[k].value.trim(); });
      var r = await sb.auth.signUp({ email: fr.email.value.replace(/\s+/g, "").toLowerCase(), password: fr.password.value, options: { data: d } });
      if (r.error) return P.msg("#m-reg", t("bad") + r.error.message, "err");
      if (r.data.session) return boot();
      P.msg("#m-reg", t("done"), "ok");
    };
  }


  // ---------------------------------------------------------------- calendar (busy days)
  function calCard() {
    return '<div class="p-card"><h3>📅 ' + t("cal") + '</h3><p class="p-sub">' + t("calHint") + '</p><div id="p-cal"></div>' +
      '<div id="p-caled" class="hidden" style="margin-top:14px;padding:14px;border-radius:14px;background:#fff7f7;border:1px solid #f3caca"><b id="p-calday"></b>' +
      '<div class="fld" style="margin-top:8px"><label>' + t("calNote") + '</label><input id="p-calnote" maxlength="200"></div>' +
      '<div class="p-actions"><button class="btn btn--gold btn--sm" type="button" id="p-calsave">' + t("calSave") + '</button><button class="btn btn--outline btn--sm" type="button" id="p-calfree">' + t("calClear") + '</button></div></div>' +
      '<div class="msg" id="m-cal"></div><div id="p-calup" style="margin-top:12px;font-size:13.5px"></div></div>';
  }
  async function bindCal() {
    var pid = me.partner.id, busy = {}, sel = null;
    async function load() {
      var r = await sb.from("partner_busy").select("day,note").eq("partner_id", pid).gte("day", window.MNCal.key(new Date(Date.now() - 86400000 * 400))).order("day");
      busy = {}; (r.data || []).forEach(function (x) { busy[x.day] = x.note || true; }); draw();
    }
    function draw() {
      window.MNCal.render($("#p-cal"), { lang: L === "ru" ? "ru" : "uz", months: window.innerWidth < 700 ? 1 : 2, busy: busy, legend: [t("calFree"), t("calBusy")], onPick: pick });
      var today = window.MNCal.key(new Date()), up = Object.keys(busy).filter(function (d) { return d >= today; }).sort().slice(0, 8);
      $("#p-calup").innerHTML = up.length ? '<b>' + t("calUp") + ':</b> ' + up.map(function (d) { return d.split("-").reverse().join(".") + (typeof busy[d] === "string" ? " (" + esc(busy[d]) + ")" : ""); }).join(" · ") : "";
    }
    async function pick(day, isBusy) {
      if (!isBusy) {
        busy[day] = true; draw();
        var r = await sb.from("partner_busy").insert({ partner_id: pid, day: day });
        if (r.error) { delete busy[day]; draw(); return P.msg("#m-cal", t("bad") + r.error.message, "err"); }
        P.msg("#m-cal", "");
      }
      sel = day; $("#p-caled").classList.remove("hidden"); $("#p-calday").textContent = "📅 " + day.split("-").reverse().join(".") + " — " + t("calBusy");
      $("#p-calnote").value = typeof busy[day] === "string" ? busy[day] : ""; $("#p-calnote").focus();
    }
    $("#p-calsave").onclick = async function () {
      if (!sel) return; var n = $("#p-calnote").value.trim();
      var r = await sb.from("partner_busy").update({ note: n || null }).eq("partner_id", pid).eq("day", sel);
      if (r.error) return P.msg("#m-cal", t("bad") + r.error.message, "err");
      busy[sel] = n || true; $("#p-caled").classList.add("hidden"); sel = null; draw(); P.msg("#m-cal", t("saved"), "ok");
    };
    $("#p-calfree").onclick = async function () {
      if (!sel) return;
      var r = await sb.from("partner_busy").delete().eq("partner_id", pid).eq("day", sel);
      if (r.error) return P.msg("#m-cal", t("bad") + r.error.message, "err");
      delete busy[sel]; $("#p-caled").classList.add("hidden"); sel = null; draw(); P.msg("#m-cal", "");
    };
    load();
  }
  // ---------------------------------------------------------------- logged in
  async function docsBlock() {
    var p = me.partner, docs = p.docs || [];
    var opts = Object.keys(t("docKinds")).map(function (k) { return '<option value="' + k + '">' + esc(t("docKinds")[k]) + '</option>'; }).join("");
    return '<div class="p-card"><h3>' + t("docs") + '</h3>' + (docs.length ? '<ul class="pdocs">' + docs.map(function (d) { return '<li>📄 ' + esc(t("docKinds")[d.kind] || d.kind) + ' — <small>' + esc(d.name || "") + '</small></li>'; }).join("") + '</ul>' : '') +
      '<div class="p-grid"><div class="fld"><label>' + t("docKind") + '</label><select id="d-kind">' + opts + '</select></div><div class="fld"><label>' + t("file") + '</label><input type="file" id="d-file" accept=".pdf,image/*"></div></div>' +
      '<div class="msg" id="m-doc"></div><div class="p-actions"><button class="btn btn--navy btn--sm" id="d-up">' + t("upload") + '</button></div></div>';
  }
  function bindDocs() {
    $("#d-up").onclick = async function () {
      var f = $("#d-file").files[0]; if (!f) return; P.msg("#m-doc", "…");
      try {
        var path = await P.upload("partner-docs", me.partner.id, f);
        var docs = (me.partner.docs || []).concat([{ kind: $("#d-kind").value, path: path, name: f.name, at: new Date().toISOString() }]);
        var r = await sb.rpc("partner_save", { p: Object.assign(profilePayload(me.partner), { docs: docs }) });
        if (r.error) throw r.error; P.msg("#m-doc", t("saved"), "ok"); setTimeout(boot, 600);
      } catch (e) { P.msg("#m-doc", t("bad") + P.err(e), "err"); }
    };
  }
  function profilePayload(p) {
    return { name: p.name, company: p.company, inn: p.inn, license_no: p.license_no, phone: p.phone, whatsapp: p.whatsapp, city: p.city, cities: p.cities || [], languages: p.languages || [],
      specialties: p.specialties || [], bio: p.bio, photo: p.photo, photos: p.photos || [], price_day: p.price_day == null ? "" : String(p.price_day), price_note: p.price_note,
      vehicle_type: p.vehicle_type, vehicle_seats: p.vehicle_seats == null ? "" : String(p.vehicle_seats), vehicle_year: p.vehicle_year == null ? "" : String(p.vehicle_year),
      hotel_stars: p.hotel_stars == null ? "" : String(p.hotel_stars), hotel_rooms: p.hotel_rooms == null ? "" : String(p.hotel_rooms),
      experience_years: p.experience_years == null ? "" : String(p.experience_years), docs: p.docs || [],
      telegram: p.telegram || "", birth_year: p.birth_year == null ? "" : String(p.birth_year), home_area: p.home_area || "", home_address: p.home_address || "" };
  }
  function pub(path) { return path ? window.MN_SB.url + "/storage/v1/object/public/partner-photos/" + path : ""; }

  function profileForm() {
    var p = me.partner, k = p.kind;
    var chk = function (list, have, name) { return '<div class="pchips">' + list.map(function (x) { return '<label><input type="checkbox" name="' + name + '" value="' + esc(x) + '"' + ((have || []).indexOf(x) > -1 ? " checked" : "") + '> ' + esc(x) + '</label>'; }).join("") + '</div>'; };
    var h = '<div class="p-card"><h3>' + t("profile") + '</h3><form id="f-prof"><div class="p-grid">' +
      '<div class="fld full"><label>' + t("name") + '</label><input name="name" value="' + esc(p.name) + '" maxlength="120"></div>' +
      '<div class="fld full"><label>' + t("photo") + '</label>' + (p.photo ? '<img class="pphoto" src="' + esc(pub(p.photo)) + '" alt="">' : '') + '<input type="file" id="ph-main" accept="image/*"></div>' +
      '<div class="fld"><label>' + t("city") + '</label><input name="city" value="' + esc(p.city || "") + '"></div>' +
      '<div class="fld"><label>' + t("cities") + '</label><input name="cities" value="' + esc((p.cities || []).join(", ")) + '"></div>' +
      (k !== "hotel" ? '<div class="fld"><label>' + t("birth") + '</label><input name="birth_year" type="number" min="1940" max="2010" value="' + (p.birth_year || "") + '"></div>' : '') +
      '<div class="fld"><label>' + t("area") + '</label><input name="home_area" maxlength="120" value="' + esc(p.home_area || "") + '"></div>' +
      '<div class="fld full"><label>' + t("addr") + '</label><input name="home_address" maxlength="250" value="' + esc(p.home_address || "") + '"></div>' +
      '<div class="fld"><label>' + t("price") + ' (' + (k === "hotel" ? t("perNight") : t("perDay")) + ')</label><input name="price_day" type="number" min="0" step="1" value="' + (p.price_day == null ? "" : p.price_day) + '"></div>' +
      '<div class="fld"><label>' + t("priceNote") + '</label><input name="price_note" value="' + esc(p.price_note || "") + '" maxlength="200"></div>' +
      (k === "guide" ? '<div class="fld"><label>' + t("exp") + '</label><input name="experience_years" type="number" min="0" max="60" value="' + (p.experience_years == null ? "" : p.experience_years) + '"></div>' : '') +
      (k === "driver" ? '<div class="fld"><label>' + t("vType") + '</label><input name="vehicle_type" value="' + esc(p.vehicle_type || "") + '" placeholder="Chevrolet Cobalt / Hyundai Starex"></div><div class="fld"><label>' + t("seats") + '</label><input name="vehicle_seats" type="number" min="1" max="60" value="' + (p.vehicle_seats || "") + '"></div><div class="fld"><label>' + t("year") + '</label><input name="vehicle_year" type="number" min="1990" max="2030" value="' + (p.vehicle_year || "") + '"></div>' : '') +
      (k === "hotel" ? '<div class="fld"><label>' + t("stars") + '</label><input name="hotel_stars" type="number" min="0" max="5" value="' + (p.hotel_stars == null ? "" : p.hotel_stars) + '"></div><div class="fld"><label>' + t("rooms") + '</label><input name="hotel_rooms" type="number" min="1" max="2000" value="' + (p.hotel_rooms || "") + '"></div>' : '') +
      '<div class="fld full"><label>' + t("langs") + '</label>' + chk(LANGS, p.languages, "languages") + '</div>' +
      (k === "guide" ? '<div class="fld full"><label>' + t("spec") + '</label>' + chk(SPEC, p.specialties, "specialties") + '</div>' : '') +
      '<div class="fld full"><label>' + t("bio") + '</label><textarea name="bio" rows="5" maxlength="1500">' + esc(p.bio || "") + '</textarea></div>' +
      '<div class="fld full"><label>' + t("gallery") + '</label><div class="pgal">' + (p.photos || []).map(function (x, i) { return '<span><img src="' + esc(pub(x)) + '" alt=""><button type="button" data-rm="' + i + '">×</button></span>'; }).join("") + '</div><input type="file" id="ph-more" accept="image/*" multiple></div>' +
      '<div class="fld"><label>' + t("phone") + '</label><input name="phone" value="' + esc(p.phone || "") + '"></div><div class="fld"><label>' + t("tg") + ' *</label><input name="telegram" required maxlength="64" placeholder="@username" value="' + esc(p.telegram || "") + '"></div><div class="fld"><label>' + t("wa") + '</label><input name="whatsapp" value="' + esc(p.whatsapp || "") + '"></div>' +
      '<div class="fld"><label>' + t("lic") + '</label><input name="license_no" value="' + esc(p.license_no || "") + '"></div>' + (k === "hotel" || k === "other" ? '<div class="fld"><label>' + t("inn") + '</label><input name="inn" value="' + esc(p.inn || "") + '"></div>' : '') +
      '</div><div class="msg" id="m-prof"></div><div class="p-actions"><button class="btn btn--gold" type="submit">' + t("save") + '</button>' +
      (p.status === "approved" ? '<a class="btn btn--outline" target="_blank" rel="noopener" href="../partners.html#p-' + p.id + '">' + t("view") + '</a>' : '') + '</div></form></div>';
    return h;
  }
  async function resize(file, max) {
    try {
      var img = await createImageBitmap(file), s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var b = await new Promise(function (r) { c.toBlob(r, "image/webp", 0.85); });
      return new File([b], (file.name || "photo").replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
    } catch (e) { return file; }
  }
  function bindProfile() {
    var f = $("#f-prof");
    $$("[data-rm]", f).forEach(function (b) { b.onclick = function () { me.partner.photos.splice(+b.dataset.rm, 1); b.parentNode.remove(); }; });
    f.onsubmit = async function (e) {
      e.preventDefault(); P.msg("#m-prof", "…");
      try {
        var p = me.partner, d = profilePayload(p);
        ["name", "city", "price_day", "price_note", "experience_years", "vehicle_type", "vehicle_seats", "vehicle_year", "hotel_stars", "hotel_rooms", "bio", "phone", "whatsapp", "license_no", "inn", "birth_year", "home_area", "home_address", "telegram"].forEach(function (k) { if (f[k]) d[k] = f[k].value.trim(); });
        d.cities = f.cities.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        d.languages = $$("[name=languages]:checked", f).map(function (x) { return x.value; });
        d.specialties = $$("[name=specialties]:checked", f).map(function (x) { return x.value; });
        var mf = $("#ph-main").files[0]; if (mf) d.photo = await P.upload("partner-photos", p.id, await resize(mf, 1200));
        var more = [].slice.call($("#ph-more").files || []);
        for (var i = 0; i < more.length && d.photos.length < 8; i++) d.photos.push(await P.upload("partner-photos", p.id, await resize(more[i], 1600)));
        var r = await sb.rpc("partner_save", { p: d }); if (r.error) throw r.error;
        P.msg("#m-prof", t("saved"), "ok"); setTimeout(boot, 700);
      } catch (e2) { P.msg("#m-prof", t("bad") + P.err(e2), "err"); }
    };
  }

  async function boot() {
    langBtn();
    var s = await sb.auth.getSession(); me.user = s.data.session && s.data.session.user;
    $("#plogout").classList.toggle("hidden", !me.user);
    if (!me.user) return authView(location.hash === "#reg" ? "reg" : "login");
    var r = await sb.from("partners").select("*").eq("user_id", me.user.id).maybeSingle();
    me.partner = r.data;
    if (!me.partner) { box.innerHTML = '<div class="p-card"><h2>' + t("title") + '</h2><p class="p-sub">' + esc(me.user.email) + '</p><p>' + t("notP") + '</p>' + help() + '</div>'; return; }
    var p = me.partner, h = '';
    $("#pwho").textContent = p.name + " · " + t("kinds")[p.kind];
    if (p.status === "pending") h += '<div class="p-card"><h2>⏳ ' + t("pending") + '</h2><p class="p-sub">' + t("pendingTxt") + '</p></div>' + await docsBlock() + profileForm();
    else if (p.status === "rejected") h += '<div class="p-card"><h2>' + t("rejected") + '</h2>' + (p.admin_note ? '<p>' + esc(p.admin_note) + '</p>' : '') + '</div>';
    else {
      if (p.status === "paused") h += '<div class="p-card"><h2>' + t("paused") + '</h2>' + (p.admin_note ? '<p>' + esc(p.admin_note) + '</p>' : '') + '</div>';
      else h += '<div class="p-card"><h2>' + t("approved") + '</h2><p class="p-sub">' + t("approvedTxt") + '</p><div class="kv"><div><small>' + t("rating") + '</small><b>' + (p.reviews_count ? "★ " + Number(p.rating).toFixed(1) + " · " + p.reviews_count + " " + t("reviews") : "—") + '</b></div><div><small>' + t("trips") + '</small><b>' + (p.trips_count || 0) + '</b></div><div><small>' + t("stats") + '</small><b>' + (p.views_count || 0) + ' · ' + (p.likes_count || 0) + ' · ' + (p.shares_count || 0) + '</b></div></div></div>';
      h += calCard() + profileForm() + await docsBlock();
    }
    box.innerHTML = h + '<div class="p-card">' + help() + '</div>';
    if ($("#f-prof")) bindProfile();
    if ($("#p-cal")) bindCal();
    if ($("#d-up")) bindDocs();
  }
  function render() { boot(); }
  $("#plogout").onclick = async function () { await sb.auth.signOut(); location.reload(); };
  sb.auth.onAuthStateChange(function (ev) {
    if (ev === "PASSWORD_RECOVERY") {
      box.innerHTML = '<div class="p-card"><h2>' + t("pass8") + '</h2><form id="f-np"><input type="password" name="pw" minlength="8" required><div class="msg" id="m-np"></div><div class="p-actions"><button class="btn btn--gold">' + t("save") + '</button></div></form></div>';
      $("#f-np").onsubmit = async function (e) { e.preventDefault(); var r = await sb.auth.updateUser({ password: e.target.pw.value }); if (r.error) return P.msg("#m-np", r.error.message, "err"); history.replaceState(null, "", location.pathname); boot(); };
    }
  });
  if (!/type=recovery/.test(location.hash)) boot();
})();
