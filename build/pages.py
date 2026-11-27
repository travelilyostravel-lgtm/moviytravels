# -*- coding: utf-8 -*-
"""Extra public pages: services, booking, travellers' stories, privacy, terms + homepage trust blocks."""
import hashlib as _hl, pathlib as _pl
CSSV = _hl.md5((_pl.Path(__file__).resolve().parent.parent / "assets/css/site.css").read_bytes()).hexdigest()[:8]
import html, importlib.util, json, os
from content import CONFIG, LANGS, T

e = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))
_X = {}


def X(lang):
    """Texts for the new pages; any key missing in a language falls back to English."""
    if lang not in _X:
        def load(l):
            p = os.path.join(HERE, "lx", l + ".py")
            if not os.path.exists(p): return {}
            spec = importlib.util.spec_from_file_location("lx_" + l, p); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
            return m.X
        base = load("en"); loc = load(lang) if lang != "en" else {}
        d = dict(base); d.update(loc); _X[lang] = d
    return _X[lang]


def missing_keys(lang):
    p = os.path.join(HERE, "lx", lang + ".py")
    if lang == "en" or not os.path.exists(p): return []
    spec = importlib.util.spec_from_file_location("lxm_" + lang, p); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return [k for k in X("en") if k not in m.X]


SVC_IDS = ["guide", "car", "hotel", "airport", "airport_guide", "mice", "esim"]
SVC_IMG = {"airport_guide": "p/kukeldash", "esim": "p/tashkent-sky", "airport": "tashkent", "transfer": "p/kyzylkum", "car": "charvak", "hotel": "p/ichan-kala", "train": "train", "guide": "p/registan", "mice": "p/yurt"}
# premium cover photos (Pexels — free for commercial use), stored in Supabase storage
SVC_COVER = {k: f"https://qlytfxwxauvlrbfnwzod.supabase.co/storage/v1/object/public/food-photos/svc/{k}.webp" for k in ["guide", "car", "hotel", "airport", "airport_guide", "mice", "esim"]}
SVC_ICON = {
 "airport": '<path d="M2 16l20-6-2-3-7 2-5-6H6l3 7-5 2-2-2H1l1 6z"/><path d="M3 21h18"/>',
 "transfer": '<path d="M3 13l2-6h14l2 6v5h-2.5M5.5 18H3v-5h18"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
 "car": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M4.5 16.5l5.4-3M19.5 16.5l-5.4-3"/>',
 "hotel": '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/>',
 "train": '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/>',
 "guide": '<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M16 4l3-1v6l-3-1"/>',
 "airport_guide": '<circle cx="9" cy="6" r="3"/><path d="M3 21c0-3.9 2.7-7 6-7s6 3.1 6 7"/><path d="M14 4l7 2-7 2z"/>',
 "esim": '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 6h4M9 11h6v6H9z"/>',
 "mice": '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M12 20c0-3.3 2.7-6 6-6"/>',
}


def svc_icon(sid):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{SVC_ICON[sid]}</svg>'


def company():
    c = CONFIG
    return {"company": c["company"], "address": c["address"], "inn": c["inn"], "mfo": c["mfo"], "account": c["account"],
            "bank": c["bank"], "phone": c["office_phone"], "telegram": c["telegram"], "license": c["license"]}


def fill(s):
    return s.format(**company())


def consent_label(lang, x):
    txt = e(x["f_consent"]).replace("{privacy}", f'<a href="privacy.html" target="_blank">{e(x["f_privacy"])}</a>').replace("{terms}", f'<a href="terms.html" target="_blank">{e(x["f_terms"])}</a>')
    return f'<label class="mf-check"><input type="checkbox" name="consent" required><span>{txt}</span></label>'


def bank_box(x):
    c = company()
    rows = [("b_company", c["company"]), ("b_license", "№ " + c["license"]), ("b_address", c["address"]), ("b_inn", c["inn"]), ("b_mfo", c["mfo"]),
            ("b_account", c["account"]), ("b_bank", c["bank"]), ("b_phone", c["phone"])]
    return (f'<div class="bank"><h3>{e(x["bank_title"])}</h3><p class="bank__lead">{e(x["bank_local"])}</p><dl>'
            + "".join(f'<dt>{e(x[k])}</dt><dd{" dir=ltr" if k in ("b_inn", "b_mfo", "b_account", "b_phone") else ""}>{e(v)}</dd>' for k, v in rows)
            + f'</dl><p class="bank__note">{e(x["bank_intl"])}</p></div>')


def sec_box(x):
    lock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
    return (f'<div class="secbox"><h3>{lock}{e(x["sec_title"])}</h3><ul>' + "".join(f'<li>{e(p)}</li>' for p in x["sec_points"])
            + f'</ul><a href="privacy.html">{e(x["f_privacy"])} →</a></div>')


def contact_box(x, icon):
    c = CONFIG
    return (f'<div class="unsure"><h3>{e(x["bk_unsure_title"])}</h3><p>{e(x["bk_unsure_text"])}</p><div class="unsure__btns">'
            f'<a class="btn btn--wa btn--sm" href="https://wa.me/{c["whatsapp"]}" target="_blank" rel="noopener">{icon["wa"]}WhatsApp</a>'
            f'<a class="btn btn--tg btn--sm" href="https://t.me/{c["telegram"]}" target="_blank" rel="noopener">{icon["tg"]}Telegram</a>'
            f'<a class="btn btn--outline btn--sm" href="tel:+{c["whatsapp"]}">{icon["phone"]}<span dir="ltr">{e(c["phone"])}</span></a></div>'
            f'<small>{e(c["manager"])}</small></div>')


