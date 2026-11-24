# -*- coding: utf-8 -*-
"""Moviy Nomad — 36 ready tours (9 per country): structure only (language-neutral).
Texts live in build/l10n/<lang>.py. Built into assets/data/tours.js + assets/data/l10n/<lang>.js.
Day = (sleep_city or None, [[from, to], ...] moves, [sight ids], meals "B,L,D")
"""

COUNTRIES = ["UZ", "KZ", "KG", "TJ"]

# id: (country, lat, lon, img, hidden)
CITIES = {
    "tashkent": ("UZ", 41.31, 69.24, "tashkent-sky", 0), "samarkand": ("UZ", 39.65, 66.96, "registan", 0),
    "bukhara": ("UZ", 39.77, 64.42, "lyabi-hauz", 0), "khiva": ("UZ", 41.38, 60.36, "khiva-air", 0),
    "urgench": ("UZ", 41.55, 60.63, "khiva-air", 1), "shahrisabz": ("UZ", 39.05, 66.83, "uz-shahrisabz", 0),
    "aydarkul": ("UZ", 40.80, 66.20, "yurt", 0), "chimgan": ("UZ", 41.56, 70.02, "chimgan", 0),
    "fergana": ("UZ", 40.38, 71.78, "fergana", 0), "kokand": ("UZ", 40.53, 70.94, "uz-kokand-mosque", 0),
    "termez": ("UZ", 37.22, 67.28, "uz-termez", 0), "nukus": ("UZ", 42.46, 59.60, "kyzylkum", 0),
    "moynaq": ("UZ", 43.77, 59.02, "uz-aral", 0), "ayazkala": ("UZ", 42.32, 61.03, "uz-ayazkala", 0),
    "gijduvan": ("UZ", 40.10, 64.68, "uz-pottery", 1), "nurata": ("UZ", 40.56, 65.69, "kyzylkum", 0),
    "sentyab": ("UZ", 40.65, 66.10, "autumn-mountains", 0),
    "almaty": ("KZ", 43.24, 76.89, "kz-almaty", 0), "charyn": ("KZ", 43.35, 79.08, "kz-charyn", 0),
    "saty": ("KZ", 42.95, 78.97, "kz-kolsai", 0), "altynemel": ("KZ", 44.10, 78.30, "kz-dune", 0),
    "shymkent": ("KZ", 42.32, 69.59, "kz-shymkent", 0), "turkistan": ("KZ", 43.30, 68.25, "kz-turkistan", 0),
    "astana": ("KZ", 51.17, 71.45, "kz-astana", 0), "burabay": ("KZ", 53.08, 70.30, "kz-burabay", 0),
    "aktau": ("KZ", 43.65, 51.17, "kz-mangystau", 0), "bozzhyra": ("KZ", 43.43, 54.05, "kz-bozzhyra", 0),
    "oskemen": ("KZ", 49.95, 82.61, "kz-altai", 0), "katonkaragay": ("KZ", 49.17, 85.61, "kz-altai", 0),
    "rakhman": ("KZ", 49.08, 86.50, "kz-altai", 0),
    "bishkek": ("KG", 42.87, 74.59, "kg-bishkek", 0), "issykkul": ("KG", 42.65, 77.08, "kg-issykkul", 0),
    "karakol": ("KG", 42.49, 78.39, "kg-karakol", 0), "osh": ("KG", 40.51, 72.81, "kg-osh", 0),
    "kochkor": ("KG", 42.21, 75.75, "kg-felt", 0), "songkul": ("KG", 41.85, 75.13, "kg-songkul", 0),
    "naryn": ("KG", 41.43, 76.00, "kg-naryn", 0), "tashrabat": ("KG", 40.82, 75.29, "kg-tashrabat", 0),
    "bokonbaeva": ("KG", 42.12, 76.99, "kg-skazka", 0), "arslanbob": ("KG", 41.33, 72.94, "kg-arslanbob", 0),
    "altynarashan": ("KG", 42.37, 78.60, "kg-arashan", 0), "kyzart": ("KG", 42.03, 74.87, "kg-horse", 0),
    "dushanbe": ("TJ", 38.56, 68.79, "tj-dushanbe", 0), "iskanderkul": ("TJ", 39.08, 68.37, "tj-iskanderkul", 0),
    "panjakent": ("TJ", 39.49, 67.61, "afrosiyob", 0), "khujand": ("TJ", 40.28, 69.62, "tj-panj", 0),
    "sevenlakes": ("TJ", 39.32, 67.75, "tj-sevenlakes", 0), "istaravshan": ("TJ", 39.91, 69.00, "tj-istaravshan", 0),
    "artuch": ("TJ", 39.24, 68.08, "tj-fann", 0), "kulikalon": ("TJ", 39.22, 68.18, "tj-kulikalon", 0),
    "alaudin": ("TJ", 39.25, 68.27, "tj-alaudin", 0), "kalaikhum": ("TJ", 38.46, 70.78, "tj-panj", 0),
    "khorog": ("TJ", 37.49, 71.55, "tj-village", 0), "ishkashim": ("TJ", 36.73, 71.61, "tj-wakhan", 0),
    "langar": ("TJ", 37.04, 72.66, "tj-mountains", 0), "bulunkul": ("TJ", 37.70, 72.94, "tj-bulunkul", 0),
    "murghab": ("TJ", 38.17, 73.96, "tj-pamir", 0), "karakul": ("TJ", 39.02, 73.55, "tj-karakul", 0),
}

