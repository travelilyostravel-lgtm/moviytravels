// Moviy Nomad — partner registration inside the Telegram bot (2026-11-28).
// The partner presses Start, picks a language and a partner type, then answers the questions one by one.
// The bot never moves on until the current answer is right (price in $, a real photo, a phone number …).
// At the end it shows everything, the partner presses «✅ Yuborish» and the bot creates the account,
// the partner card (status 'pending'), uploads the photos and adds the rooms / vehicles.
// Needs SUPABASE_SERVICE_KEY in Vercel (server only — never in the browser).
const SB_URL = "https://qlytfxwxauvlrbfnwzod.supabase.co";
const SITE = "https://moviy-travel.uz";

// ------------------------------------------------------------------ lists
const CITIES = [["Toshkent", "Ташкент"], ["Samarqand", "Самарканд"], ["Buxoro", "Бухара"], ["Xiva", "Хива"], ["Shahrisabz", "Шахрисабз"],
  ["Namangan", "Наманган"], ["Andijon", "Андижан"], ["Farg'ona", "Фергана"], ["Qo'qon", "Коканд"], ["Marg'ilon", "Маргилан"], ["Urganch", "Ургенч"],
  ["Nukus", "Нукус"], ["Termiz", "Термез"], ["Qarshi", "Карши"], ["Navoiy", "Навои"], ["Jizzax", "Джизак"], ["Guliston", "Гулистан"],
  ["Mo'ynoq", "Муйнак"], ["Chimyon / Chorvoq", "Чимган / Чарвак"]].map(function (c) { return [c[0], c[0], c[1]]; });
const LANGS = [["English", "🇬🇧 Ingliz", "🇬🇧 Английский"], ["Russian", "🇷🇺 Rus", "🇷🇺 Русский"], ["Uzbek", "🇺🇿 O'zbek", "🇺🇿 Узбекский"],
  ["German", "🇩🇪 Nemis", "🇩🇪 Немецкий"], ["French", "🇫🇷 Fransuz", "🇫🇷 Французский"], ["Italian", "🇮🇹 Italyan", "🇮🇹 Итальянский"],
  ["Spanish", "🇪🇸 Ispan", "🇪🇸 Испанский"], ["Turkish", "🇹🇷 Turk", "🇹🇷 Турецкий"], ["Arabic", "🇸🇦 Arab", "🇸🇦 Арабский"],
  ["Chinese", "🇨🇳 Xitoy", "🇨🇳 Китайский"], ["Japanese", "🇯🇵 Yapon", "🇯🇵 Японский"], ["Korean", "🇰🇷 Koreys", "🇰🇷 Корейский"]];
const YESNO = [["1", "✅ Ha", "✅ Да"], ["0", "❌ Yo'q", "❌ Нет"]];
const GCATS = [["havaskor", "Havaskor gid", "Гид-любитель"], ["ixtisoslashgan", "Ixtisoslashgan gid", "Специализированный гид"],
  ["professional", "Professional gid", "Профессиональный гид"], ["oltin_fond", "«Oltin fond» gidi", "Гид «Золотого фонда»"]];
const AMEN = [["wifi", "Wi-Fi", "Wi-Fi"], ["breakfast", "Nonushta", "Завтрак"], ["parking", "Avtoturargoh", "Парковка"], ["ac", "Konditsioner", "Кондиционер"],
  ["transfer", "Aeroport transferi", "Трансфер"], ["restaurant", "Restoran", "Ресторан"], ["pool", "Basseyn", "Бассейн"], ["laundry", "Kir yuvish", "Прачечная"],
  ["reception24", "24 soat qabulxona", "Ресепшн 24 ч"], ["family", "Oilaviy xonalar", "Семейные номера"], ["courtyard", "Milliy hovli", "Национальный двор"],
  ["elevator", "Lift", "Лифт"], ["terrace", "Terassa", "Терраса"], ["nosmoking", "Chekilmaydigan xonalar", "Для некурящих"]];
const TIMES_IN = ["12:00", "13:00", "14:00", "15:00"].map(function (t) { return [t, t, t]; });
const TIMES_OUT = ["10:00", "11:00", "12:00"].map(function (t) { return [t, t, t]; });
const STARS = [["", "Yulduzsiz / mehmon uyi", "Без звёзд / гостевой дом"], ["1", "1★", "1★"], ["2", "2★", "2★"], ["3", "3★", "3★"], ["4", "4★", "4★"], ["5", "5★", "5★"]];
const POLICY = [["p1", "Bepul bekor qilish — 1 kun oldin", "Бесплатная отмена — за 1 день"],
  ["p3", "Bepul bekor qilish — 3 kun oldin", "Бесплатная отмена — за 3 дня"],
  ["p7", "Bepul bekor qilish — 7 kun oldin", "Бесплатная отмена — за 7 дней"],
  ["nr", "Qaytarilmaydi", "Без возврата"]];
const POLICY_TXT = { p1: "Kelishdan 1 kun oldingacha bepul bekor qilinadi / Free cancellation up to 1 day before arrival", p3: "Kelishdan 3 kun oldingacha bepul bekor qilinadi / Free cancellation up to 3 days before arrival",
  p7: "Kelishdan 7 kun oldingacha bepul bekor qilinadi / Free cancellation up to 7 days before arrival", nr: "Bekor qilinsa pul qaytarilmaydi / Non-refundable" };
const RCLASS = [["standard", "Standart", "Стандарт"], ["deluxe", "Deluxe", "Делюкс"], ["suite", "Lyuks (suite)", "Люкс (suite)"],
  ["family", "Oilaviy", "Семейный"], ["single", "Bir kishilik", "Одноместный"], ["dorm", "Hostel (joy)", "Хостел (место)"]];
const BEDS = [["1 double", "1 ta ikki kishilik", "1 двуспальная"], ["2 single", "2 ta bir kishilik", "2 односпальные"], ["1 single", "1 ta bir kishilik", "1 односпальная"],
  ["3 single", "3 ta bir kishilik", "3 односпальные"], ["double + single", "Ikki kishilik + bir kishilik", "Двуспальная + односпальная"], ["bunk", "Ikki qavatli", "Двухъярусная"]];
const VCLASS = [["economy", "Ekonom (Cobalt, Nexia)", "Эконом (Cobalt, Nexia)"], ["comfort", "Komfort (Malibu, Camry)", "Комфорт (Malibu, Camry)"],
  ["business", "Biznes (Mercedes E, BMW 5)", "Бизнес (Mercedes E, BMW 5)"], ["premium", "Premium (Mercedes S, V-Class)", "Премиум (Mercedes S, V-Class)"],
  ["minivan", "Miniven (4–7 kishi)", "Минивэн (4–7 чел.)"], ["minibus", "Mikroavtobus (8–19 kishi)", "Микроавтобус (8–19 чел.)"], ["bus", "Avtobus (20+ kishi)", "Автобус (20+ чел.)"]];
const CTYPE = [["person", "🙋 Shaxsiy haydovchi", "🙋 Частный водитель"], ["company", "🏢 Transport kompaniyasi", "🏢 Транспортная компания"]];
const KINDS = [["guide", "🧑‍🏫 Gid", "🧑‍🏫 Гид"], ["driver", "🚐 Transport / haydovchi", "🚐 Транспорт / водитель"], ["hotel", "🏨 Mehmonxona / mehmon uyi", "🏨 Отель / гостевой дом"], ["other", "✨ Boshqa xizmat", "✨ Другая услуга"]];
const Y = new Date().getFullYear();