# ------------------------------------------------------------------ homepage blocks
def home_blocks(lang, pre, A, icon):
    x = X(lang); c = CONFIG
    stats = "".join(f'<div class="stat"><b>{e(n)}</b><span>{e(l)}</span></div>' for n, l in x["stats"])
    about = f'''
  <section class="section" id="about">
    <div class="container about reveal">
      <div class="about__text"><span class="eyebrow">{e(x["about_eyebrow"])}</span><h2>{e(x["about_title"])}</h2><p>{e(x["about_text"])}</p>
        <p class="lic"><span class="lic__ic">✓</span>{e(x["lic_badge"].replace("{n}", c["license"]))}</p>
        <a class="igcard" href="https://instagram.com/{c["parent_instagram"]}" target="_blank" rel="noopener"><span class="igcard__ic">{icon["ig"]}</span><span><b>{e(x["about_ig"])}</b><small>{e(x["about_ig_note"])}</small></span><span class="igcard__go">→</span></a>
      </div>
      <div class="stats">{stats}</div>
    </div>
  </section>'''
    cards = "".join(
        f'<a class="svc-mini svc-mini--{sid}" href="services.html#{sid}"><span class="svc-mini__img"><img src="{SVC_COVER[sid]}" alt="{e(x["services"][sid][0])}" loading="lazy" decoding="async"></span>'
        f'<span class="svc-mini__in"><span class="svc-mini__ic">{svc_icon(sid)}</span><b>{e(x["services"][sid][0])}</b><small>{e(x["services"][sid][1])}</small><i class="svc-mini__go" aria-hidden="true">→</i></span></a>'
        for sid in SVC_IDS)
    services = f'''
  <section class="section section--sand" id="services">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(x["svc_eyebrow"])}</span><h2>{e(x["svc_title"])}</h2><p>{e(x["svc_sub"])}</p></div>
      <div class="svc-minis">{cards}</div>
      <p style="margin-top:28px"><a class="btn btn--outline" href="services.html">{e(x["svc_more"])} →</a></p>
    </div>
  </section>'''
    import partners_i18n
    PT = partners_i18n.S(lang)
    tiles = "".join(
        f'<a class="pt-tile" href="{ {"guide": "guides.html", "driver": "transport.html", "hotel": "hotels.html"}.get(k, "partners.html?k=" + k)}"><span class="pt-tile__ic">{svc_icon(ic)}</span><b>{e(PT["k_" + k])}</b><small>{e(PT["d_" + k])}</small><span class="pt-tile__n" data-ptn="{k}"></span></a>'
        for k, ic in (("guide", "guide"), ("driver", "car"), ("hotel", "hotel"), ("other", "mice")))
    partners = f'''
  <section class="section section--tight" id="partners">
    <div class="container">
      <div class="section-head section-head--tight reveal"><span class="eyebrow">{e(PT["eyebrow"])}</span><h2>{e(PT["title"])}</h2><p>{e(PT["sub"])}</p></div>
      <div class="pt-home" id="pt-home" hidden></div>
      <div class="pt-tiles">{tiles}</div>
      <p class="pt-more"><a class="btn btn--outline" href="partners.html">{e(" ".join(PT["see_all"].replace("({n})", "").replace("{n}", "").split()))} →</a> <a class="pt-become" href="partners.html#join">{e(PT["become"])}</a></p>
    </div>
  </section>'''
    revs = "".join(
        f'<figure class="rev reveal"><div class="rev__stars">★★★★★</div><blockquote>“{e(txt)}”</blockquote><figcaption><b>{e(name)}</b><span>{e(trip)}</span></figcaption></figure>'
        for name, trip, txt in x["reviews"] if not NON_UZ_RE.search(trip))  # 2026-11-26: Uzbekistan only
    reviews = f'''
  <section class="section" id="reviews">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(x["rev_eyebrow"])}</span><h2>{e(x["rev_title"])}</h2><p>{e(x["rev_sub"])}</p></div>
      <div class="revs">{revs}</div>
      <p style="margin-top:28px"><a class="btn btn--tg" href="https://t.me/{c["reviews_channel"]}" target="_blank" rel="noopener">{icon["tg"]}{e(x["rev_all"])}</a></p>
    </div>
  </section>
  <section class="section section--sand" id="stories">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(x["gal_eyebrow"])}</span><h2>{e(x["gal_title"])}</h2><p>{e(x["gal_sub"])}</p></div>
      <div class="gal" data-gallery="6"><p class="gal__empty">{e(x["gal_empty"])}</p></div>
      <p class="gal__actions"><a class="btn btn--gold" href="stories.html#share">{e(x["gal_btn"])}</a> <a class="btn btn--outline" href="stories.html">{e(x["gal_all"])} →</a></p>
    </div>
  </section>'''
    return {"about": about, "services": services, "reviews": reviews, "partners": partners}


def footer_legal(lang, pre):
    x = X(lang); c = company()
    return (f'<div class="footer__legal"><b>{e(c["company"])}</b> · {e(x["b_license"])} № {e(c["license"])} · {e(c["address"])} · {e(x["b_inn"])}: {e(c["inn"])} · <span dir="ltr">{e(c["phone"])}</span>'
            f'<span><a href="{pre}{path(lang)}privacy.html">{e(x["privacy_title"])}</a> · <a href="{pre}{path(lang)}terms.html">{e(x["terms_title"])}</a></span></div>')


def path(lang):
    return "" if lang == "en" else lang + "/"


def js_strings(lang):
    x = X(lang)
    keys = ["f_sending", "f_send", "f_required", "f_ok_title", "f_ok_text", "f_err", "f_close", "bk_first", "bk_last", "bk_gender", "bk_m", "bk_f", "bk_dob",
            "bk_remove", "bk_ok", "bk_ok_req", "bk_submit_req", "ts_send", "ts_uploading", "ts_ok", "ts_too_many", "gal_empty", "bk_submit", "rev_traveller"]
    d = {k: x[k] for k in keys}
    d["services"] = {k: v[0] for k, v in x["services"].items()}
    d["wx"] = x["wx"]
    return json.dumps(d, ensure_ascii=False)


