/* Moviy Nomad — partner portal (guides, drivers, hotels, other services). UI: O'zbekcha / Русский.
   1) register  2) wait for the founder's check  3) fill the profile → it appears on the site. Simple on purpose. */
(function () {
  var P = window.MNP, sb = P.sb, $ = P.$, $$ = P.$$, esc = P.esc;
  var L = (function () { try { return localStorage.getItem("mn_plang") || ((navigator.language || "").slice(0, 2) === "ru" ? "ru" : "uz"); } catch (e) { return "uz"; } })();
  var D = {
    uz: {
      title: "Hamkorlar portali", notP: "Bu akkaunt hamkor sifatida ro'yxatdan o'tmagan. Hamkor bo'lish uchun «Chiqish»ni bosing va boshqa e-mail bilan ro'yxatdan o'ting.", sub: "Gidlar, haydovchilar, mehmonxonalar va boshqa xizmat egalari uchun.",
      login: "Kirish", reg: "Hamkor bo'lish", chT: "Kartochkani o'zgartirish", chHint: "Siz saytdasiz: o'zgarishlar (til, shahar, rasm, narx, bio va boshqalar) avval Moviy Nomad'ga boradi. Admin tasdiqlagach saytdagi kartochkangiz yangilanadi.", chCom: "Adminga izoh: nimani o'zgartirdingiz va nega? *", chSend: "Tasdiqlashga yuborish", chSent: "Yuborildi ✅ Admin tasdiqlagach kartochkangiz yangilanadi.", chPend: "O'zgarishlaringiz tekshiruvda", chYour: "Izohingiz", chRej: "Oxirgi o'zgarishingiz rad etildi", chOk: "Oxirgi o'zgarishingiz tasdiqlandi va saytda yangilandi", chNeed: "Iltimos, adminga izoh yozing: nimani o'zgartirdingiz.", chPendNote: "Quyidagi formada yuborgan (hali tasdiqlanmagan) ma'lumotlaringiz turibdi. Yana o'zgartirib yuborsangiz, eski so'rov yangisi bilan almashadi.", cal: "Kalendarim (band kunlarim)", calHint: "Band kunlaringizni bosing — qizil bo'ladi. Yana bossangiz izoh yozishingiz yoki kunni bo'shatishingiz mumkin. Mijozlar saytda yashil (bo'sh) kunlarni ko'rib so'rov qoldiradi, menejer siz bilan bog'lanadi. Izohlarni faqat siz va Moviy Nomad ko'radi.", calFree: "Bo'sh", calBusy: "Band", calNote: "Izoh (masalan: Germaniya guruhi, 8 kishi)", calSave: "Saqlash", calClear: "Bo'sh qilish", calUp: "Yaqin band kunlar", stats: "Ko'rishlar · Layklar · Ulashishlar", birth: "Tug'ilgan yil", area: "Yashash joyi (shahar, tuman) — saytda ko'rinadi", addr: "To'liq manzil — faqat Moviy Nomad ko'radi", regGo: "Ariza saytning tegishli bo'limida beriladi: talablarni o'qiysiz, rasmlarni yuklaysiz va shu yerda kabinet ochiladi. Kim sifatida ariza berasiz?", email: "E-mail", pass: "Parol", pass8: "Parol (kamida 8 belgi)", forgot: "Parolni unutdim", logout: "Chiqish",
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
      bad: "Xatolik: ",
      rejHow: "Kamchiliklarni tuzating: ma'lumotlarni to'g'rilang, kerakli rasm va hujjatlarni yuklang, so'ng «Tuzatib qayta yuborish»ni bosing. Arizangiz qayta ko'rib chiqiladi — buni necha marta bo'lsa ham qilishingiz mumkin.",
      lockNote: "🔒 Bu ma'lumotni faqat Moviy Nomad o'zgartiradi (ism, tug'ilgan yil, guvohnoma raqami, firma). O'zgartirish kerak bo'lsa — menejerga yozing.", histT: "O'zgarishlar tarixim", histNone: "Hali o'zgartirish so'rovi yo'q.", histSt: { pending: "⏳ Tekshirilmoqda", approved: "✅ Tasdiqlandi", rejected: "❌ Rad etildi" },
      payT: "Sizga to'lanadigan summalar", payNote: "Bu yerda faqat sizning narxingiz va sizga to'lanadigan summa ko'rsatiladi. Sizga aynan o'zingiz yozgan narx to'lanadi; mijozlar bilan hisob-kitobni Moviy Nomad yuritadi.", payNone: "Hozircha bron yo'q.", payCols: ["Bron", "Sana", "Kun / kecha", "Narxingiz", "Sizga to'lanadi", "Holat"], priceHint: "Bu — SIZNING narxingiz (sizga to'lanadi). Narx o'zgarsa, Moviy Nomad tasdiqlaydi.",
      payStatus: { request: "So'rov", new: "So'rov", in_progress: "Kelishilmoqda", awaiting_payment: "To'lov kutilmoqda", deposit_paid: "Tasdiqlanmoqda", payment_reported: "To'lov tekshirilmoqda", paid: "To'landi", confirmed: "Tasdiqlandi", closed: "Yakunlandi" },
      rejWhy: "Rad etish sababi", rejCom: "Nimani tuzatdingiz? (adminga qisqacha)", rejSend: "Tuzatib qayta yuborish", rejSent: "Arizangiz qayta yuborildi ✅ Tez orada ko'rib chiqamiz.", rejNeed: "Nimani tuzatganingizni qisqacha yozing.", rejN: "Qayta yuborilgan"
    },
    ru: {
      title: "Портал партнёров", notP: "Этот аккаунт не зарегистрирован как партнёр. Нажмите «Выйти» и зарегистрируйтесь с другим e-mail.", sub: "Для гидов, водителей, гостиниц и других поставщиков услуг.",
      login: "Вход", reg: "Стать партнёром", chT: "Изменить карточку", chHint: "Вы на сайте: изменения (языки, города, фото, цена, био и др.) сначала уходят в Moviy Nomad. После одобрения администратором карточка на сайте обновится.", chCom: "Комментарий администратору: что вы изменили и почему? *", chSend: "Отправить на проверку", chSent: "Отправлено ✅ Карточка обновится после одобрения администратором.", chPend: "Ваши изменения на проверке", chYour: "Ваш комментарий", chRej: "Последнее изменение отклонено", chOk: "Последнее изменение одобрено и опубликовано", chNeed: "Пожалуйста, напишите комментарий: что вы изменили.", chPendNote: "В форме ниже — отправленные (ещё не одобренные) данные. Если измените и отправите снова, старая заявка заменится новой.", cal: "Мой календарь (занятые дни)", calHint: "Нажмите на занятый день — он станет красным. Нажмите ещё раз, чтобы написать заметку или освободить день. Туристы на сайте видят зелёные (свободные) дни и оставляют заявку, менеджер свяжется с вами. Заметки видите только вы и Moviy Nomad.", calFree: "Свободно", calBusy: "Занято", calNote: "Заметка (например: группа из Германии, 8 чел.)", calSave: "Сохранить", calClear: "Освободить", calUp: "Ближайшие занятые дни", stats: "Просмотры · Лайки · Репосты", birth: "Год рождения", area: "Где живёте (город, район) — видно на сайте", addr: "Полный адрес — видит только Moviy Nomad", regGo: "Заявка подаётся в нужном разделе сайта: читаете требования, загружаете фото — и здесь открывается кабинет. Кем вы подаёте заявку?", email: "E-mail", pass: "Пароль", pass8: "Пароль (не менее 8 символов)", forgot: "Забыли пароль", logout: "Выйти",
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
      bad: "Ошибка: ",
      rejHow: "Исправьте недочёты: поправьте данные, загрузите нужные фото и документы и нажмите «Исправить и отправить снова». Заявку рассмотрят заново — отправлять можно сколько угодно раз.",
      lockNote: "🔒 Эти данные меняет только Moviy Nomad (имя, год рождения, номер удостоверения, компания). Если нужно изменить — напишите менеджеру.", histT: "История моих изменений", histNone: "Запросов на изменение пока нет.", histSt: { pending: "⏳ Проверяется", approved: "✅ Одобрено", rejected: "❌ Отклонено" },
      payT: "Суммы к выплате вам", payNote: "Здесь показаны только ваша цена и сумма к выплате. Вам платится ровно указанная вами цена; расчёты с клиентами ведёт Moviy Nomad.", payNone: "Пока нет бронирований.", payCols: ["Бронь", "Дата", "Дней / ночей", "Ваша цена", "К выплате", "Статус"], priceHint: "Это ВАША цена (выплачивается вам). Изменение цены подтверждает Moviy Nomad.",
      payStatus: { request: "Запрос", new: "Запрос", in_progress: "Согласуется", awaiting_payment: "Ожидает оплаты", deposit_paid: "Подтверждается", payment_reported: "Оплата проверяется", paid: "Оплачено", confirmed: "Подтверждено", closed: "Завершено" },
      rejWhy: "Причина отказа", rejCom: "Что вы исправили? (кратко для администратора)", rejSend: "Исправить и отправить снова", rejSent: "Заявка отправлена повторно ✅ Скоро рассмотрим.", rejNeed: "Кратко напишите, что исправили.", rejN: "Отправлено повторно"
    }
  };
  var LANGS = ["English", "Русский", "O'zbek", "Türkçe", "Deutsch", "Français", "Español", "Italiano", "العربية", "中文", "한국어", "日本語", "हिन्दी", "Svenska"];
  var SPEC = ["History", "Culture", "Architecture", "Food", "Nature", "Photography", "Shopping", "Religion", "Adventure", "Family"];
  // 25.11.2026: e-mail code login, optional password, rooms / vehicles
  Object.assign(D.uz, { codeTab: "E-mail kodi", passTab: "Parol", codeSend: "Kod yuborish", codeSent: "E-mailingizga kirish kodi va havola yuborildi. Kodni yozing yoki xatdagi havolani bosing.", code: "Koddagi raqamlar", codeOk: "Kirish",
    codeHint: "Parolsiz kirish: e-mailingizni yozing — kod keladi.", pwT: "🔒 Kabinet paroli (ixtiyoriy)", pwHint: "Xohlasangiz parol qo'ying: keyin e-mail kodisiz ham, parol bilan ham kira olasiz. Boshqa odam kabinetingizni ochmasligi uchun foydali.", pwSave: "Parolni saqlash", pwOk: "Parol saqlandi ✅",
    unitsRoom: "🛏 Xona turlari va narxlar", unitsCar: "🚐 Mashinalar va narxlar", unitsHint: "Netto — sizga to'lanadigan narx. Yangi yoki o'zgartirilgan xona/mashina Moviy Nomad tasdig'idan keyin saytda chiqadi. Vaqtincha yopish (masalan, ta'mirda) — tasdiqsiz.",
    uAddRoom: "+ Xona turi qo'shish", uAddCar: "+ Mashina qo'shish", uSave: "Saqlash", uDel: "O'chirish", uHide: "Vaqtincha yopish", uShow: "Qayta ochish", uPhotos: "Rasmlar (15 tagacha)", uNone: "Hali qo'shilmagan.",
    uSt: { pending: "⏳ Tekshirilmoqda", approved: "✅ Saytda", rejected: "❌ Rad etildi", hidden: "⏸ Yopiq" }, uDelQ: "Rostdan o'chirilsinmi? Qayta bosing.",
    exT: "🏨 Mehmonxona ma'lumotlari", exSave: "Saqlash" });
  Object.assign(D.ru, { codeTab: "Код на e-mail", passTab: "Пароль", codeSend: "Отправить код", codeSent: "На e-mail отправлены код и ссылка для входа. Введите код или нажмите ссылку в письме.", code: "Цифры из письма", codeOk: "Войти",
    codeHint: "Вход без пароля: укажите e-mail — придёт код.", pwT: "🔒 Пароль кабинета (необязательно)", pwHint: "При желании задайте пароль: тогда сможете входить и по паролю, и по коду. Полезно, чтобы никто другой не открыл ваш кабинет.", pwSave: "Сохранить пароль", pwOk: "Пароль сохранён ✅",
    unitsRoom: "🛏 Типы номеров и цены", unitsCar: "🚐 Машины и цены", unitsHint: "Нетто — цена, которую получаете вы. Новый или изменённый номер/машина появится на сайте после проверки Moviy Nomad. Временно закрыть (например, в ремонте) — без проверки.",
    uAddRoom: "+ Добавить тип номера", uAddCar: "+ Добавить машину", uSave: "Сохранить", uDel: "Удалить", uHide: "Временно закрыть", uShow: "Открыть снова", uPhotos: "Фото (до 15)", uNone: "Пока не добавлено.",
    uSt: { pending: "⏳ На проверке", approved: "✅ На сайте", rejected: "❌ Отклонено", hidden: "⏸ Закрыто" }, uDelQ: "Точно удалить? Нажмите ещё раз.",
    exT: "🏨 Данные отеля", exSave: "Сохранить" });
  Object.assign(D.uz, { grpT: "✈️ «Moviy Nomad» Telegram guruhi", grpTxt: "Hamkorlarimiz va turizm sohasidagi odamlar uchun yopiq guruh: yangiliklar, buyurtmalar, tanishuvlar. Hali qo'shilmagan bo'lsangiz — qo'shiling, so'rovingizni admin tasdiqlaydi.", grpBtn: "Telegram guruhga qo'shilish" });
  Object.assign(D.ru, { grpT: "✈️ Telegram-группа «Moviy Nomad»", grpTxt: "Закрытая группа для наших партнёров и людей из туризма: новости, заказы, знакомства. Если ещё не вступили — вступите, заявку подтверждает администратор.", grpBtn: "Вступить в Telegram-группу" });
  var GRP = (window.MN_CFG || {}).partner_group || "";
  function grpBlock() { return GRP ? '<div class="p-card" style="border:2px solid #2aabee;background:#f2faff"><h3>' + t("grpT") + '</h3><p class="p-sub">' + t("grpTxt") + '</p><a class="btn" style="background:#2aabee;color:#fff" target="_blank" rel="noopener" href="' + esc(GRP) + '">' + t("grpBtn") + '</a></div>' : ""; }
  var UJ = (window.MNJ_UNITS || {});
  var t = function (k) { return D[L][k]; };
  var me = { user: null, partner: null };
  var WA = (window.MN_CFG || {}).whatsapp || "998975427799", TG = (window.MN_CFG || {}).telegram || "moviy_safina";
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
        '<h2>' + t("title") + '</h2><p class="p-sub">' + t("sub") + '</p>' +
        '<div class="seg" style="margin:6px 0 12px"><button type="button" data-lm="code" class="' + (tab !== "pass" ? "is-on" : "") + '">✉️ ' + t("codeTab") + '</button><button type="button" data-lm="pass" class="' + (tab === "pass" ? "is-on" : "") + '">🔒 ' + t("passTab") + '</button></div>' +
        (tab === "pass"
          ? '<form id="f-log"><div class="fld"><label>' + t("email") + '</label><input name="email" type="email" required autocomplete="email"></div>' +
            '<div class="fld" style="margin-top:12px"><label>' + t("pass") + '</label><input name="password" type="password" required autocomplete="current-password"></div><div class="msg" id="m-log"></div>' +
            '<div class="p-actions"><button class="btn btn--gold" type="submit">' + t("login") + '</button><button class="btn btn--outline" type="button" id="p-forgot">' + t("forgot") + '</button></div></form>'
          : '<form id="f-code"><p class="p-sub">' + t("codeHint") + '</p><div class="fld"><label>' + t("email") + '</label><input name="email" type="email" required autocomplete="email"></div>' +
            '<div class="fld hidden" id="c-wrap" style="margin-top:12px"><label>' + t("code") + '</label><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" style="font-size:22px;letter-spacing:5px"></div><div class="msg" id="m-log"></div>' +
            '<div class="p-actions"><button class="btn btn--gold" type="submit" id="c-btn">' + t("codeSend") + '</button></div></form>')) +
      help() + '</div>';
    $$("[data-t]", box).forEach(function (b) { b.onclick = function () { authView(b.dataset.t); }; });
    $$("[data-lm]", box).forEach(function (b) { b.onclick = function () { authView(b.dataset.lm); }; });
    var fc = $("#f-code"); if (fc) fc.onsubmit = async function (e) {
      e.preventDefault(); var em = fc.email.value.replace(/\s+/g, "").toLowerCase(), btn = $("#c-btn"); btn.disabled = true;
      if (!fc.dataset.sent) {
        P.msg("#m-log", "…");
        var o = await sb.auth.signInWithOtp({ email: em, options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname } });
        btn.disabled = false;
        if (o.error) return P.msg("#m-log", t("bad") + o.error.message, "err");
        fc.dataset.sent = em; $("#c-wrap").classList.remove("hidden"); btn.textContent = t("codeOk"); fc.code.focus(); return P.msg("#m-log", t("codeSent"), "ok");
      }
      var r = await sb.auth.verifyOtp({ email: fc.dataset.sent, token: fc.code.value.replace(/\D/g, ""), type: "email" });
      btn.disabled = false;
      if (r.error) return P.msg("#m-log", t("bad") + r.error.message, "err");
      boot();
    };
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
    var live = p.status === "approved" || p.status === "paused", C = (window.MNCities && window.MNCities.list) || [], CL = L === "ru" ? "ru" : "uz";
    if (live && me.pending) p = Object.assign({}, p, me.pending.data);
    var cityKey = window.MNCities ? window.MNCities.key(p.city) : "", hasCity = C.some(function (c) { return c[0] === cityKey; });
    var citySel = C.length ? '<select name="city"><option value=""></option>' + (p.city && !hasCity ? '<option selected>' + esc(p.city) + '</option>' : '') + C.map(function (c) { return '<option value="' + esc(c[1]) + '"' + (c[0] === cityKey ? " selected" : "") + '>' + esc(window.MNCities.label(c[0], CL)) + '</option>'; }).join("") + '</select>' : '<input name="city" value="' + esc(p.city || "") + '">';
    var haveK = (p.cities || []).map(function (x) { return window.MNCities ? window.MNCities.key(x) : x; });
    var cityChips = C.length ? '<div class="pchips">' + C.map(function (c) { return '<label><input type="checkbox" name="cities_x" value="' + esc(c[1]) + '"' + (haveK.indexOf(c[0]) > -1 ? " checked" : "") + '> ' + esc(window.MNCities.label(c[0], CL)) + '</label>'; }).join("") + '</div>' : '<input name="cities" value="' + esc((p.cities || []).join(", ")) + '">';
    var h = '<div class="p-card"><h3>' + (live ? t("chT") : t("profile")) + '</h3>' + (live ? '<p class="p-sub">' + t("chHint") + '</p>' + (me.pending ? '<p class="p-sub" style="color:#b4541b">' + t("chPendNote") + '</p>' : '') : '') + '<form id="f-prof"><div class="p-grid">' +
      '<div class="fld full"><label>' + t("name") + '</label><input name="name" value="' + esc(p.name) + '" maxlength="120"' + (live ? ' disabled' : '') + '></div>' + (live ? '<div class="fld full"><small class="p-sub">' + t("lockNote") + '</small></div>' : '') +
      '<div class="fld full"><label>' + t("photo") + '</label>' + (p.photo ? '<img class="pphoto" src="' + esc(pub(p.photo)) + '" alt="">' : '') + '<input type="file" id="ph-main" accept="image/*"></div>' +
      '<div class="fld"><label>' + t("city") + '</label>' + citySel + '</div>' +
      '<div class="fld full"><label>' + t("cities") + '</label>' + cityChips + '</div>' +
      (k !== "hotel" ? '<div class="fld"><label>' + t("birth") + '</label><input name="birth_year" type="number" min="1940" max="2010" value="' + (p.birth_year || "") + '"' + (live ? ' disabled' : '') + '></div>' : '') +
      '<div class="fld"><label>' + t("area") + '</label><input name="home_area" maxlength="120" value="' + esc(p.home_area || "") + '"></div>' +
      '<div class="fld full"><label>' + t("addr") + '</label><input name="home_address" maxlength="250" value="' + esc(p.home_address || "") + '"></div>' +
      '<div class="fld"><label>' + t("price") + ' (' + (k === "hotel" ? t("perNight") : t("perDay")) + ')</label><input name="price_day" type="number" min="0" step="1" value="' + (p.price_day == null ? "" : p.price_day) + '"><small class="p-sub">' + t("priceHint") + '</small></div>' +
      '<div class="fld"><label>' + t("priceNote") + '</label><input name="price_note" value="' + esc(p.price_note || "") + '" maxlength="200"></div>' +
      (k === "guide" ? '<div class="fld"><label>' + t("exp") + '</label><input name="experience_years" type="number" min="0" max="60" value="' + (p.experience_years == null ? "" : p.experience_years) + '"></div>' : '') +
      (k === "driver" ? '<div class="fld"><label>' + t("vType") + '</label><input name="vehicle_type" value="' + esc(p.vehicle_type || "") + '" placeholder="Chevrolet Cobalt / Hyundai Starex"></div><div class="fld"><label>' + t("seats") + '</label><input name="vehicle_seats" type="number" min="1" max="60" value="' + (p.vehicle_seats || "") + '"></div><div class="fld"><label>' + t("year") + '</label><input name="vehicle_year" type="number" min="1990" max="2030" value="' + (p.vehicle_year || "") + '"></div>' : '') +
      (k === "hotel" ? '<div class="fld"><label>' + t("stars") + '</label><input name="hotel_stars" type="number" min="0" max="5" value="' + (p.hotel_stars == null ? "" : p.hotel_stars) + '"></div><div class="fld"><label>' + t("rooms") + '</label><input name="hotel_rooms" type="number" min="1" max="2000" value="' + (p.hotel_rooms || "") + '"></div>' : '') +
      '<div class="fld full"><label>' + t("langs") + '</label>' + chk(LANGS, p.languages, "languages") + '</div>' +
      (k === "guide" ? '<div class="fld full"><label>' + t("spec") + '</label>' + chk(SPEC, p.specialties, "specialties") + '</div>' : '') +
      '<div class="fld full"><label>' + t("bio") + '</label><textarea name="bio" rows="5" maxlength="1500">' + esc(p.bio || "") + '</textarea></div>' +
      '<div class="fld full"><label>' + t("gallery") + '</label><div class="pgal">' + (p.photos || []).map(function (x, i) { return '<span><img src="' + esc(pub(x)) + '" alt=""><button type="button" data-rm="' + i + '">×</button></span>'; }).join("") + '</div><input type="file" id="ph-more" accept="image/*" multiple></div>' +
      '<div class="fld"><label>' + t("phone") + '</label><input name="phone" value="' + esc(p.phone || "") + '"></div><div class="fld"><label>' + t("tg") + ' *</label><input name="telegram" required maxlength="64" placeholder="@username" value="' + esc(p.telegram || "") + '"></div><div class="fld"><label>' + t("wa") + '</label><input name="whatsapp" value="' + esc(p.whatsapp || "") + '"></div>' +
      '<div class="fld"><label>' + t("lic") + '</label><input name="license_no" value="' + esc(p.license_no || "") + '"' + (live ? ' disabled' : '') + '></div>' + (k === "hotel" || k === "other" ? '<div class="fld"><label>' + t("inn") + '</label><input name="inn" value="' + esc(p.inn || "") + '"' + (live ? ' disabled' : '') + '></div>' : '') +
      (live ? '<div class="fld full"><label>' + t("chCom") + '</label><textarea name="ch_comment" rows="2" maxlength="1000" required></textarea></div>' : '') +
      (p.status === "rejected" ? '<div class="fld full"><label>' + t("rejCom") + '</label><textarea name="rs_comment" rows="2" maxlength="500" required></textarea></div>' : '') +
      '</div><div class="msg" id="m-prof"></div><div class="p-actions"><button class="btn btn--gold" type="submit">' + (live ? t("chSend") : p.status === "rejected" ? "↻ " + t("rejSend") : t("save")) + '</button>' +
      (p.status === "approved" ? '<a class="btn btn--outline" target="_blank" rel="noopener" href="../partners.html#p-' + p.id + '">' + t("view") + '</a>' : '') + '</div></form></div>';
    return h;
  }
  async function resize(file, max) {
    // 1) createImageBitmap; 2) if the phone browser can't, load it as an <img>; 3) if both fail, send the original
    var src = null;
    try { src = await createImageBitmap(file); } catch (e) {
      try { src = await new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = URL.createObjectURL(file); }); } catch (e2) { src = null; }
    }
    if (!src) return file;
    try {
      var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, s = Math.min(1, max / Math.max(w, h));
      var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
      c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
      var b = await new Promise(function (r) { c.toBlob(r, "image/webp", 0.8); });
      if (!b || b.type !== "image/webp") b = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.82); });   // old Safari: no WebP encoder
      return b ? new File([b], (file.name || "photo").replace(/\.\w+$/, "") + (b.type === "image/jpeg" ? ".jpg" : ".webp"), { type: b.type }) : file;
    } catch (e) { return file; }
  }

  function bindProfile() {
    var f = $("#f-prof");
    me.rmPhotos = [];
    $$("[data-rm]", f).forEach(function (b) { b.onclick = function () { var img = b.parentNode.querySelector("img"); me.rmPhotos.push(decodeURIComponent((img.getAttribute("src") || "").split("/partner-photos/")[1] || "")); b.parentNode.remove(); }; });
    f.onsubmit = async function (e) {
      e.preventDefault(); P.msg("#m-prof", "…");
      try {
        var p = me.partner, d = profilePayload((p.status === "approved" || p.status === "paused") && me.pending ? Object.assign({}, p, me.pending.data) : p);
        if (me.rmPhotos) d.photos = d.photos.filter(function (x) { return me.rmPhotos.indexOf(x) < 0; });
        ["name", "city", "price_day", "price_note", "experience_years", "vehicle_type", "vehicle_seats", "vehicle_year", "hotel_stars", "hotel_rooms", "bio", "phone", "whatsapp", "license_no", "inn", "birth_year", "home_area", "home_address", "telegram"].forEach(function (k) { if (f[k]) d[k] = f[k].value.trim(); });
        d.cities = f.cities ? f.cities.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean) : $$("[name=cities_x]:checked", f).map(function (x) { return x.value; });
        d.languages = $$("[name=languages]:checked", f).map(function (x) { return x.value; });
        d.specialties = $$("[name=specialties]:checked", f).map(function (x) { return x.value; });
        var mf = $("#ph-main").files[0]; if (mf) d.photo = await P.upload("partner-photos", p.id, await resize(mf, 1200));
        var more = [].slice.call($("#ph-more").files || []);
        for (var i = 0; i < more.length && d.photos.length < 30; i++) d.photos.push(await P.upload("partner-photos", p.id, await resize(more[i], 1600)));
        if (p.status === "approved" || p.status === "paused") {
          var cm = f.ch_comment.value.trim(); if (cm.length < 3) { f.ch_comment.focus(); return P.msg("#m-prof", t("chNeed"), "err"); }
          var rq = await sb.rpc("partner_request_change", { p: d, comment: cm }); if (rq.error) throw rq.error;
          P.msg("#m-prof", t("chSent"), "ok"); setTimeout(boot, 1500); return;
        }
        var rej = p.status === "rejected";
        if (rej) { var rc = f.rs_comment.value.trim(); if (rc.length < 3) { f.rs_comment.focus(); return P.msg("#m-prof", t("rejNeed"), "err"); } d.resubmit_comment = rc; }
        var r = await sb.rpc("partner_save", { p: d }); if (r.error) throw r.error;
        P.msg("#m-prof", rej ? t("rejSent") : t("saved"), "ok"); setTimeout(boot, rej ? 1800 : 700);
      } catch (e2) { P.msg("#m-prof", t("bad") + P.err(e2), "err"); }
    };
  }

  async function histBlock() {
    var r = await sb.from("partner_changes").select("created_at,comment,status,admin_note,decided_at").eq("partner_id", me.partner.id).order("created_at", { ascending: false }).limit(20);
    var L2 = r.data || [], ST2 = t("histSt");
    return '<div class="p-card"><h3>📜 ' + t("histT") + '</h3>' + (L2.length ? '<table class="tbl"><tbody>' + L2.map(function (x) {
      return '<tr><td><small>' + new Date(x.created_at).toLocaleDateString() + '</small></td><td>' + esc(x.comment) + (x.admin_note ? '<br><small class="p-sub">Moviy Nomad: ' + esc(x.admin_note) + '</small>' : '') + '</td><td style="white-space:nowrap">' + (ST2[x.status] || x.status) + '</td></tr>';
    }).join("") + '</tbody></table>' : '<p class="p-sub">' + t("histNone") + '</p>') + '</div>';
  }

  async function payBlock() {
    var r = await sb.rpc("my_partner_payouts"), L2 = r.data || [], c = t("payCols"), ST2 = t("payStatus");
    var unit = me.partner.kind === "hotel" ? t("perNight") : t("perDay");
    return '<div class="p-card"><h3>💵 ' + t("payT") + '</h3><p class="p-sub">' + t("payNote") + '</p>' +
      '<p><b>' + t("price") + ':</b> ' + (me.partner.price_day ? '$' + Math.round(me.partner.price_day) + ' ' + unit : '—') + '</p>' +
      (L2.length ? '<div style="overflow:auto"><table class="tbl"><thead><tr>' + c.map(function (x) { return '<th>' + x + '</th>'; }).join("") + '</tr></thead><tbody>' +
        L2.map(function (x) { return '<tr><td>' + esc(x.ref || "") + '</td><td>' + (x.start_date ? new Date(x.start_date).toLocaleDateString() : "—") + '</td><td>' + (+x.units) + (x.qty > 1 ? ' × ' + x.qty : '') + '</td><td>$' + Math.round(x.unit_price) + '</td><td><b>$' + Math.round(x.amount) + '</b></td><td>' + esc(ST2[x.status] || x.status || "") + '</td></tr>'; }).join("") +
        '</tbody></table></div>' : '<p class="p-sub">' + t("payNone") + '</p>') + '</div>';
  }

  // ---------------------------------------------------------------- rooms / vehicles
  function uopt(o, sel) { return Object.keys(o || {}).map(function (k) { return '<option value="' + esc(k) + '"' + (k === sel ? " selected" : "") + '>' + esc(o[k]) + '</option>'; }).join(""); }
  function uForm(u, room) {
    var J2 = UJ[L] || UJ.uz || {}, f = function (n, lab, type, val, ex) { return '<div class="fld"><label>' + esc(lab) + '</label><input data-u="' + n + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '"' + (ex || "") + '></div>'; };
    return '<div class="p-grid">' + (room
      ? '<div class="fld"><label>' + esc(J2.r_class) + '</label><select data-u="class">' + uopt(J2.rc, u.class || "standard") + '</select></div>' + f("name", J2.r_name, "text", u.name, ' maxlength="120"') +
        f("capacity", J2.r_cap, "number", u.capacity || 2, ' min="1" max="20"') + '<div class="fld"><label>' + esc(J2.r_beds) + '</label><select data-u="beds">' + uopt(J2.beds, u.beds || "1 double") + '</select></div>' +
        f("qty", J2.r_qty, "number", u.qty || 1, ' min="1" max="999"') + f("price_netto", J2.r_price, "number", u.price_netto, ' min="1" max="20000"') +
        '<div class="fld"><label><input type="checkbox" data-u="breakfast"' + (u.breakfast !== false ? " checked" : "") + '> ' + esc(J2.r_bf) + '</label></div>'
      : '<div class="fld"><label>' + esc(J2.v_class) + '</label><select data-u="class">' + uopt(J2.vc, u.class || "comfort") + '</select></div>' + f("name", J2.v_model, "text", u.name, ' maxlength="120"') +
        f("capacity", J2.v_seats, "number", u.capacity || 4, ' min="1" max="60"') + f("luggage", J2.v_lug, "number", u.luggage == null ? 3 : u.luggage, ' min="0" max="60"') + f("year", J2.v_year, "number", u.year, ' min="1990" max="2030"') +
        f("plate", J2.v_plate, "text", u.plate, ' maxlength="20"') + f("price_netto", J2.v_day, "number", u.price_netto, ' min="1" max="20000"') + f("price_transfer", J2.v_tr, "number", u.price_transfer, ' min="1" max="5000"') +
        '<div class="fld"><label><input type="checkbox" data-u="ac"' + (u.ac !== false ? " checked" : "") + '> ' + esc(J2.v_ac) + '</label></div>') +
      '<div class="fld full"><label>' + t("uPhotos") + '</label><div class="pgal">' + (u.photos || []).map(function (x, i) { return '<span><img src="' + esc(pub(x)) + '" alt=""><button type="button" data-urm="' + i + '">×</button></span>'; }).join("") + '</div><input type="file" data-uph accept="image/*" multiple></div></div>';
  }
  async function unitsBlock() {
    var room = me.partner.kind === "hotel", r = await sb.from("partner_units").select("*").eq("partner_id", me.partner.id).order("sort").order("created_at");
    me.units = r.data || [];
    return '<div class="p-card" id="p-units"><h3>' + t(room ? "unitsRoom" : "unitsCar") + '</h3><p class="p-sub">' + t("unitsHint") + '</p><div id="u-list">' +
      (me.units.length ? me.units.map(function (u) { return unitCard(u, room); }).join("") : '<p class="p-sub">' + t("uNone") + '</p>') + '</div>' +
      '<button class="btn btn--outline btn--sm" type="button" id="u-add">' + t(room ? "uAddRoom" : "uAddCar") + '</button><div class="msg" id="m-units"></div></div>';
  }
  function unitCard(u, room) {
    var st = t("uSt")[u.status] || u.status;
    return '<details class="p-unit" data-uid="' + esc(u.id || "") + '" style="border:1px solid #e5e0d5;border-radius:14px;padding:10px 12px;margin:0 0 10px"' + (u.id ? "" : " open") + '><summary style="cursor:pointer"><b>' + esc(u.name || "…") + '</b> · ' + (u.price_netto ? "$" + Math.round(u.price_netto) : "—") + (u.qty > 1 ? ' · ×' + u.qty : '') + ' · <small>' + st + '</small>' +
      (u.admin_note && u.status === "rejected" ? '<br><small style="color:#b4541b">Moviy Nomad: ' + esc(u.admin_note) + '</small>' : '') + '</summary>' + uForm(u, room) +
      '<div class="p-actions"><button class="btn btn--gold btn--sm" type="button" data-usave>' + t("uSave") + '</button>' +
      (u.status === "approved" ? '<button class="btn btn--outline btn--sm" type="button" data-uhide>' + t("uHide") + '</button>' : '') +
      (u.status === "hidden" ? '<button class="btn btn--outline btn--sm" type="button" data-ushow>' + t("uShow") + '</button>' : '') +
      (u.id ? '<button class="btn btn--outline btn--sm" type="button" data-udel>' + t("uDel") + '</button>' : '') + '</div></details>';
  }
  function bindUnits() {
    var room = me.partner.kind === "hotel", wrap = $("#p-units");
    $("#u-add").onclick = function () { var l = $("#u-list"); if (!me.units.length) l.innerHTML = ""; l.insertAdjacentHTML("beforeend", unitCard({ status: "pending", photos: [] }, room)); };
    wrap.addEventListener("click", async function (e) {
      var card = e.target.closest(".p-unit"); if (!card) return;
      var id = card.dataset.uid, u = me.units.filter(function (x) { return x.id === id; })[0] || { photos: [] };
      var rm = e.target.closest("[data-urm]"); if (rm) { card.dataset.rm = (card.dataset.rm || "") + "|" + (u.photos || [])[+rm.dataset.urm]; rm.parentNode.remove(); return; }
      if (e.target.closest("[data-udel]")) {
        if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = t("uDelQ"); return; }
        var d = await sb.from("partner_units").delete().eq("id", id); if (d.error) return P.msg("#m-units", t("bad") + d.error.message, "err"); return boot();
      }
      if (e.target.closest("[data-uhide]") || e.target.closest("[data-ushow]")) {
        var h = await sb.from("partner_units").update({ status: e.target.closest("[data-uhide]") ? "hidden" : "approved" }).eq("id", id);
        if (h.error) return P.msg("#m-units", t("bad") + h.error.message, "err"); return boot();
      }
      if (!e.target.closest("[data-usave]")) return;
      var g = function (n) { var el = card.querySelector('[data-u="' + n + '"]'); return el ? (el.type === "checkbox" ? el.checked : String(el.value).trim()) : null; };
      var num = function (n) { var x = parseFloat(g(n)); return isNaN(x) ? null : x; };
      var J2 = UJ[L] || UJ.uz || {}, row = { unit_kind: room ? "room" : "vehicle", class: g("class"), name: g("name") || (room ? (J2.rc || {})[g("class")] : ""), capacity: num("capacity"), qty: num("qty") || 1, price_netto: num("price_netto") };
      if (room) { row.beds = g("beds"); row.breakfast = g("breakfast"); } else { row.luggage = num("luggage"); row.year = num("year"); row.plate = g("plate"); row.price_transfer = num("price_transfer"); row.ac = g("ac"); }
      if (!row.name || !(row.price_netto > 0)) return P.msg("#m-units", J2.need_unit || "?", "err");
      var keep = (u.photos || []).filter(function (x) { return (card.dataset.rm || "").split("|").indexOf(x) < 0; });
      var fin = card.querySelector("[data-uph]"), files = fin ? [].slice.call(fin.files, 0, Math.max(0, 15 - keep.length)) : [];
      P.msg("#m-units", "…");
      try {
        for (var i = 0; i < files.length; i++) { var fl = await resize(files[i], 1400); keep.push(await P.upload("partner-photos", me.partner.id, fl)); }
        row.photos = keep;
        var q = id ? await sb.from("partner_units").update(row).eq("id", id) : await sb.from("partner_units").insert(Object.assign({ partner_id: me.partner.id }, row));
        if (q.error) throw q.error;
        P.msg("#m-units", t("saved"), "ok"); boot();
      } catch (er) { P.msg("#m-units", t("bad") + P.err(er), "err"); }
    });
  }
  function exBlock() {
    var x = me.partner.extra || {}, J2 = UJ[L] || UJ.uz || {}, am = x.amenities || [];
    return '<div class="p-card"><h3>' + t("exT") + '</h3><form id="f-ex"><div class="pchips">' + Object.keys(J2.amen || {}).map(function (k) { return '<label><input type="checkbox" name="am" value="' + k + '"' + (am.indexOf(k) > -1 ? " checked" : "") + '> ' + esc(J2.amen[k]) + '</label>'; }).join("") + '</div>' +
      '<div class="p-grid" style="margin-top:10px"><div class="fld"><label>' + esc(J2.check_in) + '</label><input type="time" name="check_in" value="' + esc(x.check_in || "14:00") + '"></div><div class="fld"><label>' + esc(J2.check_out) + '</label><input type="time" name="check_out" value="' + esc(x.check_out || "12:00") + '"></div>' +
      '<div class="fld full"><label>' + esc(J2.map_url) + '</label><input name="map_url" type="url" value="' + esc(x.map_url || "") + '"></div><div class="fld full"><label>' + esc(J2.policies) + '</label><textarea name="policies" rows="3" maxlength="800">' + esc(x.policies || "") + '</textarea></div></div>' +
      '<div class="msg" id="m-ex"></div><div class="p-actions"><button class="btn btn--gold btn--sm">' + t("exSave") + '</button></div></form></div>';
  }
  function bindEx() {
    var f = $("#f-ex"); if (!f) return;
    f.onsubmit = async function (e) {
      e.preventDefault(); var x = me.partner.extra || {};
      var r = await sb.rpc("partner_save_extra", { p: { amenities: $$("[name=am]:checked", f).map(function (i) { return i.value; }), check_in: f.check_in.value, check_out: f.check_out.value, map_url: f.map_url.value.trim(), policies: f.policies.value.trim(), company_type: x.company_type || "", registry_no: x.registry_no || "" } });
      P.msg("#m-ex", r.error ? t("bad") + r.error.message : t("saved"), r.error ? "err" : "ok");
    };
  }
  // ---------------------------------------------------------------- guide price list (private, NETTO)
  var RK = [["full_day", "r_full"], ["half_day", "r_half"], ["extra_hour", "r_hour"], ["meet", "r_meet"], ["out_of_town", "r_out"], ["tour_day", "r_tour"], ["big_group", "r_big"]];
  function ratesBlock() {
    var p = me.partner, J2 = UJ[L] || UJ.uz || {}, r = Object.assign({}, p.rates || {}, p.rates_new || {}), cat = (p.extra || {}).guide_cat || "";
    if (r.full_day == null && p.price_day != null) r.full_day = p.price_day;
    return '<div class="p-card" id="p-rates"><h3>' + esc(J2.sec_rates || "") + '</h3><p class="p-sub">' + esc(J2.rates_note || "") + '</p>' +
      (p.rates_new ? '<p class="p-sub" style="color:#b4541b">⏳ ' + (L === "ru" ? "Новые цены на проверке у Moviy Nomad" : "Yangi narxlaringiz Moviy Nomad tekshiruvida") + '</p>' : '') +
      '<form id="f-rates"><div class="p-grid"><div class="fld"><label>' + esc(J2.gcat || "") + '</label><select name="guide_cat">' + Object.keys(J2.gcats || {}).map(function (k) { return '<option value="' + k + '"' + (k === cat ? " selected" : "") + '>' + esc(J2.gcats[k]) + '</option>'; }).join("") + '</select></div>' +
      RK.map(function (x) { return '<div class="fld"><label>' + esc(J2[x[1]] || x[0]) + '</label><input name="' + x[0] + '" type="number" min="0" max="5000" step="1" value="' + (r[x[0]] == null ? "" : esc(r[x[0]])) + '"></div>'; }).join("") +
      '</div><div class="msg" id="m-rates"></div><div class="p-actions"><button class="btn btn--gold btn--sm">' + t("uSave") + '</button></div></form></div>';
  }
  function bindRates() {
    var f = $("#f-rates"); if (!f) return;
    f.onsubmit = async function (e) {
      e.preventDefault(); var o = {};
      RK.forEach(function (x) { var v = f[x[0]].value.trim(); if (v !== "") o[x[0]] = v; });
      var r = await sb.rpc("partner_save_rates", { p: o });
      if (r.error) return P.msg("#m-rates", t("bad") + r.error.message, "err");
      var c = f.guide_cat.value; if (c !== ((me.partner.extra || {}).guide_cat || "")) await sb.rpc("partner_save_extra", { p: { guide_cat: c } });
      P.msg("#m-rates", t("saved"), "ok"); setTimeout(boot, 900);
    };
  }
  function pwBlock() {
    return '<div class="p-card"><h3>' + t("pwT") + '</h3><p class="p-sub">' + t("pwHint") + '</p><form id="f-pw"><div class="fld"><input type="password" name="pw" minlength="8" maxlength="72" autocomplete="new-password" placeholder="••••••••"></div><div class="msg" id="m-pw"></div><div class="p-actions"><button class="btn btn--outline btn--sm">' + t("pwSave") + '</button></div></form></div>';
  }
  function bindPw() {
    var f = $("#f-pw"); if (!f) return;
    f.onsubmit = async function (e) { e.preventDefault(); if (f.pw.value.length < 8) return P.msg("#m-pw", t("pass8"), "err"); var r = await sb.auth.updateUser({ password: f.pw.value }); P.msg("#m-pw", r.error ? t("bad") + r.error.message : t("pwOk"), r.error ? "err" : "ok"); if (!r.error) f.reset(); };
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
    me.pending = null;
    var lc = (await sb.from("partner_changes").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }).limit(1)).data || [];
    if (lc[0] && lc[0].status === "pending") me.pending = lc[0];
    if (lc[0]) {
      var dt = new Date(lc[0].decided_at || lc[0].created_at).toLocaleDateString();
      if (lc[0].status === "pending") h += '<div class="p-card" style="border:2px solid #e9b949"><h3>⏳ ' + t("chPend") + ' <small>(' + dt + ')</small></h3><p class="p-sub">' + t("chYour") + ': ' + esc(lc[0].comment) + '</p></div>';
      else if (lc[0].status === "rejected") h += '<div class="p-card" style="border:2px solid #efa5a5"><h3>❌ ' + t("chRej") + ' <small>(' + dt + ')</small></h3>' + (lc[0].admin_note ? '<p>' + esc(lc[0].admin_note) + '</p>' : '') + '</div>';
      else if (Date.now() - new Date(lc[0].decided_at).getTime() < 7 * 864e5) h += '<div class="p-card" style="border:2px solid #9fd4b4"><h3>✅ ' + t("chOk") + ' <small>(' + dt + ')</small></h3>' + (lc[0].admin_note ? '<p>' + esc(lc[0].admin_note) + '</p>' : '') + '</div>';
    }
    $("#pwho").textContent = p.name + " · " + t("kinds")[p.kind];
    h += await tgBlock();
    h += await fixBlock();
    var inv = p.kind === "hotel" || p.kind === "driver" ? await unitsBlock() + (p.kind === "hotel" ? exBlock() : "") : p.kind === "guide" ? ratesBlock() : "";
    if (p.status === "pending") h += '<div class="p-card"><h2>⏳ ' + t("pending") + '</h2>' + (p.resubmit_count ? '<p class="p-sub">↻ ' + t("rejN") + ': ' + p.resubmit_count + '</p>' : '') + '<p class="p-sub">' + t("pendingTxt") + '</p></div>' + inv + await docsBlock() + profileForm() + pwBlock();
    else if (p.status === "rejected") h += '<div class="p-card" style="border:2px solid #efa5a5"><h2>❌ ' + t("rejected") + '</h2>' + (p.admin_note ? '<p><b>' + t("rejWhy") + ':</b> ' + esc(p.admin_note) + '</p>' : '') + '<p class="p-sub">' + t("rejHow") + '</p></div>' + inv + await docsBlock() + profileForm() + pwBlock();
    else {
      if (p.status === "paused") h += '<div class="p-card"><h2>' + t("paused") + '</h2>' + (p.admin_note ? '<p>' + esc(p.admin_note) + '</p>' : '') + '</div>';
      else h += '<div class="p-card"><h2>' + t("approved") + '</h2><p class="p-sub">' + t("approvedTxt") + '</p><div class="kv"><div><small>' + t("rating") + '</small><b>' + (p.reviews_count ? "★ " + Number(p.rating).toFixed(1) + " · " + p.reviews_count + " " + t("reviews") : "—") + '</b></div><div><small>' + t("trips") + '</small><b>' + (p.trips_count || 0) + '</b></div><div><small>' + t("stats") + '</small><b>' + (p.views_count || 0) + ' · ' + (p.likes_count || 0) + ' · ' + (p.shares_count || 0) + '</b></div></div></div>';
      h += await payBlock() + inv + calCard() + profileForm() + await histBlock() + await docsBlock() + pwBlock();
    }
    box.innerHTML = h + grpBlock() + '<div class="p-card">' + help() + '</div>';
    if ($("#f-prof")) bindProfile();
    if ($("#p-cal")) bindCal();
    if ($("#d-up")) bindDocs();
    if ($("#p-units")) bindUnits();
    bindEx(); bindPw(); bindRates();
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

  // «3 working days to fix»: countdown and the list of what is still missing (checked by the site every hour)
  var FIXL = {
    uz: { photo: "Asosiy rasm (klassik yoki milliy kiyimda)", license_no: "Guvohnoma / diplom raqami (to'g'ri raqam)", license_doc: "Guvohnoma / diplom rasmi", languages: "Tillar", cities: "Gidlik qiladigan shaharlar",
          birth_year: "Tug'ilgan yil", telegram: "Telegram", home: "Yashash joyi va to'liq manzil", pub: "Kartochka rasmlari", trip: "Sayyohlar bilan rasmlar", atleast: "kamida",
          t: "⚠ Kartochkangiz {n} kundan keyin saytdan o'chadi", t0: "⚠ Kartochkangiz BUGUN 23:59 da saytdan o'chadi", until: "Muddat", sub: "Iltimos, quyidagilarni to'ldiring. Sayt har soatda tekshiradi: 100% to'ldirilsa, kartochkangiz saytda qoladi.",
          off: "🚫 Kartochkangiz saytdan olib tashlandi — kamchiliklar o'z vaqtida tuzatilmadi", offSub: "Quyidagilarni to'ldiring — kartochka 100% bo'lishi bilan sayt uni o'zi qaytaradi (1 soat ichida).", ok: "✅ Hammasi to'ldirildi — kartochkangiz saytda qoladi. Rahmat!" },
    ru: { photo: "Главное фото (в классической или национальной одежде)", license_no: "Номер удостоверения / диплома (правильный номер)", license_doc: "Фото удостоверения / диплома", languages: "Языки", cities: "Города работы",
          birth_year: "Год рождения", telegram: "Telegram", home: "Место проживания и полный адрес", pub: "Фото для карточки", trip: "Фото с туристами", atleast: "минимум",
          t: "⚠ Ваша карточка будет удалена с сайта через {n} дн.", t0: "⚠ Ваша карточка будет удалена с сайта СЕГОДНЯ в 23:59", until: "Срок", sub: "Пожалуйста, заполните следующее. Сайт проверяет каждый час: при 100% заполнении карточка остаётся на сайте.",
          off: "🚫 Ваша карточка снята с сайта — недочёты не исправлены вовремя", offSub: "Заполните следующее — как только карточка будет на 100%, сайт вернёт её сам (в течение часа).", ok: "✅ Всё заполнено — карточка остаётся на сайте. Спасибо!" }
  };
  async function fixBlock() {
    var r = await sb.rpc("partner_my_fix"); var f = r.data; if (!f) return "";
    var X = FIXL[L] || FIXL.uz, miss = f.missing || [];
    var lab = function (c) { var m = /^(pub|trip):(\d+)\/(\d+)$/.exec(c); return m ? X[m[1]] + ": " + m[2] + " / " + X.atleast + " " + m[3] : (X[c] || c); };
    var list = miss.length ? '<ul class="pdocs">' + miss.map(function (c) { return '<li style="color:#b4541b">❌ ' + esc(lab(c)) + '</li>'; }).join("") + '</ul>' : '<p style="color:#23794a"><b>' + X.ok + '</b></p>';
    if (f.auto_paused) return '<div class="p-card" style="border:2px solid #efa5a5;background:#fff6f6"><h2>' + X.off + '</h2><p>' + X.offSub + '</p>' + list + '</div>';
    var dl = new Date(f.deadline), days = Math.ceil((dl - new Date()) / 864e5);
    var title = days <= 0 || dl.toDateString() === new Date().toDateString() ? X.t0 : X.t.replace("{n}", days);
    return '<div class="p-card" style="border:2px solid #e9b949;background:#fffaf0"><h2>' + (miss.length ? title : X.ok) + '</h2>' +
      (miss.length ? '<p><b>' + X.until + ':</b> ' + ("0" + dl.getDate()).slice(-2) + "." + ("0" + (dl.getMonth() + 1)).slice(-2) + "." + dl.getFullYear() + ' 23:59</p><p class="p-sub">' + X.sub + '</p>' : '') + (miss.length ? list : '') + '</div>';
  }

  // Telegram: one tap after registration links our bot, then warnings and orders reach the phone even without opening the site
  async function tgBlock() {
    var r = await sb.rpc("partner_tg_info"), x = r.data; if (!x || !x.bot) return "";
    var ru = L === "ru";
    if (x.linked) return '<div class="p-card" style="padding:12px 16px"><b style="color:#23794a">📲 ' + (ru ? "Telegram-уведомления подключены" : "Telegram xabarnomalar ulangan") + '</b> <small class="p-sub">@' + esc(x.bot) + '</small></div>';
    var url = "https://t.me/" + encodeURIComponent(x.bot) + "?start=" + encodeURIComponent(x.code);
    return '<div class="p-card" style="border:2px solid #2aabee;background:#f2faff"><h2 style="margin-top:0">📲 ' + (ru ? "Подключите Telegram — 1 нажатие" : "Telegram'ni ulang — 1 bosish") + '</h2>' +
      '<p>' + (ru ? "Сюда будут приходить заказы, важные предупреждения о вашей карточке и сроках — даже если вы не заходите на сайт." : "Buyurtmalar, kartochkangiz va muddatlar haqidagi muhim ogohlantirishlar telefoningizga keladi — saytga kirmasangiz ham.") + '</p>' +
      '<a class="btn" style="background:#2aabee;color:#fff" href="' + esc(url) + '" target="_blank" rel="noopener">✈ ' + (ru ? "Подключить Telegram" : "Telegram'ga ulanish") + '</a>' +
      '<p class="p-sub" style="margin-top:8px">' + (ru ? "Откроется бот @" + esc(x.bot) + " — нажмите «Start»." : "@" + esc(x.bot) + " boti ochiladi — «Start» ni bosing.") + '</p></div>';
  }
})();
