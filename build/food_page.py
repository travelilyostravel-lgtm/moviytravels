# Moviy Nomad — "Food" (2026-11-27): restaurants, cafés and tea-houses across Uzbekistan.
# food.html = choose a region; food-<region>.html = one page per region (good for Google: "restaurants in Samarkand"),
# with cuisine filters, halal filter, search, cards, and a place sheet with menu, map and a big "Yandex Go" taxi button.
import json
from html import escape as _esc


def e(s): return _esc(str(s), quote=True)

NAV = {"en": "Food", "ru": "Где поесть", "uz": "Ovqatlar", "tr": "Yemek", "ar": "المطاعم", "de": "Essen", "sv": "Mat", "zh": "美食", "hi": "भोजन", "ko": "맛집"}

# region: (en, ru, uz, tr, ar, de, sv, zh, hi, ko), photo
REG = [
 ("tashkent_city", ("Tashkent", "Ташкент", "Toshkent shahri", "Taşkent", "طشقند", "Taschkent", "Tasjkent", "塔什干", "ताशकंद", "타슈켄트"), "tashkent"),
 ("samarkand", ("Samarkand", "Самарканд", "Samarqand", "Semerkant", "سمرقند", "Samarkand", "Samarkand", "撒马尔罕", "समरकंद", "사마르칸트"), "shahizinda"),
 ("bukhara", ("Bukhara", "Бухара", "Buxoro", "Buhara", "بخارى", "Buchara", "Buchara", "布哈拉", "बुख़ारा", "부하라"), "bukhara"),
 ("khorezm", ("Khiva & Khorezm", "Хива и Хорезм", "Xiva va Xorazm", "Hive ve Harezm", "خيوة وخوارزم", "Chiwa & Choresm", "Chiva & Khorezm", "希瓦与花剌子模", "ख़ीवा और ख़ोरेज़्म", "히바·호라즘"), "khiva"),
 ("tashkent", ("Tashkent region", "Ташкентская область", "Toshkent viloyati", "Taşkent bölgesi", "منطقة طشقند", "Region Taschkent", "Tasjkentregionen", "塔什干州", "ताशकंद क्षेत्र", "타슈켄트주"), "uz-charvak"),
 ("fergana", ("Fergana", "Фергана", "Farg'ona", "Fergana", "فرغانة", "Fergana", "Fergana", "费尔干纳", "फ़रग़ाना", "페르가나"), "ceramics"),
 ("andijan", ("Andijan", "Андижан", "Andijon", "Andican", "أنديجان", "Andijon", "Andizjan", "安集延", "अंदिजान", "안디잔"), "uz-fergana-road"),
 ("namangan", ("Namangan", "Наманган", "Namangan", "Namangan", "نمنغان", "Namangan", "Namangan", "纳曼干", "नमनगान", "나망간"), "uz-kokand-mosque"),
 ("kashkadarya", ("Kashkadarya (Shahrisabz)", "Кашкадарья (Шахрисабз)", "Qashqadaryo (Shahrisabz)", "Kaşkaderya (Şehrisebz)", "قشقداريا (شهرسبز)", "Kaschkadarja (Schahrisabz)", "Kasjkadarja (Sjachrisabz)", "卡什卡达里亚（沙赫里萨布兹）", "क़श्क़ादरिया (शहरिसब्ज़)", "카슈카다리야(샤흐리삽스)"), "uz-shahrisabz"),
 ("surkhandarya", ("Surkhandarya (Termez)", "Сурхандарья (Термез)", "Surxondaryo (Termiz)", "Surhanderya (Tirmiz)", "سرخانداريا (ترمذ)", "Surchandarja (Termes)", "Surchandarja (Termez)", "苏尔汉河（铁尔梅兹）", "सुरख़ानदरिया (तिरमिज़)", "수르한다리야(테르메즈)"), "mountains"),
 ("navoi", ("Navoi", "Навои", "Navoiy", "Nevai", "نوائي", "Navoiy", "Navoi", "纳沃伊", "नवोई", "나보이"), "uz-yurt"),
 ("jizzakh", ("Jizzakh", "Джизак", "Jizzax", "Cizzah", "جيزاخ", "Dschisak", "Dzjizzach", "吉扎克", "जिज़्ज़ाख़", "지작"), "autumn-mountains"),
 ("syrdarya", ("Syrdarya (Gulistan)", "Сырдарья (Гулистан)", "Sirdaryo (Guliston)", "Siriderya (Gülistan)", "سيرداريا (كولستان)", "Syrdarja (Guliston)", "Syrdarja (Guliston)", "锡尔河（古利斯坦）", "सिरदरिया (गुलिस्तान)", "시르다리야(굴리스탄)"), "kyzylkum"),
 ("karakalpakstan", ("Karakalpakstan (Nukus)", "Каракалпакстан (Нукус)", "Qoraqalpog'iston (Nukus)", "Karakalpakistan (Nukus)", "قره قلباقستان (نوكوس)", "Karakalpakstan (Nukus)", "Karakalpakstan (Nukus)", "卡拉卡尔帕克斯坦（努库斯）", "कराकल्पकस्तान (नुकुस)", "카라칼파크스탄(누쿠스)"), "uz-aral"),
]
MAIN = ("tashkent", "bukhara", "khiva", "shahizinda", "hero", "ceramics", "camels", "charvak", "mountains", "plov", "tea", "chorsu")
LI = {"en": 0, "ru": 1, "uz": 2, "tr": 3, "ar": 4, "de": 5, "sv": 6, "zh": 7, "hi": 8, "ko": 9}