# 27.11: two group streams — English-speaking and Russian-speaking guide
GL_TXT = {
 "en": dict(gl_sub="Fixed departure dates for solo travellers and couples — choose an English- or Russian-speaking group, everything is arranged.", gl_q="Which guide language suits you?", gl_en="English-speaking guide", gl_ru="Russian-speaking guide", gl_en_s="International groups", gl_ru_s="Groups from Russia & CIS", gl_from="from", gl_more="Dates & booking", gl_left="{n} seats left", gl_pp="per person", gl_det="Details & booking", gl_tar="Choose group size"),
 "ru": dict(gl_sub="Фиксированные даты для путешественников-одиночек и пар — выберите группу с гидом на английском или русском, всё организовано.", gl_q="Какой язык гида вам подходит?", gl_en="Гид на английском", gl_ru="Гид на русском", gl_en_s="Международные группы", gl_ru_s="Группы из России и СНГ", gl_from="от", gl_more="Даты и бронирование", gl_left="Осталось мест: {n}", gl_pp="за человека", gl_det="Подробнее и бронь", gl_tar="Выберите размер группы"),
 "uz": dict(gl_sub="Yakka sayohatchilar va juftliklar uchun aniq sanalar — ingliz yoki rus tilidagi guruhni tanlang, hammasi tashkil qilingan.", gl_q="Qaysi tildagi gid sizga mos?", gl_en="Ingliz tilida gid", gl_ru="Rus tilida gid", gl_en_s="Xalqaro guruhlar", gl_ru_s="Rossiya va MDH guruhlari", gl_from="", gl_more="Sanalar va bron", gl_left="{n} ta joy qoldi", gl_pp="1 kishi uchun", gl_det="Batafsil va bron", gl_tar="Guruh hajmini tanlang"),
 "tr": dict(gl_sub="Tek başına seyahat edenler ve çiftler için sabit tarihler — İngilizce ya da Rusça rehberli grubu seçin, her şey hazır.", gl_q="Hangi rehber dili size uygun?", gl_en="İngilizce rehber", gl_ru="Rusça rehber", gl_en_s="Uluslararası gruplar", gl_ru_s="Rusya ve BDT grupları", gl_from="", gl_more="Tarihler ve rezervasyon", gl_left="{n} yer kaldı", gl_pp="kişi başı", gl_det="Detaylar ve rezervasyon", gl_tar="Grup büyüklüğünü seçin"),
 "ar": dict(gl_sub="مواعيد ثابتة للمسافرين المنفردين والأزواج — اختر مجموعة بمرشد يتحدث الإنجليزية أو الروسية، وكل شيء منظم.", gl_q="ما لغة المرشد المناسبة لك؟", gl_en="مرشد بالإنجليزية", gl_ru="مرشد بالروسية", gl_en_s="مجموعات دولية", gl_ru_s="مجموعات من روسيا ورابطة الدول المستقلة", gl_from="من", gl_more="المواعيد والحجز", gl_left="تبقى {n} مقعداً", gl_pp="للشخص", gl_det="التفاصيل والحجز", gl_tar="اختر حجم المجموعة"),
 "de": dict(gl_sub="Feste Termine für Alleinreisende und Paare — wählen Sie eine Gruppe mit englisch- oder russischsprachigem Guide, alles ist organisiert.", gl_q="Welche Reiseleiter-Sprache passt zu Ihnen?", gl_en="Englischsprachiger Guide", gl_ru="Russischsprachiger Guide", gl_en_s="Internationale Gruppen", gl_ru_s="Gruppen aus Russland & GUS", gl_from="ab", gl_more="Termine & Buchung", gl_left="Noch {n} Plätze", gl_pp="pro Person", gl_det="Details & Buchung", gl_tar="Gruppengröße wählen"),
 "sv": dict(gl_sub="Fasta datum för ensamresenärer och par — välj grupp med engelsk- eller rysktalande guide, allt är ordnat.", gl_q="Vilket guidespråk passar dig?", gl_en="Engelsktalande guide", gl_ru="Rysktalande guide", gl_en_s="Internationella grupper", gl_ru_s="Grupper från Ryssland & OSS", gl_from="från", gl_more="Datum & bokning", gl_left="{n} platser kvar", gl_pp="per person", gl_det="Detaljer & bokning", gl_tar="Välj gruppstorlek"),
 "zh": dict(gl_sub="为独行旅客和情侣提供固定出发日期——可选英语或俄语导游团，一切都已安排妥当。", gl_q="您需要哪种语言的导游？", gl_en="英语导游", gl_ru="俄语导游", gl_en_s="国际团", gl_ru_s="俄罗斯及独联体团", gl_from="起", gl_more="日期与预订", gl_left="剩余 {n} 个名额", gl_pp="每人", gl_det="详情与预订", gl_tar="选择团队规模"),
 "hi": dict(gl_sub="अकेले यात्रियों और जोड़ों के लिए तय तारीखें — अंग्रेज़ी या रूसी गाइड वाला समूह चुनें, सब कुछ व्यवस्थित है।", gl_q="आपको किस भाषा का गाइड चाहिए?", gl_en="अंग्रेज़ी बोलने वाला गाइड", gl_ru="रूसी बोलने वाला गाइड", gl_en_s="अंतरराष्ट्रीय समूह", gl_ru_s="रूस और CIS के समूह", gl_from="से", gl_more="तारीखें और बुकिंग", gl_left="{n} सीटें बाकी", gl_pp="प्रति व्यक्ति", gl_det="विवरण और बुकिंग", gl_tar="समूह का आकार चुनें"),
 "ko": dict(gl_sub="혼자 여행하는 분과 커플을 위한 확정 출발일 — 영어 또는 러시아어 가이드 그룹을 선택하세요. 모든 준비가 완료되어 있습니다.", gl_q="원하시는 가이드 언어는?", gl_en="영어 가이드", gl_ru="러시아어 가이드", gl_en_s="국제 그룹", gl_ru_s="러시아·CIS 그룹", gl_from="", gl_more="일정 및 예약", gl_left="잔여 {n}석", gl_pp="1인", gl_det="상세 및 예약", gl_tar="그룹 규모 선택"),
}

def gl_toggle(lang):
    g = GL_TXT.get(lang, GL_TXT["en"])
    return (f'<div class="gl" role="tablist" aria-label="{e(g["gl_q"])}"><p class="gl__q">{e(g["gl_q"])}</p><div class="gl__opts">'
            f'<button type="button" class="gl__b" data-gl="English"><span class="gl__f">🇬🇧</span><span><b>{e(g["gl_en"])}</b><small>{e(g["gl_en_s"])}</small></span></button>'
            f'<button type="button" class="gl__b" data-gl="Russian"><span class="gl__f">🇷🇺</span><span><b>{e(g["gl_ru"])}</b><small>{e(g["gl_ru_s"])}</small></span></button></div></div>')


def gr_strings(lang):
    x = X(lang)
    keys = [k for k in x if k.startswith("gr_") and isinstance(x[k], str)] + ["f_required", "f_sending", "f_err", "f_ok_title"]
    return json.dumps(dict({k: x[k] for k in keys}, **GL_TXT.get(lang, GL_TXT["en"])), ensure_ascii=False)


def groups_home(lang):
    x = X(lang)
    return f'''
  <section class="section" id="groups">
    <div class="container">
      <div class="gdh-head"><div class="section-head reveal"><span class="eyebrow">{e(x["gr_eyebrow"])}</span><h2>{e(x["gr_home_title"])}</h2><p>{e(GL_TXT.get(lang, GL_TXT["en"])["gl_sub"])}</p></div>
      {gl_toggle(lang)}</div>
      <div class="gdh" id="gd-home"></div>
      <p style="margin-top:22px"><a class="btn btn--outline" href="group-tours.html" id="gd-home-all">{e(x["gr_home_all"])} →</a></p>
    </div>
  </section>
<script>window.MNG={gr_strings(lang)};</script>'''



