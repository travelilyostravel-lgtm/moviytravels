"""eSIM page (27.11.2026): tourist picks a plan here and buys it at our partner Qulay SIM.
Qulay SIM is the seller (payment, QR, support, refunds); we only send the tourist with a tracked link.
LIVE = False keeps the page out of the menu, sitemap and Google until the partner link and plans are ready."""
import json
from html import escape as _esc

LIVE = False

def e(s): return _esc(str(s), quote=True)

NAV = {"en": "eSIM internet", "ru": "eSIM интернет", "uz": "eSIM internet", "tr": "eSIM internet", "ar": "إنترنت eSIM", "de": "eSIM-Internet",
       "sv": "eSIM-internet", "zh": "eSIM 上网", "hi": "eSIM इंटरनेट", "ko": "eSIM 인터넷"}

_EN = dict(
    title="eSIM for Uzbekistan — internet from the moment you land", sub="Buy before your flight, install with a QR code, and your phone is online as soon as you land in Tashkent, Samarkand or Urgench. No SIM shop, no passport queue.",
    how="How it works", s1="Choose a plan", s1d="Pick how many GB and days you need for your trip.", s2="Buy online", s2d="Pay on the page of our official partner Qulay SIM and get a QR code by e-mail.",
    s3="Land and go online", s3d="Scan the QR code before the flight. After landing, switch on the eSIM — internet works right away.",
    plans="Plans for Uzbekistan", gb="GB", days="days", unl="Unlimited", buy="Buy eSIM", pop="Popular", per="for",
    soon="eSIM plans are being added — check back very soon.", promo="Promo code", seller="Sold and supported by our official partner Qulay SIM: payment, QR code, help and refunds are handled by Qulay SIM.",
    q1="Does my phone support eSIM?", a1="Most phones from 2019 onward do (iPhone XS and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer). The phone must be unlocked. Check: Settings → Mobile data → Add eSIM.",
    q2="When should I install it?", a2="Install it at home over Wi-Fi a day or two before the flight, and switch it on after landing. Your home SIM can stay in the phone.",
    q3="Can I keep my WhatsApp number?", a3="Yes. WhatsApp and Telegram keep working on your usual number; the eSIM only gives you local internet.",
    go="Opening Qulay SIM…")