# Known transfers: (a, b, km, hours, mode, note_key)
LEGS = [
    ("tashkent", "samarkand", 300, 2.2, "train", "afrosiyob"), ("samarkand", "bukhara", 270, 1.7, "train", "afrosiyob"),
    ("bukhara", "tashkent", 570, 3.9, "train", "afrosiyob"), ("bukhara", "khiva", 450, 6.5, "car", "kyzylkum_road"),
    ("khiva", "urgench", 35, 0.7, "car", ""), ("urgench", "tashkent", 750, 1.5, "flight", "domestic_flight"),
    ("tashkent", "chimgan", 85, 1.5, "car", ""), ("samarkand", "aydarkul", 230, 4, "car", "via_nurata"),
    ("samarkand", "shahrisabz", 90, 2, "car", "takhtakaracha"), ("samarkand", "panjakent", 60, 1.5, "border", "border"),
    ("panjakent", "iskanderkul", 180, 4, "car", ""), ("iskanderkul", "dushanbe", 130, 3, "car", "anzob"),
    ("dushanbe", "khujand", 340, 5.5, "car", "anzob"), ("khujand", "tashkent", 150, 3, "border", "border"),
    ("almaty", "charyn", 200, 3, "car", ""), ("issykkul", "bishkek", 250, 4, "car", ""),
    ("bishkek", "tashkent", 480, 1.2, "flight", "flight"), ("tashkent", "turkistan", 300, 5, "border", "border"),
    ("tashkent", "fergana", 310, 4.5, "car", "kamchik"), ("tashkent", "kokand", 230, 3.5, "car", "kamchik"),
    ("kokand", "fergana", 90, 1.3, "car", ""), ("tashkent", "nukus", 900, 1.7, "flight", "domestic_flight"),
    ("nukus", "moynaq", 200, 3, "car", ""), ("moynaq", "ayazkala", 330, 5, "car", ""), ("ayazkala", "khiva", 120, 2, "car", ""),
    ("tashkent", "termez", 500, 1.5, "flight", "domestic_flight"), ("termez", "shahrisabz", 270, 5, "car", "baysun"),
    ("samarkand", "nurata", 160, 3, "car", ""), ("nurata", "sentyab", 60, 1.3, "car", ""), ("sentyab", "aydarkul", 80, 1.5, "car", ""),
    ("aydarkul", "bukhara", 270, 4.5, "car", ""), ("bukhara", "gijduvan", 45, 0.8, "car", ""), ("gijduvan", "aydarkul", 200, 3.5, "car", ""),
    ("chimgan", "tashkent", 85, 1.5, "car", ""), ("aydarkul", "samarkand", 230, 4, "car", "via_nurata"),
    ("charyn", "saty", 90, 1.8, "car", ""), ("saty", "almaty", 290, 4.5, "car", ""), ("almaty", "altynemel", 270, 4, "car", ""),
    ("altynemel", "charyn", 260, 4.5, "car", ""), ("charyn", "almaty", 200, 3, "car", ""),
    ("shymkent", "turkistan", 165, 2.5, "car", ""), ("almaty", "shymkent", 690, 1.3, "flight", "domestic_flight"),
    ("shymkent", "astana", 1200, 2, "flight", "domestic_flight"), ("astana", "burabay", 250, 3.5, "car", ""),
    ("aktau", "bozzhyra", 400, 7, "car", "offroad"), ("oskemen", "katonkaragay", 380, 6.5, "car", ""),
    ("katonkaragay", "rakhman", 100, 3.5, "car", "offroad"), ("rakhman", "oskemen", 470, 9, "car", "offroad"),
    ("bishkek", "issykkul", 250, 4, "car", ""), ("issykkul", "karakol", 150, 2.5, "car", ""),
    ("karakol", "bokonbaeva", 150, 2.5, "car", ""), ("bokonbaeva", "bishkek", 260, 4.5, "car", ""),
    ("bishkek", "kochkor", 200, 3.5, "car", ""), ("kochkor", "songkul", 110, 3, "car", "offroad"),
    ("songkul", "bishkek", 320, 6.5, "car", ""), ("bokonbaeva", "kochkor", 100, 1.7, "car", ""),
    ("karakol", "altynarashan", 35, 2, "car", "offroad"), ("kochkor", "naryn", 120, 2, "car", ""),
    ("naryn", "tashrabat", 120, 2.5, "car", ""), ("tashrabat", "songkul", 290, 6, "car", "offroad"),
    ("bishkek", "kyzart", 300, 5, "car", ""), ("kyzart", "songkul", 25, 6, "car", "horse"), ("bishkek", "karakol", 400, 6.5, "car", ""),
    ("osh", "arslanbob", 200, 4, "car", ""), ("dushanbe", "kalaikhum", 360, 7, "car", "panj_road"),
    ("kalaikhum", "khorog", 240, 6, "car", "panj_road"), ("khorog", "ishkashim", 105, 3, "car", ""),
    ("ishkashim", "langar", 120, 4, "car", ""), ("langar", "bulunkul", 140, 4.5, "car", "offroad"),
    ("bulunkul", "murghab", 160, 3.5, "car", ""), ("murghab", "karakul", 135, 3, "car", ""), ("karakul", "osh", 270, 6, "border", "border"),
    ("dushanbe", "istaravshan", 270, 5, "car", "anzob"), ("istaravshan", "khujand", 75, 1.3, "car", ""),
    ("khujand", "panjakent", 280, 5.5, "car", ""), ("panjakent", "sevenlakes", 65, 2.5, "car", ""),
    ("sevenlakes", "iskanderkul", 200, 5, "car", ""), ("dushanbe", "artuch", 200, 4.5, "car", ""),
    ("artuch", "kulikalon", 12, 4, "car", "trek"), ("kulikalon", "alaudin", 10, 6, "car", "trek"), ("alaudin", "iskanderkul", 60, 2.5, "car", ""),
    ("dushanbe", "khorog", 330, 1.1, "flight", "domestic_flight"), ("langar", "khorog", 220, 7, "car", ""),
    # Grand Central Asia tour (4 countries)
    ("sevenlakes", "panjakent", 65, 2.5, "car", ""), ("panjakent", "iskanderkul", 180, 4, "car", "anzob"),
    ("dushanbe", "almaty", 1000, 1.7, "flight", "flight"), ("almaty", "bishkek", 240, 4, "border", "border"),
]