# ------------------------------------------------------------------ main menu (same on every page)
def nav_html(lang, base, on_home=False):
    import partners_i18n
    t = T[lang]; x = X(lang); N = partners_i18n.NS(lang)
    tours = "#tours" if on_home else f"{base}index.html#tours"
    svc = "".join(f'<a href="{base}services.html#{sid}">{e(x["services"][sid][0])}</a>' for sid in SVC_IDS)
    import esim_page
    if esim_page.LIVE: svc += f'<a href="{base}esim.html">📶 {e(esim_page.NAV.get(lang, esim_page.NAV["en"]))}</a>'
    svc += f'<a href="{base}partners.html?k=other">{e(partners_i18n.S(lang)["k_other"])}</a><a class="nav__all" href="{base}services.html">{e(x["svc_more"])} →</a>'
    VID = {"en":"Videos about Uzbekistan","ru":"Видео об Узбекистане","uz":"O'zbekiston haqida videolar","tr":"Özbekistan videoları","ar":"فيديوهات عن أوزبكستان","de":"Videos über Usbekistan","sv":"Videor om Uzbekistan","zh":"乌兹别克斯坦视频","hi":"उज़्बेकिस्तान के वीडियो","ko":"우즈베키스탄 영상"}
    more = (f'<a href="{base}videos.html">▶ {e(VID.get(lang, VID["en"]))}</a>'
            f'<a href="{base}group-tours.html">{e(x["nav_groups"])}</a><a href="{base}stories.html">{e(x["nav_reviews"])}</a>'
            f'<a href="{base}partners.html">{e(N["all_partners"])}</a><a href="{"#about" if on_home else base + "index.html#about"}">{e(x["nav_about"])}</a>'
            f'<a href="{base}{"" if lang == "en" else "../"}agent/">{e(t["agent_login"])}</a>')
    dd = lambda label, inner: f'<div class="nav__dd"><button type="button" class="nav__ddb" aria-haspopup="true">{e(label)}<i aria-hidden="true">▾</i></button><div class="nav__ddm">{inner}</div></div>'
    HOME = {"en":"Home","ru":"Главная","uz":"Bosh sahifa","tr":"Ana sayfa","ar":"الرئيسية","de":"Startseite","sv":"Hem","zh":"首页","hi":"होम","ko":"홈"}
    home_href = "#top" if on_home else (base or "./")
    return (f'<a href="{home_href}" class="nav__home"><i aria-hidden="true">⌂</i> {e(HOME.get(lang, "Home"))}</a><a href="{tours}">{e(t["nav"]["tours"])}</a><a href="{base}events.html" class="nav__ev">{e(__import__("events_page").NAV.get(lang, "Events"))}</a><a href="{base}food.html" class="nav__food">{e(__import__("food_page").NAV.get(lang, "Food"))}</a><a href="{base}guides.html">{e(N["nav_guides"])}</a>'
            f'<a href="{base}transport.html">{e(N["nav_transport"])}</a><a href="{base}hotels.html">{e(N["nav_hotels"])}</a>'
            + dd(x["nav_services"], svc) + f'<a href="{base}builder.html" class="nav__build">{e(t["build_nav"])}</a>' + dd(N["nav_more"], more)
            # phones only (in the burger menu): my cabinet + become a partner
            + f'<a href="{base}account.html" class="nav__m nav__acct" data-free>👤 {e(CAB_LINK.get(lang, CAB_LINK["en"]))}</a>'
            + f'<a href="{base}partners.html#join" class="nav__m nav__join" data-free>🤝 {e(partners_i18n.S(lang)["become"])}</a>')

import re as _re
NON_UZ_RE = _re.compile("Kyrg|Kirg|Qirg|Кырг|Kırg|吉尔吉斯|किर्ग|키르기스|قيرغيز|Kazak|Qozog|Kasach|Tajik|Tojik|Tadsch|Таджик|Казах")

CAB_LINK = {"en": "My cabinet", "ru": "Мой кабинет", "uz": "Kabinetim", "tr": "Kabinim", "ar": "حسابي", "de": "Mein Bereich", "sv": "Mitt konto", "zh": "个人中心", "hi": "मेरा कैबिनेट", "ko": "마이페이지"}
CAB_TITLE = {"en": ("My cabinet", "Your requests, bookings, payments, documents and messages — in one place."), "ru": ("Мой кабинет", "Ваши заявки, бронирования, оплаты, документы и сообщения — в одном месте."),
  "uz": ("Mening kabinetim", "So'rov va bronlaringiz, to'lovlar, hujjatlar va xabarlar — bir joyda."), "tr": ("Kabinim", "Talepleriniz, rezervasyonlarınız, ödemeler, belgeler ve mesajlar — tek yerde."),
  "ar": ("حسابي", "طلباتك وحجوزاتك ومدفوعاتك ومستنداتك ورسائلك — في مكان واحد."), "de": ("Mein Bereich", "Ihre Anfragen, Buchungen, Zahlungen, Dokumente und Nachrichten — an einem Ort."),
  "sv": ("Mitt konto", "Dina förfrågningar, bokningar, betalningar, dokument och meddelanden — på ett ställe."), "zh": ("个人中心", "您的询价、预订、付款、文件和消息——集中在一处。"),
  "hi": ("मेरा कैबिनेट", "आपके अनुरोध, बुकिंग, भुगतान, दस्तावेज़ और संदेश — एक ही जगह।"), "ko": ("마이페이지", "문의, 예약, 결제, 서류, 메시지를 한곳에서.")}

def acct_link(lang, base):
    """Header button 'My cabinet' with a red mark for unread messages (cabdot.js)."""
    return (f'<a class="acct-link" href="{base}account.html" data-free><i class="acct-ico" aria-hidden="true">👤</i>'
            f'<span>{e(CAB_LINK.get(lang, CAB_LINK["en"]))}</span><i class="acct-dot" hidden></i></a>')

# ------------------------------------------------------------------ page shell
def shell(lang, slug, title, desc, body, icon, logo, extra_font, lang_names, body_cls="", extra_js=""):
    t = T[lang]; x = X(lang); pre = "" if lang == "en" else "../"; A = pre + "assets/"
    c = CONFIG; home = f"{pre}{path(lang)}"
    langs = "".join(f'<a href="{pre}{path(l)}{slug}" hreflang="{l}" lang="{l}"{" aria-current=\"page\"" if l == lang else ""}>{lang_names[l]}<small>{l.upper()}</small></a>' for l in LANGS)
    alts = "".join(f'<link rel="alternate" hreflang="{l}" href="{c["site_url"]}/{path(l)}{slug}">' for l in LANGS)
    nav = nav_html(lang, home)
    return f'''<!DOCTYPE html>
<html lang="{lang}" dir="{t["dir"]}" data-base="{pre}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} — Moviy Nomad</title><meta name="description" content="{e(desc)}">
<link rel="canonical" href="{c["site_url"]}/{path(lang)}{slug}">{alts}
<meta property="og:title" content="{e(title)} — Moviy Nomad"><meta property="og:description" content="{e(desc)}"><meta property="og:image" content="{c["site_url"]}/assets/img/hero.webp">
<meta name="theme-color" content="#12355b"><script>(function(){{try{{var t=localStorage.getItem("mn_theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}}})()</script><link rel="icon" href="{A}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito+Sans:wght@400;600;700{extra_font}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{A}css/site.css?v={CSSV}">
</head>
<body class="subpage {body_cls}">
<header class="header is-solid">
  <div class="container header__bar">
    <a class="logo" href="{home}" aria-label="Moviy Nomad">{logo}<span class="logo__text">MOVIY<span>NOMAD</span></span></a>
    <nav class="nav">{nav}</nav>
    <div class="header__right">
      {acct_link(lang, home)}
      <button class="hshare" data-share="site" aria-label="Share" title="Share">{icon["share"]}</button>
      <div class="lang"><button class="lang__btn" aria-label="Language">{icon["globe"]}{lang.upper()}</button><div class="lang__menu">{langs}</div></div>
      <a class="btn btn--gold btn--sm header__cta" href="https://wa.me/{c["whatsapp"]}" target="_blank" rel="noopener">{icon["wa"]}WhatsApp</a>
      <button class="burger" aria-label="Menu">{icon["menu"]}</button>
    </div>
  </div>
</header>
<main class="subpage__main">
{body}
</main>
<footer class="footer footer--sub">
  <div class="container">
    {footer_legal(lang, pre)}
    <div class="footer__bottom"><span>© 2026 Moviy Nomad · Moviy Travel</span><span><a href="tel:+{c["whatsapp"]}" dir="ltr">{e(c["phone"])}</a> · <a href="https://t.me/{c["telegram"]}" target="_blank" rel="noopener">@{c["telegram"]}</a> · <a href="https://instagram.com/{c["instagram"]}" target="_blank" rel="noopener">@{c["instagram"]}</a>{(' · <a href="mailto:' + c["email"] + '">' + c["email"] + '</a>') if c.get("email") else ""}</span></div>
  </div>
</footer>
<script>window.MN={json.dumps({"whatsapp": c["whatsapp"], "telegram": c["telegram"], "instagram": c["instagram"], "msgGeneral": t["msg_general"], "msgTour": t["msg_tour"]}, ensure_ascii=False)};window.MNX={js_strings(lang)};window.MN_LANG="{lang}";</script>
<script src="{A}js/sb-config.js"></script><script src="{A}data/l10n/{lang}.js"></script><script>window.MN_SHARE_TXT=(window.MN_L||{{}}).ui||{{}};</script><script src="{A}js/share.js"></script><script src="{A}js/forms.js"></script>{extra_js}<script src="{A}js/site.js" defer></script><script src="{A}js/visitor.js" defer></script>
</body>
</html>
'''


