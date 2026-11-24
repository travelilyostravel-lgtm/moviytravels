# Home-page "Discover Uzbekistan" video section (YouTube, official channel "Uzbekistan Travel").
# To add a video: append (youtube_id, category, "Original title") to VIDEOS and rebuild.
from html import escape as e

# (youtube_id, category, title, source channel, seconds, {lang: alternative id in that language})
# Every video checked 2026-11-25: embedding allowed by the owner, status OK. Only the official
# "Uzbekistan Travel" channel (State Tourism Committee) and large international media.
UT = "Uzbekistan Travel"
VIDEOS = [
    ("y-46aImm6uA", "overview", "Welcome to Uzbekistan - the Hidden Pearl of the East!", UT, 133, {}),
    ("ZWJuld5C_S8", "overview", "What Makes Uzbekistan So Magical? | 4K World Travel Guide", UT, 120, {}),
    ("1b1kRJbY2Hw", "overview", "Exploring Uzbekistan's silk road soul, from Tashkent metro to Samarkand", "Euronews", 720, {"ru": "UPlXEaxT5-8"}),
    ("DcZZdeb_L7k", "overview", "Uzbekistan: The Most Surprising Travel Destination in the World", UT, 184, {}),
    ("MB2UFDwlBdE", "overview", "Uzbekistan: A Journey Through the Heart of Central Asia", "BBC Travel Show", 1379, {}),
    ("MDLLdttIYFs", "overview", "Uzbekistan – A Destination You Must Visit! Kel Ey Dunyo", UT, 314, {}),
    ("MBb21VlupkE", "overview", "Uzbekistan. Safe travel GUARANTEED", UT, 146, {}),
    ("d_cTQLqZttA", "overview", "Why Uzbekistan's Tourist Police Are So Nice", UT, 193, {}),
    ("9rArLIzKLNs", "cities", "The Incredible City of Samarkand (Travel Guide)", UT, 100, {}),
    ("QhaC4nHMvRM", "cities", "From Samarkand to Khiva, Uzbekistan's UNESCO landmarks trace the story of the Silk Road", "Euronews", 300, {"ru": "HSJm67e_FjI"}),
    ("uDBjszvdI9Y", "cities", "Bukhara — Timeless Silk-Road City & Hidden Treasures", UT, 93, {}),
    ("degfJSSJth4", "cities", "BUKHARA: Walking Through 2,500 Years of History", UT, 52, {}),
    ("SKr4te4tbzU", "cities", "Discovering Khorezm: The Ancient Heart of Uzbekistan", UT, 128, {}),
    ("XmHFe_CxhOQ", "cities", "The Most Magical Air Balloon Ride Over Khiva!", UT, 139, {}),
    ("klbNT870dHQ", "cities", "Tashkent: The Surprising Capital of Uzbekistan (Travel Guide)", UT, 143, {}),
    ("ZeZh7koECRE", "cities", "Tashkent at Night from Drone | 4K", UT, 31, {}),
    ("eIll3G4y8eg", "cities", "When the city lights up: discovering Uzbekistan after sunset", "Euronews", 300, {}),
    ("Rq2XbsnpQ_E", "nature", "Visit the mountains of Uzbekistan", UT, 104, {}),
    ("8pnRv_j4zEc", "nature", "Winter Wonderland in Chimgan Mountains | 4K", UT, 33, {}),
    ("PjFOds0MEF4", "nature", "How Uzbekistan is turning winter into a travel season", "Euronews", 300, {}),
    ("7SCu594KE-8", "nature", "Why You Should Visit Tashkent Region (Before Everyone Else Does)", UT, 128, {}),
    ("rWIcCxeZshU", "nature", "Inside Gelon: The Most Unique Mountain Village in Uzbekistan | 4K", UT, 165, {}),
    ("tp_W35NWcCg", "nature", "Nanay Village — A Hidden Green Paradise in Uzbekistan's Mountains | 4K", UT, 50, {}),
    ("9KB7RUyFlhY", "nature", "Karakalpakstan — Uzbekistan's Land of Contrasts", UT, 85, {}),
    ("MpAdIxsPqUs", "nature", "Legends of Uzbekistan – 8 Epic Desert Fortresses in One Journey", UT, 236, {}),
    ("tDQ3WafmmWM", "food", "Silk Road cuisine: from Tashkent's markets to mountain flavours in Parkent", "Euronews", 300, {}),
    ("-_BYf5LNmj0", "food", "From Earth to table: following Uzbekistan's seasonal harvests", "Euronews", 300, {}),
    ("_cGn8Ja4-RA", "food", "How 350 Kilogram Batches Of Plov Are Cooked Daily In Uzbekistan", "Insider Food", 492, {}),
    ("dlnkQBAY2SE", "food", "How 3,000 Legendary Samsas Are Baked Daily In Uzbekistan", "Insider Food", 556, {}),
    ("N3uXw6sRzDI", "food", "What Is Uzbek Food?", "Eater", 421, {}),
    ("tGZmbefI0DM", "food", "Learn how to cook chuzma lagman with Uzbek chef Bakhridin Chusti", "Euronews", 180, {}),
    ("1ExRIgtBe3Y", "culture", "A Culture of Respect Starts Early", UT, 106, {}),
    ("IhZ9x56Wdd0", "culture", "Fergana Valley: A cultural oasis on the Great Silk Road", "Euronews", 300, {}),
    ("FG8esfN5Z8M", "culture", "Production of Silk in Uzbekistan", UT, 184, {}),
    ("OU_GdRCE4ds", "culture", "Rishtan ceramics", UT, 189, {}),
    ("SkVH-JDb7_w", "culture", "A Lifetime Shaped in Clay | Inside a Traditional Pottery Studio", UT, 55, {}),
    ("d8EwvjW5St0", "culture", "The Islamic Civilization Centre: a modern masterpiece of Central Asia", "Euronews", 300, {}),
    ("RGM4AAfsvJ4", "culture", "Uloq Kopkari – The Most Intense Horseback Game!", UT, 26, {}),
    ("tf4zKwh_oVc", "culture", "Louvre in the desert - State Museum of Arts by I. Savitsky", UT, 131, {}),
]
CHANNEL = "https://www.youtube.com/channel/UCB1cKhxEJgvAjoANCvv403w"