# sight id: (city, img)
SIGHTS = {
    "tash_imam": ("tashkent", "uz-hazratiimam"), "tash_chorsu": ("tashkent", "chorsu"), "tash_metro": ("tashkent", "metro"),
    "tash_timur": ("tashkent", "uz-timurids"), "tash_plov": ("tashkent", "plov"),
    "sam_registan": ("samarkand", "registan"), "sam_gurmir": ("samarkand", "gur-e-amir"), "sam_shahizinda": ("samarkand", "uz-shahizinda2"),
    "sam_bibi": ("samarkand", "bibi-khanym"), "sam_ulugbek": ("samarkand", "ulugbek"), "sam_bread": ("samarkand", "uz-tandir"),
    "sam_imambukhari": ("samarkand", "uz-mosaic"), "sam_maturidi": ("samarkand", "maturidi"), "sam_siyob": ("samarkand", "uz-driedfruit"),
    "sam_kebab": ("samarkand", "uz-kabob"), "sam_afrosiyob": ("samarkand", "afrosiyob"),
    "buk_ark": ("bukhara", "ark"), "buk_poikalon": ("bukhara", "uz-poikalon"), "buk_lyabi": ("bukhara", "lyabi-hauz"),
    "buk_samanid": ("bukhara", "samanid"), "buk_mirarab": ("bukhara", "mir-i-arab"), "buk_domes": ("bukhara", "bukhara"),
    "buk_naqshband": ("bukhara", "uz-tillakori"), "buk_sitorai": ("bukhara", "uz-dress"), "buk_cooking": ("bukhara", "plov"),
    "buk_teahouse": ("bukhara", "uz-tea"), "gij_pottery": ("gijduvan", "uz-pottery"),
    "khi_ichan": ("khiva", "ichan-kala"), "khi_kalta": ("khiva", "uz-kaltaminor"), "khi_islamkhoja": ("khiva", "islam-khoja"),
    "khi_tashhauli": ("khiva", "uz-matniyoz"), "khi_walls": ("khiva", "uz-khiva-walls"), "khi_fortresses": ("ayazkala", "uz-ayazkala"),
    "nuk_savitsky": ("nukus", "ceramics"), "moy_ships": ("moynaq", "uz-aral"), "moy_aral": ("moynaq", "uz-aral2"),
    "ayd_yurt": ("aydarkul", "uz-yurt"), "ayd_camel": ("aydarkul", "uz-camels"), "ayd_lake": ("aydarkul", "kyzylkum"),
    "nur_fortress": ("nurata", "kyzylkum"), "sen_village": ("sentyab", "autumn-mountains"),
    "chim_mount": ("chimgan", "chimgan"), "chim_charvak": ("chimgan", "uz-charvak"), "chim_amirsoy": ("chimgan", "uz-snowpeaks"),
    "fer_kokand": ("kokand", "uz-mosaic"), "fer_jome": ("kokand", "uz-kokand-mosque"), "fer_rishtan": ("fergana", "ceramics"),
    "fer_margilan": ("fergana", "uz-fabrics"), "fer_bazaar": ("fergana", "uz-dress"), "fer_valley": ("fergana", "uz-fergana-road"),
    "ter_fayaz": ("termez", "uz-termez"), "ter_hakim": ("termez", "kukeldash"), "ter_kyrkyz": ("termez", "kyzylkum"),
    "shah_aksaray": ("shahrisabz", "uz-shahrisabz"), "shah_dorut": ("shahrisabz", "bibi-khanym"),
    "ala_city": ("almaty", "kz-almaty"), "ala_koktobe": ("almaty", "kz-koktobe"), "ala_medeu": ("almaty", "kz-medeu"),
    "ala_bigalmaty": ("almaty", "kz-bigalmaty"), "ala_bazaar": ("almaty", "uz-spices"), "cha_valley": ("charyn", "kz-charyn"),
    "sat_kolsai": ("saty", "kz-kolsai"), "sat_kaindy": ("saty", "kz-kaindy"), "alt_dune": ("altynemel", "kz-dune"),
    "alt_aktau": ("altynemel", "kyzylkum"), "alt_tamgaly": ("altynemel", "kz-mangystau"),
    "tur_yasawi": ("turkistan", "kz-turkistan"), "tur_arystan": ("turkistan", "maturidi"), "tur_otrar": ("turkistan", "kyzylkum"),
    "tur_karavan": ("turkistan", "kz-karavan"), "shy_city": ("shymkent", "kz-shymkent"),
    "ast_baiterek": ("astana", "kz-astana"), "ast_khanshatyr": ("astana", "kz-astana2"), "ast_mosque": ("astana", "kz-mosque"),
    "ast_museum": ("astana", "kz-astana"), "bur_lake": ("burabay", "kz-burabay"), "bur_horse": ("burabay", "kz-steppe"),
    "man_caspian": ("aktau", "kz-mangystau"), "man_bozzhyra": ("bozzhyra", "kz-bozzhyra"), "man_torysh": ("bozzhyra", "kz-torysh"),
    "man_beket": ("aktau", "kyzylkum"), "man_tuzbair": ("bozzhyra", "kz-mangystau"),
    "alt_ethno": ("oskemen", "kz-steppe"), "alt_bukhtarma": ("katonkaragay", "kz-altai"), "alt_berel": ("katonkaragay", "kz-steppe"),
    "alt_rakhman": ("rakhman", "kz-altai2"), "alt_belukha": ("rakhman", "kz-altai"),
    "ski_shymbulak": ("almaty", "kz-ski"), "eth_huns": ("almaty", "kz-eagle"),
    "bis_city": ("bishkek", "kg-bishkek"), "bis_alaarcha": ("bishkek", "kg-alaarcha"), "bis_burana": ("bishkek", "kg-valley"),
    "iss_cholpon": ("issykkul", "kg-cholponata"), "iss_beach": ("issykkul", "kg-issykkul"), "kar_dungan": ("karakol", "kg-karakol"),
    "kar_jeti": ("karakol", "kg-jetioguz"), "kar_arashan": ("altynarashan", "kg-arashan"), "kar_alakul": ("altynarashan", "kg-alakul"),
    "bok_eagle": ("bokonbaeva", "kz-eagle"), "bok_skazka": ("bokonbaeva", "kg-skazka"), "koch_felt": ("kochkor", "kg-felt"),
    "song_lake": ("songkul", "kg-songkul"), "song_yurt": ("songkul", "kg-yurt"), "song_horse": ("songkul", "kg-horse"),
    "nar_city": ("naryn", "kg-naryn"), "tash_rabat": ("tashrabat", "kg-tashrabat"), "osh_sulaiman": ("osh", "kg-osh"),
    "osh_bazaar": ("osh", "uz-spices"), "ars_walnut": ("arslanbob", "kg-arslanbob"), "ars_waterfall": ("arslanbob", "kg-valley"),
    "kg_valley": ("kyzart", "kg-valley"), "kg_ski": ("karakol", "kg-winter"), "kg_hotspring": ("karakol", "kg-arashan"),
    "dus_city": ("dushanbe", "tj-dushanbe"), "dus_hissar": ("dushanbe", "tj-hissar"), "dus_varzob": ("dushanbe", "tj-mountains"),
    "isk_lake": ("iskanderkul", "tj-iskanderkul"), "isk_waterfall": ("iskanderkul", "tj-fann"), "sev_lakes": ("sevenlakes", "tj-sevenlakes"),
    "pan_sarazm": ("panjakent", "afrosiyob"), "pan_ancient": ("panjakent", "tj-panjakent"),
    "fan_peaks": ("artuch", "tj-fann"), "fan_kulikalon": ("kulikalon", "tj-kulikalon"), "fan_alaudin": ("alaudin", "tj-alaudin"),
    "pam_road": ("kalaikhum", "tj-panj"), "pam_khorog": ("khorog", "tj-village"), "pam_wakhan": ("ishkashim", "tj-wakhan"),
    "pam_yamchun": ("langar", "tj-yamchun"), "pam_langar": ("langar", "tj-mountains"), "pam_bulunkul": ("bulunkul", "tj-bulunkul"),
    "pam_murghab": ("murghab", "tj-pamir"), "pam_karakul": ("karakul", "tj-karakul"), "pam_hotspring": ("ishkashim", "kg-arashan"),
    "khu_fort": ("khujand", "tj-panjakent"), "khu_bazaar": ("khujand", "uz-driedfruit"), "ist_mug": ("istaravshan", "tj-istaravshan"),
}