def page_head(eyebrow, title, sub):
    return f'<section class="phero"><div class="container"><span class="eyebrow">{e(eyebrow)}</span><h1>{e(title)}</h1><p>{e(sub)}</p></div></section>'


# ------------------------------------------------------------------ services
SVC_PAGE = {"guide": ("guide", "guides.html"), "car": ("driver", "transport.html"), "hotel": ("hotel", "hotels.html")}


def render_services(lang, icon, logo, font, names):
    import partners_i18n
    x = X(lang); PT = partners_i18n.S(lang)
    pre = "" if lang == "en" else "../"
    cards = ""
    for sid in SVC_IDS:
        ttl, short, pts = x["services"][sid]
        cards += (f'<article class="svc" id="{sid}"><div class="svc__img" style="background-image:url({SVC_COVER[sid] if sid in SVC_COVER else pre + "assets/img/" + SVC_IMG[sid] + ".webp"})"><span class="svc__ic">{svc_icon(sid)}</span></div>'
                  f'<div class="svc__body"><h2>{e(ttl)}</h2><p>{e(short)}</p><ul>' + "".join(f'<li>{e(p)}</li>' for p in pts) +
                  f'</ul><div class="svc__price" data-svcp="{sid}" data-tpl="{e(x["svc_from"])}" hidden></div><button class="btn btn--gold btn--sm" data-svc="{sid}">{e(x["svc_request"])} →</button>'
                  + (f' <a class="btn btn--outline btn--sm" href="{SVC_PAGE[sid][1]}">{e(PT["k_" + SVC_PAGE[sid][0]])} →</a>' if sid in SVC_PAGE else '') + '</div></article>')
    how = "".join(f'<div class="how__i"><b>{n + 1}</b><h3>{e(h)}</h3><p>{e(p)}</p></div>' for n, (h, p) in enumerate(x["svc_how"]))
    opts = "".join(f'<option value="{sid}">{e(x["services"][sid][0])}</option>' for sid in SVC_IDS)
    modal = f'''<div class="modal" id="svc-modal" role="dialog" aria-modal="true"><div class="modal__box modal__box--form">
  <button class="modal__close" aria-label="{e(x["f_close"])}">×</button>
  <form class="mf" id="svc-form" novalidate>
    <h3 id="svc-title">{e(x["svc_request"])}</h3>
    <div class="mf-grid">
      <label class="mf-f mf-f--full"><span>{e(x["f_service"])} *</span><select name="service" required>{opts}</select></label>
      <label class="mf-f mf-f--full"><span>{e(x["f_city"])} *</span><input name="city" required maxlength="200"></label>
      <label class="mf-f"><span>{e(x["f_date"])} *</span><input type="date" name="start_date" required></label>
      <label class="mf-f"><span>{e(x["f_pax"])} *</span><input type="number" name="pax" min="1" max="500" value="2" required></label>
      <label class="mf-f"><span>{e(x["f_name"])} *</span><input name="contact_name" required maxlength="120" autocomplete="name"></label>
      <label class="mf-f"><span>{e(x["f_email"])} *</span><input type="email" name="email" required maxlength="160" autocomplete="email" placeholder="name@example.com"><small class="mf-hint">{e(x.get("f_email_hint", ""))}</small></label>
      <label class="mf-f"><span>{e(x.get("f_wa_opt", x["f_phone"]))}</span><input type="tel" name="phone" maxlength="40" autocomplete="tel" placeholder="+"></label>
      <label class="mf-f"><span>{e(x["f_citizenship"])}</span><input name="citizenship" maxlength="80"></label>
      <label class="mf-f mf-f--full"><span>{e(x["f_details"])}</span><textarea name="message" rows="3" maxlength="3000"></textarea></label>
    </div>
    {consent_label(lang, x)}
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["f_send"])}</button>
  </form>
</div></div>'''
    body = (page_head(x["svc_eyebrow"], x["svc_page_title"], x["svc_page_sub"]) +
            f'<section class="section section--tight"><div class="container"><div class="svcs">{cards}</div></div></section>'
            f'<section class="section section--sand section--tight"><div class="container"><h2 class="h2c">{e(x["svc_how_title"])}</h2><div class="how">{how}</div>'
            f'<div class="side2">{sec_box(x)}{contact_box(x, icon)}</div></div></section>' + modal)
    return shell(lang, "services.html", x["svc_page_title"], x["svc_page_sub"], body, icon, logo, font, names)


# ------------------------------------------------------------------ partners (guides, drivers, hotels, other)
PT_SLUG = {"": "partners.html", "guide": "guides.html", "driver": "transport.html", "hotel": "hotels.html"}
PT_IMG = {"": "p/lyabi-hauz", "guide": "p/registan", "driver": "p/uz-fergana-road", "hotel": "p/ichan-kala", "other": "p/uz-pottery"}