L = {
 'en': ('Learn more about Uzbekistan', 'Video', 'Discover Uzbekistan on video', 'Short films about cities, culture and nature — watch before you travel.', ('All', 'Overview', 'Cities', 'Mountains & deserts', 'Food, fruit & bazaars', 'Culture & traditions'), "Videos from the official channel of Uzbekistan's Tourism Committee and international media (Euronews, BBC, Insider, Eater)", 'Watch on YouTube', 'Liked it? Ask us about a tour'),
 'ru': ('Узнать больше об Узбекистане', 'Видео', 'Узбекистан в видео', 'Короткие фильмы о городах, культуре и природе — посмотрите перед поездкой.', ('Все', 'Обзор', 'Города', 'Горы и пустыни', 'Еда, фрукты и базары', 'Культура и традиции'), 'Видео с официального канала Комитета по туризму Узбекистана и международных СМИ (Euronews, BBC, Insider, Eater)', 'Смотреть на YouTube', 'Понравилось? Спросите нас о туре'),
 'uz': ("O'zbekiston haqida ko'proq bilish", 'Video', "O'zbekistonni video orqali kashf eting", 'Shaharlar, madaniyat va tabiat haqida qisqa filmlar — sayohatdan oldin tomosha qiling.', ('Hammasi', 'Umumiy', 'Shaharlar', "Tog'lar va cho'llar", 'Taomlar, mevalar va bozorlar', 'Madaniyat va qadriyatlar'), "Videolar O'zbekiston Turizm qo'mitasining rasmiy kanalidan va xalqaro OAVdan (Euronews, BBC, Insider, Eater)", "YouTube'da ko'rish", "Yoqdimi? Tur haqida so'rang"),
 'tr': ('Özbekistan hakkında daha fazla bilgi', 'Video', "Özbekistan'ı videoyla keşfedin", 'Şehirler, kültür ve doğa hakkında kısa filmler — yolculuktan önce izleyin.', ('Tümü', 'Genel', 'Şehirler', 'Dağlar ve çöller', 'Yemek, meyve ve pazarlar', 'Kültür ve gelenekler'), "Videolar Özbekistan Turizm Komitesi'nin resmi kanalından ve uluslararası medyadan (Euronews, BBC, Insider, Eater)", "YouTube'da izle", 'Beğendiniz mi? Tur için bize yazın'),
 'ar': ('اعرف المزيد عن أوزبكستان', 'فيديو', 'اكتشف أوزبكستان بالفيديو', 'أفلام قصيرة عن المدن والثقافة والطبيعة — شاهدها قبل رحلتك.', ('الكل', 'نظرة عامة', 'المدن', 'الجبال والصحاري', 'الطعام والفواكه والأسواق', 'الثقافة والتقاليد'), 'مقاطع من القناة الرسمية للجنة السياحة في أوزبكستان ووسائل إعلام دولية (Euronews وBBC وInsider وEater)', 'شاهد على يوتيوب', 'أعجبك؟ اسألنا عن جولة'),
 'de': ('Mehr über Usbekistan erfahren', 'Video', 'Usbekistan im Video entdecken', 'Kurzfilme über Städte, Kultur und Natur — vor der Reise ansehen.', ('Alle', 'Überblick', 'Städte', 'Berge & Wüsten', 'Essen, Obst & Basare', 'Kultur & Traditionen'), 'Videos vom offiziellen Kanal des usbekischen Tourismuskomitees und internationaler Medien (Euronews, BBC, Insider, Eater)', 'Auf YouTube ansehen', 'Gefallen? Fragen Sie uns nach einer Tour'),
 'sv': ('Läs mer om Uzbekistan', 'Video', 'Upptäck Uzbekistan på video', 'Korta filmer om städer, kultur och natur — se dem innan resan.', ('Alla', 'Översikt', 'Städer', 'Berg & öknar', 'Mat, frukt & basarer', 'Kultur & traditioner'), 'Videor från Uzbekistans turistkommittés officiella kanal och internationella medier (Euronews, BBC, Insider, Eater)', 'Se på YouTube', 'Gillade du det? Fråga oss om en resa'),
 'zh': ('了解更多乌兹别克斯坦', '视频', '通过视频探索乌兹别克斯坦', '关于城市、文化与自然的短片——出发前先看看。', ('全部', '概览', '城市', '山脉与沙漠', '美食、水果与集市', '文化与传统'), '视频来自乌兹别克斯坦旅游委员会官方频道及国际媒体（Euronews、BBC、Insider、Eater）', '在 YouTube 观看', '喜欢吗？向我们咨询行程'),
 'hi': ('उज़्बेकिस्तान के बारे में और जानें', 'वीडियो', 'वीडियो में उज़्बेकिस्तान देखें', 'शहरों, संस्कृति और प्रकृति पर छोटी फ़िल्में — यात्रा से पहले देखें।', ('सभी', 'परिचय', 'शहर', 'पहाड़ और रेगिस्तान', 'खाना, फल और बाज़ार', 'संस्कृति और परंपराएँ'), 'वीडियो उज़्बेकिस्तान पर्यटन समिति के आधिकारिक चैनल और अंतरराष्ट्रीय मीडिया (Euronews, BBC, Insider, Eater) से', 'YouTube पर देखें', 'पसंद आया? टूर के बारे में पूछें'),
 'ko': ('우즈베키스탄 더 알아보기', '영상', '영상으로 만나는 우즈베키스탄', '도시, 문화, 자연에 관한 짧은 영상 — 여행 전에 보세요.', ('전체', '개요', '도시', '산과 사막', '음식·과일·시장', '문화와 전통'), '우즈베키스탄 관광위원회 공식 채널 및 국제 언론(Euronews, BBC, Insider, Eater) 영상', 'YouTube에서 보기', '마음에 드셨나요? 투어를 문의하세요'),
}
MORE = {
 "en": ("All videos", "See all {n} videos", "Videos about Uzbekistan", "Liked a place? Ask us about a tour", "Subscribe to new videos and tours"),
 "ru": ("Все видео", "Смотреть все {n} видео", "Видео об Узбекистане", "Понравилось место? Спросите нас о туре", "Подписаться на новые видео и туры"),
 "uz": ("Barcha videolar", "Barcha {n} ta videoni ko'rish", "O'zbekiston haqida videolar", "Joy yoqdimi? Tur haqida bizga yozing", "Yangi video va turlarga obuna bo'lish"),
 "tr": ("Tüm videolar", "{n} videonun tümünü gör", "Özbekistan videoları", "Bir yeri beğendiniz mi? Tur için bize yazın", "Yeni video ve turlara abone olun"),
 "ar": ("كل الفيديوهات", "شاهد كل الفيديوهات ({n})", "فيديوهات عن أوزبكستان", "أعجبك مكان؟ اسألنا عن جولة", "اشترك لتصلك الفيديوهات والجولات الجديدة"),
 "de": ("Alle Videos", "Alle {n} Videos ansehen", "Videos über Usbekistan", "Ein Ort gefällt Ihnen? Fragen Sie nach einer Tour", "Neue Videos und Touren abonnieren"),
 "sv": ("Alla videor", "Se alla {n} videor", "Videor om Uzbekistan", "Gillade du en plats? Fråga oss om en resa", "Prenumerera på nya videor och resor"),
 "zh": ("全部视频", "查看全部 {n} 个视频", "乌兹别克斯坦视频", "喜欢某个地方？向我们咨询行程", "订阅新视频和新线路"),
 "hi": ("सभी वीडियो", "सभी {n} वीडियो देखें", "उज़्बेकिस्तान के वीडियो", "कोई जगह पसंद आई? टूर के बारे में पूछें", "नए वीडियो और टूर की सदस्यता लें"),
 "ko": ("모든 영상", "영상 {n}개 모두 보기", "우즈베키스탄 영상", "마음에 드는 곳이 있나요? 투어를 문의하세요", "새 영상과 투어 구독하기"),
}
HOME_LIMIT = 6

