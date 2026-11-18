/* Moviy Nomad — ready-made tours (presentation content).
 * Each day: title, sleep (overnight city or null on last day), move (transfer legs [from,to]),
 * stops (places visited with a short description and photo), meals (B = breakfast, L = lunch, D = dinner).
 */
(function () {
  var INCLUDED_BASE = [
    "Accommodation in your chosen hotel category, breakfast included",
    "Meet & greet at the airport with a name sign, all transfers",
    "Private air-conditioned transport for the whole program",
    "Licensed guide in your language for all sightseeing days",
    "Entrance tickets to all monuments in the program",
    "Bottled water in the vehicle every day",
    "24/7 support from our team on WhatsApp / Telegram"
  ];
  var EXCLUDED_BASE = [
    "International flights",
    "Visa fees (if required for your passport)",
    "Lunches and dinners unless stated in the program",
    "Photo and video fees at some monuments",
    "Travel insurance",
    "Tips for guides and drivers, personal expenses"
  ];
  var BRING_BASE = [
    ["passport", "Passport valid for 6+ months after your trip"],
    ["shoes", "Comfortable walking shoes — old towns have stone streets"],
    ["scarf", "Modest clothes for mosques: shoulders and knees covered, a scarf for women"],
    ["sun", "Sunglasses, hat and sunscreen — the sun is strong from April to October"],
    ["jacket", "A light jacket for cool evenings and the desert at night"],
    ["cash", "Some cash in USD or EUR (clean, new notes) — cards work in cities, cash is king in bazaars"],
    ["plug", "Power adapter: type C/F sockets, 220 V"],
    ["meds", "Personal medicine and a small first-aid kit"]
  ];

  window.MN_TOURS = {

    classic: {
      title: "Classic Uzbekistan", subtitle: "The great Silk Road cities in one journey",
      cover: "registan", flags: ["UZ"], hotel: "superior",
      highlights: ["Registan at sunset", "Afrosiyob high-speed trains", "Old Bukhara on foot", "Khiva's walled Ichan-Kala"],
      days: [
        { title: "Welcome to Tashkent", sleep: "tashkent", meals: "D",
          stops: [
            { name: "Airport meeting", desc: "Your driver meets you with a Moviy Nomad sign and takes you to the hotel.", img: "tashkent-sky" },
            { name: "Hazrati Imam complex", desc: "Religious heart of Tashkent; the library keeps the 7th-century Uthman Quran.", img: "tashkent" },
            { name: "Chorsu bazaar & Kukeldash madrasa", desc: "Spices, dried fruit and fresh bread under a giant blue dome.", img: "chorsu" },
            { name: "Tashkent metro", desc: "Ride the most beautiful metro in Central Asia — every station is a palace.", img: "metro" },
            { name: "Welcome dinner with plov", desc: "Try Uzbekistan's national dish cooked in a huge kazan.", img: "plov" }
          ] },
        { title: "Fast train to Samarkand", sleep: "samarkand", meals: "B", move: [["tashkent", "samarkand"]],
          stops: [
            { name: "Afrosiyob high-speed train", desc: "Morning train — 300 km in about 2 hours 10 minutes.", img: "train" },
            { name: "Gur-e-Amir", desc: "The ribbed blue dome over the tomb of Amir Timur.", img: "gur-e-amir" },
            { name: "Registan square", desc: "Three majestic madrasas — most beautiful at sunset and in the evening light.", img: "registan" }
          ] },
        { title: "The jewels of Samarkand", sleep: "samarkand", meals: "B",
          stops: [
            { name: "Shah-i-Zinda", desc: "An avenue of turquoise mausoleums — the most photogenic street on the Silk Road.", img: "shahizinda" },
            { name: "Bibi-Khanym mosque & Siyob bazaar", desc: "Timur's grand mosque and the city's lively market next door.", img: "bibi-khanym" },
            { name: "Ulugbek observatory", desc: "The 15th-century observatory of the astronomer-king.", img: "ulugbek" },
            { name: "Afrosiyob museum", desc: "Ancient Samarkand and its 7th-century wall paintings of foreign ambassadors.", img: "afrosiyob" }
          ] },
        { title: "On to Bukhara", sleep: "bukhara", meals: "B", move: [["samarkand", "bukhara"]],
          stops: [
            { name: "Train to Bukhara", desc: "About 1 hour 40 minutes on the Afrosiyob.", img: "train" },
            { name: "Lyabi-Hauz", desc: "The old town's square around a 17th-century pool, shaded by mulberry trees.", img: "lyabi-hauz" },
            { name: "Evening walk in the old town", desc: "Quiet lanes, craftsmen's workshops and tea houses.", img: "bukhara" }
          ] },
        { title: "Living museum of Bukhara", sleep: "bukhara", meals: "B",
          stops: [
            { name: "Ark fortress", desc: "Residence of the emirs of Bukhara for over a thousand years.", img: "ark" },
            { name: "Samanid mausoleum", desc: "A 10th-century masterpiece of brick architecture.", img: "samanid" },
            { name: "Poi-Kalon ensemble", desc: "The Kalon minaret and the blue domes of Mir-i-Arab madrasa.", img: "mir-i-arab" },
            { name: "Trading domes", desc: "Medieval bazaars for carpets, ceramics, suzani and spices.", img: "ceramics" }
          ] },
        { title: "Across the Kyzylkum to Khiva", sleep: "khiva", meals: "B", move: [["bukhara", "khiva"]],
          stops: [
            { name: "Kyzylkum desert road", desc: "A scenic drive with a stop at the Amu Darya river.", img: "kyzylkum" },
            { name: "Sunset on the city walls", desc: "First look at Khiva from the walls of Ichan-Kala.", img: "khiva" }
          ] },
        { title: "Khiva — the walled city", sleep: "khiva", meals: "B",
          stops: [
            { name: "Ichan-Kala", desc: "A whole medieval city inside clay walls, a UNESCO World Heritage site.", img: "ichan-kala" },
            { name: "Kalta Minor & Kunya-Ark", desc: "The famous unfinished turquoise minaret and the old khans' citadel.", img: "khiva-air" },
            { name: "Islam Khoja minaret", desc: "Climb the tallest minaret of Khiva for the best view.", img: "islam-khoja" }
          ] },
        { title: "Departure", sleep: null, meals: "B", move: [["khiva", "urgench"], ["urgench", "tashkent"]],
          stops: [
            { name: "Transfer and flight", desc: "Transfer to Urgench airport and flight to Tashkent for your international departure.", img: "tashkent-sky" }
          ] }
      ],
      included: INCLUDED_BASE.concat(["Afrosiyob train tickets Tashkent–Samarkand–Bukhara", "Domestic flight Urgench–Tashkent", "Welcome dinner with plov"]),
      excluded: EXCLUDED_BASE, bring: BRING_BASE
    },

    express: {
      title: "Samarkand & Bukhara Express", subtitle: "Two legendary cities by high-speed train",
      cover: "bukhara", flags: ["UZ"], hotel: "superior",
      highlights: ["Registan & Shah-i-Zinda", "Old Bukhara", "Fast trains, no long drives"],
      days: [
        { title: "Arrival in Tashkent", sleep: "tashkent", meals: "-",
          stops: [ { name: "Airport meeting & city tour", desc: "Hazrati Imam complex, Chorsu bazaar and the metro.", img: "tashkent" } ] },
        { title: "Samarkand", sleep: "samarkand", meals: "B", move: [["tashkent", "samarkand"]],
          stops: [
            { name: "Registan square", desc: "Three madrasas framing the most famous square of Central Asia.", img: "registan" },
            { name: "Gur-e-Amir", desc: "Mausoleum of Amir Timur.", img: "gur-e-amir" } ] },
        { title: "Samarkand highlights", sleep: "samarkand", meals: "B",
          stops: [
            { name: "Shah-i-Zinda", desc: "Avenue of blue-tiled mausoleums.", img: "shahizinda" },
            { name: "Bibi-Khanym & Siyob bazaar", desc: "Timur's great mosque and the bread and fruit market.", img: "bibi-khanym" } ] },
        { title: "Bukhara", sleep: "bukhara", meals: "B", move: [["samarkand", "bukhara"]],
          stops: [
            { name: "Ark & Poi-Kalon", desc: "Fortress of the emirs and the Kalon minaret.", img: "ark" },
            { name: "Lyabi-Hauz", desc: "Evening at the old pool square.", img: "lyabi-hauz" } ] },
        { title: "Departure", sleep: null, meals: "B", move: [["bukhara", "tashkent"]],
          stops: [ { name: "Train to Tashkent", desc: "Afrosiyob back to Tashkent for your flight home.", img: "train" } ] }
      ],
      included: INCLUDED_BASE.concat(["All Afrosiyob train tickets"]), excluded: EXCLUDED_BASE, bring: BRING_BASE
    },

    spiritual: {
      title: "Spiritual Heritage of Uzbekistan", subtitle: "Ziyarat to the great scholars and saints",
      cover: "tashkent", flags: ["UZ"], hotel: "superior",
      highlights: ["Imam al-Bukhari complex", "Imam al-Maturidi", "Bahauddin Naqshband", "Uthman Quran"],
      days: [
        { title: "Tashkent", sleep: "tashkent", meals: "D",
          stops: [ { name: "Hazrati Imam complex", desc: "Mosques, madrasa and the library with the Uthman Quran.", img: "tashkent" },
                   { name: "Kukeldash madrasa", desc: "16th-century madrasa next to Chorsu bazaar.", img: "kukeldash" } ] },
        { title: "Samarkand — Imam al-Bukhari", sleep: "samarkand", meals: "B", move: [["tashkent", "samarkand"]],
          stops: [ { name: "Imam al-Bukhari memorial complex", desc: "Resting place of the compiler of Sahih al-Bukhari, 25 km from Samarkand.", img: "bibi-khanym" },
                   { name: "Registan", desc: "Evening visit to the Registan madrasas.", img: "registan" } ] },
        { title: "Samarkand — saints and scholars", sleep: "samarkand", meals: "B",
          stops: [ { name: "Imam al-Maturidi mausoleum", desc: "Tomb of the great theologian of the Hanafi school.", img: "maturidi" },
                   { name: "Shah-i-Zinda", desc: "Shrine of Qusam ibn Abbas, cousin of the Prophet ﷺ.", img: "shahizinda" },
                   { name: "Gur-e-Amir", desc: "Mausoleum of Amir Timur and his teacher.", img: "gur-e-amir" } ] },
        { title: "Bukhara — Bahauddin Naqshband", sleep: "bukhara", meals: "B", move: [["samarkand", "bukhara"]],
          stops: [ { name: "Bahauddin Naqshband complex", desc: "Shrine of the founder of the Naqshbandi order, 12 km from Bukhara.", img: "mir-i-arab" },
                   { name: "Lyabi-Hauz", desc: "Old town square for the evening.", img: "lyabi-hauz" } ] },
        { title: "Holy Bukhara", sleep: "bukhara", meals: "B",
          stops: [ { name: "Poi-Kalon & Mir-i-Arab madrasa", desc: "The Kalon mosque and a working madrasa since the 16th century.", img: "mir-i-arab" },
                   { name: "Samanid mausoleum & Ark", desc: "10th-century brick masterpiece and the emirs' fortress.", img: "samanid" } ] },
        { title: "Return to Tashkent", sleep: "tashkent", meals: "B", move: [["bukhara", "tashkent"]],
          stops: [ { name: "Afrosiyob train", desc: "Afternoon train back to Tashkent, free evening.", img: "train" } ] },
        { title: "Departure", sleep: null, meals: "B",
          stops: [ { name: "Airport transfer", desc: "Transfer to Tashkent airport.", img: "tashkent-sky" } ] }
      ],
      included: INCLUDED_BASE.concat(["All train tickets", "Welcome dinner", "Program planned around prayer times on request"]), excluded: EXCLUDED_BASE, bring: BRING_BASE
    },

    nature: {
      title: "Mountains & Desert", subtitle: "Chimgan peaks, Charvak lake and a night in a yurt",
      cover: "charvak", flags: ["UZ"], hotel: "comfort",
      highlights: ["Chimgan cable car", "Turquoise Charvak lake", "Camel ride & yurt camp"],
      days: [
        { title: "To the Chimgan mountains", sleep: "chimgan", meals: "B,D", move: [["tashkent", "chimgan"]],
          stops: [ { name: "Chimgan & Beldersay", desc: "Cable car ride and easy mountain walks.", img: "chimgan" } ] },
        { title: "Charvak lake, train to Samarkand", sleep: "samarkand", meals: "B", move: [["chimgan", "tashkent"], ["tashkent", "samarkand"]],
          stops: [ { name: "Charvak reservoir", desc: "Turquoise water between mountains — swim in summer.", img: "charvak" },
                   { name: "Evening train", desc: "Afrosiyob to Samarkand.", img: "train" } ] },
        { title: "Desert yurt camp", sleep: "aydarkul", meals: "B,L,D", move: [["samarkand", "aydarkul"]],
          stops: [ { name: "Nurata", desc: "Holy spring and the fortress of Alexander the Great.", img: "kyzylkum" },
                   { name: "Aydarkul yurt camp", desc: "Camel ride, dinner by the campfire, Kazakh songs and a sky full of stars.", img: "yurt" } ] },
        { title: "Back to Samarkand", sleep: null, meals: "B", move: [["aydarkul", "samarkand"]],
          stops: [ { name: "Lake Aydarkul", desc: "Morning at the lake, return to Samarkand for your onward journey.", img: "camels" } ] }
      ],
      included: INCLUDED_BASE.concat(["Train ticket Tashkent–Samarkand", "Yurt camp with dinner and breakfast", "Camel ride"]), excluded: EXCLUDED_BASE, bring: BRING_BASE
    },

    silkroad: {
      title: "Silk Road: Uzbekistan, Kazakhstan & Kyrgyzstan", subtitle: "Canyons, alpine lakes and the great cities",
      cover: "mountains", flags: ["KZ", "KG", "UZ"], hotel: "superior",
      highlights: ["Charyn Canyon", "Issyk-Kul lake", "Burana tower", "Samarkand"],
      days: [
        { title: "Almaty", sleep: "almaty", meals: "-", stops: [ { name: "Arrival & city walk", desc: "Panfilov park, Zenkov cathedral and the Green bazaar.", img: "autumn-mountains" } ] },
        { title: "Mountains of Almaty", sleep: "almaty", meals: "B", stops: [ { name: "Medeu & Shymbulak", desc: "Cable car into the Tian Shan mountains.", img: "mountains" } ] },
        { title: "Charyn Canyon to Karakol", sleep: "karakol", meals: "B", move: [["almaty", "charyn"], ["charyn", "karakol"]],
          stops: [ { name: "Charyn Canyon", desc: "Walk the Valley of Castles.", img: "kyzylkum" },
                   { name: "Border into Kyrgyzstan", desc: "Kegen–Karkyra crossing (summer route).", img: "autumn-mountains" } ] },
        { title: "Karakol", sleep: "karakol", meals: "B", stops: [ { name: "Jeti-Oguz & Dungan mosque", desc: "Red rocks of the 'Seven Bulls' and a wooden mosque built without nails.", img: "autumn-mountains" } ] },
        { title: "Issyk-Kul shore", sleep: "issykkul", meals: "B", move: [["karakol", "issykkul"]], stops: [ { name: "Cholpon-Ata", desc: "Lake beaches and an open-air museum of petroglyphs.", img: "chimgan" } ] },
        { title: "To Bishkek", sleep: "bishkek", meals: "B", move: [["issykkul", "bishkek"]], stops: [ { name: "Burana tower", desc: "11th-century minaret of the ancient city of Balasagun.", img: "fergana" } ] },
        { title: "Fly to Tashkent", sleep: "tashkent", meals: "B", move: [["bishkek", "tashkent"]], stops: [ { name: "Tashkent", desc: "Evening walk and dinner.", img: "tashkent-sky" } ] },
        { title: "Samarkand", sleep: "samarkand", meals: "B", move: [["tashkent", "samarkand"]], stops: [ { name: "Registan & Gur-e-Amir", desc: "The heart of Timur's capital.", img: "registan" } ] },
        { title: "Samarkand", sleep: "samarkand", meals: "B", stops: [ { name: "Shah-i-Zinda & Bibi-Khanym", desc: "The blue avenue of mausoleums and Timur's mosque.", img: "shahizinda" } ] },
        { title: "Back to Tashkent", sleep: "tashkent", meals: "B", move: [["samarkand", "tashkent"]], stops: [ { name: "Tashkent metro & Chorsu", desc: "Afternoon in the capital.", img: "metro" } ] },
        { title: "Chimgan day trip", sleep: "tashkent", meals: "B", stops: [ { name: "Chimgan & Charvak", desc: "Mountains and the turquoise lake.", img: "charvak" } ] },
        { title: "Departure", sleep: null, meals: "B", stops: [ { name: "Airport transfer", desc: "Flight home from Tashkent.", img: "tashkent-sky" } ] }
      ],
      included: INCLUDED_BASE.concat(["Flight Bishkek–Tashkent", "Train tickets Tashkent–Samarkand–Tashkent", "Border crossing assistance"]), excluded: EXCLUDED_BASE, bring: BRING_BASE
    },

    uztj: {
      title: "Uzbekistan & Tajikistan", subtitle: "From Samarkand into the Fann mountains",
      cover: "shahizinda", flags: ["UZ", "TJ"], hotel: "comfort",
      highlights: ["Samarkand", "Sogdian Panjakent", "Iskanderkul lake", "Khujand bazaar"],
      days: [
        { title: "Tashkent", sleep: "tashkent", meals: "-", stops: [ { name: "Arrival & city tour", desc: "Hazrati Imam, Chorsu bazaar and the metro.", img: "tashkent" } ] },
        { title: "Samarkand", sleep: "samarkand", meals: "B", move: [["tashkent", "samarkand"]], stops: [ { name: "Registan & Gur-e-Amir", desc: "Timur's magnificent capital.", img: "registan" } ] },
        { title: "Into Tajikistan: Panjakent", sleep: "panjakent", meals: "B", move: [["samarkand", "panjakent"]],
          stops: [ { name: "Shah-i-Zinda", desc: "Morning in Samarkand before the border.", img: "shahizinda" },
                   { name: "Ancient Panjakent", desc: "Ruins of a Sogdian city with temples and frescoes.", img: "afrosiyob" } ] },
        { title: "Iskanderkul lake", sleep: "iskanderkul", meals: "B,D", move: [["panjakent", "iskanderkul"]], stops: [ { name: "Iskanderkul", desc: "Turquoise lake and waterfall in the Fann mountains.", img: "chimgan" } ] },
        { title: "Dushanbe", sleep: "dushanbe", meals: "B", move: [["iskanderkul", "dushanbe"]], stops: [ { name: "Anzob pass & Dushanbe", desc: "Mountain road to the Tajik capital.", img: "autumn-mountains" } ] },
        { title: "Dushanbe & Hissar", sleep: "dushanbe", meals: "B", stops: [ { name: "Hissar fortress & National museum", desc: "Ancient fortress gate and the reclining Buddha statue.", img: "ark" } ] },
        { title: "Khujand", sleep: "khujand", meals: "B", move: [["dushanbe", "khujand"]], stops: [ { name: "Panjshanbe bazaar", desc: "One of the most beautiful bazaars in Central Asia.", img: "chorsu" } ] },
        { title: "Back to Tashkent", sleep: "tashkent", meals: "B", move: [["khujand", "tashkent"]], stops: [ { name: "Border & Tashkent", desc: "Return to Uzbekistan, farewell dinner.", img: "plov" } ] },
        { title: "Departure", sleep: null, meals: "B", stops: [ { name: "Airport transfer", desc: "Flight home.", img: "tashkent-sky" } ] }
      ],
      included: INCLUDED_BASE.concat(["Train ticket Tashkent–Samarkand", "Border crossing assistance"]), excluded: EXCLUDED_BASE, bring: BRING_BASE
    }
  };
})();