def render_partners(lang, icon, logo, font, names, kind=""):
    import partners_i18n, join_i18n
    x = X(lang); PT = partners_i18n.S(lang); N = partners_i18n.NS(lang); pre = "" if lang == "en" else "../"
    jl = join_i18n.jl(lang); JT = join_i18n.J[jl]
    tabs = "".join(f'<button class="ttab{" is-on" if k == "" else ""}" data-pk="{k}">{e(PT["all"] if k == "" else PT["k_" + k])}</button>' for k in ("", "guide", "driver", "hotel", "other"))
    how = "".join(f'<div class="how__i"><b>{n + 1}</b><h3>{e(PT[k])}</h3></div>' for n, k in enumerate(("how1", "how2", "how3")))
    why = "".join(f'<li>✓ {e(PT[k])}</li>' for k in ("why1", "why2", "why3", "why4"))
    jk = kind or "guide"
    title = N["t_" + kind] if kind else PT["page_title"]
    sub = N["s_" + kind] if kind else PT["page_sub"]
    links = [("guide", "guides.html"), ("driver", "transport.html"), ("hotel", "hotels.html"), ("other", "partners.html?k=other")]
    ksub = "".join(f'<a href="{u}"{" class=\"is-on\"" if k == kind else ""}>{e(PT["k_" + k])}</a>' for k, u in links) + f'<a href="partners.html"{" class=\"is-on\"" if not kind else ""}>{e(PT["all"])}</a>'
    hero = (f'<section class="khero" style="background-image:url({pre}assets/img/{PT_IMG[kind]}.webp)"><div class="container">'
            f'<div class="orn-line"><i></i></div><span class="eyebrow">{e(PT["eyebrow"])}</span><h1>{e(title)}</h1><p>{e(sub)}</p>'
            f'<div class="khero__btns"><a class="btn btn--gold" href="#pt-grid">{e(PT["ask"])} ↓</a>'
            f'<button class="btn btn--ghost" type="button" data-join="{kind}" data-free>{e(N["jb_" + jk] if kind else PT["become"])}</button></div>'
            f'<nav class="ksub" aria-label="{e(PT["eyebrow"])}">{ksub}</nav></div></section>')
    reqs = "".join(f'<li>{e(r)}</li>' for r in join_i18n.req(lang, jk))
    jtitle = N.get("jt_" + jk) if lang in ("uz", "ru", "en") else partners_i18n.NS("en")["jt_" + jk]
    jsub = N["j_sub"] if lang in ("uz", "ru", "en") else partners_i18n.NS("en")["j_sub"]
    jbtn = (N if lang in ("uz", "ru", "en") else partners_i18n.NS("en"))["jb_" + jk]
    join = (f'<section class="section section--tight" id="join"><div class="container"><div class="join">'
            f'<div><div class="orn-line"><i></i></div><h2>{e(jtitle)}</h2><p>{e(jsub)}</p>'
            f'<button class="btn btn--gold" type="button" data-join="{kind}" data-free>{e(jbtn)} →</button>'
            f'<p style="margin:16px 0 0;font-size:13.5px"><a href="{pre}partner/">moviy-travel.uz/partner/</a> — {e(JT["cab"])}</p></div>'
            f'<div class="join__req"><h3>{e((N if lang in ("uz", "ru", "en") else partners_i18n.NS("en"))["j_req"])}</h3><ol>{reqs}</ol></div></div></div></section>')
    jmodal = f'<div class="modal" id="jn-modal" role="dialog" aria-modal="true"><div class="modal__box modal__box--form"><button class="modal__close" aria-label="{e(PT["close"])}">×</button><div id="jn-body"></div></div></div>'
    modal = f'''<div class="modal" id="pt-modal" role="dialog" aria-modal="true"><div class="modal__box modal__box--form">
  <button class="modal__close" aria-label="{e(PT["close"])}">×</button>
  <div id="pt-prof"></div>
  <form class="mf" id="pt-form" novalidate>
    <h3>{e(PT["ask"])}: <span id="pt-fname"></span></h3>
    <div class="mf-grid">
      <label class="mf-f"><span>{e(x["f_date"])} *</span><input type="date" name="start_date" required></label>
      <label class="mf-f"><span>{e(x["f_pax"])} *</span><input type="number" name="pax" min="1" max="500" value="2" required></label>
      <label class="mf-f"><span>{e(PT["rq_units"])} *</span><input type="number" name="units" min="1" max="60" value="1" required></label>
      <p class="mf-f mf-f--full pt-est" id="pt-est" hidden>{e(PT["rq_est"])}: <b></b></p>
      <label class="mf-f"><span>{e(x["f_name"])} *</span><input name="contact_name" required maxlength="120" autocomplete="name"></label>
      <label class="mf-f"><span id="rq-em-l" data-req="{e(x["f_email"])} *" data-opt="{e(PT["rq_email_opt"])}">{e(x["f_email"])} *</span><input type="email" name="email" required maxlength="160" autocomplete="email"></label>
      <label class="mf-f"><span>{e(PT["rq_country"])} *</span><input name="country" maxlength="80" placeholder="{e(PT["rq_country_ph"])}" required></label>
      <label class="mf-f"><span id="rq-wa-l" data-req="{e(PT["rq_wa"])} *" data-opt="{e(PT["rq_phone"])} *">{e(PT["rq_wa"])} *</span><input type="tel" name="phone" maxlength="40" autocomplete="tel" placeholder="+"></label>
      <label class="mf-f" id="rq-tg" hidden><span>{e(PT["rq_tg"])} *</span><input name="telegram" maxlength="64" placeholder="@username"></label>
      <label class="mf-f mf-f--full"><span>{e(x["f_details"])}</span><textarea name="message" rows="3" maxlength="3000"></textarea></label>
    </div>
    {consent_label(lang, x)}
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["f_send"])}</button>
  </form>
  <form class="mf" id="pt-rform" novalidate hidden>
    <h3>{e(PT["write"])}</h3><p class="pt-note">{e(PT["rv_note"])}</p>
    <div class="mf-grid">
      <label class="mf-f"><span>{e(PT["rv_ref"])} *</span><input name="trip_ref" required maxlength="20"></label>
      <label class="mf-f"><span>{e(PT["rv_email"])} *</span><input type="email" name="email" required maxlength="160"></label>
      <label class="mf-f"><span>{e(PT["rv_name"])} *</span><input name="name" required maxlength="80"></label>
      <label class="mf-f"><span>{e(PT["rv_country"])}</span><input name="country" maxlength="60"></label>
      <label class="mf-f mf-f--full"><span>{e(PT["rv_rating"])} *</span><span class="pt-stars">{"".join(f'<label><input type="radio" name="rating" value="{i}"{" checked" if i == 5 else ""}><b>★</b></label>' for i in range(1, 6))}</span></label>
      <label class="mf-f mf-f--full"><span>{e(PT["rv_text"])}</span><textarea name="body" rows="4" maxlength="1500"></textarea></label>
    </div>
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(PT["rv_send"])}</button>
  </form>
</div></div>'''
    body = (hero +
            f'<section class="section section--tight"><div class="container"><div class="pt-cities" id="pt-cities" aria-label="{e(PT["city"])}"></div><div class="pt-bar{" pt-bar--solo" if kind else ""}">' + (f'<div class="ttabs" id="pt-tabs">{tabs}</div>' if not kind else '') +
            f'</div><div class="pt-langq" id="pt-langs" aria-label="{e(PT["lang_q_guide"] if kind == "guide" else PT["lang_q"])}"><b>🗣 {e(PT["lang_q_guide"] if kind == "guide" else PT["lang_q"])}</b><div class="pt-langq__c" id="pt-langc"></div></div>'
            f'<div class="pt-top" id="pt-top" hidden></div><div class="pt-grid" id="pt-grid"><p class="pt-empty">…</p></div><p class="pt-rules">ℹ️ {e(PT["rules"])}</p></div></section>'
            f'<section class="section section--sand section--tight"><div class="container"><div class="how">{how}</div>'
            f'<div class="pt-why"><h2 class="h2c">{e(PT["why_t"])}</h2><ul>{why}</ul></div></div></section>' + join + modal + jmodal)
    jdata = {"lang": jl, "kind": kind, "J": JT, "group": CONFIG.get("partner_group", ""), "REQ": {k: join_i18n.req(lang, k) for k in join_i18n.SLOTS}, "SLOTS": join_i18n.SLOTS}
    import units_i18n
    js = (f'<script>window.MNPT={json.dumps(PT, ensure_ascii=False)};window.MNPT_KIND="{kind}";window.MNJ={json.dumps(jdata, ensure_ascii=False)};window.MNPT_U={json.dumps(units_i18n.U(lang), ensure_ascii=False)};</script>'
          f'<script src="{pre}assets/js/mn-cal.js" defer></script><script src="{pre}assets/js/mn-cities.js" defer></script><script src="{pre}assets/js/mn-countries.js" defer></script><script src="{pre}assets/js/mn-langs.js" defer></script><script src="{pre}assets/js/partners.js" defer></script><script src="{pre}assets/js/partner-join.js?v=2" defer></script>')
    return shell(lang, PT_SLUG[kind], title, sub, body, icon, logo, font, names, extra_js=js)