TXT = {
 "en": _EN,
 "ru": dict(_EN, title="eSIM для Узбекистана — интернет сразу после посадки", sub="Купите до вылета, установите по QR-коду — и телефон в сети, как только вы приземлитесь в Ташкенте, Самарканде или Ургенче. Без салона связи и очереди с паспортом.",
   how="Как это работает", s1="Выберите тариф", s1d="Сколько ГБ и дней нужно на поездку.", s2="Купите онлайн", s2d="Оплата на странице нашего официального партнёра Qulay SIM, QR-код придёт на e-mail.",
   s3="Приземлились — и в сети", s3d="Отсканируйте QR-код до вылета. После посадки включите eSIM — интернет работает сразу.",
   plans="Тарифы для Узбекистана", gb="ГБ", days="дн.", unl="Безлимит", buy="Купить eSIM", pop="Популярный", per="на",
   soon="Тарифы eSIM добавляются — загляните совсем скоро.", promo="Промокод", seller="Продаёт и поддерживает наш официальный партнёр Qulay SIM: оплата, QR-код, помощь и возвраты — на стороне Qulay SIM.",
   q1="Поддерживает ли мой телефон eSIM?", a1="Большинство телефонов с 2019 года (iPhone XS и новее, Samsung Galaxy S20 и новее, Google Pixel 3 и новее). Телефон должен быть без привязки к оператору. Проверка: Настройки → Сотовая связь → Добавить eSIM.",
   q2="Когда устанавливать?", a2="Дома по Wi-Fi за день-два до вылета, а включить после посадки. Домашняя SIM может оставаться в телефоне.",
   q3="Останется ли мой номер в WhatsApp?", a3="Да. WhatsApp и Telegram работают на вашем обычном номере, eSIM даёт только местный интернет.", go="Открываем Qulay SIM…"),
 "uz": dict(_EN, title="O'zbekiston uchun eSIM — qo'nishingiz bilan internet", sub="Uchishdan oldin sotib oling, QR-kod bilan o'rnating — Toshkent, Samarqand yoki Urganchga qo'nishingiz bilan telefoningiz internetda. Aloqa do'koni va pasport navbatisiz.",
   how="Qanday ishlaydi", s1="Tarifni tanlang", s1d="Safaringizga necha GB va necha kun kerak.", s2="Onlayn sotib oling", s2d="To'lov rasmiy hamkorimiz Qulay SIM sahifasida, QR-kod e-mailga keladi.",
   s3="Qo'ndingiz — internetdasiz", s3d="QR-kodni uchishdan oldin skanerlang. Qo'ngach eSIM'ni yoqing — internet darhol ishlaydi.",
   plans="O'zbekiston tariflari", gb="GB", days="kun", unl="Cheksiz", buy="eSIM sotib olish", pop="Ommabop", per="",
   soon="eSIM tariflari qo'shilmoqda — tez orada qayta kiring.", promo="Promo-kod", seller="Sotuvchi va yordam — rasmiy hamkorimiz Qulay SIM: to'lov, QR-kod, yordam va pulni qaytarish Qulay SIM tomonidan.",
   q1="Telefonim eSIM'ni qo'llaydimi?", a1="2019-yildan keyingi ko'p telefonlar qo'llaydi (iPhone XS va yangilari, Samsung Galaxy S20 va yangilari, Google Pixel 3 va yangilari). Telefon operatorga bog'lanmagan bo'lishi kerak. Tekshirish: Sozlamalar → Mobil aloqa → eSIM qo'shish.",
   q2="Qachon o'rnatish kerak?", a2="Uyda Wi-Fi orqali uchishdan 1–2 kun oldin o'rnating, qo'ngach yoqing. O'z SIM kartangiz telefonda qolaveradi.",
   q3="WhatsApp raqamim saqlanadimi?", a3="Ha. WhatsApp va Telegram odatiy raqamingizda ishlaydi, eSIM faqat mahalliy internet beradi.", go="Qulay SIM ochilmoqda…"),
 "tr": dict(_EN, title="Özbekistan için eSIM — iner inmez internet", sub="Uçuştan önce satın alın, QR kodla kurun; Taşkent, Semerkant veya Ürgenç'e indiğiniz anda telefonunuz internette.",
   how="Nasıl çalışır", s1="Paket seçin", s1d="Seyahatiniz için kaç GB ve kaç gün gerektiğini seçin.", s2="Online satın alın", s2d="Ödeme resmi ortağımız Qulay SIM'in sayfasında, QR kod e-postanıza gelir.",
   s3="İnin ve bağlanın", s3d="QR kodu uçuştan önce okutun. İnişten sonra eSIM'i açın, internet hemen çalışır.",
   plans="Özbekistan paketleri", gb="GB", days="gün", unl="Sınırsız", buy="eSIM satın al", pop="Popüler", per="",
   soon="eSIM paketleri ekleniyor — çok yakında tekrar bakın.", promo="Promosyon kodu", seller="Satış ve destek resmi ortağımız Qulay SIM'e aittir: ödeme, QR kod, yardım ve iadeler Qulay SIM tarafından yapılır.",
   q1="Telefonum eSIM destekliyor mu?", a1="2019 sonrası çoğu telefon destekler (iPhone XS ve üstü, Samsung Galaxy S20 ve üstü, Google Pixel 3 ve üstü). Telefon operatör kilitsiz olmalı.",
   q2="Ne zaman kurmalıyım?", a2="Uçuştan 1–2 gün önce evde Wi-Fi ile kurun, inişten sonra açın.", q3="WhatsApp numaram kalır mı?", a3="Evet. WhatsApp ve Telegram normal numaranızla çalışır; eSIM sadece yerel internet sağlar.", go="Qulay SIM açılıyor…"),
 "ar": dict(_EN, title="شريحة eSIM لأوزبكستان — إنترنت فور الهبوط", sub="اشترِها قبل السفر وثبّتها برمز QR، وسيكون هاتفك متصلاً فور هبوطك في طشقند أو سمرقند أو أورغنتش.",
   how="كيف تعمل", s1="اختر الباقة", s1d="كم غيغابايت وكم يوماً تحتاج لرحلتك.", s2="اشترِ عبر الإنترنت", s2d="الدفع على صفحة شريكنا الرسمي Qulay SIM ويصلك رمز QR بالبريد.",
   s3="اهبط واتصل", s3d="امسح رمز QR قبل السفر، وبعد الهبوط فعّل الشريحة فيعمل الإنترنت فوراً.",
   plans="باقات أوزبكستان", gb="غيغابايت", days="يوم", unl="غير محدود", buy="شراء eSIM", pop="الأكثر طلباً", per="",
   soon="تتم إضافة الباقات — عُد قريباً جداً.", promo="رمز ترويجي", seller="البائع والدعم: شريكنا الرسمي Qulay SIM — الدفع ورمز QR والمساعدة والاسترداد لدى Qulay SIM.",
   q1="هل يدعم هاتفي eSIM؟", a1="معظم الهواتف منذ 2019 (iPhone XS وأحدث، Samsung Galaxy S20 وأحدث، Google Pixel 3 وأحدث)، ويجب أن يكون الهاتف غير مقفل.",
   q2="متى أثبّتها؟", a2="في المنزل عبر Wi-Fi قبل السفر بيوم أو يومين، وفعّلها بعد الهبوط.", q3="هل يبقى رقمي على واتساب؟", a3="نعم، يعمل واتساب وتيليغرام برقمك المعتاد، والشريحة توفر الإنترنت المحلي فقط.", go="جارٍ فتح Qulay SIM…"),
 "de": dict(_EN, title="eSIM für Usbekistan — Internet ab der Landung", sub="Vor dem Flug kaufen, per QR-Code installieren — und Ihr Handy ist online, sobald Sie in Taschkent, Samarkand oder Urgentsch landen.",
   how="So funktioniert's", s1="Tarif wählen", s1d="Wie viele GB und Tage Sie für die Reise brauchen.", s2="Online kaufen", s2d="Bezahlung auf der Seite unseres offiziellen Partners Qulay SIM, QR-Code per E-Mail.",
   s3="Landen und online sein", s3d="QR-Code vor dem Flug scannen, nach der Landung eSIM einschalten — das Internet läuft sofort.",
   plans="Tarife für Usbekistan", gb="GB", days="Tage", unl="Unbegrenzt", buy="eSIM kaufen", pop="Beliebt", per="",
   soon="Die eSIM-Tarife werden gerade eingestellt — schauen Sie bald wieder vorbei.", promo="Gutscheincode", seller="Verkauf und Support durch unseren offiziellen Partner Qulay SIM: Zahlung, QR-Code, Hilfe und Erstattungen übernimmt Qulay SIM.",
   q1="Unterstützt mein Handy eSIM?", a1="Die meisten Geräte ab 2019 (iPhone XS und neuer, Samsung Galaxy S20 und neuer, Google Pixel 3 und neuer). Das Gerät muss entsperrt sein.",
   q2="Wann installieren?", a2="1–2 Tage vor dem Flug zu Hause per WLAN, nach der Landung einschalten.", q3="Bleibt meine WhatsApp-Nummer?", a3="Ja. WhatsApp und Telegram laufen weiter mit Ihrer Nummer; die eSIM liefert nur lokales Internet.", go="Qulay SIM wird geöffnet…"),
 "sv": dict(_EN, title="eSIM för Uzbekistan — internet direkt när du landar", sub="Köp före resan, installera med QR-kod — telefonen är uppkopplad så fort du landar i Tasjkent, Samarkand eller Urgench.",
   how="Så funkar det", s1="Välj paket", s1d="Hur många GB och dagar du behöver.", s2="Köp online", s2d="Betalning hos vår officiella partner Qulay SIM, QR-koden kommer via e-post.",
   s3="Landa och surfa", s3d="Skanna QR-koden före resan och slå på eSIM efter landning — internet fungerar direkt.",
   plans="Paket för Uzbekistan", gb="GB", days="dagar", unl="Obegränsat", buy="Köp eSIM", pop="Populär", per="",
   soon="eSIM-paketen läggs upp — titta in snart igen.", promo="Rabattkod", seller="Säljs och supportas av vår officiella partner Qulay SIM: betalning, QR-kod, hjälp och återbetalning sköts av Qulay SIM.",
   q1="Stöder min telefon eSIM?", a1="De flesta telefoner från 2019 (iPhone XS och nyare, Samsung Galaxy S20 och nyare, Google Pixel 3 och nyare). Telefonen måste vara olåst.",
   q2="När ska jag installera?", a2="Hemma via Wi-Fi 1–2 dagar före resan, slå på efter landning.", q3="Behåller jag mitt WhatsApp-nummer?", a3="Ja. WhatsApp och Telegram fungerar med ditt vanliga nummer; eSIM ger bara lokalt internet.", go="Öppnar Qulay SIM…"),
 "zh": dict(_EN, title="乌兹别克斯坦 eSIM——落地即上网", sub="出发前购买，扫码安装，在塔什干、撒马尔罕或乌尔根奇落地即可上网，无需排队办卡。",
   how="使用方法", s1="选择套餐", s1d="按行程选择流量和天数。", s2="在线购买", s2d="在我们的官方合作伙伴 Qulay SIM 页面付款，二维码发送到邮箱。",
   s3="落地上网", s3d="出发前扫描二维码，落地后开启 eSIM，即可上网。",
   plans="乌兹别克斯坦套餐", gb="GB", days="天", unl="无限流量", buy="购买 eSIM", pop="热门", per="",
   soon="eSIM 套餐正在上架，请稍后再来。", promo="优惠码", seller="由官方合作伙伴 Qulay SIM 销售并提供支持：付款、二维码、帮助和退款均由 Qulay SIM 负责。",
   q1="我的手机支持 eSIM 吗？", a1="2019 年以后的大多数手机都支持（iPhone XS 及以上、三星 Galaxy S20 及以上、Google Pixel 3 及以上），手机需为无锁版。",
   q2="什么时候安装？", a2="出发前 1–2 天在家用 Wi-Fi 安装，落地后开启。", q3="WhatsApp 号码会保留吗？", a3="会。WhatsApp 和 Telegram 继续使用您原来的号码，eSIM 只提供当地网络。", go="正在打开 Qulay SIM…"),
 "hi": dict(_EN, title="उज़्बेकिस्तान के लिए eSIM — उतरते ही इंटरनेट", sub="उड़ान से पहले खरीदें, QR कोड से इंस्टॉल करें — ताशकंद, समरकंद या उर्गेंच में उतरते ही फ़ोन ऑनलाइन।",
   how="कैसे काम करता है", s1="प्लान चुनें", s1d="यात्रा के लिए कितने GB और दिन चाहिए।", s2="ऑनलाइन खरीदें", s2d="हमारे आधिकारिक पार्टनर Qulay SIM के पेज पर भुगतान, QR कोड ई-मेल पर।",
   s3="उतरें और ऑनलाइन हों", s3d="उड़ान से पहले QR स्कैन करें, उतरने के बाद eSIM चालू करें — इंटरनेट तुरंत चलेगा।",
   plans="उज़्बेकिस्तान के प्लान", gb="GB", days="दिन", unl="अनलिमिटेड", buy="eSIM खरीदें", pop="लोकप्रिय", per="",
   soon="eSIM प्लान जोड़े जा रहे हैं — जल्द ही फिर देखें।", promo="प्रोमो कोड", seller="बिक्री और सहायता हमारे आधिकारिक पार्टनर Qulay SIM द्वारा: भुगतान, QR कोड, मदद और रिफंड Qulay SIM संभालता है।",
   q1="क्या मेरा फ़ोन eSIM सपोर्ट करता है?", a1="2019 के बाद के ज़्यादातर फ़ोन (iPhone XS और नए, Samsung Galaxy S20 और नए, Google Pixel 3 और नए)। फ़ोन अनलॉक होना चाहिए।",
   q2="कब इंस्टॉल करें?", a2="उड़ान से 1–2 दिन पहले घर पर Wi-Fi से, और उतरने के बाद चालू करें।", q3="क्या मेरा WhatsApp नंबर रहेगा?", a3="हाँ। WhatsApp और Telegram आपके सामान्य नंबर पर चलते रहेंगे; eSIM सिर्फ़ लोकल इंटरनेट देता है।", go="Qulay SIM खुल रहा है…"),
 "ko": dict(_EN, title="우즈베키스탄 eSIM — 도착하자마자 인터넷", sub="출국 전에 구매하고 QR 코드로 설치하세요. 타슈켄트, 사마르칸트, 우르겐치에 도착하는 순간 인터넷이 연결됩니다.",
   how="이용 방법", s1="요금제 선택", s1d="여행에 필요한 데이터와 기간을 고르세요.", s2="온라인 구매", s2d="공식 파트너 Qulay SIM 페이지에서 결제하고 QR 코드를 이메일로 받습니다.",
   s3="도착 후 바로 연결", s3d="출국 전에 QR 코드를 스캔하고, 도착 후 eSIM을 켜면 바로 인터넷이 됩니다.",
   plans="우즈베키스탄 요금제", gb="GB", days="일", unl="무제한", buy="eSIM 구매", pop="인기", per="",
   soon="eSIM 요금제를 준비 중입니다. 곧 다시 확인해 주세요.", promo="프로모션 코드", seller="판매 및 지원: 공식 파트너 Qulay SIM — 결제, QR 코드, 고객 지원, 환불은 Qulay SIM이 담당합니다.",
   q1="제 휴대폰이 eSIM을 지원하나요?", a1="2019년 이후 대부분의 휴대폰이 지원합니다(iPhone XS 이상, 삼성 Galaxy S20 이상, Google Pixel 3 이상). 언락폰이어야 합니다.",
   q2="언제 설치하나요?", a2="출국 1–2일 전 집에서 Wi-Fi로 설치하고, 도착 후 켜세요.", q3="WhatsApp 번호는 유지되나요?", a3="네. WhatsApp과 Telegram은 기존 번호로 계속 사용되며, eSIM은 현지 인터넷만 제공합니다.", go="Qulay SIM을 여는 중…"),
}

