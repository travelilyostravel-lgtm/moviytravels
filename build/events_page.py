# Moviy Nomad — "Events" page (2026-11-27): concerts, festivals, theatre, sport, official holidays in Uzbekistan.
# Data comes live from the database (public.events): iTicket.uz is read automatically every 3 hours, festivals and
# official holidays are added by the admin. Visitors can send a booking request through Moviy Nomad.
import json
from html import escape as _esc

def e(s): return _esc(str(s), quote=True)

NAV = {"en": "Events", "ru": "Афиша", "uz": "Tadbirlar", "tr": "Etkinlikler", "ar": "الفعاليات", "de": "Events", "sv": "Evenemang",
       "zh": "活动", "hi": "इवेंट्स", "ko": "이벤트"}

TXT = {
 "en": dict(eyebrow="Events in Uzbekistan", title="Concerts, festivals & events", sub="Concerts, theatre, festivals, sport and national holidays across Uzbekistan — updated automatically. Pick an event and we will arrange tickets, transfer and hotel.",
            all="All", city="City", allc="All cities", month="Month", allm="Any month", more="Show more events", none="No events match your choice yet — try another month or category.",
            from_="from", free="Free / price on request", book="Book with us", tickets="Tickets on iTicket", tba="date to be announced", official="Official", src="Source: iTicket.uz and official calendars",
            m_title="Book this event", m_sub="We will reserve tickets and can add transfer, guide or hotel. A manager replies within a few hours.", qty="Number of tickets", extra="Also arrange", x_tr="Transfer", x_ho="Hotel", x_gu="Guide",
            note="Ticket prices are the organiser's prices in Uzbek sum; the amount in your currency is approximate.", loading="Loading events…", until="until",
            cats=dict(concert="Concerts", theatre="Theatre", festival="Festivals", official="National holidays", culture="Culture", exhibition="Exhibitions", kids="Kids", sport="Sport", other="Other")),
 "ru": dict(eyebrow="Афиша Узбекистана", title="Концерты, фестивали и события", sub="Концерты, театр, фестивали, спорт и государственные праздники по всему Узбекистану — обновляется автоматически. Выберите событие — мы организуем билеты, трансфер и отель.",
            all="Все", city="Город", allc="Все города", month="Месяц", allm="Любой месяц", more="Показать ещё", none="По вашему выбору пока ничего нет — попробуйте другой месяц или категорию.",
            from_="от", free="Бесплатно / цена по запросу", book="Забронировать у нас", tickets="Билеты на iTicket", tba="дата уточняется", official="Официально", src="Источник: iTicket.uz и официальные календари",
            m_title="Бронирование события", m_sub="Мы забронируем билеты и при желании добавим трансфер, гида или отель. Менеджер ответит в течение нескольких часов.", qty="Количество билетов", extra="Также организовать", x_tr="Трансфер", x_ho="Отель", x_gu="Гид",
            note="Цены билетов — цены организатора в сумах; сумма в вашей валюте примерная.", loading="Загружаем события…", until="до",
            cats=dict(concert="Концерты", theatre="Театр", festival="Фестивали", official="Праздники", culture="Культура", exhibition="Выставки", kids="Детям", sport="Спорт", other="Другое")),
 "uz": dict(eyebrow="O'zbekiston tadbirlari", title="Konsertlar, festivallar va tadbirlar", sub="Butun O'zbekiston bo'ylab konsertlar, teatr, festivallar, sport va davlat bayramlari — avtomatik yangilanadi. Tadbirni tanlang — chipta, transfer va mehmonxonani biz tashkil qilamiz.",
            all="Hammasi", city="Shahar", allc="Barcha shaharlar", month="Oy", allm="Istalgan oy", more="Yana ko'rsatish", none="Tanlovingiz bo'yicha hozircha tadbir yo'q — boshqa oy yoki turkumni tanlang.",
            from_="dan", free="Bepul / narx so'rov bo'yicha", book="Biz orqali bron", tickets="iTicket'da chipta", tba="sana aniqlanmoqda", official="Rasmiy", src="Manba: iTicket.uz va rasmiy kalendarlar",
            m_title="Tadbirni bron qilish", m_sub="Chiptalarni bron qilamiz, xohlasangiz transfer, gid yoki mehmonxona ham qo'shamiz. Menejer bir necha soat ichida javob beradi.", qty="Chiptalar soni", extra="Yana tashkil qilish", x_tr="Transfer", x_ho="Mehmonxona", x_gu="Gid",
            note="Chipta narxlari — tashkilotchining so'mdagi narxi; sizning valyutangizdagi summa taxminiy.", loading="Tadbirlar yuklanmoqda…", until="gacha",
            cats=dict(concert="Konsertlar", theatre="Teatr", festival="Festivallar", official="Bayramlar", culture="Madaniyat", exhibition="Ko'rgazmalar", kids="Bolalar uchun", sport="Sport", other="Boshqa")),
 "tr": dict(eyebrow="Özbekistan etkinlikleri", title="Konserler, festivaller ve etkinlikler", sub="Özbekistan genelinde konserler, tiyatro, festivaller, spor ve resmi bayramlar — otomatik güncellenir. Etkinliği seçin, bilet, transfer ve oteli biz ayarlayalım.",
            all="Tümü", city="Şehir", allc="Tüm şehirler", month="Ay", allm="Herhangi bir ay", more="Daha fazla göster", none="Seçiminize uygun etkinlik yok — başka bir ay veya kategori deneyin.",
            from_="", free="Ücretsiz / fiyat talep üzerine", book="Bizimle rezerve et", tickets="iTicket'ta bilet", tba="tarih açıklanacak", official="Resmi", src="Kaynak: iTicket.uz ve resmi takvimler",
            m_title="Etkinlik rezervasyonu", m_sub="Biletleri ayırırız; isterseniz transfer, rehber veya otel de ekleriz. Yöneticimiz birkaç saat içinde yanıt verir.", qty="Bilet sayısı", extra="Ayrıca ayarla", x_tr="Transfer", x_ho="Otel", x_gu="Rehber",
            note="Bilet fiyatları organizatörün som cinsinden fiyatlarıdır; kendi para biriminizdeki tutar yaklaşıktır.", loading="Etkinlikler yükleniyor…", until="kadar",
            cats=dict(concert="Konserler", theatre="Tiyatro", festival="Festivaller", official="Resmi bayramlar", culture="Kültür", exhibition="Sergiler", kids="Çocuklar", sport="Spor", other="Diğer")),
 "ar": dict(eyebrow="فعاليات أوزبكستان", title="حفلات ومهرجانات وفعاليات", sub="حفلات ومسرح ومهرجانات ورياضة وأعياد وطنية في أنحاء أوزبكستان — تُحدَّث تلقائيًا. اختر الفعالية ونرتّب لك التذاكر والنقل والفندق.",
            all="الكل", city="المدينة", allc="كل المدن", month="الشهر", allm="أي شهر", more="عرض المزيد", none="لا توجد فعاليات مطابقة حاليًا — جرّب شهرًا أو فئة أخرى.",
            from_="من", free="مجاني / السعر عند الطلب", book="احجز عبرنا", tickets="التذاكر على iTicket", tba="الموعد سيُعلن لاحقًا", official="رسمي", src="المصدر: iTicket.uz والتقاويم الرسمية",
            m_title="حجز الفعالية", m_sub="نحجز التذاكر ويمكننا إضافة النقل أو المرشد أو الفندق. يرد المدير خلال ساعات قليلة.", qty="عدد التذاكر", extra="رتّبوا أيضًا", x_tr="النقل", x_ho="الفندق", x_gu="المرشد",
            note="أسعار التذاكر هي أسعار المنظّم بالسوم؛ المبلغ بعملتك تقريبي.", loading="جارٍ تحميل الفعاليات…", until="حتى",
            cats=dict(concert="حفلات", theatre="مسرح", festival="مهرجانات", official="أعياد وطنية", culture="ثقافة", exhibition="معارض", kids="للأطفال", sport="رياضة", other="أخرى")),
 "de": dict(eyebrow="Events in Usbekistan", title="Konzerte, Festivals & Events", sub="Konzerte, Theater, Festivals, Sport und Nationalfeiertage in ganz Usbekistan — automatisch aktualisiert. Wählen Sie ein Event, wir organisieren Tickets, Transfer und Hotel.",
            all="Alle", city="Stadt", allc="Alle Städte", month="Monat", allm="Jeder Monat", more="Mehr anzeigen", none="Noch keine passenden Events — versuchen Sie einen anderen Monat oder eine andere Kategorie.",
            from_="ab", free="Kostenlos / Preis auf Anfrage", book="Bei uns buchen", tickets="Tickets bei iTicket", tba="Datum folgt", official="Offiziell", src="Quelle: iTicket.uz und offizielle Kalender",
            m_title="Event buchen", m_sub="Wir reservieren die Tickets und ergänzen auf Wunsch Transfer, Guide oder Hotel. Antwort innerhalb weniger Stunden.", qty="Anzahl Tickets", extra="Zusätzlich organisieren", x_tr="Transfer", x_ho="Hotel", x_gu="Guide",
            note="Ticketpreise sind Veranstalterpreise in Sum; der Betrag in Ihrer Währung ist ungefähr.", loading="Events werden geladen…", until="bis",
            cats=dict(concert="Konzerte", theatre="Theater", festival="Festivals", official="Feiertage", culture="Kultur", exhibition="Ausstellungen", kids="Kinder", sport="Sport", other="Sonstiges")),
 "sv": dict(eyebrow="Evenemang i Uzbekistan", title="Konserter, festivaler & evenemang", sub="Konserter, teater, festivaler, sport och nationella helgdagar i hela Uzbekistan — uppdateras automatiskt. Välj ett evenemang så ordnar vi biljetter, transfer och hotell.",
            all="Alla", city="Stad", allc="Alla städer", month="Månad", allm="Valfri månad", more="Visa fler", none="Inga evenemang matchar ännu — prova en annan månad eller kategori.",
            from_="från", free="Gratis / pris på förfrågan", book="Boka via oss", tickets="Biljetter på iTicket", tba="datum meddelas", official="Officiellt", src="Källa: iTicket.uz och officiella kalendrar",
            m_title="Boka evenemang", m_sub="Vi reserverar biljetter och kan lägga till transfer, guide eller hotell. Svar inom några timmar.", qty="Antal biljetter", extra="Ordna även", x_tr="Transfer", x_ho="Hotell", x_gu="Guide",
            note="Biljettpriser är arrangörens priser i sum; beloppet i din valuta är ungefärligt.", loading="Laddar evenemang…", until="till",
            cats=dict(concert="Konserter", theatre="Teater", festival="Festivaler", official="Helgdagar", culture="Kultur", exhibition="Utställningar", kids="Barn", sport="Sport", other="Övrigt")),
 "zh": dict(eyebrow="乌兹别克斯坦活动", title="音乐会、节庆与活动", sub="乌兹别克斯坦各地的音乐会、戏剧、节庆、体育和国家节日——自动更新。选好活动，我们为您安排门票、接送和酒店。",
            all="全部", city="城市", allc="所有城市", month="月份", allm="任意月份", more="查看更多", none="暂无符合条件的活动——请换个月份或类别。",
            from_="起", free="免费 / 价格咨询", book="通过我们预订", tickets="在 iTicket 购票", tba="日期待定", official="官方", src="来源：iTicket.uz 及官方日历",
            m_title="预订活动", m_sub="我们为您预订门票，并可加订接送、导游或酒店。经理将在几小时内回复。", qty="门票数量", extra="同时安排", x_tr="接送", x_ho="酒店", x_gu="导游",
            note="门票价格为主办方的苏姆价格；您所选货币的金额为估算。", loading="正在加载活动…", until="至",
            cats=dict(concert="音乐会", theatre="戏剧", festival="节庆", official="国家节日", culture="文化", exhibition="展览", kids="亲子", sport="体育", other="其他")),
 "hi": dict(eyebrow="उज़्बेकिस्तान के इवेंट्स", title="कॉन्सर्ट, फ़ेस्टिवल और इवेंट्स", sub="पूरे उज़्बेकिस्तान में कॉन्सर्ट, थिएटर, फ़ेस्टिवल, खेल और राष्ट्रीय पर्व — अपने-आप अपडेट। इवेंट चुनें, टिकट, ट्रांसफ़र और होटल हम व्यवस्थित करेंगे।",
            all="सभी", city="शहर", allc="सभी शहर", month="महीना", allm="कोई भी महीना", more="और देखें", none="अभी आपकी पसंद से मेल खाता इवेंट नहीं — कोई दूसरा महीना या श्रेणी चुनें।",
            from_="से", free="निःशुल्क / कीमत अनुरोध पर", book="हमारे साथ बुक करें", tickets="iTicket पर टिकट", tba="तारीख़ घोषित होगी", official="आधिकारिक", src="स्रोत: iTicket.uz और आधिकारिक कैलेंडर",
            m_title="इवेंट बुक करें", m_sub="हम टिकट आरक्षित करेंगे और चाहें तो ट्रांसफ़र, गाइड या होटल भी जोड़ेंगे। मैनेजर कुछ घंटों में जवाब देगा।", qty="टिकटों की संख्या", extra="साथ में व्यवस्था", x_tr="ट्रांसफ़र", x_ho="होटल", x_gu="गाइड",
            note="टिकट की कीमतें आयोजक की सुम में कीमतें हैं; आपकी मुद्रा में राशि अनुमानित है।", loading="इवेंट लोड हो रहे हैं…", until="तक",
            cats=dict(concert="कॉन्सर्ट", theatre="थिएटर", festival="फ़ेस्टिवल", official="राष्ट्रीय पर्व", culture="संस्कृति", exhibition="प्रदर्शनियाँ", kids="बच्चे", sport="खेल", other="अन्य")),
 "ko": dict(eyebrow="우즈베키스탄 이벤트", title="콘서트·축제·이벤트", sub="우즈베키스탄 전역의 콘서트, 공연, 축제, 스포츠, 국경일 — 자동으로 업데이트됩니다. 이벤트를 고르시면 티켓, 송영, 호텔을 준비해 드립니다.",
            all="전체", city="도시", allc="모든 도시", month="월", allm="모든 월", more="더 보기", none="조건에 맞는 이벤트가 아직 없습니다 — 다른 월이나 분류를 선택해 보세요.",
            from_="부터", free="무료 / 가격 문의", book="저희를 통해 예약", tickets="iTicket에서 예매", tba="날짜 미정", official="공식", src="출처: iTicket.uz 및 공식 일정",
            m_title="이벤트 예약", m_sub="티켓을 예약해 드리고 원하시면 송영, 가이드, 호텔도 추가합니다. 몇 시간 안에 답변드립니다.", qty="티켓 수", extra="함께 준비", x_tr="송영", x_ho="호텔", x_gu="가이드",
            note="티켓 가격은 주최 측의 숨 가격이며, 선택한 통화 금액은 대략적인 값입니다.", loading="이벤트를 불러오는 중…", until="까지",
            cats=dict(concert="콘서트", theatre="공연", festival="축제", official="국경일", culture="문화", exhibition="전시", kids="어린이", sport="스포츠", other="기타")),
}
CITIES = {"tashkent": ("Tashkent", "Ташкент", "Toshkent"), "samarkand": ("Samarkand", "Самарканд", "Samarqand"), "bukhara": ("Bukhara", "Бухара", "Buxoro"),
          "khiva": ("Khiva", "Хива", "Xiva"), "nukus": ("Nukus", "Нукус", "Nukus"), "boysun": ("Boysun", "Байсун", "Boysun")}