CATS = ["national", "european", "asian", "middle", "fastfood", "cafe", "other"]
CAT_ICON = {"national": "🍲", "european": "🍝", "asian": "🍜", "middle": "🥙", "fastfood": "🍔", "cafe": "☕", "other": "🍽"}
CAT_TXT = {
 "en": ("Uzbek national", "European", "Asian (Korean, Chinese, Japanese…)", "Turkish & Middle Eastern", "Fast food", "Cafés & desserts", "Other"),
 "ru": ("Узбекская национальная", "Европейская", "Азиатская (корейская, китайская, японская…)", "Турецкая и восточная", "Фастфуд", "Кафе и десерты", "Другое"),
 "uz": ("O'zbek milliy taomlari", "Yevropa oshxonasi", "Osiyo (koreys, xitoy, yapon…)", "Turk va Sharq taomlari", "Fast-fud", "Kafe va shirinliklar", "Boshqa"),
 "tr": ("Özbek ulusal mutfağı", "Avrupa mutfağı", "Asya (Kore, Çin, Japon…)", "Türk ve Orta Doğu", "Fast food", "Kafeler ve tatlılar", "Diğer"),
 "ar": ("المطبخ الأوزبكي", "المطبخ الأوروبي", "آسيوي (كوري، صيني، ياباني…)", "تركي وشرق أوسطي", "وجبات سريعة", "مقاهٍ وحلويات", "أخرى"),
 "de": ("Usbekische Küche", "Europäisch", "Asiatisch (koreanisch, chinesisch, japanisch…)", "Türkisch & orientalisch", "Fast Food", "Cafés & Desserts", "Sonstiges"),
 "sv": ("Uzbekiskt", "Europeiskt", "Asiatiskt (koreanskt, kinesiskt, japanskt…)", "Turkiskt & Mellanöstern", "Snabbmat", "Kaféer & desserter", "Övrigt"),
 "zh": ("乌兹别克传统菜", "欧式", "亚洲菜（韩、中、日…）", "土耳其与中东菜", "快餐", "咖啡与甜点", "其他"),
 "hi": ("उज़्बेक पारंपरिक", "यूरोपीय", "एशियाई (कोरियन, चाइनीज़, जापानी…)", "तुर्की और मध्य-पूर्वी", "फ़ास्ट फ़ूड", "कैफ़े और मिठाइयाँ", "अन्य"),
 "ko": ("우즈베크 전통 요리", "유럽식", "아시아(한식·중식·일식…)", "튀르키예·중동", "패스트푸드", "카페·디저트", "기타"),
}