BASE_INC = ["hotel", "transfers", "transport", "guide", "tickets", "water", "support"]
BASE_EXC = ["intl_flights", "visa", "meals", "photo", "insurance", "tips"]
BRING_CITY = ["passport", "shoes", "scarf", "sun", "jacket", "cash", "plug", "meds"]
BRING_MOUNT = ["passport", "boots", "warm", "sun", "cash", "meds", "plug", "bag"]

def T(cid, country, cover, hotel, days, extra_inc=(), extra_exc=(), bring=None, flags=None, season="all"):
    return {"id": cid, "country": country, "cover": cover, "hotel": hotel, "days": days, "season": season,
            "inc": BASE_INC + list(extra_inc), "exc": BASE_EXC + list(extra_exc),
            "bring": bring or BRING_CITY, "flags": flags or [country]}

TOURS = [
 # ---------------- UZBEKISTAN
 T("classic", "UZ", "registan", "superior", [   # 8 days / 7 nights, Saturday start in Khiva (owner, 2026-11-23)
   ("khiva", [], ["khi_walls"], "D"),
   ("khiva", [], ["khi_ichan", "khi_islamkhoja", "khi_tashhauli"], "B"),
   ("bukhara", [["khiva", "bukhara"]], ["buk_lyabi", "buk_domes"], "B"),
   ("bukhara", [], ["buk_ark", "buk_samanid", "buk_poikalon"], "B"),
   ("samarkand", [["bukhara", "samarkand"]], ["sam_gurmir", "sam_registan"], "B"),
   ("samarkand", [], ["sam_shahizinda", "sam_bibi", "sam_ulugbek", "sam_siyob"], "B"),
   ("tashkent", [["samarkand", "tashkent"]], ["tash_timur", "tash_metro"], "B"),
   (None, [], ["tash_imam", "tash_chorsu"], "B")], ["train", "dinner"], ["own_flight_khiva"]),
 T("express", "UZ", "shahizinda", "superior", [
   ("tashkent", [], ["tash_imam", "tash_metro"], "D"),
   ("samarkand", [["tashkent", "samarkand"]], ["sam_registan", "sam_gurmir"], "B"),
   ("samarkand", [], ["sam_shahizinda", "sam_bibi", "sam_siyob"], "B"),
   ("bukhara", [["samarkand", "bukhara"]], ["buk_ark", "buk_poikalon", "buk_lyabi"], "B"),
   (None, [["bukhara", "tashkent"]], ["buk_domes"], "B")], ["train", "dinner"]),
 T("silkroad", "UZ", "khiva", "superior", [
   ("tashkent", [], ["tash_imam", "tash_chorsu"], "D"),
   ("khiva", [["tashkent", "urgench"], ["urgench", "khiva"]], ["khi_walls"], "B"),
   ("khiva", [], ["khi_ichan", "khi_islamkhoja", "khi_tashhauli"], "B"),
   ("bukhara", [["khiva", "bukhara"]], ["buk_lyabi"], "B"),
   ("bukhara", [], ["buk_ark", "buk_samanid", "buk_poikalon"], "B"),
   ("bukhara", [], ["buk_sitorai", "buk_domes", "buk_mirarab"], "B"),
   ("aydarkul", [["bukhara", "gijduvan"], ["gijduvan", "aydarkul"]], ["gij_pottery", "ayd_camel", "ayd_yurt"], "B,D"),
   ("samarkand", [["aydarkul", "samarkand"]], ["ayd_lake", "sam_registan"], "B"),
   ("samarkand", [["samarkand", "shahrisabz"], ["shahrisabz", "samarkand"]], ["shah_aksaray", "sam_shahizinda"], "B"),
   (None, [["samarkand", "tashkent"]], ["sam_bibi"], "B")], ["train", "flight", "yurt", "dinner"]),
 T("spiritual", "UZ", "maturidi", "superior", [
   ("tashkent", [], ["tash_imam", "tash_timur"], "D"),
   ("samarkand", [["tashkent", "samarkand"]], ["sam_gurmir", "sam_maturidi", "sam_registan"], "B"),
   ("samarkand", [], ["sam_imambukhari", "sam_shahizinda"], "B"),
   ("bukhara", [["samarkand", "bukhara"]], ["buk_naqshband", "buk_samanid"], "B"),
   ("bukhara", [], ["buk_poikalon", "buk_mirarab", "buk_lyabi"], "B"),
   ("tashkent", [["bukhara", "tashkent"]], ["buk_ark"], "B"),
   (None, [], ["tash_chorsu"], "B")], ["train", "dinner"]),
 T("fergana", "UZ", "fergana", "comfort", [
   ("tashkent", [], ["tash_imam", "tash_chorsu"], "D"),
   ("fergana", [["tashkent", "kokand"], ["kokand", "fergana"]], ["fer_kokand", "fer_jome"], "B"),
   ("fergana", [], ["fer_margilan", "fer_bazaar"], "B"),
   ("fergana", [], ["fer_rishtan", "fer_valley"], "B"),
   ("tashkent", [["fergana", "tashkent"]], ["tash_metro"], "B"),
   (None, [], ["tash_timur"], "B")], ["dinner"]),
 T("aral", "UZ", "uz-aral", "comfort", [
   ("nukus", [["tashkent", "nukus"]], ["nuk_savitsky"], "D"),
   ("moynaq", [["nukus", "moynaq"]], ["moy_ships", "moy_aral"], "B,L,D"),
   ("ayazkala", [["moynaq", "ayazkala"]], ["khi_fortresses"], "B,L,D"),
   ("khiva", [["ayazkala", "khiva"]], ["khi_ichan", "khi_walls"], "B"),
   (None, [["khiva", "urgench"], ["urgench", "tashkent"]], ["khi_islamkhoja"], "B")], ["flight", "yurt", "jeep", "dinner"], bring=BRING_MOUNT),
 T("nature", "UZ", "chimgan", "comfort", [
   ("tashkent", [], ["tash_imam", "tash_chorsu"], "D"),
   ("tashkent", [["tashkent", "chimgan"], ["chimgan", "tashkent"]], ["chim_mount", "chim_amirsoy", "chim_charvak"], "B"),  # day trip, night in Tashkent
   ("samarkand", [["tashkent", "samarkand"]], ["sam_registan"], "B"),
   ("sentyab", [["samarkand", "nurata"], ["nurata", "sentyab"]], ["nur_fortress", "sen_village"], "B,D"),
   ("aydarkul", [["sentyab", "aydarkul"]], ["ayd_lake", "ayd_camel", "ayd_yurt"], "B,L,D"),
   ("bukhara", [["aydarkul", "bukhara"]], ["buk_lyabi", "buk_poikalon"], "B"),
   (None, [["bukhara", "tashkent"]], ["buk_ark"], "B")], ["train", "yurt", "homestay", "dinner"], bring=BRING_MOUNT),
 T("south", "UZ", "uz-shahrisabz", "comfort", [
   ("tashkent", [], ["tash_imam", "tash_timur"], "D"),
   ("termez", [["tashkent", "termez"]], ["ter_fayaz", "ter_hakim"], "B"),
   ("shahrisabz", [["termez", "shahrisabz"]], ["ter_kyrkyz", "shah_aksaray"], "B"),
   ("samarkand", [["shahrisabz", "samarkand"]], ["shah_dorut", "sam_registan"], "B"),
   ("samarkand", [], ["sam_shahizinda", "sam_gurmir"], "B"),
   (None, [["samarkand", "tashkent"]], ["sam_bibi"], "B")], ["flight", "train", "dinner"]),
 T("gastro", "UZ", "plov", "superior", [
   ("tashkent", [], ["tash_chorsu", "tash_plov"], "L,D"),
   ("samarkand", [["tashkent", "samarkand"]], ["sam_bread", "sam_siyob", "sam_registan"], "B,L"),
   ("samarkand", [], ["sam_shahizinda", "sam_kebab"], "B,D"),
   ("bukhara", [["samarkand", "bukhara"]], ["buk_cooking", "buk_lyabi"], "B,D"),
   ("bukhara", [["bukhara", "gijduvan"], ["gijduvan", "bukhara"]], ["gij_pottery", "buk_teahouse", "buk_domes"], "B,L"),
   (None, [["bukhara", "tashkent"]], ["buk_poikalon"], "B")], ["train", "food"]),
 # ---------------- KAZAKHSTAN
 T("kz_almaty", "KZ", "kz-almaty", "superior", [
   ("almaty", [], ["ala_city", "ala_koktobe"], "D"),
   ("almaty", [], ["ala_medeu", "ala_bigalmaty"], "B"),
   ("almaty", [["almaty", "charyn"], ["charyn", "almaty"]], ["cha_valley"], "B,L"),
   (None, [], ["ala_bazaar"], "B")], ["dinner"]),
 T("kz_lakes", "KZ", "kz-kaindy", "comfort", [
   ("almaty", [], ["ala_city", "ala_koktobe"], "D"),
   ("saty", [["almaty", "charyn"], ["charyn", "saty"]], ["cha_valley"], "B,L,D"),
   ("saty", [], ["sat_kaindy", "sat_kolsai"], "B,L,D"),
   ("almaty", [["saty", "almaty"]], ["ala_medeu"], "B"),
   (None, [], ["ala_bazaar"], "B")], ["homestay", "dinner"], bring=BRING_MOUNT),
 T("kz_altynemel", "KZ", "kz-dune", "comfort", [
   ("almaty", [], ["ala_city"], "D"),
   ("altynemel", [["almaty", "altynemel"]], ["alt_tamgaly", "alt_dune"], "B,L,D"),
   ("altynemel", [], ["alt_aktau"], "B,L,D"),
   (None, [["altynemel", "charyn"], ["charyn", "almaty"]], ["cha_valley"], "B,L")], ["homestay", "jeep", "dinner"], extra_exc=["park"], bring=BRING_MOUNT),
 T("kz_turkistan", "KZ", "kz-turkistan", "superior", [
   ("shymkent", [], ["shy_city"], "D"),
   ("turkistan", [["shymkent", "turkistan"]], ["tur_arystan", "tur_otrar", "tur_yasawi"], "B"),
   ("turkistan", [], ["tur_karavan"], "B"),
   (None, [["turkistan", "shymkent"]], [], "B")], ["dinner"]),
 T("kz_classic", "KZ", "kz-charyn", "superior", [
   ("almaty", [], ["ala_city", "ala_koktobe"], "D"),
   ("almaty", [], ["ala_medeu", "ala_bigalmaty"], "B"),
   ("saty", [["almaty", "charyn"], ["charyn", "saty"]], ["cha_valley"], "B,L,D"),
   ("almaty", [["saty", "almaty"]], ["sat_kolsai", "sat_kaindy"], "B"),
   ("turkistan", [["almaty", "shymkent"], ["shymkent", "turkistan"]], ["tur_arystan", "tur_yasawi"], "B"),
   ("astana", [["turkistan", "shymkent"], ["shymkent", "astana"]], ["tur_karavan", "ast_baiterek"], "B"),
   ("astana", [], ["ast_khanshatyr", "ast_mosque"], "B"),
   (None, [], ["ast_museum"], "B")], ["flight", "homestay", "dinner"]),
 T("kz_astana", "KZ", "kz-astana2", "superior", [
   ("astana", [], ["ast_baiterek"], "D"),
   ("burabay", [["astana", "burabay"]], ["bur_lake"], "B"),
   ("astana", [["burabay", "astana"]], ["bur_horse", "ast_mosque"], "B"),
   (None, [], ["ast_khanshatyr", "ast_museum"], "B")], ["dinner"]),
 T("kz_mangystau", "KZ", "kz-bozzhyra", "comfort", [
   ("aktau", [], ["man_caspian"], "D"),
   ("bozzhyra", [["aktau", "bozzhyra"]], ["man_torysh", "man_bozzhyra"], "B,L,D"),
   ("bozzhyra", [], ["man_tuzbair"], "B,L,D"),
   ("aktau", [["bozzhyra", "aktau"]], ["man_beket"], "B,L"),
   (None, [], [], "B")], ["jeep", "camp", "dinner"], bring=BRING_MOUNT, season="spring_autumn"),
 T("kz_altai", "KZ", "kz-altai", "comfort", [
   ("oskemen", [], ["alt_ethno"], "D"),
   ("katonkaragay", [["oskemen", "katonkaragay"]], ["alt_bukhtarma"], "B,L,D"),
   ("katonkaragay", [], ["alt_berel"], "B,L,D"),
   ("rakhman", [["katonkaragay", "rakhman"]], ["alt_rakhman"], "B,L,D"),
   ("rakhman", [], ["alt_belukha"], "B,L,D"),
   ("oskemen", [["rakhman", "oskemen"]], [], "B,L"),
   (None, [], [], "B")], ["jeep", "homestay", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kz_winter", "KZ", "kz-ski", "superior", [
   ("almaty", [], ["ala_city", "ala_koktobe"], "D"),
   ("almaty", [], ["ski_shymbulak"], "B"),
   ("almaty", [], ["ala_medeu"], "B"),
   ("almaty", [["almaty", "charyn"], ["charyn", "almaty"]], ["cha_valley", "eth_huns"], "B,L"),
   (None, [], ["ala_bazaar"], "B")], ["dinner"], extra_exc=["ski"], bring=BRING_MOUNT, season="winter"),
 # ---------------- KYRGYZSTAN
 T("kg_issykkul", "KG", "kg-issykkul", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("issykkul", [["bishkek", "issykkul"]], ["bis_burana", "iss_cholpon"], "B"),
   ("karakol", [["issykkul", "karakol"]], ["iss_beach", "kar_dungan"], "B"),
   ("karakol", [], ["kar_jeti"], "B"),
   ("bokonbaeva", [["karakol", "bokonbaeva"]], ["bok_skazka", "bok_eagle"], "B,D"),
   ("bishkek", [["bokonbaeva", "bishkek"]], ["bis_alaarcha"], "B"),
   (None, [], [], "B")], ["yurt", "dinner"], season="summer"),
 T("kg_songkul", "KG", "kg-songkul", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("songkul", [["bishkek", "kochkor"], ["kochkor", "songkul"]], ["koch_felt", "song_yurt"], "B,L,D"),
   ("songkul", [], ["song_horse", "song_lake"], "B,L,D"),
   ("bishkek", [["songkul", "bishkek"]], ["bis_burana"], "B"),
   (None, [], ["bis_alaarcha"], "B")], ["yurt", "horses", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kg_lakes", "KG", "kg-yurt", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("issykkul", [["bishkek", "issykkul"]], ["bis_burana", "iss_cholpon"], "B"),
   ("karakol", [["issykkul", "karakol"]], ["iss_beach", "kar_dungan"], "B"),
   ("karakol", [], ["kar_jeti"], "B"),
   ("bokonbaeva", [["karakol", "bokonbaeva"]], ["bok_skazka", "bok_eagle"], "B,D"),
   ("songkul", [["bokonbaeva", "kochkor"], ["kochkor", "songkul"]], ["koch_felt", "song_yurt"], "B,L,D"),
   ("songkul", [], ["song_horse", "song_lake"], "B,L,D"),
   ("bishkek", [["songkul", "bishkek"]], ["kg_valley"], "B"),
   (None, [], ["bis_alaarcha"], "B")], ["yurt", "horses", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kg_alakul", "KG", "kg-alakul", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("karakol", [["bishkek", "karakol"]], ["iss_cholpon"], "B"),
   ("altynarashan", [["karakol", "altynarashan"]], ["kar_arashan"], "B,L,D"),
   ("altynarashan", [], ["kar_alakul"], "B,L,D"),
   ("karakol", [["altynarashan", "karakol"]], ["kar_jeti", "kar_dungan"], "B,L"),
   (None, [["karakol", "bishkek"]], [], "B")], ["crew", "homestay", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kg_south", "KG", "kg-osh", "comfort", [
   ("osh", [], ["osh_sulaiman", "osh_bazaar"], "D"),
   ("arslanbob", [["osh", "arslanbob"]], ["ars_walnut"], "B,D"),
   ("arslanbob", [], ["ars_waterfall"], "B,D"),
   (None, [["arslanbob", "osh"]], [], "B")], ["homestay", "dinner"]),
 T("kg_alaarcha", "KG", "kg-alaarcha", "superior", [
   ("bishkek", [], ["bis_city"], "D"),
   ("bishkek", [], ["bis_alaarcha"], "B,L"),
   (None, [], ["bis_burana"], "B")], ["dinner"]),
 T("kg_tashrabat", "KG", "kg-tashrabat", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("naryn", [["bishkek", "kochkor"], ["kochkor", "naryn"]], ["koch_felt", "nar_city"], "B,D"),
   ("tashrabat", [["naryn", "tashrabat"]], ["tash_rabat"], "B,L,D"),
   ("songkul", [["tashrabat", "songkul"]], ["song_yurt"], "B,L,D"),
   ("bishkek", [["songkul", "bishkek"]], ["song_lake"], "B"),
   (None, [], ["bis_alaarcha"], "B")], ["yurt", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kg_horse", "KG", "kg-horse", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("kyzart", [["bishkek", "kyzart"]], ["kg_valley"], "B,L,D"),
   ("songkul", [["kyzart", "songkul"]], ["song_horse"], "B,L,D"),
   ("songkul", [], ["song_lake", "song_yurt"], "B,L,D"),
   ("bishkek", [["songkul", "bishkek"]], ["koch_felt"], "B"),
   (None, [], ["bis_burana"], "B")], ["horses", "yurt", "dinner"], bring=BRING_MOUNT, season="summer"),
 T("kg_winter", "KG", "kg-winter", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("karakol", [["bishkek", "karakol"]], ["iss_cholpon"], "B"),
   ("karakol", [], ["kg_ski"], "B"),
   ("karakol", [], ["kg_hotspring", "kar_dungan"], "B"),
   ("bishkek", [["karakol", "bishkek"]], ["kg_valley"], "B"),
   (None, [], ["bis_alaarcha"], "B")], ["dinner"], extra_exc=["ski"], bring=BRING_MOUNT, season="winter"),
 # ---------------- TAJIKISTAN
 T("tj_fann", "TJ", "tj-iskanderkul", "comfort", [
   ("dushanbe", [], ["dus_city", "dus_hissar"], "D"),
   ("iskanderkul", [["dushanbe", "iskanderkul"]], ["isk_lake", "isk_waterfall"], "B,D"),
   ("sevenlakes", [["iskanderkul", "sevenlakes"]], ["sev_lakes"], "B,L,D"),
   ("panjakent", [["sevenlakes", "panjakent"]], ["pan_ancient", "pan_sarazm"], "B"),
   (None, [["panjakent", "samarkand"]], [], "B")], ["homestay", "dinner"], bring=BRING_MOUNT, season="spring_autumn"),
 T("tj_pamir", "TJ", "tj-pamir", "comfort", [
   ("dushanbe", [], ["dus_city"], "D"),
   ("kalaikhum", [["dushanbe", "kalaikhum"]], ["pam_road"], "B,L,D"),
   ("khorog", [["kalaikhum", "khorog"]], ["pam_khorog"], "B,L,D"),
   ("ishkashim", [["khorog", "ishkashim"]], ["pam_wakhan", "pam_hotspring"], "B,L,D"),
   ("langar", [["ishkashim", "langar"]], ["pam_yamchun", "pam_langar"], "B,L,D"),
   ("bulunkul", [["langar", "bulunkul"]], ["pam_bulunkul"], "B,L,D"),
   ("murghab", [["bulunkul", "murghab"]], ["pam_murghab"], "B,L,D"),
   ("karakul", [["murghab", "karakul"]], ["pam_karakul"], "B,L,D"),
   ("osh", [["karakul", "osh"]], ["osh_sulaiman"], "B"),
   (None, [], ["osh_bazaar"], "B")], ["jeep", "homestay", "permit", "meals_full"], bring=BRING_MOUNT, flags=["TJ", "KG"], season="summer"),
 T("tj_ancient", "TJ", "tj-hissar", "comfort", [
   ("dushanbe", [], ["dus_city", "dus_hissar"], "D"),
   ("istaravshan", [["dushanbe", "istaravshan"]], ["ist_mug"], "B"),
   ("khujand", [["istaravshan", "khujand"]], ["khu_fort", "khu_bazaar"], "B"),
   ("panjakent", [["khujand", "panjakent"]], ["pan_ancient"], "B"),
   ("panjakent", [], ["pan_sarazm"], "B"),
   (None, [["panjakent", "samarkand"]], [], "B")], ["dinner"]),
 T("tj_iskanderkul", "TJ", "tj-fann", "comfort", [
   ("dushanbe", [], ["dus_city"], "D"),
   ("iskanderkul", [["dushanbe", "iskanderkul"]], ["dus_varzob", "isk_lake"], "B,D"),
   (None, [["iskanderkul", "dushanbe"]], ["isk_waterfall"], "B")], ["dinner"], bring=BRING_MOUNT),
 T("tj_sevenlakes", "TJ", "tj-sevenlakes", "comfort", [
   ("samarkand", [], ["sam_registan"], "D"),
   ("sevenlakes", [["samarkand", "panjakent"], ["panjakent", "sevenlakes"]], ["pan_sarazm", "sev_lakes"], "B,L,D"),
   (None, [["sevenlakes", "panjakent"], ["panjakent", "samarkand"]], ["pan_ancient"], "B")], ["homestay", "dinner"], flags=["TJ", "UZ"]),
 T("tj_alaudin", "TJ", "tj-alaudin", "comfort", [
   ("dushanbe", [], ["dus_city"], "D"),
   ("artuch", [["dushanbe", "artuch"]], ["fan_peaks"], "B,L,D"),
   ("kulikalon", [["artuch", "kulikalon"]], ["fan_kulikalon"], "B,L,D"),
   ("alaudin", [["kulikalon", "alaudin"]], ["fan_alaudin"], "B,L,D"),
   ("iskanderkul", [["alaudin", "iskanderkul"]], ["isk_lake"], "B,D"),
   ("dushanbe", [["iskanderkul", "dushanbe"]], ["dus_hissar"], "B"),
   (None, [], [], "B")], ["crew", "homestay", "meals_full"], bring=BRING_MOUNT, season="summer"),
 T("tj_uztj", "TJ", "tj-sevenlakes", "superior", [
   ("samarkand", [], ["sam_registan", "sam_gurmir"], "D"),
   ("samarkand", [], ["sam_shahizinda", "sam_bibi"], "B"),
   ("panjakent", [["samarkand", "panjakent"]], ["pan_sarazm", "pan_ancient"], "B"),
   ("sevenlakes", [["panjakent", "sevenlakes"]], ["sev_lakes"], "B,L,D"),
   ("iskanderkul", [["sevenlakes", "iskanderkul"]], ["isk_lake"], "B,D"),
   ("dushanbe", [["iskanderkul", "dushanbe"]], ["dus_city", "dus_hissar"], "B"),
   ("khujand", [["dushanbe", "khujand"]], ["khu_fort"], "B"),
   (None, [["khujand", "tashkent"]], ["tash_imam"], "B")], ["homestay", "dinner"], flags=["UZ", "TJ"]),
 T("tj_north", "TJ", "tj-istaravshan", "comfort", [
   ("tashkent", [], ["tash_imam"], "D"),
   ("khujand", [["tashkent", "khujand"]], ["khu_fort"], "B"),
   ("khujand", [["khujand", "istaravshan"], ["istaravshan", "khujand"]], ["ist_mug", "khu_bazaar"], "B"),
   (None, [["khujand", "tashkent"]], [], "B")], ["dinner"], flags=["TJ", "UZ"]),
 T("tj_wakhan", "TJ", "tj-wakhan", "comfort", [
   ("dushanbe", [], ["dus_city"], "D"),
   ("khorog", [["dushanbe", "khorog"]], ["pam_khorog"], "B,L,D"),
   ("ishkashim", [["khorog", "ishkashim"]], ["pam_wakhan", "pam_hotspring"], "B,L,D"),
   ("langar", [["ishkashim", "langar"]], ["pam_yamchun"], "B,L,D"),
   ("langar", [], ["pam_langar"], "B,L,D"),
   ("khorog", [["langar", "khorog"]], ["pam_road"], "B,L,D"),
   ("dushanbe", [["khorog", "dushanbe"]], ["dus_hissar"], "B"),
   (None, [], [], "B")], ["flight", "jeep", "homestay", "permit", "meals_full"], bring=BRING_MOUNT, season="summer"),
]