CATS = ("all", "overview", "cities", "nature", "food", "culture")

def txt(lang):
    return L.get(lang, L["en"])

def hero_button(lang):
    return f'<a class="btn btn--video" href="#videos"><span aria-hidden="true">▶</span>{e(txt(lang)[0])}</a>'

def section(lang, own_channel="", home=True, contact=""):
    b, eyebrow, title, sub, cats, note, watch, ask = txt(lang)
    chips = "".join(f'<button type="button" class="vtab{" is-on" if c == "all" else ""}" data-vcat="{c}">{e(n)}</button>' for c, n in zip(CATS, cats))
    def dur(sec):
        return f"{sec // 60}:{sec % 60:02d}" if sec < 3600 else f"{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}"
    cards = "".join(
        f'<figure class="vcard" data-cat="{c}" data-free><button type="button" class="vcard__play" data-yt="{alt.get(lang, vid)}" aria-label="▶ {e(t)}">'
        f'<img src="https://i.ytimg.com/vi/{alt.get(lang, vid)}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><i aria-hidden="true">▶</i><b class="vcard__dur">{dur(sec)}</b></button>'
        f'<figcaption>{e(t)}<small>{e(src)}</small></figcaption></figure>' for vid, c, t, src, sec, alt in VIDEOS)
    M = MORE.get(lang, MORE["en"])
    if home:
        # "All" tab on the home page: first 6 videos + a tile that opens the separate video page
        idx = [0]
        def lim(m):
            idx[0] += 1
            return m.group(0) if idx[0] <= HOME_LIMIT else m.group(0).replace('data-free>', 'data-free data-over hidden>', 1)
        import re as _re
        cards = _re.sub(r'<figure class="vcard"[^>]*>', lim, cards)
        cards += (f'<a class="vmore" href="videos.html" data-free><span class="vmore__ico" aria-hidden="true">▶</span>'
                  f'<b>{e(M[1].replace("{n}", str(len(VIDEOS))))}</b><i aria-hidden="true">→</i></a>')
    own = f' · <a href="{e(own_channel)}" target="_blank" rel="noopener">Moviy Nomad YouTube</a>' if own_channel else ""
    return f'''
  <section class="section section--sand{"" if home else " vpage"}" id="videos"{"" if home else " data-sub-trigger"}>
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(eyebrow)}</span><h2>{e(title)}</h2><p>{e(sub)}</p></div>
      <div class="vtabs" role="tablist" data-free>{chips}</div>
      <div class="vgrid" data-home="{1 if home else 0}">{cards}</div>
      <p class="vnote">{e(note)} · <a href="{CHANNEL}" target="_blank" rel="noopener">{e(watch)} →</a>{own}</p>
      <p class="vask">{('<a class="btn btn--gold" href="#contact-us">' + e(ask) + ' →</a>') if home else contact}</p>
    </div>
  </section>
'''


def page(lang, cfg, icon):
    """Separate page with ONLY the videos (+ contact / subscribe), no other site sections."""
    b, eyebrow, title, sub, cats, note, watch, ask = txt(lang)
    M = MORE.get(lang, MORE["en"])
    contact = (f'<a class="btn btn--wa" href="https://wa.me/{cfg["whatsapp"]}" target="_blank" rel="noopener">{icon["wa"]}WhatsApp</a> '
               f'<a class="btn btn--tg" href="https://t.me/{cfg["telegram"]}" target="_blank" rel="noopener">{icon["tg"]}Telegram</a> '
               f'<button type="button" class="btn btn--outline" data-sub-open data-free>🔔 {e(M[4])}</button>'
               f'<span class="vask__lead">{e(M[3])}</span>')
    return section(lang, cfg.get("youtube", ""), home=False, contact=contact)