# ------------------------------------------------------------------ booking
def render_booking(lang, icon, logo, font, names, tours, L):
    x = X(lang)
    groups = {}
    for tr in tours:
        groups.setdefault(tr["country"], []).append(tr)
    cn = {"UZ": "🇺🇿", "KZ": "🇰🇿", "KG": "🇰🇬", "TJ": "🇹🇯", "CA": "🌏"}
    opts = f'<option value="">{e(x["bk_choose"])}</option>'
    for code, lst in groups.items():
        opts += f'<optgroup label="{cn.get(code, "")} {e(L["ui"].get("country_" + code) or T[lang]["countries"].get(code.lower(), (code,))[0])}">' + "".join(
            f'<option value="{tr["id"]}">{e(L["tours"][tr["id"]][0])}</option>' for tr in lst) + '</optgroup>'
    opts += f'<option value="custom">{e(x["bk_custom"])}</option>'
    hotels = "".join(f'<option value="{k}">{e(v)}</option>' for k, v in x["bk_hotels"])
    glangs = ["English", "Русский", "O'zbekcha", "Türkçe", "العربية", "Deutsch", "Svenska", "中文", "हिन्दी", "한국어", "Français", "Español", "Italiano"]
    gopts = "".join(f'<option>{g}</option>' for g in glangs)
    pay = "".join(
        f'<label class="pay"><input type="radio" name="pay_method" value="{k}" disabled{" checked" if k == "contact" else ""}><span><b>{e(v[0])}</b><small>{e(v[1])}</small></span></label>'
        for k, v in x["pay"].items())
    body = page_head(x["bk_btn"], x["bk_title"], x["bk_sub"]) + f'''
<section class="section section--tight"><div class="container bk">
  <form class="mf bk__form" id="bk-form" novalidate data-online="0">
    <div class="bk-soon" id="bk-soon"><span class="soon-badge">{e(x["soon_badge"])}</span><b>{e(x["bk_soon_title"])}</b><p>{e(x["bk_soon_text"])}</p></div>
    <fieldset><legend>{e(x["bk_trip"])}</legend><div class="mf-grid">
      <label class="mf-f mf-f--full"><span>{e(x["bk_tour"])} *</span><select name="tour_id" required>{opts}</select></label>
      <label class="mf-f"><span>{e(x["bk_start"])} *</span><input type="date" name="start_date" required></label>
      <label class="mf-f"><span>{e(x["bk_hotel"])}</span><select name="hotel">{hotels}</select></label>
      <label class="mf-f"><span>{e(x["bk_adults"])} *</span><input type="number" name="adults" min="1" max="60" value="2" required></label>
      <label class="mf-f"><span>{e(x["bk_children"])}</span><input type="number" name="children" min="0" max="30" value="0"></label>
      <label class="mf-f"><span>{e(x["bk_guide"])}</span><select name="guide_lang">{gopts}</select></label>
    </div></fieldset>
    <fieldset><legend>{e(x["bk_lead"])}</legend><div class="mf-grid">
      <label class="mf-f"><span>{e(x["f_name"])} *</span><input name="contact_name" required maxlength="120" autocomplete="name"></label>
      <label class="mf-f"><span>{e(x["f_email"])} *</span><input type="email" name="email" required maxlength="160" autocomplete="email" placeholder="name@example.com"><small class="mf-hint">{e(x.get("f_email_hint", ""))}</small></label>
      <label class="mf-f"><span>{e(x.get("f_wa_opt", x["f_phone"]))}</span><input type="tel" name="phone" maxlength="40" autocomplete="tel" placeholder="+"></label>
      <label class="mf-f"><span>{e(x["f_citizenship"])} *</span><input name="citizenship" required maxlength="80"></label>
      <label class="mf-f"><span>{e(x["f_messenger"])}</span><select name="messenger"><option>WhatsApp</option><option>Telegram</option><option>E-mail</option><option>{e(x["f_phone"])}</option></select></label>
    </div></fieldset>
    <fieldset><legend>{e(x["bk_travellers"])}</legend><p class="mf-note">{e(x["bk_trav_note"])}</p>
      <div id="trav-list"></div><button type="button" class="btn btn--outline btn--sm" id="trav-add">{e(x["bk_add"])}</button>
    </fieldset>
    <fieldset><legend>{e(x["bk_notes"])}</legend><textarea name="message" rows="3" maxlength="3000"></textarea></fieldset>
    <fieldset class="pays-wrap is-soon" id="pays-wrap"><legend>{e(x["bk_pay_title"])} <span class="soon-badge">{e(x["soon_badge"])}</span></legend><div class="pays">{pay}</div><p class="mf-note">{e(x["bk_pay_rule"])}</p></fieldset>
    {consent_label(lang, x)}
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["bk_submit_req"])}</button>
  </form>
  <aside class="bk__side">{sec_box(x)}{contact_box(x, icon)}<div class="bank-wrap" id="bank-wrap" hidden>{bank_box(x)}</div></aside>
</div></section>
<div class="modal" id="ok-modal" role="dialog" aria-modal="true"><div class="modal__box"><button class="modal__close" aria-label="{e(x["f_close"])}">×</button><div id="ok-body"></div></div></div>'''
    return shell(lang, "booking.html", x["bk_title"], x["bk_sub"], body, icon, logo, font, names, "is-booking")