def render(lang, pages, x, icon, logo, font, names):
    T = TXT.get(lang, TXT["en"])
    cats = "".join(f'<button type="button" class="evf__c" data-cat="{k}">{e(v)}</button>' for k, v in T["cats"].items())
    cities = "".join(f'<option value="{k}">{e(v[1] if lang == "ru" else v[2] if lang == "uz" else v[0])}</option>' for k, v in CITIES.items())
    body = pages.page_head("🎟", T["title"], T["sub"]) + f'''
<section class="section section--tight evs">
  <div class="container">
    <div class="evf" role="group">
      <div class="evf__cats"><button type="button" class="evf__c is-on" data-cat="">{e(T["all"])}</button>{cats}</div>
      <div class="evf__sel">
        <label><span>{e(T["city"])}</span><select id="ev-city"><option value="">{e(T["allc"])}</option>{cities}</select></label>
        <label><span>{e(T["month"])}</span><select id="ev-month"><option value="">{e(T["allm"])}</option></select></label>
      </div>
    </div>
    <div class="ev-grid" id="ev-grid" aria-live="polite"><p class="ev-load">{e(T["loading"])}</p></div>
    <p class="ev-empty" id="ev-empty" hidden>{e(T["none"])}</p>
    <div class="ev-more"><button type="button" class="btn btn--outline" id="ev-more" hidden>{e(T["more"])} ↓</button></div>
    <p class="ev-src">{e(T["src"])} · {e(T["note"])}</p>
  </div>
</section>
<div class="modal" id="ev-modal"><div class="modal__box modal__box--form">
  <button class="modal__close" aria-label="{e(x["f_close"])}">×</button>
  <h3>{e(T["m_title"])}</h3><p class="ev-m__ev" id="ev-m-ev"></p><p class="p-sub">{e(T["m_sub"])}</p>
  <form class="mf" id="ev-form" novalidate>
    <div class="mf-grid">
      <label class="mf-f"><span>{e(T["qty"])} *</span><input type="number" name="pax" min="1" max="100" value="2" required></label>
      <div class="mf-f"><span>{e(T["extra"])}</span><div class="ev-x"><label><input type="checkbox" name="x_tr"> {e(T["x_tr"])}</label><label><input type="checkbox" name="x_ho"> {e(T["x_ho"])}</label><label><input type="checkbox" name="x_gu"> {e(T["x_gu"])}</label></div></div>
      <label class="mf-f"><span>{e(x["f_name"])} *</span><input name="contact_name" required maxlength="120" autocomplete="name"></label>
      <label class="mf-f"><span>{e(x["f_email"])} *</span><input type="email" name="email" required maxlength="160" autocomplete="email" placeholder="name@example.com"></label>
      <label class="mf-f"><span>{e(x.get("f_wa_opt", x["f_phone"]))}</span><input type="tel" name="phone" maxlength="40" autocomplete="tel" placeholder="+"></label>
      <label class="mf-f"><span>{e(x["f_citizenship"])}</span><input name="citizenship" maxlength="80"></label>
      <label class="mf-f mf-f--full"><span>{e(x["f_details"])}</span><textarea name="message" rows="2" maxlength="3000"></textarea></label>
    </div>
    {pages.consent_label(lang, x)}
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["f_send"])}</button>
  </form>
</div></div>'''
    js_txt = dict(T, f_required=x["f_required"], f_sending=x["f_sending"], f_err=x["f_err"], f_ok_title=x["f_ok_title"], f_ok_text=x["f_ok_text"], f_close=x["f_close"], f_send=x["f_send"],
                  cities={k: (v[1] if lang == "ru" else v[2] if lang == "uz" else v[0]) for k, v in CITIES.items()})
    A = "" if lang == "en" else "../"
    js = f'<script>window.MNEV={json.dumps(js_txt, ensure_ascii=False)};</script><script src="{A}assets/js/events.js?v=2" defer></script>'
    return pages.shell(lang, "events.html", T["title"], T["sub"], body, icon, logo, font, names, "is-events", js)
