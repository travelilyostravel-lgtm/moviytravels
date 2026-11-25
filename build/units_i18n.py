# Hotel room types / transport vehicles on the public partner profile (25.11.2026). 10 site languages.
_K = ["rooms_t", "cars_t", "per_night", "per_day", "transfer", "guests", "seats", "bags", "bf_yes", "bf_no", "ac", "check_in", "check_out", "map", "amen_t", "policies", "ask_this",
      "standard", "deluxe", "suite", "family", "single", "dorm", "economy", "comfort", "business", "premium", "minivan", "minibus", "bus",
      "wifi", "breakfast", "parking", "ac_a", "transfer_a", "restaurant", "pool", "laundry", "reception24", "family_a", "courtyard", "elevator", "terrace", "nosmoking"]
_T = {
"en": ["Room types", "Vehicles", "per night", "per day", "airport transfer", "guests", "seats", "suitcases", "breakfast included", "no breakfast", "A/C", "Check-in", "Check-out", "Map", "Facilities", "Policies", "Ask about this",
       "Standard", "Deluxe", "Suite", "Family", "Single", "Dorm bed", "Economy", "Comfort", "Business", "Premium", "Minivan", "Minibus", "Coach",
       "Wi-Fi", "Breakfast", "Parking", "Air conditioning", "Airport transfer", "Restaurant", "Pool", "Laundry", "24-hour reception", "Family rooms", "National courtyard", "Lift", "Terrace", "Non-smoking rooms"],
"ru": ["Типы номеров", "Машины", "за ночь", "в день", "трансфер из аэропорта", "гостей", "мест", "чемоданов", "завтрак включён", "без завтрака", "кондиционер", "Заезд", "Выезд", "Карта", "Удобства", "Правила", "Спросить об этом",
       "Стандарт", "Делюкс", "Люкс", "Семейный", "Одноместный", "Место в хостеле", "Эконом", "Комфорт", "Бизнес", "Премиум", "Минивэн", "Микроавтобус", "Автобус",
       "Wi-Fi", "Завтрак", "Парковка", "Кондиционер", "Трансфер из аэропорта", "Ресторан", "Бассейн", "Прачечная", "Ресепшн 24 часа", "Семейные номера", "Национальный двор", "Лифт", "Терраса", "Номера для некурящих"],
"uz": ["Xona turlari", "Mashinalar", "bir kecha", "bir kun", "aeroport transferi", "kishi", "o'rin", "chamadon", "nonushta bilan", "nonushtasiz", "konditsioner", "Kirish", "Chiqish", "Xarita", "Qulayliklar", "Qoidalar", "Shu haqda so'rash",
       "Standart", "Deluxe", "Lyuks", "Oilaviy", "Bir kishilik", "Hostel joyi", "Ekonom", "Komfort", "Biznes", "Premium", "Miniven", "Mikroavtobus", "Avtobus",
       "Wi-Fi", "Nonushta", "Avtoturargoh", "Konditsioner", "Aeroport transferi", "Restoran", "Basseyn", "Kir yuvish", "24 soat qabulxona", "Oilaviy xonalar", "Milliy hovli", "Lift", "Terassa", "Chekilmaydigan xonalar"],
"tr": ["Oda tipleri", "Araçlar", "gecelik", "günlük", "havalimanı transferi", "kişi", "koltuk", "bavul", "kahvaltı dahil", "kahvaltısız", "klima", "Giriş", "Çıkış", "Harita", "Olanaklar", "Kurallar", "Bunu sor",
       "Standart", "Deluxe", "Suit", "Aile", "Tek kişilik", "Yatakhane", "Ekonomi", "Konfor", "Business", "Premium", "Minivan", "Minibüs", "Otobüs",
       "Wi-Fi", "Kahvaltı", "Otopark", "Klima", "Havalimanı transferi", "Restoran", "Havuz", "Çamaşırhane", "24 saat resepsiyon", "Aile odaları", "Geleneksel avlu", "Asansör", "Teras", "Sigara içilmeyen odalar"],
"ar": ["أنواع الغرف", "السيارات", "لليلة", "لليوم", "نقل من المطار", "ضيوف", "مقاعد", "حقائب", "الإفطار مشمول", "بدون إفطار", "تكييف", "تسجيل الوصول", "تسجيل المغادرة", "الخريطة", "المرافق", "السياسات", "اسأل عن هذا",
       "قياسية", "ديلوكس", "جناح", "عائلية", "فردية", "سرير في مهجع", "اقتصادية", "مريحة", "رجال أعمال", "فاخرة", "ميني فان", "حافلة صغيرة", "حافلة",
       "واي فاي", "إفطار", "موقف سيارات", "تكييف", "نقل من المطار", "مطعم", "مسبح", "غسيل ملابس", "استقبال 24 ساعة", "غرف عائلية", "فناء تقليدي", "مصعد", "تراس", "غرف لغير المدخنين"],
"de": ["Zimmertypen", "Fahrzeuge", "pro Nacht", "pro Tag", "Flughafentransfer", "Gäste", "Sitze", "Koffer", "mit Frühstück", "ohne Frühstück", "Klimaanlage", "Check-in", "Check-out", "Karte", "Ausstattung", "Regeln", "Dazu anfragen",
       "Standard", "Deluxe", "Suite", "Familienzimmer", "Einzelzimmer", "Schlafsaal-Bett", "Economy", "Komfort", "Business", "Premium", "Minivan", "Kleinbus", "Reisebus",
       "WLAN", "Frühstück", "Parkplatz", "Klimaanlage", "Flughafentransfer", "Restaurant", "Pool", "Wäscherei", "24-Stunden-Rezeption", "Familienzimmer", "Traditioneller Innenhof", "Aufzug", "Terrasse", "Nichtraucherzimmer"],
"sv": ["Rumstyper", "Fordon", "per natt", "per dag", "flygplatstransfer", "gäster", "platser", "resväskor", "frukost ingår", "utan frukost", "AC", "Incheckning", "Utcheckning", "Karta", "Faciliteter", "Regler", "Fråga om detta",
       "Standard", "Deluxe", "Svit", "Familjerum", "Enkelrum", "Sovsalsplats", "Ekonomi", "Komfort", "Business", "Premium", "Minivan", "Minibuss", "Buss",
       "Wi-Fi", "Frukost", "Parkering", "Luftkonditionering", "Flygplatstransfer", "Restaurang", "Pool", "Tvätt", "Reception dygnet runt", "Familjerum", "Traditionell innergård", "Hiss", "Terrass", "Rökfria rum"],
"zh": ["房型", "车辆", "每晚", "每天", "机场接送", "人", "座", "件行李", "含早餐", "不含早餐", "空调", "入住", "退房", "地图", "设施", "政策", "咨询此项",
       "标准间", "豪华间", "套房", "家庭房", "单人间", "床位", "经济型", "舒适型", "商务型", "豪华型", "小型商务车", "中巴", "大巴",
       "无线网络", "早餐", "停车场", "空调", "机场接送", "餐厅", "泳池", "洗衣", "24小时前台", "家庭房", "传统庭院", "电梯", "露台", "无烟房"],
"hi": ["कमरों के प्रकार", "वाहन", "प्रति रात", "प्रति दिन", "एयरपोर्ट ट्रांसफ़र", "मेहमान", "सीटें", "सूटकेस", "नाश्ता शामिल", "नाश्ता नहीं", "एसी", "चेक-इन", "चेक-आउट", "नक्शा", "सुविधाएँ", "नियम", "इसके बारे में पूछें",
       "स्टैंडर्ड", "डीलक्स", "सुइट", "फ़ैमिली", "सिंगल", "डॉर्म बेड", "इकॉनमी", "कम्फ़र्ट", "बिज़नेस", "प्रीमियम", "मिनीवैन", "मिनीबस", "बस",
       "वाई-फ़ाई", "नाश्ता", "पार्किंग", "एयर कंडीशनिंग", "एयरपोर्ट ट्रांसफ़र", "रेस्तरां", "पूल", "लॉन्ड्री", "24 घंटे रिसेप्शन", "फ़ैमिली रूम", "पारंपरिक आँगन", "लिफ़्ट", "टैरेस", "धूम्रपान-निषेध कमरे"],
"ko": ["객실 유형", "차량", "1박", "1일", "공항 픽업", "명", "좌석", "캐리어", "조식 포함", "조식 불포함", "에어컨", "체크인", "체크아웃", "지도", "편의시설", "규정", "이 항목 문의",
       "스탠다드", "디럭스", "스위트", "패밀리", "싱글", "도미토리 침대", "이코노미", "컴포트", "비즈니스", "프리미엄", "미니밴", "미니버스", "버스",
       "와이파이", "조식", "주차", "에어컨", "공항 픽업", "레스토랑", "수영장", "세탁", "24시간 프런트", "패밀리룸", "전통 안뜰", "엘리베이터", "테라스", "금연 객실"],
}
for _l, _v in _T.items():
    assert len(_v) == len(_K), (_l, len(_v), len(_K))


def U(lang):
    return dict(zip(_K, _T.get(lang, _T["en"])))
