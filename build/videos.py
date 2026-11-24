# Home-page "Discover Uzbekistan" video section (YouTube, official channel "Uzbekistan Travel").
# To add a video: append (youtube_id, category, "Original title") to VIDEOS and rebuild.
from html import escape as e

VIDEOS = [
    ("ZWJuld5C_S8", "overview", "What Makes Uzbekistan So Magical? | 4K World Travel Guide"),
    ("DcZZdeb_L7k", "overview", "Uzbekistan: The Most Surprising Travel Destination in the World"),
    ("WXGfqphMlJI", "overview", "Uzbekistan: The Most Beautiful Country You've Never Heard Of"),
    ("MBb21VlupkE", "overview", "Uzbekistan. Safe travel GUARANTEED"),
    ("9rArLIzKLNs", "cities", "The Incredible City of Samarkand (Travel Guide)"),
    ("uDBjszvdI9Y", "cities", "Bukhara, Uzbekistan — Timeless Silk-Road City & Hidden Treasures"),
    ("SKr4te4tbzU", "cities", "Discovering Khorezm: The Ancient Heart of Uzbekistan"),
    ("klbNT870dHQ", "cities", "Tashkent: The Surprising Capital of Uzbekistan (Travel Guide)"),
    ("FG8esfN5Z8M", "culture", "Production of Silk in Uzbekistan"),
    ("OU_GdRCE4ds", "culture", "Rishtan ceramics"),
    ("tf4zKwh_oVc", "culture", "Louvre in desert - State Museum of Arts by I.Savitsky"),
    ("Rq2XbsnpQ_E", "nature", "Visit the mountains of Uzbekistan"),
    ("7SCu594KE-8", "nature", "Why You Should Visit Tashkent Region (Before Everyone Else Does)"),
]
CHANNEL = "https://www.youtube.com/channel/UCB1cKhxEJgvAjoANCvv403w"