// ------------------------------------------------------------------ questions
// t: text | int | usd | choice | multi | phone | loc | email | photos | units ;  opt: may be skipped ; if: shown only when true
const Q = {
  name_p: { k: "name", t: "text", min: 3, max: 120, uz: "Ism va familiyangizni yozing (pasportdagidek).", ru: "Напишите имя и фамилию (как в паспорте)." },
  name_h: { k: "name", t: "text", min: 2, max: 120, uz: "Mehmonxona nomini yozing.", ru: "Напишите название отеля." },
  name_c: { k: "name", t: "text", min: 2, max: 120, uz: "Ism-familiyangiz yoki kompaniya nomi.", ru: "Ваше имя или название компании." },
  spec: { k: "spec", t: "text", min: 3, max: 60, uz: "Qanday xizmat ko'rsatasiz? (masalan: fotograf, oshpaz, master-klass)", ru: "Какую услугу оказываете? (например: фотограф, повар, мастер-класс)" },
  ctype: { k: "company_type", t: "choice", opts: CTYPE, uz: "Kim sifatida ro'yxatdan o'tasiz?", ru: "Кто вы?" },
  phone: { k: "phone", t: "phone", uz: "Telefon raqamingizni yuboring: pastdagi «📱 Raqamni yuborish» tugmasini bosing yoki +998… ko'rinishida yozing.", ru: "Отправьте номер телефона: нажмите «📱 Отправить номер» внизу или напишите в виде +998…" },
  whatsapp: { k: "whatsapp", t: "phone", opt: 1, uz: "WhatsApp raqamingiz (agar boshqa bo'lsa). Bir xil bo'lsa «O'tkazib yuborish» ni bosing.", ru: "Номер WhatsApp (если другой). Если тот же — нажмите «Пропустить»." },
  city: { k: "city", t: "choice", opts: CITIES, cols: 2, uz: "Qaysi shahardasiz?", ru: "В каком вы городе?" },
  city_h: { k: "city", t: "choice", opts: CITIES, cols: 2, uz: "Mehmonxona qaysi shaharda?", ru: "В каком городе отель?" },
  cities: { k: "cities", t: "multi", opts: CITIES, cols: 2, min: 1, uz: "Qaysi shaharlarda ishlaysiz? Hammasini belgilang, keyin «✅ Tayyor» ni bosing.", ru: "В каких городах работаете? Отметьте все и нажмите «✅ Готово»." },
  birth: { k: "birth_year", t: "int", min: 1940, max: Y - 18, uz: "Tug'ilgan yilingiz (masalan: 1990).", ru: "Год рождения (например: 1990)." },
  area: { k: "home_area", t: "text", min: 2, max: 120, uz: "Qaysi tuman yoki mahallada yashaysiz?", ru: "В каком районе / махалле живёте?" },
  area_h: { k: "home_area", t: "text", min: 2, max: 120, uz: "Mehmonxona qaysi tuman / mahallada?", ru: "В каком районе / махалле отель?" },
  addr: { k: "home_address", t: "text", min: 5, max: 250, uz: "To'liq manzil (ko'cha, uy).", ru: "Полный адрес (улица, дом)." },
  loc: { k: "map", t: "loc", uz: "📍 Mehmonxona joylashuvini yuboring: 📎 → «Joylashuv» (Location) yoki Google / Yandex xarita havolasini tashlang.", ru: "📍 Отправьте местоположение отеля: 📎 → «Геопозиция» или ссылку Google / Яндекс карты." },
  langs: { k: "languages", t: "multi", opts: LANGS, cols: 2, min: 1, uz: "Qaysi tillarda gaplashasiz? Belgilang, keyin «✅ Tayyor».", ru: "На каких языках говорите? Отметьте и нажмите «✅ Готово»." },
  langs_h: { k: "languages", t: "multi", opts: LANGS, cols: 2, min: 1, uz: "Xodimlaringiz qaysi tillarda gaplashadi?", ru: "На каких языках говорит персонал?" },
  lic_g: { k: "license_no", t: "text", min: 3, max: 80, uz: "Gid guvohnomasi yoki gidlik diplomi raqami.", ru: "Номер удостоверения гида или диплома гида." },
  lic_d: { k: "license_no", t: "text", min: 3, max: 80, uz: "Haydovchilik guvohnomasi raqami.", ru: "Номер водительского удостоверения." },
  exp_g: { k: "experience_years", t: "int", min: 0, max: 60, uz: "Sayyohlar bilan necha yil ishlagansiz? (raqam)", ru: "Сколько лет работаете с туристами? (число)" },
  exp_d: { k: "experience_years", t: "int", min: 0, max: 60, uz: "Haydash stajingiz necha yil?", ru: "Стаж вождения (лет)?" },
  inn: { k: "inn", t: "text", min: 9, max: 30, digits: 1, uz: "INN (STIR) raqami.", ru: "ИНН." },
  inn_o: { k: "inn", t: "text", min: 9, max: 30, digits: 1, opt: 1, uz: "INN (STIR) raqami yoki o'zini o'zi band qilgan shaxs guvohnomasi raqami. Bo'lmasa — «O'tkazib yuborish».", ru: "ИНН или номер самозанятого. Если нет — «Пропустить»." },
  reg: { k: "license_no", t: "text", min: 2, max: 80, opt: 1, uz: "Turizm qo'mitasi reyestridagi raqam (joylashtirish vositasi). Bo'lmasa — «O'tkazib yuborish».", ru: "Номер в реестре Комитета по туризму. Если нет — «Пропустить»." },
  stars: { k: "hotel_stars", t: "choice", opts: STARS, cols: 3, uz: "Yulduz soni:", ru: "Звёздность:" },
  cin: { k: "check_in", t: "choice", opts: TIMES_IN, cols: 4, uz: "Kirish vaqti (check-in):", ru: "Время заезда (check-in):" },
  cout: { k: "check_out", t: "choice", opts: TIMES_OUT, cols: 3, uz: "Chiqish vaqti (check-out):", ru: "Время выезда (check-out):" },
  amen: { k: "amenities", t: "multi", opts: AMEN, cols: 2, min: 1, uz: "Qanday qulayliklar bor? Belgilang, keyin «✅ Tayyor».", ru: "Какие удобства есть? Отметьте и нажмите «✅ Готово»." },
  policy: { k: "policies", t: "choice", opts: POLICY, uz: "Bron bekor qilinsa qanday qoida?", ru: "Правило отмены бронирования:" },
  gcat: { k: "guide_cat", t: "choice", opts: GCATS, uz: "Gid toifangiz:", ru: "Ваша категория:" },
  price_g: { k: "price_day", t: "usd", min: 5, max: 1500, uz: "To'liq kunlik (8 soat) netto narxingiz — AQSH DOLLARIDA. Faqat raqam, masalan: 60", ru: "Нетто-цена за полный день (8 ч) — В ДОЛЛАРАХ США. Только число, например: 60" },
  half_g: { k: "r_half_day", t: "usd", min: 5, max: 1000, opt: 1, uz: "Yarim kun (4 soat) narxi, $ (ixtiyoriy).", ru: "Цена за полдня (4 ч), $ (необязательно)." },
  price_o: { k: "price_day", t: "usd", min: 1, max: 5000, uz: "Xizmatingizning netto narxi — AQSH DOLLARIDA (1 kishi yoki 1 marta uchun). Masalan: 30", ru: "Нетто-цена услуги — В ДОЛЛАРАХ США (за человека или за раз). Например: 30" },
  bio_g: { k: "bio", t: "text", min: 60, max: 1500, uz: "O'zingiz haqingizda yozing (kamida 2–3 gap): tajriba, qaysi turlarni olib borasiz, nimasi bilan farq qilasiz.", ru: "Расскажите о себе (2–3 предложения минимум): опыт, какие туры ведёте, чем отличаетесь." },
  bio_d: { k: "bio", t: "text", min: 40, max: 1500, uz: "O'zingiz va xizmatingiz haqida qisqacha (kamida 1–2 gap).", ru: "Коротко о себе и услуге (1–2 предложения минимум)." },
  bio_h: { k: "bio", t: "text", min: 60, max: 1500, uz: "Mehmonxona haqida yozing: joylashuvi, xonalardagi qulayliklar, nonushta, nimasi bilan yaxshi.", ru: "Опишите отель: расположение, удобства в номерах, завтрак, чем хорош." },
  email: { k: "email", t: "email", opt: 1, uz: "E-mail manzilingiz (ixtiyoriy). Bo'lmasa — «O'tkazib yuborish».", ru: "E-mail (необязательно). Если нет — «Пропустить»." },
  ph_main_p: { k: "main", t: "photos", slot: "main", min: 1, max: 1, uz: "📷 Asosiy rasm: klassik yoki milliy kiyimda, yuz aniq ko'rinadigan portret. 1 ta rasm yuboring.", ru: "📷 Главное фото: портрет в классической или национальной одежде, лицо хорошо видно. Отправьте 1 фото." },
  ph_main_h: { k: "main", t: "photos", slot: "main", min: 1, max: 1, uz: "📷 Asosiy rasm: bino fasadi yoki hovli / qabulxona. 1 ta rasm.", ru: "📷 Главное фото: фасад здания или двор / ресепшн. 1 фото." },
  ph_lic_g: { k: "lic", t: "photos", slot: "lic", min: 1, max: 2, priv: 1, uz: "🪪 Gid guvohnomasi yoki diplomning aniq rasmi (raqami o'qilsin). Buni faqat biz ko'ramiz.", ru: "🪪 Чёткое фото удостоверения гида или диплома (номер читается). Видим только мы." },
  ph_lic_d: { k: "lic", t: "photos", slot: "lic", min: 1, max: 2, priv: 1, uz: "🪪 Haydovchilik guvohnomasining aniq rasmi. Buni faqat biz ko'ramiz.", ru: "🪪 Чёткое фото водительского удостоверения. Видим только мы." },
  ph_solo: { k: "solo", t: "photos", slot: "solo", min: 3, max: 10, uz: "📷 O'zingizning yakka rasmlaringiz — kamida 3 ta. Hammasini birdaniga yuborsangiz ham bo'ladi.", ru: "📷 Ваши личные фото — минимум 3. Можно отправить все сразу." },
  ph_trip: { k: "trip", t: "photos", slot: "trip", min: 10, max: 30, uz: "📷 Sayyohlar bilan tushgan rasmlar — kamida 10 ta (faqat ularning roziligi bilan). Birdaniga albom qilib yuborish mumkin.", ru: "📷 Фото с туристами — минимум 10 (только с их согласия). Можно альбомом." },
  ph_car: { k: "car", t: "photos", slot: "car", min: 6, max: 20, uz: "📷 Mashina rasmlari — kamida 6 ta: tashqi ko'rinish, salon, yuk joyi.", ru: "📷 Фото машины — минимум 6: снаружи, салон, багажник." },
  ph_tech: { k: "tech", t: "photos", slot: "tech", min: 1, max: 3, priv: 1, uz: "📄 Texpasport rasmi (raqami o'qilsin). Buni faqat biz ko'ramiz.", ru: "📄 Фото техпаспорта (номер читается). Видим только мы." },
  ph_rooms: { k: "rooms", t: "photos", slot: "rooms", min: 5, max: 25, uz: "📷 Umumiy rasmlar — kamida 5 ta: qabulxona, hovli, nonushta zali, hammom, ko'cha.", ru: "📷 Общие фото — минимум 5: ресепшн, двор, зал для завтрака, санузел, улица." },
  rooms: { k: "units", t: "units", room: 1 },
  cars: { k: "units", t: "units", room: 0 },
};
const FLOW = {
  guide: ["name_p", "phone", "whatsapp", "city", "cities", "birth", "area", "addr", "langs", "gcat", "lic_g", "exp_g", "price_g", "half_g", "bio_g", "ph_main_p", "ph_lic_g", "ph_solo", "ph_trip", "email"],
  driver: ["ctype", "name_c", "phone", "whatsapp", "city", "cities", ["birth", function (d) { return d.company_type !== "company"; }], "area", "addr", "langs", "lic_d", "exp_d",
    ["inn", function (d) { return d.company_type === "company"; }], "bio_d", "cars", "ph_main_p", "ph_lic_d", "ph_tech", "ph_car", "ph_trip", "email"],
  hotel: ["name_h", "phone", "whatsapp", "city_h", "area_h", "addr", "loc", "inn", "reg", "stars", "cin", "cout", "amen", "langs_h", "bio_h", "policy", "rooms", "ph_main_h", "ph_rooms", "email"],
  other: ["name_c", "spec", "phone", "whatsapp", "city", "cities", "birth", "area", "addr", "langs", "inn_o", "price_o", "bio_d", "ph_main_p", "ph_solo", "ph_trip", "email"],
};
// questions for one room / one vehicle
const SUB = {
  room: [
    { k: "class", t: "choice", opts: RCLASS, cols: 2, uz: "🛏 Xona turi:", ru: "🛏 Тип номера:" },
    { k: "name", t: "text", min: 2, max: 120, opt: 1, uz: "Xona nomi (masalan: Deluxe ikki kishilik, hovliga qaragan). O'tkazib yuborsangiz, xona turi yoziladi.", ru: "Название номера (например: Делюкс с видом на двор). Если пропустить — будет тип номера." },
    { k: "capacity", t: "choice", opts: [1, 2, 3, 4, 5, 6].map(function (n) { return [String(n), n + " kishi", n + " чел."]; }), cols: 3, uz: "Necha kishilik?", ru: "Сколько гостей?" },
    { k: "beds", t: "choice", opts: BEDS, cols: 2, uz: "Karavotlar:", ru: "Кровати:" },
    { k: "qty", t: "int", min: 1, max: 999, uz: "Mehmonxonada shunday xonadan nechta bor? (raqam)", ru: "Сколько таких номеров в отеле? (число)" },
    { k: "breakfast", t: "choice", opts: YESNO, cols: 2, uz: "Narxga nonushta kiradimi?", ru: "Завтрак включён в цену?" },
    { k: "price_netto", t: "usd", min: 5, max: 1500, uz: "💵 1 kecha uchun NETTO narx — AQSH DOLLARIDA. Faqat raqam, masalan: 45\n(Sizga to'lanadigan narx. Saytda mijozga xizmat haqi bilan ko'rsatiladi.)", ru: "💵 НЕТТО-цена за ночь — В ДОЛЛАРАХ США. Только число, например: 45\n(Цена, которую получаете вы. На сайте клиент видит её с сервисным сбором.)" },
    { k: "_ph", t: "photos", slot: "unit", min: 2, max: 8, uz: "📷 Shu xonaning rasmlari — kamida 2 ta (yotoq, hammom).", ru: "📷 Фото этого номера — минимум 2 (кровать, санузел)." },
  ],
  vehicle: [
    { k: "class", t: "choice", opts: VCLASS, uz: "🚗 Mashina klassi:", ru: "🚗 Класс машины:" },
    { k: "name", t: "text", min: 2, max: 120, uz: "Marka va model (masalan: Chevrolet Malibu 2).", ru: "Марка и модель (например: Chevrolet Malibu 2)." },
    { k: "year", t: "int", min: 1995, max: Y + 1, uz: "Ishlab chiqarilgan yili:", ru: "Год выпуска:" },
    { k: "capacity", t: "int", min: 1, max: 60, uz: "Nechta yo'lovchi o'rni bor? (haydovchisiz)", ru: "Сколько пассажирских мест? (без водителя)" },
    { k: "luggage", t: "int", min: 0, max: 60, uz: "Nechta chamadon sig'adi?", ru: "Сколько чемоданов помещается?" },
    { k: "plate", t: "text", min: 5, max: 20, uz: "Davlat raqami (faqat biz ko'ramiz):", ru: "Госномер (видим только мы):" },
    { k: "ac", t: "choice", opts: YESNO, cols: 2, uz: "Konditsioner bormi?", ru: "Есть кондиционер?" },
    { k: "price_netto", t: "usd", min: 5, max: 3000, uz: "💵 1 kunlik ijara NETTO narxi (haydovchi bilan) — AQSH DOLLARIDA. Masalan: 70", ru: "💵 НЕТТО-цена за день (с водителем) — В ДОЛЛАРАХ США. Например: 70" },
    { k: "price_transfer", t: "usd", min: 3, max: 1000, opt: 1, uz: "💵 Aeroport transferi narxi, $ (ixtiyoriy).", ru: "💵 Цена трансфера из аэропорта, $ (необязательно)." },
    { k: "_ph", t: "photos", slot: "unit", min: 2, max: 8, uz: "📷 Shu mashinaning rasmlari — kamida 2 ta (tashqi, salon).", ru: "📷 Фото этой машины — минимум 2 (снаружи, салон)." },
  ],
};
const T = {
  uz: {
    lang: "Tilni tanlang / Выберите язык:", kind: "👋 Moviy Nomad hamkorlar botiga xush kelibsiz!\n\nKim sifatida hamkor bo'lmoqchisiz?",
    back: "⬅️ Orqaga", skip: "➡️ O'tkazib yuborish", done: "✅ Tayyor", cancel: "✖️ Bekor qilish", send_phone: "📱 Raqamni yuborish", send_loc: "📍 Joylashuvni yuborish",
    bad_text: "Iltimos, matn yozing ({min}–{max} belgi).", bad_short: "Juda qisqa. Kamida {min} belgi yozing.", bad_int: "Faqat raqam yozing ({min}–{max}).",
    bad_usd: "❗ Narxni AQSH DOLLARIDA, faqat raqam bilan yozing ({min}–{max}). So'mdagi narx qabul qilinmaydi — dollarga aylantirib yozing. Masalan: 45",
    bad_phone: "Raqamni +998 90 123 45 67 ko'rinishida yozing yoki «📱 Raqamni yuborish» tugmasini bosing.", bad_email: "E-mail noto'g'ri. Masalan: ism@gmail.com",
    bad_loc: "📍 Joylashuvni yuboring yoki xarita havolasini tashlang.", bad_choice: "Pastdagi tugmalardan birini bosing.",
    bad_multi: "Kamida {min} tasini belgilang, keyin «✅ Tayyor».", bad_photo: "📷 Rasm yuboring (fayl emas, oddiy rasm). Hozircha: {n} / {min}.",
    ph_got: "✅ Qabul qilindi: {n} ta. ", ph_more: "Yana {k} ta kerak.", ph_enough: "Yetarli. Yana yuborishingiz mumkin yoki «✅ Tayyor» ni bosing.", ph_max: "Maksimal soni — {max}. Keyingi savol:",
    unit_more_room: "Yana xona turi qo'shasizmi?", unit_more_car: "Yana mashina qo'shasizmi?", unit_yes: "➕ Ha, yana qo'shaman", unit_no: "✅ Yo'q, davom etamiz",
    unit_added: "✅ Qo'shildi: {name} — ${price}", unit_head_room: "🛏 {n}-xona turi", unit_head_car: "🚗 {n}-mashina",
    summary: "📋 Arizangiz tayyor. Tekshirib chiqing:", send: "✅ Yuborish", restart: "🔄 Boshidan to'ldirish", sending: "⏳ Yuborilmoqda… Rasmlar yuklanyapti, 1 daqiqagacha kuting.",
    sent: "🎉 Arizangiz qabul qilindi!\n\nMoviy Nomad jamoasi 1–3 ish kunida tekshiradi. Natija shu botga keladi. Tasdiqlangach, kartochkangiz saytda chiqadi.\n\nKabinetingizga istalgan vaqt shu yerdan kirasiz: /kabinet",
    send_err: "⚠ Yuborishda xato bo'ldi. Bir daqiqadan keyin «✅ Yuborish» ni qayta bosing. Takrorlansa, bizga yozing: @moviy_safina",
    resume: "Siz ro'yxatdan o'tishni boshlagan edingiz. Davom etamizmi?", cont: "▶️ Davom etish", already: "Siz allaqachon Moviy Nomad hamkorisiz: {name}.\n\nKabinetga kirish uchun tugmani bosing:",
    login: "🔑 Kabinetga kirish", login_link: "🔑 Kabinetingizga kirish havolasi (1 soat amal qiladi, faqat siz uchun — hech kimga bermang):", login_err: "Havolani yaratib bo'lmadi. Keyinroq urinib ko'ring.",
    cancelled: "Bekor qilindi. Qayta boshlash uchun /start ni bosing.", step: "Savol {i} / {n}",
    yes: "Ha", no: "Yo'q", none: "—",
  },
  ru: {
    lang: "Tilni tanlang / Выберите язык:", kind: "👋 Добро пожаловать в бот партнёров Moviy Nomad!\n\nКем хотите стать партнёром?",
    back: "⬅️ Назад", skip: "➡️ Пропустить", done: "✅ Готово", cancel: "✖️ Отменить", send_phone: "📱 Отправить номер", send_loc: "📍 Отправить геопозицию",
    bad_text: "Пожалуйста, напишите текст ({min}–{max} символов).", bad_short: "Слишком коротко. Минимум {min} символов.", bad_int: "Только число ({min}–{max}).",
    bad_usd: "❗ Укажите цену В ДОЛЛАРАХ США, только число ({min}–{max}). Цена в сумах не принимается — переведите в доллары. Например: 45",
    bad_phone: "Напишите номер в виде +998 90 123 45 67 или нажмите «📱 Отправить номер».", bad_email: "Неверный e-mail. Например: name@gmail.com",
    bad_loc: "📍 Отправьте геопозицию или ссылку на карту.", bad_choice: "Нажмите одну из кнопок ниже.",
    bad_multi: "Отметьте минимум {min}, затем «✅ Готово».", bad_photo: "📷 Отправьте фото (как фото, не файлом). Сейчас: {n} / {min}.",
    ph_got: "✅ Принято: {n}. ", ph_more: "Нужно ещё {k}.", ph_enough: "Достаточно. Можно отправить ещё или нажать «✅ Готово».", ph_max: "Максимум — {max}. Следующий вопрос:",
    unit_more_room: "Добавить ещё тип номера?", unit_more_car: "Добавить ещё машину?", unit_yes: "➕ Да, добавить", unit_no: "✅ Нет, дальше",
    unit_added: "✅ Добавлено: {name} — ${price}", unit_head_room: "🛏 Тип номера №{n}", unit_head_car: "🚗 Машина №{n}",
    summary: "📋 Заявка готова. Проверьте:", send: "✅ Отправить", restart: "🔄 Заполнить заново", sending: "⏳ Отправляем… Загружаем фото, подождите до 1 минуты.",
    sent: "🎉 Заявка принята!\n\nКоманда Moviy Nomad проверит её за 1–3 рабочих дня. Результат придёт в этот бот. После одобрения карточка появится на сайте.\n\nВойти в кабинет можно здесь в любое время: /kabinet",
    send_err: "⚠ Ошибка при отправке. Через минуту нажмите «✅ Отправить» ещё раз. Если повторится — напишите нам: @moviy_safina",
    resume: "Вы начали регистрацию. Продолжим?", cont: "▶️ Продолжить", already: "Вы уже партнёр Moviy Nomad: {name}.\n\nЧтобы войти в кабинет, нажмите кнопку:",
    login: "🔑 Войти в кабинет", login_link: "🔑 Ссылка для входа в кабинет (действует 1 час, только для вас — никому не передавайте):", login_err: "Не удалось создать ссылку. Попробуйте позже.",
    cancelled: "Отменено. Чтобы начать заново, нажмите /start", step: "Вопрос {i} / {n}",
    yes: "Да", no: "Нет", none: "—",
  },
};
function tf(s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ""; }); }
// other languages: api/_reg_i18n.js (generated from build/i18n/portal/bot_<lang>.tsv), keyed by the Uzbek text
var I18N = {}; try { I18N = require("./_reg_i18n.js"); } catch (e) { I18N = {}; }
(function () { var src = I18N._src || []; Object.keys(I18N).forEach(function (l) { if (l[0] === "_" || !Array.isArray(I18N[l])) return; var m = {}; I18N[l].forEach(function (t, i) { if (t && src[i]) m[src[i]] = t; }); I18N[l] = m; }); delete I18N._src; })();
var BOT_LANGS = (I18N._names || [["uz", "🇺🇿 O'zbekcha"], ["ru", "🇷🇺 Русский"]]);
function okLang(x) { x = String(x || "").toLowerCase().slice(0, 2); return x === "uz" || x === "ru" || (x[0] !== "_" && I18N[x]) ? x : null; }
function X(l, uz, ru) { if (l === "ru") return ru; if (l === "uz" || uz == null) return uz; var m = /^(\d+)( kishi)$/.exec(uz); if (m) return m[1] + X(l, m[2]); var d = I18N[l] || {}, e = I18N.en || {}; return d[uz] || e[uz] || uz; }
Object.keys(I18N).forEach(function (l) { if (l === "_names") return; T[l] = {}; Object.keys(T.uz).forEach(function (k) { T[l][k] = X(l, T.uz[k], T.ru[k]); }); });
function L(st) { return (st && okLang(st.lang)) || "uz"; }
function lab(opt, l) { return X(l, opt[1], opt[2]); }