def render(lang, pages, x, icon, logo, font, names):
    T = TXT.get(lang, TXT["en"])
    qa = [(T["q1"], T["a1"]), (T["q2"], T["a2"]), (T["q3"], T["a3"])]
    faq = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in qa)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
    steps = "".join(f'<div class="es-step"><b>{i}</b><h3>{e(T[f"s{i}"])}</h3><p>{e(T[f"s{i}d"])}</p></div>' for i in (1, 2, 3))
    body = pages.page_head("📶", T["title"], T["sub"]) + f'''
<section class="section section--tight es">
  <div class="container">
    <h2 class="es-h">{e(T["how"])}</h2>
    <div class="es-steps">{steps}</div>
    <h2 class="es-h" id="plans">{e(T["plans"])}</h2>
    <div class="es-grid" id="es-grid" aria-live="polite"><p class="ev-load">…</p></div>
    <p class="es-soon" id="es-soon" hidden>{e(T["soon"])}</p>
    <p class="es-promo" id="es-promo" hidden></p>
    <p class="es-seller">🤝 {e(T["seller"])}</p>
    <div class="fd-faq es-faq">{faq}</div>
  </div>
</section>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>'''
    A = "" if lang == "en" else "../"
    js = f'<script>window.MNESIM={json.dumps(T, ensure_ascii=False)};</script><script src="{A}assets/js/esim.js?v=1" defer></script>'
    html = pages.shell(lang, "esim.html", T["title"], T["sub"], body, icon, logo, font, names, "is-esim", js)
    if not LIVE:
        html = html.replace('<meta name="theme-color"', '<meta name="robots" content="noindex, nofollow"><meta name="theme-color"', 1)
    return html