# ---------------- CENTRAL ASIA: one big 4-country programme (modelled on Advantour's 15-day "Central Asia Destinations")
GRAND = [
 T("ca_grand", "CA", "tj-sevenlakes", "superior", [
   ("tashkent", [], ["tash_imam", "tash_chorsu", "tash_metro"], "D"),
   ("khiva", [["tashkent", "urgench"], ["urgench", "khiva"]], ["khi_ichan", "khi_islamkhoja", "khi_tashhauli"], "B"),
   ("bukhara", [["khiva", "bukhara"]], ["khi_walls"], "B"),
   ("bukhara", [], ["buk_lyabi", "buk_domes", "buk_poikalon", "buk_ark", "buk_samanid"], "B"),
   ("samarkand", [["bukhara", "samarkand"]], ["buk_sitorai", "buk_naqshband"], "B"),
   ("samarkand", [], ["sam_registan", "sam_bibi", "sam_siyob", "sam_shahizinda", "sam_gurmir"], "B"),
   ("samarkand", [], ["sam_ulugbek", "sam_imambukhari"], "B"),
   ("panjakent", [["samarkand", "panjakent"], ["panjakent", "sevenlakes"], ["sevenlakes", "panjakent"]], ["sev_lakes", "pan_ancient"], "B,L"),
   ("dushanbe", [["panjakent", "iskanderkul"], ["iskanderkul", "dushanbe"]], ["isk_lake", "dus_city"], "B"),
   ("dushanbe", [], ["dus_hissar"], "B"),
   ("almaty", [["dushanbe", "almaty"]], ["ala_bazaar"], "B"),
   ("almaty", [], ["ala_city", "ala_koktobe", "ala_medeu"], "B"),
   ("bishkek", [["almaty", "bishkek"]], ["bis_city"], "B"),
   ("bishkek", [], ["bis_burana", "bis_alaarcha"], "B"),
   (None, [], [], "B")], ["train", "flight", "dinner"], ["visa_4"], flags=["UZ", "TJ", "KZ", "KG"], season="spring_autumn"),
]
# Approved by the owner 2026-11-23 (shown on the home page with the Uzbekistan tours)
TOURS += GRAND