// ------------------------------------------------------------------ Supabase (server key)
function SK() { return process.env.SUPABASE_SERVICE_KEY || ""; }
async function sb(path, opt) {
  opt = opt || {};
  var h = Object.assign({ apikey: SK(), "Content-Type": "application/json" }, opt.headers || {});
  if (!/^sb_/.test(SK())) h.Authorization = "Bearer " + SK();      // legacy service_role JWT also works
  var r = await fetch(SB_URL + path, { method: opt.method || "GET", headers: h, body: opt.body == null ? undefined : (typeof opt.body === "string" || opt.body instanceof Uint8Array || Buffer.isBuffer(opt.body) ? opt.body : JSON.stringify(opt.body)) });
  var t = await r.text(), j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
  if (!r.ok) throw new Error(path.split("?")[0] + " " + r.status + " " + String(t).slice(0, 200));
  return j;
}
async function getState(chat) { var r = await sb("/rest/v1/tg_reg?chat=eq." + chat + "&select=*"); return r && r[0] || null; }
async function putState(st) {
  st.updated_at = new Date().toISOString();
  await sb("/rest/v1/tg_reg?on_conflict=chat", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: st });
}
async function fileCount(chat, slot, ui) {
  var r = await sb("/rest/v1/tg_reg_files?select=id&chat=eq." + chat + "&slot=eq." + slot + (ui == null ? "&unit_idx=is.null" : "&unit_idx=eq." + ui), { headers: { Prefer: "count=exact" } });
  return (r || []).length;
}
async function partnerByChat(chat) { var r = await sb("/rest/v1/partners?select=id,name,user_id,status&tg_chat_id=eq." + chat); return r && r[0] || null; }