TXT = {
 "en": dict(title="Where to eat in Uzbekistan", sub="Restaurants, cafés and tea-houses in every region — Uzbek, European, Asian, halal. Pick a place and call a Yandex Go taxi straight to the door.",
            step1="1. Choose a region", step2="2. What would you like to eat?", places="places", all="All", halal="Halal", search="Search by name…", more="Show more places", none="Nothing found — try another cuisine or clear the search.",
            r_title="Restaurants in {r}: halal, Uzbek & European food", r_sub="Where to eat in {r}: {n} restaurants, cafés and tea-houses with addresses, opening hours, phones and a taxi to the door.",
            taxi="Call Yandex Go taxi", taxi_s="Opens the Yandex Go app with this place as the destination", ymap="Yandex Maps", gmap="Google Maps", gis="2GIS", call="Call", web="Website",
            hours="Opening hours", addr="Address", menu="Menu", halal_ok="Halal — confirmed by Moviy Nomad", halal_osm="Halal (marked by the place)", halal_nat="Uzbek national cuisine is usually halal — ask the staff to be sure",
            back="← All regions", other_reg="Other regions", src="Map data © OpenStreetMap contributors · photos and menus added by Moviy Nomad", loading="Loading places…",
            faq_q1="Is food in Uzbekistan halal?", faq_a1="Most Uzbek national dishes — plov, shashlik, lagman, samsa — are made with halal meat. Places marked “Halal — confirmed” were checked by Moviy Nomad; elsewhere simply ask the staff.",
            faq_q2="How do I get to a restaurant?", faq_a2="Open the place and tap “Call Yandex Go taxi”: the app opens with the restaurant as the destination. Taxis in Uzbek cities are inexpensive and arrive in a few minutes.",
            faq_q3="Can Moviy Nomad book a table or a food tour?", faq_a3="Yes — write to us on WhatsApp and we will reserve a table, arrange a plov master-class or a food tour with a guide."),
 "ru": dict(title="Где поесть в Узбекистане", sub="Рестораны, кафе и чайханы во всех регионах — узбекская, европейская, азиатская кухня, халяль. Выберите место и вызовите такси Yandex Go прямо к дверям.",
            step1="1. Выберите регион", step2="2. Что хотите поесть?", places="мест", all="Все", halal="Халяль", search="Поиск по названию…", more="Показать ещё", none="Ничего не найдено — выберите другую кухню или очистите поиск.",
            r_title="Рестораны {r}: халяль, узбекская и европейская кухня", r_sub="Где поесть — {r}: {n} ресторанов, кафе и чайхан с адресами, часами работы, телефонами и такси до двери.",
            taxi="Вызвать такси Yandex Go", taxi_s="Откроется приложение Yandex Go с этим местом в пункте назначения", ymap="Яндекс Карты", gmap="Google Maps", gis="2ГИС", call="Позвонить", web="Сайт",
            hours="Часы работы", addr="Адрес", menu="Меню", halal_ok="Халяль — проверено Moviy Nomad", halal_osm="Халяль (по данным заведения)", halal_nat="Узбекская национальная кухня обычно халяль — уточните у персонала",
            back="← Все регионы", other_reg="Другие регионы", src="Данные карты © участники OpenStreetMap · фото и меню добавляет Moviy Nomad", loading="Загружаем места…",
            faq_q1="Еда в Узбекистане халяль?", faq_a1="Большинство национальных блюд — плов, шашлык, лагман, самса — готовят из халяльного мяса. Места с отметкой «Халяль — проверено» проверены Moviy Nomad; в остальных уточните у персонала.",
            faq_q2="Как добраться до ресторана?", faq_a2="Откройте место и нажмите «Вызвать такси Yandex Go»: приложение откроется с рестораном в пункте назначения. Такси в городах Узбекистана недорогое и приезжает за несколько минут.",
            faq_q3="Moviy Nomad может забронировать столик или гастротур?", faq_a3="Да — напишите нам в WhatsApp: забронируем столик, организуем мастер-класс по плову или гастротур с гидом."),
 "uz": dict(title="O'zbekistonda qayerda ovqatlanish mumkin", sub="Har bir viloyatdagi restoran, kafe va choyxonalar — milliy, Yevropa, Osiyo taomlari, halol. Joyni tanlang va Yandex Go taksini to'g'ridan-to'g'ri eshigigacha chaqiring.",
            step1="1. Viloyatni tanlang", step2="2. Nima yemoqchisiz?", places="joy", all="Hammasi", halal="Halol", search="Nomi bo'yicha qidirish…", more="Yana ko'rsatish", none="Hech narsa topilmadi — boshqa oshxona turini tanlang yoki qidiruvni tozalang.",
            r_title="{r} restoranlari: halol, milliy va Yevropa taomlari", r_sub="{r}da qayerda ovqatlanish mumkin: {n} ta restoran, kafe va choyxona — manzil, ish vaqti, telefon va eshikkacha taksi.",
            taxi="Yandex Go taksi chaqirish", taxi_s="Yandex Go ilovasi shu joy manzili bilan ochiladi", ymap="Yandex Xarita", gmap="Google Maps", gis="2GIS", call="Qo'ng'iroq", web="Sayt",
            hours="Ish vaqti", addr="Manzil", menu="Menyu", halal_ok="Halol — Moviy Nomad tekshirgan", halal_osm="Halol (joyning o'zi belgilagan)", halal_nat="O'zbek milliy taomlari odatda halol — aniq bilish uchun xodimlardan so'rang",
            back="← Barcha viloyatlar", other_reg="Boshqa viloyatlar", src="Xarita ma'lumotlari © OpenStreetMap ishtirokchilari · rasm va menyularni Moviy Nomad qo'shadi", loading="Joylar yuklanmoqda…",
            faq_q1="O'zbekistonda taomlar halolmi?", faq_a1="Milliy taomlarning ko'pi — palov, shashlik, lag'mon, somsa — halol go'shtdan tayyorlanadi. «Halol — tekshirilgan» belgili joylarni Moviy Nomad tekshirgan; boshqalarida xodimlardan so'rang.",
            faq_q2="Restoranga qanday boraman?", faq_a2="Joyni oching va «Yandex Go taksi chaqirish» tugmasini bosing — ilova restoran manzili bilan ochiladi. O'zbekiston shaharlarida taksi arzon va bir necha daqiqada keladi.",
            faq_q3="Moviy Nomad stol yoki gastro-tur bron qila oladimi?", faq_a3="Ha — WhatsApp'da yozing: stol bron qilamiz, palov master-klassi yoki gid bilan gastro-tur tashkil qilamiz."),
 "tr": dict(title="Özbekistan'da nerede yenir", sub="Her bölgede restoranlar, kafeler ve çayhaneler — Özbek, Avrupa, Asya mutfağı, helal. Yeri seçin ve kapıya kadar Yandex Go taksi çağırın.",
            step1="1. Bölge seçin", step2="2. Ne yemek istersiniz?", places="mekân", all="Tümü", halal="Helal", search="Ada göre ara…", more="Daha fazla göster", none="Sonuç yok — başka bir mutfak seçin veya aramayı temizleyin.",
            r_title="{r} restoranları: helal, Özbek ve Avrupa yemekleri", r_sub="{r}'da nerede yenir: adres, çalışma saatleri, telefon ve kapıya taksiyle {n} restoran, kafe ve çayhane.",
            taxi="Yandex Go taksi çağır", taxi_s="Yandex Go uygulaması bu yer hedef olarak açılır", ymap="Yandex Haritalar", gmap="Google Maps", gis="2GIS", call="Ara", web="Web sitesi",
            hours="Çalışma saatleri", addr="Adres", menu="Menü", halal_ok="Helal — Moviy Nomad onaylı", halal_osm="Helal (mekânın beyanı)", halal_nat="Özbek ulusal mutfağı genellikle helaldir — emin olmak için personele sorun",
            back="← Tüm bölgeler", other_reg="Diğer bölgeler", src="Harita verileri © OpenStreetMap katkıcıları · fotoğraf ve menüleri Moviy Nomad ekler", loading="Mekânlar yükleniyor…",
            faq_q1="Özbekistan'da yemekler helal mi?", faq_a1="Pilav, şiş, lağman, samsa gibi Özbek yemeklerinin çoğu helal etle yapılır. “Helal — onaylı” işaretli yerler Moviy Nomad tarafından kontrol edildi; diğerlerinde personele sorun.",
            faq_q2="Restorana nasıl giderim?", faq_a2="Mekânı açıp “Yandex Go taksi çağır”a dokunun: uygulama restoran hedef olarak açılır. Özbek şehirlerinde taksi ucuzdur ve birkaç dakikada gelir.",
            faq_q3="Moviy Nomad masa veya yemek turu ayarlayabilir mi?", faq_a3="Evet — WhatsApp'tan yazın: masa ayırırız, pilav atölyesi veya rehberli yemek turu düzenleriz."),
 "ar": dict(title="أين تأكل في أوزبكستان", sub="مطاعم ومقاهٍ وبيوت شاي في كل المناطق — أوزبكي وأوروبي وآسيوي وحلال. اختر المكان واطلب سيارة Yandex Go حتى الباب.",
            step1="١. اختر المنطقة", step2="٢. ماذا تحب أن تأكل؟", places="مكان", all="الكل", halal="حلال", search="ابحث بالاسم…", more="عرض المزيد", none="لا نتائج — اختر مطبخًا آخر أو امسح البحث.",
            r_title="مطاعم {r}: حلال وأوزبكية وأوروبية", r_sub="أين تأكل في {r}: {n} مطعمًا ومقهى وبيت شاي مع العناوين وساعات العمل والهاتف وسيارة أجرة حتى الباب.",
            taxi="اطلب تاكسي Yandex Go", taxi_s="يفتح تطبيق Yandex Go وهذا المكان هو الوجهة", ymap="خرائط ياندكس", gmap="خرائط Google", gis="2GIS", call="اتصال", web="الموقع",
            hours="ساعات العمل", addr="العنوان", menu="القائمة", halal_ok="حلال — تم التحقق من Moviy Nomad", halal_osm="حلال (بحسب المكان)", halal_nat="المطبخ الأوزبكي عادةً حلال — اسأل الموظفين للتأكد",
            back="← كل المناطق", other_reg="مناطق أخرى", src="بيانات الخريطة © مساهمو OpenStreetMap · الصور والقوائم من Moviy Nomad", loading="جارٍ تحميل الأماكن…",
            faq_q1="هل الطعام في أوزبكستان حلال؟", faq_a1="معظم الأطباق الأوزبكية — البلوف والشاشليك واللغمان والسمسة — تُحضَّر من لحم حلال. الأماكن المعلَّمة «حلال — تم التحقق» راجعتها Moviy Nomad؛ وفي غيرها اسأل الموظفين.",
            faq_q2="كيف أصل إلى المطعم؟", faq_a2="افتح المكان واضغط «اطلب تاكسي Yandex Go»: يفتح التطبيق والمطعم هو الوجهة. التاكسي في مدن أوزبكستان رخيص ويصل خلال دقائق.",
            faq_q3="هل تحجز Moviy Nomad طاولة أو جولة طعام؟", faq_a3="نعم — راسلنا على واتساب: نحجز الطاولة وننظّم درس طبخ البلوف أو جولة طعام مع مرشد."),
 "de": dict(title="Essen gehen in Usbekistan", sub="Restaurants, Cafés und Teehäuser in jeder Region — usbekisch, europäisch, asiatisch, halal. Ort wählen und ein Yandex-Go-Taxi direkt vor die Tür rufen.",
            step1="1. Region wählen", step2="2. Was möchten Sie essen?", places="Orte", all="Alle", halal="Halal", search="Nach Namen suchen…", more="Mehr anzeigen", none="Nichts gefunden — andere Küche wählen oder Suche leeren.",
            r_title="Restaurants in {r}: halal, usbekisch & europäisch", r_sub="Essen in {r}: {n} Restaurants, Cafés und Teehäuser mit Adresse, Öffnungszeiten, Telefon und Taxi bis vor die Tür.",
            taxi="Yandex-Go-Taxi rufen", taxi_s="Öffnet die Yandex-Go-App mit diesem Ort als Ziel", ymap="Yandex Karten", gmap="Google Maps", gis="2GIS", call="Anrufen", web="Website",
            hours="Öffnungszeiten", addr="Adresse", menu="Speisekarte", halal_ok="Halal — von Moviy Nomad geprüft", halal_osm="Halal (Angabe des Lokals)", halal_nat="Usbekische Küche ist meist halal — fragen Sie zur Sicherheit nach",
            back="← Alle Regionen", other_reg="Weitere Regionen", src="Kartendaten © OpenStreetMap-Mitwirkende · Fotos und Speisekarten von Moviy Nomad", loading="Orte werden geladen…",
            faq_q1="Ist das Essen in Usbekistan halal?", faq_a1="Die meisten usbekischen Gerichte — Plov, Schaschlik, Lagman, Samsa — werden mit Halal-Fleisch zubereitet. Orte mit „Halal — geprüft“ hat Moviy Nomad kontrolliert; sonst fragen Sie das Personal.",
            faq_q2="Wie komme ich zum Restaurant?", faq_a2="Ort öffnen und „Yandex-Go-Taxi rufen“ tippen: Die App öffnet sich mit dem Restaurant als Ziel. Taxis sind in usbekischen Städten günstig und in wenigen Minuten da.",
            faq_q3="Kann Moviy Nomad einen Tisch oder eine Food-Tour buchen?", faq_a3="Ja — schreiben Sie uns auf WhatsApp: Wir reservieren den Tisch, organisieren einen Plov-Kochkurs oder eine Food-Tour mit Guide."),
 "sv": dict(title="Var man äter i Uzbekistan", sub="Restauranger, kaféer och tehus i alla regioner — uzbekiskt, europeiskt, asiatiskt, halal. Välj ett ställe och ring en Yandex Go-taxi ända fram.",
            step1="1. Välj region", step2="2. Vad vill du äta?", places="ställen", all="Alla", halal="Halal", search="Sök på namn…", more="Visa fler", none="Inget hittades — välj ett annat kök eller rensa sökningen.",
            r_title="Restauranger i {r}: halal, uzbekiskt & europeiskt", r_sub="Var man äter i {r}: {n} restauranger, kaféer och tehus med adress, öppettider, telefon och taxi ända fram.",
            taxi="Ring Yandex Go-taxi", taxi_s="Öppnar Yandex Go-appen med stället som mål", ymap="Yandex Kartor", gmap="Google Maps", gis="2GIS", call="Ring", web="Webbplats",
            hours="Öppettider", addr="Adress", menu="Meny", halal_ok="Halal — kontrollerat av Moviy Nomad", halal_osm="Halal (enligt stället)", halal_nat="Uzbekisk mat är oftast halal — fråga personalen för säkerhets skull",
            back="← Alla regioner", other_reg="Andra regioner", src="Kartdata © OpenStreetMaps bidragsgivare · foton och menyer läggs till av Moviy Nomad", loading="Laddar ställen…",
            faq_q1="Är maten i Uzbekistan halal?", faq_a1="De flesta uzbekiska rätter — plov, sjasjlik, lagman, samsa — lagas med halalkött. Ställen märkta ”Halal — kontrollerat” har Moviy Nomad kontrollerat; fråga annars personalen.",
            faq_q2="Hur kommer jag till restaurangen?", faq_a2="Öppna stället och tryck ”Ring Yandex Go-taxi”: appen öppnas med restaurangen som mål. Taxi är billigt i uzbekiska städer och kommer på några minuter.",
            faq_q3="Kan Moviy Nomad boka bord eller matresa?", faq_a3="Ja — skriv till oss på WhatsApp så bokar vi bord, plovkurs eller en matvandring med guide."),
 "zh": dict(title="乌兹别克斯坦吃什么、去哪吃", sub="各地区的餐厅、咖啡馆和茶馆——乌兹别克菜、西餐、亚洲菜、清真。选好地方，一键叫 Yandex Go 出租车直达门口。",
            step1="1. 选择地区", step2="2. 想吃什么？", places="家", all="全部", halal="清真", search="按名称搜索…", more="查看更多", none="未找到——换个菜系或清除搜索。",
            r_title="{r}餐厅：清真、乌兹别克菜与西餐", r_sub="{r}去哪吃：{n} 家餐厅、咖啡馆和茶馆，含地址、营业时间、电话，一键打车到门口。",
            taxi="叫 Yandex Go 出租车", taxi_s="打开 Yandex Go 应用并以此为目的地", ymap="Yandex 地图", gmap="Google 地图", gis="2GIS", call="致电", web="网站",
            hours="营业时间", addr="地址", menu="菜单", halal_ok="清真——Moviy Nomad 已核实", halal_osm="清真（商家标注）", halal_nat="乌兹别克传统菜通常为清真——如需确认请询问店员",
            back="← 全部地区", other_reg="其他地区", src="地图数据 © OpenStreetMap 贡献者 · 照片与菜单由 Moviy Nomad 添加", loading="正在加载…",
            faq_q1="乌兹别克斯坦的食物是清真的吗？", faq_a1="大多数乌兹别克传统菜——抓饭、烤肉串、拉条子、烤包子——都使用清真肉类。标有“清真——已核实”的餐厅经 Moviy Nomad 核查；其他请询问店员。",
            faq_q2="怎么去餐厅？", faq_a2="打开餐厅页面，点“叫 Yandex Go 出租车”，应用会以餐厅为目的地打开。乌兹别克斯坦城市打车便宜，几分钟就到。",
            faq_q3="Moviy Nomad 能订位或安排美食游吗？", faq_a3="可以——在 WhatsApp 联系我们：订位、安排抓饭烹饪课或带导游的美食之旅。"),
 "hi": dict(title="उज़्बेकिस्तान में कहाँ खाएँ", sub="हर क्षेत्र के रेस्टोरेंट, कैफ़े और चायख़ाने — उज़्बेक, यूरोपीय, एशियाई, हलाल। जगह चुनें और दरवाज़े तक Yandex Go टैक्सी बुलाएँ।",
            step1="1. क्षेत्र चुनें", step2="2. क्या खाना चाहेंगे?", places="जगहें", all="सभी", halal="हलाल", search="नाम से खोजें…", more="और दिखाएँ", none="कुछ नहीं मिला — कोई दूसरा व्यंजन चुनें या खोज साफ़ करें।",
            r_title="{r} के रेस्टोरेंट: हलाल, उज़्बेक और यूरोपीय भोजन", r_sub="{r} में कहाँ खाएँ: पता, समय, फ़ोन और दरवाज़े तक टैक्सी के साथ {n} रेस्टोरेंट, कैफ़े और चायख़ाने।",
            taxi="Yandex Go टैक्सी बुलाएँ", taxi_s="Yandex Go ऐप इस जगह को मंज़िल बनाकर खुलेगा", ymap="Yandex मैप्स", gmap="Google Maps", gis="2GIS", call="कॉल करें", web="वेबसाइट",
            hours="खुलने का समय", addr="पता", menu="मेन्यू", halal_ok="हलाल — Moviy Nomad द्वारा जाँचा गया", halal_osm="हलाल (जगह द्वारा बताया गया)", halal_nat="उज़्बेक पारंपरिक भोजन आम तौर पर हलाल होता है — पक्का करने के लिए स्टाफ़ से पूछें",
            back="← सभी क्षेत्र", other_reg="दूसरे क्षेत्र", src="मानचित्र डेटा © OpenStreetMap योगदानकर्ता · फ़ोटो और मेन्यू Moviy Nomad जोड़ता है", loading="जगहें लोड हो रही हैं…",
            faq_q1="क्या उज़्बेकिस्तान में खाना हलाल है?", faq_a1="ज़्यादातर उज़्बेक व्यंजन — प्लोव, शाशलिक, लगमान, समसा — हलाल मांस से बनते हैं। “हलाल — जाँचा गया” वाली जगहें Moviy Nomad ने जाँची हैं; बाकी जगह स्टाफ़ से पूछें।",
            faq_q2="रेस्टोरेंट तक कैसे पहुँचूँ?", faq_a2="जगह खोलें और “Yandex Go टैक्सी बुलाएँ” दबाएँ — ऐप रेस्टोरेंट को मंज़िल बनाकर खुलेगा। उज़्बेक शहरों में टैक्सी सस्ती है और कुछ मिनटों में आती है।",
            faq_q3="क्या Moviy Nomad टेबल या फ़ूड टूर बुक कर सकता है?", faq_a3="हाँ — WhatsApp पर लिखें: हम टेबल बुक करेंगे, प्लोव मास्टर-क्लास या गाइड के साथ फ़ूड टूर व्यवस्थित करेंगे।"),
 "ko": dict(title="우즈베키스탄 맛집 가이드", sub="모든 지역의 레스토랑, 카페, 찻집 — 우즈베크 요리, 유럽식, 아시아식, 할랄. 장소를 고르고 Yandex Go 택시를 문 앞까지 부르세요.",
            step1="1. 지역 선택", step2="2. 무엇을 드시겠어요?", places="곳", all="전체", halal="할랄", search="이름으로 검색…", more="더 보기", none="결과가 없습니다 — 다른 요리를 고르거나 검색어를 지워 보세요.",
            r_title="{r} 맛집: 할랄·우즈베크·유럽 요리", r_sub="{r}에서 어디서 먹을까: 주소, 영업시간, 전화번호, 문 앞까지 택시가 있는 레스토랑·카페·찻집 {n}곳.",
            taxi="Yandex Go 택시 부르기", taxi_s="이 장소를 목적지로 Yandex Go 앱이 열립니다", ymap="Yandex 지도", gmap="Google 지도", gis="2GIS", call="전화", web="웹사이트",
            hours="영업시간", addr="주소", menu="메뉴", halal_ok="할랄 — Moviy Nomad 확인", halal_osm="할랄(업소 표시)", halal_nat="우즈베크 전통 요리는 대개 할랄입니다 — 확실히 하려면 직원에게 물어보세요",
            back="← 전체 지역", other_reg="다른 지역", src="지도 데이터 © OpenStreetMap 기여자 · 사진과 메뉴는 Moviy Nomad가 추가", loading="불러오는 중…",
            faq_q1="우즈베키스탄 음식은 할랄인가요?", faq_a1="플롭, 샤슬릭, 라그만, 삼사 등 대부분의 우즈베크 요리는 할랄 고기로 만듭니다. “할랄 — 확인” 표시는 Moviy Nomad가 확인한 곳이며, 다른 곳은 직원에게 물어보세요.",
            faq_q2="레스토랑까지 어떻게 가나요?", faq_a2="장소를 열고 “Yandex Go 택시 부르기”를 누르면 레스토랑이 목적지로 설정된 앱이 열립니다. 우즈베키스탄 도시의 택시는 저렴하고 몇 분 안에 옵니다.",
            faq_q3="Moviy Nomad가 예약이나 푸드 투어를 해 주나요?", faq_a3="네 — WhatsApp으로 연락 주시면 테이블 예약, 플롭 쿠킹 클래스, 가이드 푸드 투어를 준비해 드립니다."),
}

