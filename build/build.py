import os
# -*- coding: utf-8 -*-
"""Moviy Nomad saytini yig'ish: python3 build/build.py
Natija: index.html (EN), ru/index.html, tr/index.html, ar/index.html
"""
import html, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from content import CONFIG, COUNTRIES, EXPERIENCES, LANGS, T
import tours_data as TD
import build_tours
import pages

_LD = {}
def LD(lang):
    """Localized tour/ui texts (falls back to English for anything not translated yet)."""
    if lang not in _LD:
        _LD[lang] = build_tours.l10n(lang if os.path.exists(os.path.join(os.path.dirname(__file__), "l10n", lang + ".py")) else "en")
    return _LD[lang]

def l10n_lang(lang):
    return lang if os.path.exists(os.path.join(os.path.dirname(__file__), "l10n", lang + ".py")) else "en"

EXTRA_FONT = {"ar": "&family=Tajawal:wght@400;500;700", "zh": "&family=Noto+Sans+SC:wght@400;600;700", "hi": "&family=Noto+Sans+Devanagari:wght@400;600;700", "ko": "&family=Noto+Sans+KR:wght@400;600;700"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_IMG = ["hero", "bukhara", "camels", "ceramics", "charvak", "chorsu", "khiva", "mountains", "plov", "shahizinda", "tashkent", "tea", "train"]
e = html.escape

ICON = {
 "share": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
 "pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
 "wa": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z"/></svg>',
 "tg": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.8 15.2l-.4 5.5c.6 0 .8-.3 1.1-.5l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9L24.5 3.4c.3-1.5-.6-2.1-1.6-1.7L1 10.2c-1.5.6-1.5 1.4-.3 1.8l5.6 1.7 13-8.2c.6-.4 1.2-.2.7.2z"/></svg>',
 "ig": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>',
 "menu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 "globe": '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5S14.6 18.7 12 21.5C9.4 18.7 8.1 15.5 8.1 12S9.4 5.3 12 2.5z"/></svg>',
 "chat-bubble": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/></svg>',
 "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>',
 "box": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
 "moon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
 "chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h11v8H8l-4 3z"/><path d="M15 9h5v8l-3-2.5h-6V13"/></svg>',
 "tag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
 "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
}

LOGO = ('<svg viewBox="0 0 180 120" aria-hidden="true"><polyline points="8,112 50,62 62,76" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
        '<polyline points="116,52 172,112" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'
        '<path d="M62 112V72c0-21 13-35 28-37 15 2 28 16 28 37v40z" fill="#2fa4c7"/>'
        '<line x1="90" y1="35" x2="90" y2="16" stroke="#f3b443" stroke-width="5" stroke-linecap="round"/><circle cx="90" cy="12" r="5.5" fill="#f3b443"/>'
        '<rect x="52" y="108" width="76" height="9" rx="4.5" fill="#f3b443"/></svg>')


def path_for(lang):
    return "" if lang == "en" else lang + "/"


def render(lang):
    t = T[lang]
    pre = "" if lang == "en" else "../"      # asset prefix
    A = pre + "assets/"
    cfg = CONFIG
    wa = f"https://wa.me/{cfg['whatsapp']}"
    tg = f"https://t.me/{cfg['telegram']}"
    ig = f"https://instagram.com/{cfg['instagram']}"
    tel = "tel:+" + cfg["whatsapp"]
    nav = t["nav"]

    L = LD(lang); U = L["ui"]
    XB = pages.home_blocks(lang, pre, A, ICON); XX = pages.X(lang)
    def tour_card(tr):
        tid = tr["id"]; name, sub = L["tours"][tid]
        seen = []
        for d in tr["days"]:
            for c in ([d[0]] if d[0] else []):
                if c not in seen and not TD.CITIES[c][4]: seen.append(c)
        route = " · ".join(L["cities"][c][0] for c in seen)
        price = f'<div class="price"><small>{e(U["from"])}</small><strong data-from="{tid}">…</strong> <small>{e(t["pp"])}</small></div>'
        flags = "".join(f"<span>{f}</span>" for f in tr["flags"])
        img = tr["cover"]; folder = "" if img in MAIN_IMG else "p/"
        return f'''
      <article class="tour reveal">
        <a class="tour__img" href="tours/{tid}.html"><img src="{A}img/{folder}{img}.webp" alt="{e(name)}" loading="lazy" width="1100" height="760"><span class="tour__days">{len(tr["days"])} {e(U["days"])}</span><div class="tour__flags">{flags}</div></a>
        <div class="tour__body">
          <h3>{e(name)}</h3>
          <div class="tour__route">{e(route)}</div>
          <p>{e(sub)}</p>
          <div class="tour__foot">{price}<a class="btn btn--gold btn--sm" href="tours/{tid}.html">{e(U["view_tour"])} →</a></div>
        </div>
      </article>'''
    ttabs = "".join(f'<button class="ttab" role="tab" data-tc="{c}" aria-selected="{"true" if i == 0 else "false"}">{e(U["country_" + c])}</button>' for i, c in enumerate(TD.COUNTRIES))
    tgrids = "".join(f'<div class="tours tgrid{" is-active" if i == 0 else ""}" data-tc-panel="{c}">' + "".join(tour_card(x) for x in TD.TOURS if x["country"] == c) + '</div>' for i, c in enumerate(TD.COUNTRIES))

    tabs = "".join(
        f'<button class="tab" role="tab" aria-selected="{"true" if i == 0 else "false"}" aria-controls="c-{c["id"]}">{e(t["countries"][c["id"]][0])}</button>'
        for i, c in enumerate(COUNTRIES))
    panels = ""
    for i, c in enumerate(COUNTRIES):
        cname, cdesc = t["countries"][c["id"]]
        badges = "".join(f'<div class="badge"><img src="{A}icons/{b}.webp" alt="{b.replace("-", " ").title()}" loading="lazy" width="300" height="300"></div>' for b in c["badges"])
        panels += f'''
      <div class="country{" is-active" if i == 0 else ""}" id="c-{c["id"]}" role="tabpanel">
        <div class="country__text"><h3>{e(cname)}</h3><p>{e(cdesc)}</p>
          <button class="btn btn--outline" data-contact data-tour="{e(cname)}">{ICON["chat-bubble"]}{e(t["ask_country"])}</button></div>
        <div class="badges">{badges}</div>
      </div>'''

    mosaic = "".join(f'<figure class="reveal"><img src="{A}img/{x}.webp" alt="{e(t["exp"][x])}" loading="lazy"><figcaption>{e(t["exp"][x])}</figcaption></figure>' for x in EXPERIENCES)
    why = "".join(f'<div class="why__item reveal"><div class="why__icon">{ICON[ic]}</div><h3>{e(h)}</h3><p>{e(p)}</p></div>' for ic, h, p in t["why"])
    steps = "".join(f'<div class="step reveal"><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in t["steps"])
    faq = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in t["faq"])
    chips = "".join(f'<span class="chip">{e(c)}</span>' for c in t["chips"])

    langs_menu = "".join(
        f'<a href="{pre}{path_for(l)}" hreflang="{l}" lang="{l}"{" aria-current=\"page\"" if l == lang else ""}>{T[l]["name"]}<small>{l.upper()}</small></a>'
        for l in LANGS)
    alternates = "".join(f'<link rel="alternate" hreflang="{l}" href="{cfg["site_url"]}/{path_for(l)}">' for l in LANGS)
    alternates += f'<link rel="alternate" hreflang="x-default" href="{cfg["site_url"]}/">'
    url = f'{cfg["site_url"]}/{path_for(lang)}'

    js_cfg = json.dumps({"whatsapp": cfg["whatsapp"], "telegram": cfg["telegram"], "instagram": cfg["instagram"], "msgGeneral": t["msg_general"], "msgTour": t["msg_tour"], "bookLabel": pages.X(lang)["bk_btn"]}, ensure_ascii=False)
    ld = json.dumps({
        "@context": "https://schema.org", "@type": "TravelAgency", "name": "Moviy Nomad",
        "description": t["meta_desc"], "url": url, "image": cfg["site_url"] + "/assets/img/hero.webp",
        "areaServed": ["Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Tajikistan"],
        "sameAs": [ig, tg], "parentOrganization": {"@type": "Organization", "name": "Moviy Travel"},
    }, ensure_ascii=False)

    links = [("destinations", "#destinations"), ("tours", "#tours"), ("why", "#why"), ("faq", "#faq"), ("contact", "#contact-us")]
    _x = pages.X(lang)
    navhtml = f'<a href="#tours">{e(nav["tours"])}</a><a href="services.html">{e(_x["nav_services"])}</a><a href="builder.html" class="nav__build">{e(t["build_nav"])}</a><a href="#reviews">{e(_x["nav_reviews"])}</a><a href="#about">{e(_x["nav_about"])}</a><a href="#contact-us">{e(nav["contact"])}</a>'
    year = "2026"

    return f'''<!DOCTYPE html>
<html lang="{lang}" dir="{t["dir"]}" data-base="{pre}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(t["meta_title"])}</title>
<meta name="description" content="{e(t["meta_desc"])}">
<link rel="canonical" href="{url}">{alternates}
<meta property="og:type" content="website"><meta property="og:title" content="{e(t["meta_title"])}"><meta property="og:description" content="{e(t["meta_desc"])}">
<meta property="og:image" content="{cfg["site_url"]}/assets/img/hero.webp"><meta property="og:url" content="{url}">
<meta name="theme-color" content="#12355b">
<link rel="icon" href="{A}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito+Sans:wght@400;600;700{EXTRA_FONT.get(lang, "")}&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="{A}img/hero.webp">
<link rel="stylesheet" href="{A}css/site.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="header">
  <div class="container header__bar">
    <a class="logo" href="{pre}{path_for(lang)}" aria-label="Moviy Nomad">{LOGO}<span class="logo__text">MOVIY<span>NOMAD</span></span></a>
    <nav class="nav">{navhtml}</nav>
    <div class="header__right">
      <a class="agent-link" href="{pre}agent/">{e(t["agent_login"])}</a>
      <button class="hshare" data-share="site" aria-label="{e(U["share"])}" title="{e(U["share"])}">{ICON["share"]}</button>
      <div class="lang"><button class="lang__btn" aria-label="Language">{ICON["globe"]}{lang.upper()}</button><div class="lang__menu">{langs_menu}</div></div>
      <button class="btn btn--gold btn--sm header__cta" data-contact>{e(t["plan"])}</button>
      <button class="burger" aria-label="Menu">{ICON["menu"]}</button>
    </div>
  </div>
</header>

<main>
  <section class="hero">
    <div class="hero__bg" style="background-image:url({A}img/hero.webp)"></div>
    <div class="container">
      <div class="hero__content">
        <span class="eyebrow">{e(t["hero_eyebrow"])}</span>
        <h1>{t["hero_title"]}</h1>
        <p class="hero__sub">{e(t["hero_sub"])}</p>
        <div class="hero__actions">
          <a class="btn btn--wa" href="{wa}" data-wa target="_blank" rel="noopener">{ICON["wa"]}{e(t["btn_wa"])}</a>
          <a class="btn btn--tg" href="{tg}" target="_blank" rel="noopener">{ICON["tg"]}{e(t["btn_tg"])}</a>
          <a class="btn btn--ig" href="{ig}" target="_blank" rel="noopener">{ICON["ig"]}Instagram</a>
        </div>
        <div class="chips">{chips}</div>
      </div>
    </div>
    <span class="hero__scroll" aria-hidden="true"></span>
  </section>

  <section class="section" id="destinations">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["dest_eyebrow"])}</span><h2>{e(t["dest_title"])}</h2><p>{e(t["dest_sub"])}</p></div>
      <div class="tabs" role="tablist">{tabs}</div>
      {panels}
    </div>
  </section>

  <section class="section section--sand" id="tours">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(U["h_eyebrow"])}</span><h2>{e(U["h_title"])}</h2><p>{e(U["h_sub"])}</p></div>
      <div class="ttabs" role="tablist">{ttabs}</div>
      {tgrids}
      <p class="tours-note">{e(t["tours_note"])}</p>
    </div>
  </section>

{XB["services"]}

  <section class="section builder-cta">
    <div class="container">
      <div class="bcta reveal">
        <div class="bcta__text"><span class="eyebrow">{e(t["build_nav"])}</span><h2>{e(t["build_title"])}</h2><p>{e(t["build_sub"])}</p>
          <a class="btn btn--gold" href="builder.html">{e(t["build_btn"])} →</a></div>
        <div class="bcta__img"><img src="{A}img/p/yurt.webp" alt="" loading="lazy"><img src="{A}img/p/ichan-kala.webp" alt="" loading="lazy"><img src="{A}img/p/gur-e-amir.webp" alt="" loading="lazy"></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["exp_eyebrow"])}</span><h2>{e(t["exp_title"])}</h2><p>{e(t["exp_sub"])}</p></div>
      <div class="mosaic">{mosaic}</div>
    </div>
  </section>

  <section class="section section--navy" id="why">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["why_eyebrow"])}</span><h2>{e(t["why_title"])}</h2></div>
      <div class="why">{why}</div>
    </div>
  </section>

{XB["about"]}

  <section class="section section--sand">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["steps_eyebrow"])}</span><h2>{e(t["steps_title"])}</h2></div>
      <div class="steps">{steps}</div>
    </div>
  </section>

{XB["reviews"]}

  <section class="section" id="faq">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["faq_eyebrow"])}</span><h2>{e(t["faq_title"])}</h2></div>
      <div class="faq">{faq}</div>
    </div>
  </section>

  <section class="section" id="contact-us" style="padding-top:0">
    <div class="container">
      <div class="cta reveal">
        <div><h2>{e(t["cta_title"])}</h2><p>{e(t["cta_sub"])}</p></div>
        <div class="cta__actions">
          <a class="btn btn--wa" href="{wa}" data-wa target="_blank" rel="noopener">{ICON["wa"]}{e(t["btn_wa"])}</a>
          <a class="btn btn--tg" href="{tg}" target="_blank" rel="noopener">{ICON["tg"]}{e(t["btn_tg"])}</a>
          <a class="btn btn--ig" href="{ig}" target="_blank" rel="noopener">{ICON["ig"]}Instagram</a>
        </div>
        <p class="cta__phone"><a href="{tel}">{ICON["phone"]}{e(cfg.get("phone",""))}</a> · {e(cfg.get("manager",""))}</p>
      </div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__about">
        <a class="logo" href="{pre}{path_for(lang)}">{LOGO}<span class="logo__text">MOVIY<span>NOMAD</span></span></a>
        <p>{e(t["footer_about"])}<br>{e(t["footer_part"])}</p>
        <div class="socials">
          <a href="{wa}" data-wa target="_blank" rel="noopener" aria-label="WhatsApp">{ICON["wa"]}</a>
          <a href="{tg}" target="_blank" rel="noopener" aria-label="Telegram">{ICON["tg"]}</a>
          <a href="{ig}" target="_blank" rel="noopener" aria-label="Instagram">{ICON["ig"]}</a>
        </div>
      </div>
      <div><h4>{e(t["footer_nav"])}</h4><ul>{"".join(f'<li><a href="{h}">{e(nav[k])}</a></li>' for k, h in links[:4])}</ul></div>
      <div><h4>{e(t["footer_contact"])}</h4><ul>
        <li><a href="{tel}">{e(cfg.get("phone",""))}</a><br><small>{e(cfg.get("manager",""))}</small></li>
        <li><a href="{wa}" data-wa target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="{tg}" target="_blank" rel="noopener">Telegram @{cfg["telegram"]}</a></li>
        <li><a href="{ig}" target="_blank" rel="noopener">Instagram @{cfg["instagram"]}</a></li>
        <li><a href="https://instagram.com/{cfg["parent_instagram"]}" target="_blank" rel="noopener">Moviy Travel @{cfg["parent_instagram"]}</a></li>
        <li><a href="services.html">{e(XX["nav_services"])}</a> · <a href="booking.html">{e(XX["bk_btn"])}</a></li>
        {f'<li><a href="mailto:{cfg["email"]}">{cfg["email"]}</a></li>' if cfg["email"] else ""}
        <li><a href="{pre}agent/">{e(t["agent_login"])} →</a></li>
      </ul></div>
    </div>
    {pages.footer_legal(lang, pre)}
    <div class="footer__bottom"><span>© {year} Moviy Nomad. {e(t["rights"])}</span><span>{" · ".join(f'<a href="{pre}{path_for(l)}">{T[l]["name"]}</a>' for l in LANGS)}</span></div>
  </div>
</footer>

<div class="sbar" aria-label="{e(U["contact_us"])}">
  <a class="sbar__wa" href="{wa}" data-wa target="_blank" rel="noopener" aria-label="WhatsApp">{ICON["wa"]}</a>
  <a class="sbar__tg" href="{tg}" target="_blank" rel="noopener" aria-label="Telegram">{ICON["tg"]}</a>
  <a class="sbar__ig" href="{ig}" target="_blank" rel="noopener" aria-label="Instagram">{ICON["ig"]}</a>
</div>

<button class="fab" data-contact aria-label="{e(t["fab"])}">{ICON["chat-bubble"]}<span>{e(t["fab"])}</span></button>

<div class="modal" id="contact" role="dialog" aria-modal="true" aria-labelledby="contact-title">
  <div class="modal__box">
    <button class="modal__close" aria-label="Close">×</button>
    <h3 id="contact-title">{e(t["modal_title"])}</h3>
    <div class="modal__tour"></div>
    <div class="modal__opts">
      <a class="opt opt--wa" href="{wa}" target="_blank" rel="noopener"><span class="opt__ic">{ICON["wa"]}</span><span><strong>{e(t["opt_wa"][0])}</strong><small>{e(t["opt_wa"][1])}</small></span></a>
      <a class="opt opt--tg" href="{tg}" target="_blank" rel="noopener"><span class="opt__ic">{ICON["tg"]}</span><span><strong>{e(t["opt_tg"][0])}</strong><small>{e(t["opt_tg"][1])}</small></span></a>
      <a class="opt opt--ig" href="{ig}" target="_blank" rel="noopener"><span class="opt__ic">{ICON["ig"]}</span><span><strong>{e(t["opt_ig"][0])}</strong><small>{e(t["opt_ig"][1])}</small></span></a>
      <a class="opt opt--tel" href="{tel}"><span class="opt__ic">{ICON["phone"]}</span><span><strong>{e(cfg.get("phone",""))}</strong><small>{e(cfg.get("manager",""))}</small></span></a>
    </div>
  </div>
</div>

<script>window.MN={js_cfg};</script>
<script src="{A}data/catalog.js"></script><script src="{A}data/places.js"></script><script src="{A}data/tours.js"></script><script src="{A}data/l10n/{l10n_lang(lang)}.js"></script><script src="{A}js/engine.js"></script><script src="{A}js/share.js"></script>
<script>document.querySelectorAll("[data-from]").forEach(function(el){{var t=MN_TOURS[el.getAttribute("data-from")];if(t)el.textContent="$"+MN_ENGINE.fromPrice(t).toLocaleString("en");}});</script>
<script>window.MNX={pages.js_strings(lang)};window.MN_LANG="{lang}";</script><script src="{A}js/sb-config.js"></script><script src="{A}js/forms.js" defer></script>
<script src="{A}js/site.js" defer></script>
</body>
</html>
'''


HEAD = """<!DOCTYPE html>
<html lang="{lang}" dir="{dir}" data-base="{base}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><meta name="theme-color" content="#12355b">
<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito+Sans:wght@400;600;700{font}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}assets/css/site.css"><link rel="stylesheet" href="{base}assets/css/deck.css">
</head>"""

SCRIPTS = """<script>window.MN={cfg};</script>
<script src="{base}assets/data/catalog.js"></script><script src="{base}assets/data/places.js"></script><script src="{base}assets/data/geo.js"></script><script src="{base}assets/data/tours.js"></script>
<script src="{base}assets/data/l10n/{l10n}.js"></script><script src="{base}assets/js/engine.js"></script><script src="{base}assets/js/share.js"></script><script src="{base}assets/js/{js}.js"></script>"""


def page_cfg(lang="en"):
    t = T[lang]
    return json.dumps({"whatsapp": CONFIG["whatsapp"], "telegram": CONFIG["telegram"], "instagram": CONFIG["instagram"], "msgGeneral": t["msg_general"], "msgTour": t["msg_tour"]}, ensure_ascii=False)


def head(lang, base, title, desc):
    return HEAD.format(base=base, title=e(title), desc=e(desc), lang=lang, dir=T[lang]["dir"], font=EXTRA_FONT.get(lang, ""))


def lang_menu(lang, base, page):
    items = "".join(f'<a href="{base}{path_for(l)}{page}" hreflang="{l}" lang="{l}"{" aria-current=\"page\"" if l == lang else ""}>{T[l]["name"]}<small>{l.upper()}</small></a>' for l in LANGS)
    return f'<div class="lang lang--deck"><button class="lang__btn" aria-label="Language" onclick="event.stopPropagation();this.parentNode.classList.toggle(\'is-open\')">{ICON["globe"]}{lang.upper()}</button><div class="lang__menu">{items}</div></div>'


def render_tour(tid, lang):
    base = "../" if lang == "en" else "../../"
    L = LD(lang); home = "../index.html#tours"
    return head(lang, base, f"{L['tours'][tid][0]} — Moviy Nomad", L["tours"][tid][1]) + f"""
<body class="deck-page" data-tour="{tid}" onclick="var m=document.querySelector('.lang.is-open');if(m)m.classList.remove('is-open')">
<header class="topbar"><a class="logo" href="{home}" aria-label="Moviy Nomad">{LOGO}</a><div class="topbar__title" id="t-title"></div><button class="tb-btn" id="share" data-share="tour" title="{e(L['ui']['share'])}">{ICON["share"]}<span>{e(L['ui']['share'])}</span></button>{lang_menu(lang, base, "tours/" + tid + ".html")}<span class="topbar__count" id="count"></span><a class="close" href="{home}" aria-label="{e(L['ui']['close'])}">×</a></header>
<div class="bar" id="bar"></div>
<div class="sample" id="sample" hidden></div>
<main id="deck"></main>
<nav class="dock"><button class="dock__arrow" id="prev" aria-label="‹">‹</button><div id="dots"></div><button class="dock__arrow dock__arrow--next" id="next" aria-label="›">›</button></nav>
""" + SCRIPTS.format(base=base, cfg=page_cfg(lang), js="deck", l10n=l10n_lang(lang)) + "\n</body></html>\n"


def builder_body(months, interests, U):
    return f"""<main class="container bwrap">
  <div class="bhead"><span class="eyebrow">{e(U["b_eyebrow"])}</span><h1>{e(U["b_title"])}</h1><p>{e(U["b_sub"])}</p></div>
  <div>
    <div class="bstep"><h3><span>1</span>{e(U["b_step1"])}</h3>
      <div class="presets" id="presets"></div>
      <div id="cities"></div></div>
    <div class="bstep"><h3><span>2</span>{e(U["b_step2"])}</h3><div id="route"></div></div>
    <div class="bstep"><h3><span>3</span>{e(U["b_step3"])}</h3><div class="cards" id="hotel"></div></div>
    <div class="bstep"><h3><span>4</span>{e(U["b_step4"])}</h3><div class="cards" id="transport"></div></div>
    <div class="bstep"><h3><span>5</span>{e(U["b_step5"])}</h3>
      <div class="brow"><div><label class="lbl">{e(U["travellers"])}</label><div class="stepper"><button data-pax="-1" aria-label="−">−</button><b id="pax">2</b><button data-pax="1" aria-label="+">+</button></div><label class="tgl"><input type="checkbox" id="single"> {e(U["single_room"])}</label></div>
      <div><label class="lbl" for="lang">{e(U["guide_lang"])}</label><select id="lang"></select><label class="lbl" for="month" style="margin-top:14px">{e(U["b_month"])}</label><select id="month">{months}</select></div></div>
      <label class="lbl" style="margin-top:18px">{e(U["b_interests"])}</label><div class="chks">{interests}</div></div>
  </div>
  <aside class="result is-empty" id="result">
    <svg id="bmap"></svg>
    <div class="bstats" id="bstats"></div>
    <div class="bprice"><small>{e(U["b_est"])}</small><strong id="bprice">—</strong><small id="btotal"></small>
      <a class="btn btn--wa is-disabled" id="send" target="_blank" rel="noopener">{e(U["b_send_wa"])}</a>
      <a class="btn btn--outline" id="sendtg" href="#" target="_blank" rel="noopener" style="width:100%;margin-top:10px">{e(U["b_send_tg"])}</a></div>
    <p class="bnote">{e(U["b_note"])}</p>
  </aside>
</main>"""


def builder_inputs(U):
    months = "".join(f'<option value="{e(m) if i else ""}">{e(m)}</option>' for i, m in enumerate(U["months"]))
    interests = "".join(f'<label class="chk"><input type="checkbox" name="interest" value="{e(x)}"> {e(x)}</label>' for x in U["interests"])
    return months, interests


def render_builder(lang):
    base = "" if lang == "en" else "../"
    U = LD(lang)["ui"]
    months, interests = builder_inputs(U)
    return head(lang, base, f'{U["b_title"]} — Moviy Nomad', U["b_sub"]) + f"""
<body class="builder-page">
<header class="header is-solid"><div class="container header__bar"><a class="logo" href="index.html" aria-label="Moviy Nomad">{LOGO}<span class="logo__text">MOVIY<span>NOMAD</span></span></a>
<nav class="nav" style="display:flex"><a href="index.html#tours">{e(U["nav_ready"])}</a><a href="index.html#faq">{e(U["nav_faq"])}</a></nav>{lang_menu(lang, base, "builder.html")}</div></header>
<div class="sample" id="sample" hidden style="top:86px"></div>
{builder_body(months, interests, U)}
""" + SCRIPTS.format(base=base, cfg=page_cfg(lang), js="builder", l10n=l10n_lang(lang)) + "\n</body></html>\n"


PORTAL_HEAD = """<!DOCTYPE html>
<html lang="{lang}" dir="ltr" data-base="../">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="robots" content="noindex"><meta name="theme-color" content="#12355b">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/site.css"><link rel="stylesheet" href="../assets/css/deck.css"><link rel="stylesheet" href="../assets/css/portal.css">
</head>"""


def render_agent():
    months, interests = builder_inputs(LD("en")["ui"])
    countries = "".join(f"<option>{c}</option>" for c in ["Germany", "Sweden", "Turkey", "United Arab Emirates", "Saudi Arabia", "China", "India", "South Korea", "Russia", "Kazakhstan", "United Kingdom", "France", "Italy", "Spain", "Netherlands", "Poland", "USA", "Japan", "Malaysia", "Indonesia", "Other"])
    return PORTAL_HEAD.format(lang="en", title="Agent portal — Moviy Nomad") + f"""
<body class="portal">
<header class="p-top"><div class="container p-top__bar"><a class="logo" href="../index.html">{LOGO}<span class="logo__text">MOVIY<span>NOMAD</span></span></a><span class="p-top__tag">Agent portal</span><span class="p-top__sp"></span>
  <div class="p-top__who hidden" id="who"></div><button class="btn btn--ghost btn--sm hidden" id="logout">Log out</button></div>
  <nav class="p-tabs hidden" id="tabs"><div class="container" style="display:flex;gap:4px"><button data-view="quote" class="is-on">New quote</button><button data-view="list">My bookings</button><button data-view="agency">Agency</button></div></nav>
</header>
<main class="container p-main">
  <div class="msg msg--err" id="notcfg" hidden>The portal is not connected to the database yet.</div>

  <section id="v-auth" class="p-auth hidden"><div class="p-card">
    <div class="seg"><button data-auth="login" class="is-on">Log in</button><button data-auth="register">Register your agency</button></div>
    <form id="f-login">
      <h2>Welcome, partner</h2><p class="p-sub">Log in to quote tours with your net prices and book for your clients.</p>
      <div class="fld"><label>E-mail</label><input type="email" name="email" required autocomplete="email"></div>
      <div class="fld" style="margin-top:12px"><label>Password</label><input type="password" name="password" required autocomplete="current-password"></div>
      <div class="msg" id="m-login"></div>
      <div class="p-actions"><button class="btn btn--gold" type="submit">Log in</button><button class="btn btn--outline" type="button" id="forgot">Forgot password</button></div>
    </form>
    <form id="f-register" class="hidden">
      <h2>Become a partner agency</h2><p class="p-sub">We check every agency by hand. After approval you get net prices and online booking.</p>
      <div class="p-grid">
        <div class="fld full"><label>Agency name *</label><input name="agency_name" required></div>
        <div class="fld"><label>Country *</label><select name="country" required>{countries}</select></div>
        <div class="fld"><label>City</label><input name="city"></div>
        <div class="fld full"><label>Address</label><input name="address"></div>
        <div class="fld"><label>Website</label><input name="website" placeholder="https://"></div>
        <div class="fld"><label>License / registration no.</label><input name="license_no"></div>
        <div class="fld"><label>Contact person *</label><input name="contact_name" required></div>
        <div class="fld"><label>Phone</label><input name="phone"></div>
        <div class="fld"><label>WhatsApp</label><input name="whatsapp"></div>
        <div class="fld"><label>E-mail (login) *</label><input type="email" name="email" required autocomplete="email"></div>
        <div class="fld full"><label>Password * <small>(min. 8 characters)</small></label><input type="password" name="password" minlength="8" required autocomplete="new-password"></div>
        <label class="chk full"><input type="checkbox" required> I agree that Moviy Nomad checks my agency documents and stores my clients' passport data only to arrange their trip.</label>
      </div>
      <div class="msg" id="m-register"></div>
      <div class="p-actions"><button class="btn btn--gold" type="submit">Send application</button></div>
    </form>
  </div></section>

  <section id="v-pending" class="hidden"><div class="p-card">
    <h2 id="pend-title">Your application is being reviewed</h2>
    <p class="p-sub" id="pend-text">Please upload your company registration and tourism license. We usually review applications within 1–2 working days.</p>
    <div class="files" id="pend-docs"></div>
    <div class="p-grid" style="margin-top:16px"><div class="fld"><label>Document type</label><select id="doc-kind"><option value="registration">Company registration</option><option value="license">Tourism license</option><option value="id">ID of the director</option><option value="other">Other</option></select></div>
      <div class="fld"><label>File (PDF or image)</label><input type="file" id="doc-file" accept=".pdf,image/*"></div></div>
    <div class="msg" id="m-docs"></div>
    <div class="p-actions"><button class="btn btn--navy" id="doc-up">Upload document</button></div>
  </div></section>

  <section id="v-quote" class="hidden">
    {builder_body(months, interests, LD("en")["ui"])}
    <div class="p-card" id="q-box" style="margin-top:20px">
      <h3>Your quote</h3>
      <div id="q-empty" class="empty">Choose a ready tour or build a route above.</div>
      <div id="q-body" class="hidden">
        <div class="kv"><div><small>Tour</small><b id="q-title"></b></div><div><small>Travellers</small><b id="q-pax"></b></div><div><small>Brutto (client price)</small><b id="q-brutto"></b></div><div class="hl"><small>Your netto</small><b id="q-netto"></b></div></div>
        <p class="p-sub" style="margin-top:10px" id="q-comm"></p>
        <div class="p-grid"><div class="fld"><label>Start date *</label><input type="date" id="q-date"></div><div class="fld"><label>Note for Moviy Nomad</label><input id="q-note" placeholder="Arrival flight, special wishes…"></div></div>
        <div class="msg" id="m-quote"></div>
        <div class="p-actions"><button class="btn btn--gold" id="q-book">Book this tour →</button></div>
      </div>
    </div>
  </section>

  <section id="v-list" class="hidden"><div class="p-card"><h2>My bookings</h2><p class="p-sub">All requests and bookings of your agency.</p><div id="list"></div></div></section>

  <section id="v-booking" class="hidden"></section>

  <section id="v-agency" class="hidden"><div class="p-card" id="agency-box"></div></section>
</main>
<script>window.MN={page_cfg()};</script>
<script src="../assets/vendor/supabase.js"></script><script src="../assets/js/sb-config.js"></script><script src="../assets/js/portal-core.js"></script>
<script src="../assets/data/catalog.js"></script><script src="../assets/data/places.js"></script><script src="../assets/data/geo.js"></script><script src="../assets/data/tours.js"></script>
<script src="../assets/data/l10n/en.js"></script><script src="../assets/js/engine.js"></script><script src="../assets/js/builder.js"></script><script src="../assets/js/agent.js"></script>
</body></html>
"""


def render_admin():
    return PORTAL_HEAD.format(lang="uz", title="Admin panel — Moviy Nomad") + f"""
<body class="portal">
<header class="p-top"><div class="container p-top__bar"><a class="logo" href="../index.html">{LOGO}<span class="logo__text">MOVIY<span>NOMAD</span></span></a><span class="p-top__tag">Admin</span><span class="p-top__sp"></span>
  <div class="p-top__who hidden" id="who"></div><button class="btn btn--ghost btn--sm hidden" id="logout">Chiqish</button></div>
  <nav class="p-tabs hidden" id="tabs"><div class="container" style="display:flex;gap:4px"><button data-view="bookings" class="is-on">Bronlar</button><button data-view="agencies">Agentliklar</button><button data-view="requests">Mijoz so'rovlari</button><button data-view="posts">Hikoyalar</button></div></nav>
</header>
<main class="container p-main">
  <div class="msg msg--err" id="notcfg" hidden>Panel hali bazaga ulanmagan (assets/js/sb-config.js).</div>
  <section id="v-login" class="p-auth hidden"><div class="p-card"><form id="f-login">
    <h2>Admin panel</h2><p class="p-sub">Faqat Moviy Nomad xodimlari uchun.</p>
    <div class="fld"><label>E-mail</label><input type="email" name="email" required></div>
    <div class="fld" style="margin-top:12px"><label>Parol</label><input type="password" name="password" required></div>
    <div class="msg" id="m-login"></div><div class="p-actions"><button class="btn btn--gold" type="submit">Kirish</button></div></form></div></section>
  <section id="v-bookings" class="hidden"><div class="p-card"><h2>Bronlar</h2><div class="filters" id="bf"></div><div id="blist"></div></div></section>
  <section id="v-booking" class="hidden"></section>
  <section id="v-agencies" class="hidden"><div class="p-card"><h2>Agentliklar</h2><div class="filters" id="af"></div><div id="alist"></div></div></section>
  <section id="v-agency" class="hidden"></section>
  <section id="v-requests" class="hidden"><div class="p-card"><h2>Mijoz so'rovlari (sayt: bron va xizmatlar)</h2><div class="filters" id="rf"></div><div id="rlist"></div></div></section>
  <section id="v-request" class="hidden"></section>
  <section id="v-posts" class="hidden"><div class="p-card"><h2>Sayohatchilar hikoyalari</h2><p class="p-sub">Tasdiqlangan hikoyalar saytda darhol ko'rinadi.</p><div class="filters" id="pf"></div><div id="plist"></div></div></section>
</main>
<script>window.MN={page_cfg()};</script>
<script src="../assets/vendor/supabase.js"></script><script src="../assets/vendor/jspdf.umd.min.js"></script>
<script src="../assets/js/sb-config.js"></script><script src="../assets/js/portal-core.js"></script><script src="../assets/js/voucher.js"></script><script src="../assets/js/admin.js"></script><script src="../assets/js/admin-site.js"></script>
</body></html>
"""


def main():
    for lang in LANGS:
        out = os.path.join(ROOT, path_for(lang), "index.html")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(render(lang))
        print("ok", os.path.relpath(out, ROOT))
    build_tours.main()
    ids = {tr["id"] for tr in TD.TOURS}
    for lang in LANGS:
        d = os.path.join(ROOT, path_for(lang), "tours"); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d):
            if f.endswith(".html") and f[:-5] not in ids: os.remove(os.path.join(d, f))
        for tr in TD.TOURS:
            with open(os.path.join(d, tr["id"] + ".html"), "w", encoding="utf-8") as f:
                f.write(render_tour(tr["id"], lang))
        with open(os.path.join(ROOT, path_for(lang), "builder.html"), "w", encoding="utf-8") as f:
            f.write(render_builder(lang))
        print("ok", lang, "tours + builder")
    names = {l: T[l]["name"] for l in LANGS}
    for lang in LANGS:
        d = os.path.join(ROOT, path_for(lang)); font = EXTRA_FONT.get(lang, ""); L = LD(lang)
        out = {"services.html": pages.render_services(lang, ICON, LOGO, font, names),
               "booking.html": pages.render_booking(lang, ICON, LOGO, font, names, TD.TOURS, L),
               "stories.html": pages.render_stories(lang, ICON, LOGO, font, names),
               "privacy.html": pages.render_legal(lang, "privacy", ICON, LOGO, font, names),
               "terms.html": pages.render_legal(lang, "terms", ICON, LOGO, font, names)}
        for fn, h in out.items():
            with open(os.path.join(d, fn), "w", encoding="utf-8") as f: f.write(h)
        miss = pages.missing_keys(lang)
        print("ok", lang, "pages", ("MISSING " + ",".join(miss)) if miss else "")
    with open(os.path.join(ROOT, "agent", "index.html"), "w", encoding="utf-8") as f:
        f.write(render_agent())
    print("ok agent/index.html")
    os.makedirs(os.path.join(ROOT, "admin"), exist_ok=True)
    with open(os.path.join(ROOT, "admin", "index.html"), "w", encoding="utf-8") as f:
        f.write(render_admin())
    print("ok admin/index.html")
    # favicon
    with open(os.path.join(ROOT, "assets", "favicon.svg"), "w") as f:
        f.write(LOGO.replace('<svg viewBox="0 0 180 120" aria-hidden="true">', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -30 200 180"><rect x="-10" y="-30" width="200" height="180" rx="36" fill="#12355b"/>'))
    if CONFIG["whatsapp"] == "998000000000":
        print("DIQQAT: build/content.py ichida haqiqiy WhatsApp raqamini kiriting!")


def bust_cache():
    """Append ?v=<content hash> to local css/js links so browsers fetch fresh files after each update."""
    import hashlib, re as _re
    root = ROOT if "ROOT" in globals() else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pat = _re.compile(r'((?:href|src)=")([^"?#]*assets/[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in (".git", "build", "node_modules")]
        for f in fn:
            if not f.endswith(".html"): continue
            fp = os.path.join(dp, f); html = open(fp, encoding="utf-8").read()
            def rep(m):
                tgt = os.path.normpath(os.path.join(dp, m.group(2)))
                if not os.path.exists(tgt): return m.group(0)
                h = hashlib.md5(open(tgt, "rb").read()).hexdigest()[:8]
                return m.group(1) + m.group(2) + "?v=" + h + m.group(3)
            new = pat.sub(rep, html)
            if new != html: open(fp, "w", encoding="utf-8").write(new)


if __name__ == "__main__":
    main()
    bust_cache()
