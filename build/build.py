# -*- coding: utf-8 -*-
"""Moviy Nomad saytini yig'ish: python3 build/build.py
Natija: index.html (EN), ru/index.html, tr/index.html, ar/index.html
"""
import html, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from content import CONFIG, TOURS, COUNTRIES, EXPERIENCES, LANGS, T

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape

ICON = {
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
    nav = t["nav"]

    def tour_card(tr):
        name, route, desc = t["tours"][tr["id"]]
        if tr["price"]:
            price = f'<div class="price"><small>{e(t["from"])}</small><strong>${tr["price"]:,}</strong> <small>{e(t["pp"])}</small></div>'
        else:
            price = f'<div class="price price--req"><small>&nbsp;</small><strong>{e(t["on_request"])}</strong></div>'
        flags = "".join(f"<span>{f}</span>" for f in tr["flags"])
        return f'''
      <article class="tour reveal">
        <div class="tour__img"><img src="{A}img/{tr["img"]}.webp" alt="{e(name)}" loading="lazy" width="1100" height="825"><span class="tour__days">{tr["days"]} {e(t["days"])}</span><div class="tour__flags">{flags}</div></div>
        <div class="tour__body">
          <h3>{e(name)}</h3>
          <div class="tour__route">{e(route)}</div>
          <p>{e(desc)}</p>
          <div class="tour__foot">{price}<button class="btn btn--gold btn--sm" data-contact data-tour="{e(name)}">{e(t["ask"])}</button></div>
        </div>
      </article>'''

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

    js_cfg = json.dumps({"whatsapp": cfg["whatsapp"], "msgGeneral": t["msg_general"], "msgTour": t["msg_tour"]}, ensure_ascii=False)
    ld = json.dumps({
        "@context": "https://schema.org", "@type": "TravelAgency", "name": "Moviy Nomad",
        "description": t["meta_desc"], "url": url, "image": cfg["site_url"] + "/assets/img/hero.webp",
        "areaServed": ["Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Tajikistan"],
        "sameAs": [ig, tg], "parentOrganization": {"@type": "Organization", "name": "Moviy Travel"},
    }, ensure_ascii=False)

    links = [("destinations", "#destinations"), ("tours", "#tours"), ("why", "#why"), ("faq", "#faq"), ("contact", "#contact-us")]
    navhtml = "".join(f'<a href="{h}">{e(nav[k])}</a>' for k, h in links)
    year = "2026"

    return f'''<!DOCTYPE html>
<html lang="{lang}" dir="{t["dir"]}">
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
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
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
      <div class="section-head reveal"><span class="eyebrow">{e(t["tours_eyebrow"])}</span><h2>{e(t["tours_title"])}</h2><p>{e(t["tours_sub"])}</p></div>
      <div class="tours">{"".join(tour_card(x) for x in TOURS)}</div>
      <p class="tours-note">{e(t["tours_note"])}</p>
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

  <section class="section section--sand">
    <div class="container">
      <div class="section-head reveal"><span class="eyebrow">{e(t["steps_eyebrow"])}</span><h2>{e(t["steps_title"])}</h2></div>
      <div class="steps">{steps}</div>
    </div>
  </section>

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
        <li><a href="{wa}" data-wa target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="{tg}" target="_blank" rel="noopener">Telegram @{cfg["telegram"]}</a></li>
        <li><a href="{ig}" target="_blank" rel="noopener">Instagram @{cfg["instagram"]}</a></li>
        {f'<li><a href="mailto:{cfg["email"]}">{cfg["email"]}</a></li>' if cfg["email"] else ""}
      </ul></div>
    </div>
    <div class="footer__bottom"><span>© {year} Moviy Nomad. {e(t["rights"])}</span><span>{" · ".join(f'<a href="{pre}{path_for(l)}">{T[l]["name"]}</a>' for l in LANGS)}</span></div>
  </div>
</footer>

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
    </div>
  </div>
</div>

<script>window.MN={js_cfg};</script>
<script src="{A}js/site.js" defer></script>
</body>
</html>
'''


def main():
    for lang in LANGS:
        out = os.path.join(ROOT, path_for(lang), "index.html")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(render(lang))
        print("ok", os.path.relpath(out, ROOT))
    # favicon
    with open(os.path.join(ROOT, "assets", "favicon.svg"), "w") as f:
        f.write(LOGO.replace('<svg viewBox="0 0 180 120" aria-hidden="true">', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -30 200 180"><rect x="-10" y="-30" width="200" height="180" rx="36" fill="#12355b"/>'))
    if CONFIG["whatsapp"] == "998000000000":
        print("DIQQAT: build/content.py ichida haqiqiy WhatsApp raqamini kiriting!")


if __name__ == "__main__":
    main()