# famous local dishes (proper names, same in every language) — shown on region pages
DISH = {
 "tashkent_city": "Tashkent plov · lagman · samsa · shashlik · non", "samarkand": "Samarkand plov · Samarkand non · shashlik · somsa",
 "bukhara": "Oshi sofi · bakhsh · shashlik · halva", "khorezm": "Shivit oshi · tukhum barak · gurvak", "fergana": "Fergana plov · kazan kebab · Rishtan tea",
 "andijan": "Andijan plov · lagman · kebab", "namangan": "Namangan kebab · plov · somsa", "tashkent": "Plov · shashlik · fresh fish by Charvak",
}

# 27.11: tourist top list + photos/menu through the place's own Yandex Maps card
_EXTRA = {
    "en": dict(ypm="Photos, menu & prices", ypm_s="Opens this place on Yandex Maps: real photos, menu, prices and reviews", top_note="Top places for travellers", all_on="Show all places", all_off="Show only top places"),
    "ru": dict(ypm="Фото, меню и цены", ypm_s="Откроется карточка заведения в Яндекс Картах: фото, меню, цены и отзывы", top_note="Лучшие места для туристов", all_on="Показать все заведения", all_off="Только лучшие места"),
    "uz": dict(ypm="Rasmlar, menyu va narxlar", ypm_s="Yandex Xaritada shu joyning kartochkasi ochiladi: rasmlar, menyu, narxlar va sharhlar", top_note="Turistlar uchun eng yaxshi joylar", all_on="Barcha joylarni ko'rsatish", all_off="Faqat eng yaxshi joylar"),
    "tr": dict(ypm="Fotoğraflar, menü ve fiyatlar", ypm_s="Mekân Yandex Haritalar'da açılır: fotoğraflar, menü, fiyatlar ve yorumlar", top_note="Gezginler için en iyi yerler", all_on="Tüm mekânları göster", all_off="Sadece en iyi yerler"),
    "ar": dict(ypm="الصور والقائمة والأسعار", ypm_s="تُفتح صفحة المكان على خرائط ياندكس: صور وقائمة وأسعار وتقييمات", top_note="أفضل الأماكن للسياح", all_on="عرض كل الأماكن", all_off="أفضل الأماكن فقط"),
    "de": dict(ypm="Fotos, Speisekarte & Preise", ypm_s="Öffnet das Lokal in Yandex Karten: Fotos, Speisekarte, Preise und Bewertungen", top_note="Top-Adressen für Reisende", all_on="Alle Lokale zeigen", all_off="Nur Top-Adressen"),
    "sv": dict(ypm="Bilder, meny och priser", ypm_s="Öppnar stället i Yandex Kartor: bilder, meny, priser och omdömen", top_note="Bästa ställena för resenärer", all_on="Visa alla ställen", all_off="Bara de bästa ställena"),
    "zh": dict(ypm="照片、菜单和价格", ypm_s="在 Yandex 地图中打开该餐厅：照片、菜单、价格和评价", top_note="游客精选餐厅", all_on="显示全部餐厅", all_off="只看精选"),
    "hi": dict(ypm="फ़ोटो, मेन्यू और दाम", ypm_s="Yandex मैप्स पर यह जगह खुलेगी: फ़ोटो, मेन्यू, दाम और रिव्यू", top_note="पर्यटकों के लिए बेहतरीन जगहें", all_on="सभी जगहें दिखाएँ", all_off="सिर्फ़ बेहतरीन जगहें"),
    "ko": dict(ypm="사진, 메뉴, 가격", ypm_s="Yandex 지도에서 이 식당이 열립니다: 사진, 메뉴, 가격, 리뷰", top_note="여행자를 위한 추천 식당", all_on="모든 식당 보기", all_off="추천 식당만"),
}
for _l, _d in _EXTRA.items():
    if _l in TXT: TXT[_l].update(_d)