L = {
 "en": ("Learn more about Uzbekistan", "Video", "Discover Uzbekistan on video", "Short films about cities, culture and nature — watch before you travel.", ("All", "Overview", "Cities", "Culture & crafts", "Nature & mountains"), "Videos from the official channel of Uzbekistan's Tourism Committee", "Watch on YouTube", "Liked it? Ask us about a tour"),
 "ru": ("Узнать больше об Узбекистане", "Видео", "Узбекистан в видео", "Короткие фильмы о городах, культуре и природе — посмотрите перед поездкой.", ("Все", "Обзор", "Города", "Культура и ремёсла", "Природа и горы"), "Видео с официального канала Комитета по туризму Узбекистана", "Смотреть на YouTube", "Понравилось? Спросите нас о туре"),
 "uz": ("O'zbekiston haqida ko'proq bilish", "Video", "O'zbekistonni video orqali kashf eting", "Shaharlar, madaniyat va tabiat haqida qisqa filmlar — sayohatdan oldin tomosha qiling.", ("Hammasi", "Umumiy", "Shaharlar", "Madaniyat va hunarmandchilik", "Tabiat va tog'lar"), "Videolar O'zbekiston Turizm qo'mitasining rasmiy kanalidan", "YouTube'da ko'rish", "Yoqdimi? Tur haqida so'rang"),
 "tr": ("Özbekistan hakkında daha fazla bilgi", "Video", "Özbekistan'ı videoyla keşfedin", "Şehirler, kültür ve doğa hakkında kısa filmler — yolculuktan önce izleyin.", ("Tümü", "Genel", "Şehirler", "Kültür ve zanaat", "Doğa ve dağlar"), "Videolar Özbekistan Turizm Komitesi'nin resmi kanalından", "YouTube'da izle", "Beğendiniz mi? Tur için bize yazın"),
 "ar": ("اعرف المزيد عن أوزبكستان", "فيديو", "اكتشف أوزبكستان بالفيديو", "أفلام قصيرة عن المدن والثقافة والطبيعة — شاهدها قبل رحلتك.", ("الكل", "نظرة عامة", "المدن", "الثقافة والحِرف", "الطبيعة والجبال"), "مقاطع من القناة الرسمية للجنة السياحة في أوزبكستان", "شاهد على يوتيوب", "أعجبك؟ اسألنا عن جولة"),
 "de": ("Mehr über Usbekistan erfahren", "Video", "Usbekistan im Video entdecken", "Kurzfilme über Städte, Kultur und Natur — vor der Reise ansehen.", ("Alle", "Überblick", "Städte", "Kultur & Handwerk", "Natur & Berge"), "Videos vom offiziellen Kanal des usbekischen Tourismuskomitees", "Auf YouTube ansehen", "Gefallen? Fragen Sie uns nach einer Tour"),
 "sv": ("Läs mer om Uzbekistan", "Video", "Upptäck Uzbekistan på video", "Korta filmer om städer, kultur och natur — se dem innan resan.", ("Alla", "Översikt", "Städer", "Kultur & hantverk", "Natur & berg"), "Videor från Uzbekistans turistkommittés officiella kanal", "Se på YouTube", "Gillade du det? Fråga oss om en resa"),
 "zh": ("了解更多乌兹别克斯坦", "视频", "通过视频探索乌兹别克斯坦", "关于城市、文化与自然的短片——出发前先看看。", ("全部", "概览", "城市", "文化与手工艺", "自然与山脉"), "视频来自乌兹别克斯坦旅游委员会官方频道", "在 YouTube 观看", "喜欢吗？向我们咨询行程"),
 "hi": ("उज़्बेकिस्तान के बारे में और जानें", "वीडियो", "वीडियो में उज़्बेकिस्तान देखें", "शहरों, संस्कृति और प्रकृति पर छोटी फ़िल्में — यात्रा से पहले देखें।", ("सभी", "परिचय", "शहर", "संस्कृति और शिल्प", "प्रकृति और पहाड़"), "वीडियो उज़्बेकिस्तान पर्यटन समिति के आधिकारिक चैनल से", "YouTube पर देखें", "पसंद आया? टूर के बारे में पूछें"),
 "ko": ("우즈베키스탄 더 알아보기", "영상", "영상으로 만나는 우즈베키스탄", "도시, 문화, 자연에 관한 짧은 영상 — 여행 전에 보세요.", ("전체", "개요", "도시", "문화·공예", "자연·산"), "우즈베키스탄 관광위원회 공식 채널 영상", "YouTube에서 보기", "마음에 드셨나요? 투어를 문의하세요"),
}
CATS = ("all", "overview", "cities", "culture", "nature")

def txt(lang):
    return L.get(lang, L["en"])

def hero_button(lang):
    return f'<a class="btn btn--video" href="#videos"><span aria-hidden="true">▶</span>{e(txt(lang)[0])}</a>'

def section(lang, own_channel=""):
    b, eyebrow, title, sub, cats, note, watch, ask = txt(lang)
    chips = "".join(f'<button type="button" class="vtab{" is-on" if c == "all" else ""}" data-vcat="{c}">{e(n)}</button>' for c, n in zip(CATS, cats))
    cards = "".join(
        f'<figure class="vcard" data-cat="{c}"><button type="button" class="vcard__play" data-yt="{vid}" aria-label="▶ {e(t)}">'
        f'<img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><i aria-hidden="true">▶</i></button>'
        f'<figcaption>{e(t)}</figcaption></figure>' for vid, c, t in VIDEOS)
    own = f' · <a href="{e(own_channel)}" target="_blank" rel="noopener">Moviy Nomad YouTube</a>' if own_channel else ""
    return f'''
  <section class="section section--sand" id="videos">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(eyebrow)}</span><h2>{e(title)}</h2><p>{e(sub)}</p></div>
      <div class="vtabs" role="tablist">{chips}</div>
      <div class="vgrid">{cards}</div>
      <p class="vnote">{e(note)} · <a href="{CHANNEL}" target="_blank" rel="noopener">{e(watch)} →</a>{own}</p>
      <p class="vask"><a class="btn btn--gold" href="#contact-us">{e(ask)} →</a></p>
    </div>
  </section>
'''