# Owner 2026-11-25: one best-selling Kyrgyzstan programme on the home page "popular" list, priced and open
# even while Kyrgyzstan is "in preparation". Modelled on the market's classic Issyk-Kul loop
# (Ak-Sai Travel "Classical Kyrgyzstan"; partner DMC for the first bookings: Ak-Sai Travel, Bishkek).
FEATURED = [
 T("kg_classic", "KG", "kg-jetioguz", "comfort", [
   ("bishkek", [], ["bis_city"], "D"),
   ("issykkul", [["bishkek", "issykkul"]], ["bis_burana", "iss_cholpon"], "B"),
   ("karakol", [["issykkul", "karakol"]], ["iss_beach", "kar_dungan"], "B"),
   ("altynarashan", [["karakol", "altynarashan"]], ["kar_arashan"], "B,L,D"),
   ("karakol", [["altynarashan", "karakol"]], ["kar_jeti"], "B,L"),
   ("bokonbaeva", [["karakol", "bokonbaeva"]], ["bok_skazka", "bok_eagle"], "B,D"),
   ("bishkek", [["bokonbaeva", "bishkek"]], ["bis_alaarcha"], "B"),
   (None, [], [], "B")], ["jeep", "yurt", "dinner"], bring=BRING_MOUNT, season="spring_autumn"),
]
for _t in FEATURED: _t["open"] = True
TOURS += FEATURED

# User decision 2026-11-20: 6 tours per country (24 total), the best-selling formats.
KEEP = ["classic", "express", "silkroad", "spiritual", "nature", "fergana",
        "kz_almaty", "kz_lakes", "kz_classic", "kz_turkistan", "kz_altynemel", "kz_astana",
        "kg_issykkul", "kg_songkul", "kg_lakes", "kg_alakul", "kg_tashrabat", "kg_south",
        "tj_fann", "tj_pamir", "tj_sevenlakes", "tj_uztj", "tj_ancient", "tj_alaudin", "ca_grand", "kg_classic"]
TOURS = [t for k in KEEP for t in TOURS if t["id"] == k]
USED_SIGHTS = sorted({s for t in TOURS for d in t["days"] for s in d[2]})
USED_CITIES = sorted({c for t in TOURS for d in t["days"] for c in ([d[0]] if d[0] else []) + [x for m in d[1] for x in m]} | {SIGHTS[s][0] for s in USED_SIGHTS})

# Home page "popular" list (owner 2026-11-23): Fergana and Mountains & desert are not shown on the home page
HOME_HIDE = ["fergana", "nature"]