def _rn(r, lang): return r[1][LI.get(lang, 0)]

def _page_js(lang, region, T):
    js_txt = dict(T, cats={c: CAT_TXT.get(lang, CAT_TXT["en"])[i] for i, c in enumerate(CATS)}, icons=CAT_ICON, region=region,
                  regions={r[0]: _rn(r, lang) for r in REG})
    return f'<script>window.MNFOOD={json.dumps(js_txt, ensure_ascii=False)};</script>'

def _faq(T):
    qa = [(T["faq_q1"], T["faq_a1"]), (T["faq_q2"], T["faq_a2"]), (T["faq_q3"], T["faq_a3"])]
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
    return ('<div class="fd-faq">' + "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in qa) + '</div>'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')

def render_index(lang, pages, x, icon, logo, font, names):
    T = TXT.get(lang, TXT["en"]); A = "" if lang == "en" else "../"
    tiles = "".join(f'''<a class="fdr" href="food-{r[0]}.html" data-r="{r[0]}" style="--img:url('/assets/img/{"" if r[2] in MAIN else "p/"}{r[2]}.webp')">
      <span class="fdr__shade"></span><span class="fdr__t"><b>{e(_rn(r, lang))}</b><small data-cnt="{r[0]}">&nbsp;</small></span></a>''' for r in REG)
    body = pages.page_head("🍽", T["title"], T["sub"]) + f'''
<section class="section section--tight fd">
  <div class="container">
    <h2 class="fd-step">{e(T["step1"])}</h2>
    <div class="fdr-grid">{tiles}</div>
    {_faq(T)}
    <p class="fd-src">{e(T["src"])}</p>
  </div>
</section>'''
    js = _page_js(lang, "", T) + f'<script src="{A}assets/js/food.js?v=3" defer></script>'
    return pages.shell(lang, "food.html", T["title"], T["sub"], body, icon, logo, font, names, "is-food", js)

def render_region(lang, r, pages, x, icon, logo, font, names):
    T = TXT.get(lang, TXT["en"]); A = "" if lang == "en" else "../"; rn = _rn(r, lang)
    title = T["r_title"].replace("{r}", rn); sub = T["r_sub"].replace("{r}", rn).replace("{n} ", "").replace(" {n}", "")
    chips = f'<button type="button" class="fdc is-on" data-cat=""><i>✨</i>{e(T["all"])}<small data-cc="_all"></small></button>' + "".join(
        f'<button type="button" class="fdc" data-cat="{c}"><i>{CAT_ICON[c]}</i>{e(CAT_TXT.get(lang, CAT_TXT["en"])[i])}<small data-cc="{c}"></small></button>' for i, c in enumerate(CATS))
    others = "".join(f'<a href="food-{o[0]}.html">{e(_rn(o, lang))}</a>' for o in REG if o[0] != r[0])
    dish = DISH.get(r[0])
    body = pages.page_head("🍽", title, sub) + f'''
<section class="section section--tight fd">
  <div class="container">
    <p class="fd-back"><a href="food.html">{e(T["back"])}</a>{f' <span class="fd-dish">🍽 {e(dish)}</span>' if dish else ''}</p>
    <h2 class="fd-step">{e(T["step2"])}</h2>
    <div class="fdc-row">{chips}</div>
    <div class="fd-tools"><label class="fd-halal"><input type="checkbox" id="fd-halal"> <span>☪ {e(T["halal"])}</span></label><input type="search" id="fd-q" placeholder="{e(T["search"])}" autocomplete="off"></div>
    <div class="fd-grid" id="fd-grid" aria-live="polite"><p class="ev-load">{e(T["loading"])}</p></div>
    <p class="ev-empty" id="fd-empty" hidden>{e(T["none"])}</p>
    <div class="ev-more"><button type="button" class="btn btn--outline" id="fd-more" hidden>{e(T["more"])} ↓</button></div>
    <p class="fd-allsw"><button type="button" id="fd-all">{e(T["all_on"])}</button></p>
    {_faq(T)}
    <div class="fd-others"><h3>{e(T["other_reg"])}</h3><div>{others}</div></div>
    <p class="fd-src">{e(T["src"])}</p>
  </div>
</section>
<div class="fds" id="fd-sheet" aria-hidden="true"><div class="fds__bg" data-close></div><div class="fds__box" role="dialog" aria-modal="true"><button class="fds__x" data-close aria-label="×">×</button><div id="fd-sheet-in"></div></div></div>'''
    js = _page_js(lang, r[0], T) + f'<script src="{A}assets/js/food.js?v=3" defer></script>'
    return pages.shell(lang, f"food-{r[0]}.html", title, sub, body, icon, logo, font, names, "is-food", js)

def render_all(lang, pages, icon, logo, font, names):
    x = pages.X(lang)
    out = {"food.html": render_index(lang, pages, x, icon, logo, font, names)}
    for r in REG: out[f"food-{r[0]}.html"] = render_region(lang, r, pages, x, icon, logo, font, names)
    return out