// ------------------------------------------------------------------ flow helpers
function flow(st) {
  return (FLOW[st.kind] || []).map(function (x) { return Array.isArray(x) ? { q: Q[x[0]], when: x[1], id: x[0] } : { q: Q[x], id: x }; })
    .filter(function (x) { return !x.when || x.when(st.data || {}); });
}
function cur(st) { var f = flow(st); return f[st.step] ? f[st.step].q : null; }
function subList(st) { return SUB[cur(st) && cur(st).room ? "room" : "vehicle"]; }

function kb(rows) { return { inline_keyboard: rows }; }
function chunk(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
function navRow(st, q) {
  var l = L(st), r = [{ text: T[l].back, callback_data: "back" }];
  if (q.opt) r.push({ text: T[l].skip, callback_data: "skip" });
  return r;
}

async function ask(api, chat, st, note) {
  var l = L(st), q = cur(st), inUnit = q && q.t === "units" && st.cur;
  if (inUnit) q = subList(st)[st.sub];
  if (!q) return showSummary(api, chat, st);
  var f = flow(st), head = T[l].step.replace("{i}", st.step + 1).replace("{n}", f.length);
  if (inUnit) head += " · " + tf(T[l][cur(st).room ? "unit_head_room" : "unit_head_car"], { n: (st.units || []).length + 1 });
  var text = (note ? note + "\n\n" : "") + "▫️ " + head + "\n\n" + X(l, q.uz, q.ru), markup;
  if (q.t === "choice") markup = kb(chunk(q.opts.map(function (o) { return { text: lab(o, l), callback_data: "c:" + o[0] }; }), q.cols || 1).concat([navRow(st, q)]));
  else if (q.t === "multi") {
    var sel = (inUnit ? st.cur : st.data)[q.k] || [];
    markup = kb(chunk(q.opts.map(function (o) { return { text: (sel.indexOf(o[0]) >= 0 ? "✅ " : "▫️ ") + lab(o, l), callback_data: "m:" + o[0] }; }), q.cols || 1)
      .concat([[{ text: T[l].done + (sel.length ? " (" + sel.length + ")" : ""), callback_data: "mdone" }], navRow(st, q)]));
  } else if (q.t === "phone") {
    await api("sendMessage", { chat_id: chat, text: text, reply_markup: { keyboard: [[{ text: T[l].send_phone, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } });
    return api("sendMessage", { chat_id: chat, text: "⬇️", reply_markup: kb([navRow(st, q)]) });
  } else if (q.t === "loc") {
    await api("sendMessage", { chat_id: chat, text: text, reply_markup: { keyboard: [[{ text: T[l].send_loc, request_location: true }]], resize_keyboard: true, one_time_keyboard: true } });
    return api("sendMessage", { chat_id: chat, text: "⬇️", reply_markup: kb([navRow(st, q)]) });
  } else if (q.t === "photos") {
    var n = await fileCount(chat, q.slot, q.slot === "unit" ? (st.units || []).length : null);
    if (n) text += "\n\n" + tf(T[l].ph_got, { n: n }) + (n >= q.min ? T[l].ph_enough : tf(T[l].ph_more, { k: q.min - n }));
    var row = navRow(st, q); if (n >= q.min) row.push({ text: T[l].done, callback_data: "pdone" });
    markup = kb([row]);
  } else if (q.t === "units") {
    st.cur = {}; st.sub = 0; await putState(st); return ask(api, chat, st);
  } else markup = kb([navRow(st, q)]);
  return api("sendMessage", { chat_id: chat, text: text, reply_markup: markup, disable_web_page_preview: true });
}

function setVal(st, q, v) { if (st.cur && cur(st) && cur(st).t === "units") st.cur[q.k] = v; else st.data[q.k] = v; }

async function next(api, chat, st, note) {
  var q = cur(st);
  if (q && q.t === "units" && st.cur) {
    var list = subList(st);
    st.sub++;
    if (st.sub >= list.length) {                       // this room / vehicle is complete
      var u = st.cur, l = L(st); st.units = (st.units || []).concat([u]); st.cur = null; st.sub = 0;
      await putState(st);
      var nm = u.name || lab((q.room ? RCLASS : VCLASS).filter(function (o) { return o[0] === u.class; })[0] || ["", "", ""], l);
      return api("sendMessage", { chat_id: chat, text: tf(T[l].unit_added, { name: nm, price: u.price_netto }) + "\n\n" + T[l][q.room ? "unit_more_room" : "unit_more_car"],
        reply_markup: kb([[{ text: T[l].unit_yes, callback_data: "u:more" }], [{ text: T[l].unit_no, callback_data: "u:end" }]]) });
    }
    await putState(st); return ask(api, chat, st, note);
  }
  st.step++;
  var nq = cur(st);
  if (nq && nq.t === "units") { st.cur = {}; st.sub = 0; }
  await putState(st); return ask(api, chat, st, note);
}

async function back(api, chat, st) {
  var q = cur(st);
  if (q && q.t === "units" && st.cur && st.sub > 0) { st.sub--; await putState(st); return ask(api, chat, st); }
  if (q && q.t === "units" && !st.cur && (st.units || []).length) {        // on the «add another?» question → re-open the last one at its photos
    st.cur = st.units[st.units.length - 1]; st.units = st.units.slice(0, -1); st.sub = subList(st).length - 1; await putState(st); return ask(api, chat, st);
  }
  if (q && q.t === "units" && st.cur && (st.units || []).length) {          // back from a new room → re-open the last one at its price
    st.cur = st.units[st.units.length - 1]; st.units = st.units.slice(0, -1); st.sub = subList(st).length - 2; await putState(st); return ask(api, chat, st);
  }
  if (st.step > 0) { st.step--; st.cur = null; st.sub = 0; var pq = cur(st); if (pq && pq.t === "units") { st.cur = (st.units || []).pop() || {}; st.sub = st.cur.class ? subList(st).length - 1 : 0; } await putState(st); return ask(api, chat, st); }
  st.kind = null; st.step = 0; await putState(st); return askKind(api, chat, st);
}

function askLang(api, chat) { return api("sendMessage", { chat_id: chat, text: "Tilni tanlang / Выберите язык / Choose a language:", reply_markup: kb(chunk(BOT_LANGS.map(function (x) { return { text: x[1], callback_data: "l:" + x[0] }; }), 3)) }); }
function askKind(api, chat, st) { var l = L(st); return api("sendMessage", { chat_id: chat, text: T[l].kind, reply_markup: kb(KINDS.map(function (k) { return [{ text: lab(k, l), callback_data: "k:" + k[0] }]; })) }); }

// ------------------------------------------------------------------ answers
function vText(q, s, l) {
  s = String(s || "").trim();
  if (!s) return { err: tf(T[l].bad_text, q) };
  if (s.length < q.min) return { err: tf(T[l].bad_short, q) };
  if (q.digits && (s.replace(/\D/g, "").length < 9)) return { err: tf(T[l].bad_int, { min: "9", max: "14 " + X(l, "raqam", "цифр") }) };
  return { v: s.slice(0, q.max) };
}
function vNum(q, s, l, usd) {
  var raw = String(s || "").replace(/\s+/g, "").replace(/[$,]/g, function (c) { return c === "," ? "." : ""; }).replace(/(usd|dollar|долл\w*)/ig, "");
  var x = parseFloat(raw);
  if (!/^\d+(\.\d+)?$/.test(raw) || isNaN(x) || x < q.min || x > q.max) return { err: tf(T[l][usd ? "bad_usd" : "bad_int"], q) };
  return { v: usd ? Math.round(x * 100) / 100 : Math.round(x) };
}
function vPhone(s) { var d = String(s || "").replace(/[^\d+]/g, ""); if (/^\d{9}$/.test(d)) d = "998" + d; d = d.replace(/^\+/, ""); return /^\d{11,13}$/.test(d) ? "+" + d : null; }

async function onText(api, chat, st, msg) {
  var l = L(st), q = cur(st), inUnit = q && q.t === "units" && st.cur; if (inUnit) q = subList(st)[st.sub];
  if (!q) return showSummary(api, chat, st);
  var r;
  if (q.t === "text") r = vText(q, msg.text, l);
  else if (q.t === "int") r = vNum(q, msg.text, l, false);
  else if (q.t === "usd") r = vNum(q, msg.text, l, true);
  else if (q.t === "phone") { var p = vPhone(msg.contact ? msg.contact.phone_number : msg.text); r = p ? { v: p } : { err: T[l].bad_phone }; }
  else if (q.t === "email") { var e = String(msg.text || "").trim().toLowerCase(); r = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e) ? { v: e } : { err: T[l].bad_email }; }
  else if (q.t === "loc") {
    if (msg.location) r = { v: "https://yandex.uz/maps/?pt=" + msg.location.longitude + "," + msg.location.latitude + "&z=17&l=map" };
    else if (/^https?:\/\/\S*(google|goo\.gl|yandex|2gis)\S*$/i.test(String(msg.text || "").trim())) r = { v: String(msg.text).trim().slice(0, 400) };
    else r = { err: T[l].bad_loc };
  }
  else if (q.t === "photos") { var n0 = await fileCount(chat, q.slot, q.slot === "unit" ? (st.units || []).length : null); r = { err: tf(T[l].bad_photo, { n: n0, min: q.min }) }; }
  else r = { err: T[l].bad_choice };
  if (r.err) return api("sendMessage", { chat_id: chat, text: r.err, reply_markup: kb([navRow(st, q)]) });
  setVal(st, q, r.v);
  if (q.t === "phone" || q.t === "loc") await api("sendMessage", { chat_id: chat, text: "✅", reply_markup: { remove_keyboard: true } });
  return next(api, chat, st);
}

async function onPhoto(api, chat, st, msg, token) {
  var l = L(st), q = cur(st), inUnit = q && q.t === "units" && st.cur; if (inUnit) q = subList(st)[st.sub];
  if (!q || q.t !== "photos") return api("sendMessage", { chat_id: chat, text: X(l, "Hozir rasm kerak emas — yuqoridagi savolga javob bering.", "Сейчас фото не нужно — ответьте на вопрос выше.") });
  var f = null, mime = "image/jpeg";
  if (msg.photo && msg.photo.length) f = msg.photo[msg.photo.length - 1];
  else if (msg.document && /^image\//.test(msg.document.mime_type || "")) { f = msg.document; mime = msg.document.mime_type; }
  else if (msg.document && q.priv && msg.document.mime_type === "application/pdf") { f = msg.document; mime = "application/pdf"; }
  if (!f) return api("sendMessage", { chat_id: chat, text: tf(T[l].bad_photo, { n: 0, min: q.min }) });
  var ui = q.slot === "unit" ? (st.units || []).length : null;
  var n = await fileCount(chat, q.slot, ui);
  if (n >= q.max) return;
  try { await sb("/rest/v1/tg_reg_files", { method: "POST", headers: { Prefer: "return=minimal,resolution=ignore-duplicates" }, body: { chat: chat, slot: q.slot, unit_idx: ui, file_id: f.file_id, file_uid: f.file_unique_id, mime: mime } }); } catch (e) {}
  if (msg.media_group_id) {                                     // an album arrives as many messages: answer only once, after the last one
    await new Promise(function (ok) { setTimeout(ok, 1800); });
    var last = await sb("/rest/v1/tg_reg_files?select=file_uid&chat=eq." + chat + "&order=id.desc&limit=1");
    if (!last[0] || last[0].file_uid !== f.file_unique_id) return;
    st = await getState(chat);
  }
  n = await fileCount(chat, q.slot, ui);
  if (n >= q.max) return next(api, chat, st, tf(T[l].ph_got, { n: n }) + tf(T[l].ph_max, { max: q.max }));
  var row = navRow(st, q); if (n >= q.min) row.push({ text: T[l].done, callback_data: "pdone" });
  return api("sendMessage", { chat_id: chat, text: tf(T[l].ph_got, { n: n }) + (n >= q.min ? T[l].ph_enough : tf(T[l].ph_more, { k: q.min - n })), reply_markup: kb([row]) });
}

async function onButton(api, chat, st, data, cbMsg) {
  var l = L(st);
  if (data === "back") return back(api, chat, st);
  if (data === "cancel") { st.status = "cancelled"; await putState(st); return api("sendMessage", { chat_id: chat, text: T[l].cancelled }); }
  if (data === "restart") { await sb("/rest/v1/tg_reg_files?chat=eq." + chat, { method: "DELETE" }); st.kind = null; st.step = 0; st.sub = 0; st.data = {}; st.units = []; st.cur = null; await putState(st); return askKind(api, chat, st); }
  if (data === "send") return submit(api, chat, st);
  var q = cur(st), inUnit = q && q.t === "units" && st.cur; if (inUnit) q = subList(st)[st.sub];
  if (data === "u:more") { st.cur = {}; st.sub = 0; await putState(st); return ask(api, chat, st); }
  if (data === "u:end") { if (!(st.units || []).length) { st.cur = {}; st.sub = 0; await putState(st); return ask(api, chat, st); } st.cur = null; st.sub = 0; return next(api, chat, st); }
  if (!q) return showSummary(api, chat, st);
  if (data === "skip" && q.opt) { setVal(st, q, q.t === "usd" || q.t === "int" ? null : ""); if (q.t === "phone" || q.t === "loc") await api("sendMessage", { chat_id: chat, text: "➡️", reply_markup: { remove_keyboard: true } }); return next(api, chat, st); }
  if (data.indexOf("c:") === 0 && q.t === "choice") {
    var v = data.slice(2); if (!q.opts.some(function (o) { return o[0] === v; })) return;
    setVal(st, q, v); var o = q.opts.filter(function (x) { return x[0] === v; })[0];
    if (cbMsg) await api("editMessageReplyMarkup", { chat_id: chat, message_id: cbMsg.message_id, reply_markup: kb([[{ text: "✅ " + lab(o, l), callback_data: "noop" }]]) });
    return next(api, chat, st);
  }
  if (data.indexOf("m:") === 0 && q.t === "multi") {
    var mv = data.slice(2), box = inUnit ? st.cur : st.data, sel = (box[q.k] || []).slice(), i = sel.indexOf(mv);
    if (i >= 0) sel.splice(i, 1); else sel.push(mv);
    box[q.k] = sel; await putState(st);
    if (cbMsg) return api("editMessageReplyMarkup", { chat_id: chat, message_id: cbMsg.message_id, reply_markup: kb(chunk(q.opts.map(function (o) { return { text: (sel.indexOf(o[0]) >= 0 ? "✅ " : "▫️ ") + lab(o, l), callback_data: "m:" + o[0] }; }), q.cols || 1)
      .concat([[{ text: T[l].done + (sel.length ? " (" + sel.length + ")" : ""), callback_data: "mdone" }], navRow(st, q)])) });
    return;
  }
  if (data === "mdone" && q.t === "multi") {
    var have = ((inUnit ? st.cur : st.data)[q.k] || []).length;
    if (have < (q.min || 1)) return api("sendMessage", { chat_id: chat, text: tf(T[l].bad_multi, { min: q.min || 1 }) });
    return next(api, chat, st);
  }
  if (data === "pdone" && q.t === "photos") {
    var n = await fileCount(chat, q.slot, q.slot === "unit" ? (st.units || []).length : null);
    if (n < q.min) return api("sendMessage", { chat_id: chat, text: tf(T[l].bad_photo, { n: n, min: q.min }) });
    return next(api, chat, st);
  }
}

// ------------------------------------------------------------------ summary + submit
function pick(list, v, l) { var o = list.filter(function (x) { return x[0] === v; })[0]; return o ? lab(o, l) : (v || T[l].none); }
async function showSummary(api, chat, st) {
  var l = L(st), d = st.data, ru = l === "ru", lines = [];
  var row = function (a, b) { if (b != null && b !== "" && !(Array.isArray(b) && !b.length)) lines.push("• " + a + ": " + b); };
  row(X(l, "Turi", "Тип"), pick(KINDS, st.kind, l));
  row(X(l, "Nomi / ism", "Название / имя"), d.name); row(X(l, "Xizmat", "Услуга"), d.spec);
  row(X(l, "Telefon", "Телефон"), d.phone); row("WhatsApp", d.whatsapp); row("Telegram", st.username ? "@" + st.username : "");
  row(X(l, "Shahar", "Город"), d.city); row(X(l, "Ishlaydigan shaharlar", "Работает в"), (d.cities || []).join(", "));
  row(X(l, "Manzil", "Адрес"), [d.home_area, d.home_address].filter(Boolean).join(", ")); row(X(l, "Xarita", "Карта"), d.map ? "✅" : "");
  row(X(l, "Tug'ilgan yil", "Год рождения"), d.birth_year); row(X(l, "Tillar", "Языки"), (d.languages || []).map(function (x) { return pick(LANGS, x, l); }).join(", "));
  row(X(l, "Hujjat / reyestr raqami", "Номер документа"), d.license_no); row(X(l, "Tajriba", "Стаж"), d.experience_years != null ? d.experience_years + X(l, " yil", " лет") : "");
  row(X(l, "INN", "ИНН"), d.inn); row(X(l, "Toifa", "Категория"), d.guide_cat ? pick(GCATS, d.guide_cat, l) : "");
  row(X(l, "Yulduz", "Звёзды"), d.hotel_stars != null && st.kind === "hotel" ? pick(STARS, d.hotel_stars, l) : ""); row("Check-in / out", d.check_in ? d.check_in + " / " + d.check_out : "");
  row(X(l, "Qulayliklar", "Удобства"), (d.amenities || []).map(function (x) { return pick(AMEN, x, l); }).join(", ")); row(X(l, "Bekor qilish", "Отмена"), d.policies ? pick(POLICY, d.policies, l) : "");
  row(X(l, "Narx", "Цена"), d.price_day ? "$" + d.price_day + (d.r_half_day ? " · ½: $" + d.r_half_day : "") : "");
  row("E-mail", d.email);
  (st.units || []).forEach(function (u, i) {
    lines.push((st.kind === "hotel" ? "🛏 " : "🚗 ") + (i + 1) + ". " + (u.name || pick(st.kind === "hotel" ? RCLASS : VCLASS, u.class, l)) + " — $" + u.price_netto +
      (st.kind === "hotel" ? " · " + u.capacity + X(l, " kishi", " чел.") + " · ×" + u.qty : " · " + (u.year || "") + " · " + (u.capacity || "") + X(l, " o'rin", " мест")));
  });
  var files = await sb("/rest/v1/tg_reg_files?select=slot&chat=eq." + chat), cnt = {};
  files.forEach(function (f) { cnt[f.slot] = (cnt[f.slot] || 0) + 1; });
  lines.push("📷 " + X(l, "Rasmlar", "Фото") + ": " + files.length);
  var bio = d.bio ? "\n\n📝 " + d.bio.slice(0, 600) : "";
  return api("sendMessage", { chat_id: chat, text: T[l].summary + "\n\n" + lines.join("\n") + bio,
    reply_markup: kb([[{ text: T[l].send, callback_data: "send" }], [{ text: T[l].back, callback_data: "back" }, { text: T[l].restart, callback_data: "restart" }]]) });
}

async function tgFile(token, fileId) {
  var g = await (await fetch("https://api.telegram.org/bot" + token + "/getFile?file_id=" + encodeURIComponent(fileId))).json();
  if (!g.ok) throw new Error("getFile");
  var r = await fetch("https://api.telegram.org/file/bot" + token + "/" + g.result.file_path);
  if (!r.ok) throw new Error("download " + r.status);
  return Buffer.from(await r.arrayBuffer());
}
async function upload(bucket, path, buf, mime) {
  await sb("/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "Content-Type": mime || "image/jpeg", "x-upsert": "false" }, body: buf });
  return path;
}
function rnd() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

async function submit(api, chat, st) {
  var l = L(st), d = st.data, token = process.env.TELEGRAM_BOT_TOKEN;
  if (st.status === "sending" && Date.now() - new Date(st.updated_at).getTime() < 120000) return;   // double press
  st.status = "sending"; await putState(st);
  await api("sendMessage", { chat_id: chat, text: T[l].sending });
  try {
    // 1) account (a bot-only e-mail; the partner signs in through the bot's /kabinet link)
    var email = "tg" + chat + "@partners.moviy-travel.uz", uid = null, pid = null;
    var old = await partnerByChat(chat); if (old) { pid = old.id; uid = old.user_id; }
    if (!pid) {
      var pw = require("crypto").randomBytes(24).toString("hex") + "Aa1!";
      var meta = { partner_kind: st.kind, partner_name: d.name, phone: d.phone || "", whatsapp: d.whatsapp || "", city: d.city || "", license_no: d.license_no || "", company: st.kind === "hotel" ? d.name : "", inn: d.inn || "", source: "telegram" };
      var u;
      try { u = await sb("/auth/v1/admin/users", { method: "POST", body: { email: email, password: pw, email_confirm: true, user_metadata: meta } }); }
      catch (e) {
        if (!/already|registered|exists|422/i.test(String(e.message))) throw e;
        var list = await sb("/auth/v1/admin/users?per_page=1&filter=" + encodeURIComponent(email)); u = (list.users || []).filter(function (x) { return x.email === email; })[0];
        if (!u) throw e;
      }
      uid = u.id;
      for (var i = 0; i < 5 && !pid; i++) { var pr = await sb("/rest/v1/partners?select=id&user_id=eq." + uid); pid = pr[0] && pr[0].id; if (!pid) await new Promise(function (ok) { setTimeout(ok, 700); }); }
      if (!pid) throw new Error("partner row");
    }
    // 2) photos: Telegram → storage
    var files = await sb("/rest/v1/tg_reg_files?select=*&chat=eq." + chat + "&order=id"), photo = null, photos = [], docs = [], unitPh = {};
    var jobs = files.map(function (f) { return async function () {
      var buf = await tgFile(token, f.file_id), priv = f.slot === "lic" || f.slot === "tech", pdf = f.mime === "application/pdf";
      var ext = pdf ? ".pdf" : /png/.test(f.mime || "") ? ".png" : ".jpg", tag = f.slot === "unit" ? "u" : f.slot;
      var path = await upload(priv ? "partner-docs" : "partner-photos", pid + "/" + tag + "-" + rnd() + ext, buf, f.mime || "image/jpeg");
      if (priv) docs.push({ kind: f.slot === "lic" ? "license" : "vehicle", path: path, name: f.slot + ext, at: new Date().toISOString() });
      else if (f.slot === "main") photo = path;
      else if (f.slot === "unit") (unitPh[f.unit_idx] = unitPh[f.unit_idx] || []).push(path);
      else photos.push(path);
    }; });
    for (var k = 0; k < jobs.length; k += 4) await Promise.all(jobs.slice(k, k + 4).map(function (j) { return j().catch(function () {}); }));
    // 3) the card
    var units = st.units || [];
    var p = {
      kind: st.kind, status: "pending", name: d.name, company: st.kind === "hotel" || d.company_type === "company" ? d.name : null, inn: d.inn || null, license_no: d.license_no || null,
      phone: d.phone, whatsapp: d.whatsapp || null, email: d.email || null, telegram: st.username ? "@" + st.username : null, city: d.city,
      cities: d.cities && d.cities.length ? d.cities : (d.city ? [d.city] : []), languages: d.languages || [], specialties: d.spec ? [d.spec] : [], bio: d.bio,
      photo: photo, photos: photos.slice(0, 30), docs: docs,
      price_day: units.length ? Math.min.apply(null, units.map(function (u) { return u.price_netto; })) : (d.price_day || null),
      hotel_stars: st.kind === "hotel" && d.hotel_stars ? +d.hotel_stars : null, hotel_rooms: st.kind === "hotel" ? units.reduce(function (s, u) { return s + (+u.qty || 1); }, 0) : null,
      experience_years: d.experience_years != null ? d.experience_years : null, birth_year: d.birth_year || null, home_area: d.home_area || null, home_address: d.home_address || null,
      vehicle_type: st.kind === "driver" && units[0] ? units[0].name : null, vehicle_seats: st.kind === "driver" && units[0] ? units[0].capacity : null, vehicle_year: st.kind === "driver" && units[0] ? units[0].year : null,
      extra: { source: "telegram", amenities: d.amenities || [], check_in: d.check_in || "", check_out: d.check_out || "", map_url: d.map || "", policies: POLICY_TXT[d.policies] || "",
        company_type: d.company_type || "", registry_no: st.kind === "hotel" ? (d.license_no || "") : "", guide_cat: d.guide_cat || "" },
      tg_chat_id: chat, tg_linked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    if (st.kind === "guide") { p.rates = { full_day: d.price_day }; if (d.r_half_day) p.rates.half_day = d.r_half_day; }
    await sb("/rest/v1/partners?id=eq." + pid, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: p });
    // 4) rooms / vehicles
    if (units.length) {
      await sb("/rest/v1/partner_units?partner_id=eq." + pid + "&status=eq.pending", { method: "DELETE" });
      await sb("/rest/v1/partner_units", { method: "POST", headers: { Prefer: "return=minimal" }, body: units.map(function (u, i) {
        var room = st.kind === "hotel";
        return { partner_id: pid, unit_kind: room ? "room" : "vehicle", class: u.class, name: u.name || pick(room ? RCLASS : VCLASS, u.class, "uz"), capacity: u.capacity ? +u.capacity : null,
          beds: room ? u.beds || null : null, qty: +u.qty || 1, luggage: room ? null : (u.luggage != null ? +u.luggage : null), year: room ? null : (u.year || null), plate: room ? null : (u.plate || null),
          ac: room ? true : u.ac === "1", breakfast: room ? u.breakfast === "1" : false, price_netto: u.price_netto, price_transfer: room ? null : (u.price_transfer || null), photos: unitPh[i] || [], sort: i };
      }) });
    }
    // 5) done
    st.status = "done"; st.partner_id = pid; await putState(st);
    await sb("/rest/v1/tg_reg_files?chat=eq." + chat, { method: "DELETE" });
    return api("sendMessage", { chat_id: chat, text: T[l].sent, reply_markup: kb([[{ text: T[l].login, callback_data: "login" }]]) });
  } catch (e) {
    console.error("tg submit", e);
    st.status = "active"; await putState(st);
    return api("sendMessage", { chat_id: chat, text: T[l].send_err, reply_markup: kb([[{ text: T[l].send, callback_data: "send" }]]) });
  }
}

// one-time sign-in link to the partner cabinet (works for every partner linked to this chat)
async function loginLink(api, chat, st) {
  var l = L(st);
  try {
    var p = await partnerByChat(chat); if (!p || !p.user_id) throw new Error("no partner");
    var usr = await sb("/auth/v1/admin/users/" + p.user_id);
    var g = await sb("/auth/v1/admin/generate_link", { method: "POST", body: { type: "magiclink", email: usr.email, redirect_to: SITE + "/partner/" } });
    var link = g.action_link || (g.properties && g.properties.action_link);
    if (!link) throw new Error("no link");
    return api("sendMessage", { chat_id: chat, text: T[l].login_link, reply_markup: kb([[{ text: T[l].login, url: link }]]) });
  } catch (e) { console.error("tg login", e); return api("sendMessage", { chat_id: chat, text: T[l].login_err }); }
}

// ------------------------------------------------------------------ entry
// returns true when the update was handled here
module.exports = async function handle(api, upd) {
  if (!SK()) return false;
  var msg = upd.message, cb = upd.callback_query, from = (msg && msg.from) || (cb && cb.from) || {}, chat = msg ? msg.chat.id : cb && cb.message && cb.message.chat.id;
  if (!chat || (msg && msg.chat.type !== "private") || (cb && cb.message.chat.type !== "private")) return true;
  if (cb) api("answerCallbackQuery", { callback_query_id: cb.id }).catch(function () {});
  var text = msg ? String(msg.text || "").trim() : "", data = cb ? String(cb.data || "") : "";
  var st = await getState(chat);
  var fresh = function (lang) { return { chat: chat, lang: lang || (st && st.lang) || okLang(from.language_code) || "uz", kind: null, step: 0, sub: 0, data: {}, units: [], cur: null, username: from.username || null, status: "active" }; };

  if (/^\/(kabinet|login|cabinet)/i.test(text) || data === "login") { await loginLink(api, chat, st || fresh()); return true; }
  if (/^\/cancel/i.test(text)) { if (st) { st.status = "cancelled"; await putState(st); } await api("sendMessage", { chat_id: chat, text: T[L(st)].cancelled, reply_markup: { remove_keyboard: true } }); return true; }
  if (/^\/start/i.test(text) || /^\/(join|reg)/i.test(text)) {
    var pp = await partnerByChat(chat);
    if (pp) { var ls = st || fresh(); await api("sendMessage", { chat_id: chat, text: tf(T[L(ls)].already, { name: pp.name }), reply_markup: kb([[{ text: T[L(ls)].login, callback_data: "login" }]]) }); return true; }
    if (st && st.status === "active" && st.kind) {
      await api("sendMessage", { chat_id: chat, text: T[L(st)].resume, reply_markup: kb([[{ text: T[L(st)].cont, callback_data: "cont" }], [{ text: T[L(st)].restart, callback_data: "restart" }]]) });
      return true;
    }
    await putState(fresh()); await askLang(api, chat); return true;
  }
  if (data.indexOf("l:") === 0) { st = st && st.status === "active" ? st : fresh(); st.lang = okLang(data.slice(2)) || "uz"; st.username = from.username || st.username; await putState(st); await askKind(api, chat, st); return true; }
  if (data.indexOf("k:") === 0) {
    if (!st) st = fresh(); var kd = data.slice(2); if (!FLOW[kd]) return true;
    if (await partnerByChat(chat)) { await api("sendMessage", { chat_id: chat, text: tf(T[L(st)].already, { name: "" }), reply_markup: kb([[{ text: T[L(st)].login, callback_data: "login" }]]) }); return true; }
    await sb("/rest/v1/tg_reg_files?chat=eq." + chat, { method: "DELETE" });
    st.kind = kd; st.step = 0; st.sub = 0; st.data = {}; st.units = []; st.cur = null; st.status = "active"; st.username = from.username || st.username;
    if (cb && cb.message) await api("editMessageReplyMarkup", { chat_id: chat, message_id: cb.message.message_id, reply_markup: kb([[{ text: "✅ " + pick(KINDS, kd, L(st)), callback_data: "noop" }]]) });
    await putState(st); await ask(api, chat, st); return true;
  }
  if (!st || st.status === "done" || st.status === "cancelled" || !st.kind) return false;   // not registering → the old help text
  if (data === "cont") { await ask(api, chat, st); return true; }
  if (data === "noop") return true;
  if (cb) { await onButton(api, chat, st, data, cb.message); return true; }
  if (msg.photo || msg.document) { await onPhoto(api, chat, st, msg); return true; }
  if (msg.text || msg.contact || msg.location) { await onText(api, chat, st, msg); return true; }
  return true;
};
module.exports.loginLink = loginLink;
module.exports._i18n = { X: X, Q: Q, SUB: SUB, T: T, lists: [CITIES, LANGS, YESNO, GCATS, AMEN, STARS, POLICY, RCLASS, BEDS, VCLASS, CTYPE, KINDS] };