# ------------------------------------------------------------------ stories
def render_stories(lang, icon, logo, font, names):
    x = X(lang)
    stars = "".join(f'<label><input type="radio" name="rating" value="{n}"{" checked" if n == 5 else ""}><span>★</span></label>' for n in range(5, 0, -1))
    body = page_head(x["gal_eyebrow"], x["ts_page_title"], x["ts_page_sub"]) + f'''
<section class="section section--tight"><div class="container">
  <div class="gal gal--page" data-gallery="60"><p class="gal__empty">{e(x["gal_empty"])}</p></div>
</div></section>
<section class="section section--sand section--tight" id="share"><div class="container bk">
  <form class="mf bk__form" id="ts-form" novalidate>
    <h2>{e(x["ts_form_title"])}</h2><p class="mf-note">{e(x["ts_form_sub"])}</p>
    <div class="mf-grid">
      <label class="mf-f"><span>{e(x["ts_name"])} *</span><input name="name" required minlength="2" maxlength="60"></label>
      <label class="mf-f"><span>{e(x["ts_country"])}</span><input name="country" maxlength="60"></label>
      <label class="mf-f mf-f--full"><span>{e(x["ts_trip"])}</span><input name="trip" maxlength="120"></label>
      <label class="mf-f mf-f--full"><span>{e(x["ts_body"])} *</span><textarea name="body" rows="4" required minlength="10" maxlength="1500"></textarea></label>
      <div class="mf-f"><span>{e(x["ts_rating"])}</span><div class="stars">{stars}</div></div>
      <label class="mf-f mf-f--full"><span>{e(x["ts_photos"])}</span><input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple><small>{e(x["ts_photos_hint"])}</small></label>
      <div class="ts-prev" id="ts-prev"></div>
    </div>
    <label class="mf-check"><input type="checkbox" name="consent" required><span>{e(x["ts_consent"])}</span></label>
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["ts_send"])}</button>
  </form>
  <aside class="bk__side">{sec_box(x)}</aside>
</div></section>'''
    return shell(lang, "stories.html", x["ts_page_title"], x["ts_page_sub"], body, icon, logo, font, names)


# ------------------------------------------------------------------ legal
def render_legal(lang, kind, icon, logo, font, names):
    x = X(lang)
    title = x[kind + "_title"]
    ph = e(company()["phone"])
    secs = "".join(f'<h2>{e(h)}</h2><p>{e(fill(p)).replace(ph, "<span dir=ltr>" + ph + "</span>")}</p>' for h, p in x[kind])
    extra = bank_box(x) if kind == "terms" else sec_box(x)
    body = f'<section class="phero phero--small"><div class="container"><h1>{e(title)}</h1><p>{e(x["legal_updated"])}</p></div></section><section class="section section--tight"><div class="container legal"><article>{secs}</article><aside>{extra}</aside></div></section>'
    return shell(lang, kind + ".html", title, title, body, icon, logo, font, names)


# ------------------------------------------------------------------ guaranteed group departures
def render_groups(lang, icon, logo, font, names):
    x = X(lang); pre = "" if lang == "en" else "../"; A = pre + "assets/"
    feats = "".join(f'<div class="gfeat"><b>{e(h)}</b><p>{e(p)}</p></div>' for h, p in x["gr_feats"])
    how = "".join(f'<div class="how__i"><b>{n + 1}</b><h3>{e(h)}</h3><p>{e(p)}</p></div>' for n, (h, p) in enumerate(x["gr_how"]))
    incl = "".join(f'<li>{e(i)}</li>' for i in x["gr_incl"]); excl = "".join(f'<li>{e(i)}</li>' for i in x["gr_excl"])
    rooms = "".join(f'<option value="{k}">{e(v)}</option>' for k, v in x["gr_rooms"])
    body = page_head(x["gr_eyebrow"], x["gr_title"], x["gr_sub"]) + f'''
<section class="section section--tight"><div class="container">
  <div class="gfeats">{feats}</div>
  <div class="gds-box" id="gd-sched-box"><h2>{e(x["gr_sched_title"])}</h2><div id="gd-sched"></div></div>
  {gl_toggle(lang)}
  <div class="gd-head"><h2>{e(x["gr_list_title"])}</h2><select id="gd-month" class="gd-month" hidden></select></div>
  <div class="gds" id="gd-list"></div>
</div></section>
<section class="section section--sand section--tight"><div class="container">
  <div class="ginc"><div><h2>{e(x["gr_incl_title"])}</h2><ul class="ticks">{incl}</ul></div><div><h2>{e(x["gr_excl_title"])}</h2><ul class="crosses">{excl}</ul></div></div>
  <h2 class="h2c">{e(x["gr_how_title"])}</h2><div class="how">{how}</div>
  <div class="side2">{sec_box(x)}{contact_box(x, icon)}</div>
</div></section>
<div class="modal" id="gd-modal" role="dialog" aria-modal="true"><div class="modal__box modal__box--form">
  <button class="modal__close" aria-label="{e(x["f_close"])}">×</button>
  <form class="mf" id="gd-form" novalidate>
    <h3>{e(x["gr_form_title"])}</h3>
    <div class="mf-grid">
      <label class="mf-f mf-f--full"><span>{e(x["gr_f_dep"])}</span><select name="dep"></select></label>
      <label class="mf-f"><span>{e(x["gr_f_seats"])} *</span><input type="number" name="pax" min="1" max="20" value="1" required></label>
      <label class="mf-f"><span>{e(x["gr_f_room"])}</span><select name="room">{rooms}</select></label>
      <label class="mf-f"><span>{e(x["f_name"])} *</span><input name="contact_name" required maxlength="120" autocomplete="name"></label>
      <label class="mf-f"><span>{e(x["f_email"])} *</span><input type="email" name="email" required maxlength="160" autocomplete="email" placeholder="name@example.com"><small class="mf-hint">{e(x.get("f_email_hint", ""))}</small></label>
      <label class="mf-f"><span>{e(x.get("f_wa_opt", x["f_phone"]))}</span><input type="tel" name="phone" maxlength="40" autocomplete="tel" placeholder="+"></label>
      <label class="mf-f"><span>{e(x["f_citizenship"])} *</span><input name="citizenship" required maxlength="80"></label>
      <label class="mf-f"><span>{e(x["f_messenger"])}</span><select name="messenger"><option>WhatsApp</option><option>Telegram</option><option>E-mail</option></select></label>
      <label class="mf-f mf-f--full"><span>{e(x["f_details"])}</span><textarea name="message" rows="2" maxlength="3000"></textarea></label>
    </div>
    {consent_label(lang, x)}
    <div class="mf-msg" role="status"></div>
    <button class="btn btn--gold" type="submit">{e(x["f_send"])}</button>
  </form>
  <div id="gd-ok" hidden></div>
</div></div>'''
    js = (f'<script>window.MNG={gr_strings(lang)};</script><script src="{A}data/catalog.js"></script><script src="{A}data/places.js"></script>'
          f'<script src="{A}data/tours.js"></script><script src="{A}js/engine.js"></script><script src="{A}js/gd-schedule.js"></script><script src="{A}js/groups.js?v=4"></script>')
    return shell(lang, "group-tours.html", x["gr_title"], x["gr_sub"], body, icon, logo, font, names, "is-groups", js)
