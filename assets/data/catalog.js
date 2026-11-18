/* Moviy Nomad — catalog: cities, routes, services and prices.
 * !!! SAMPLE PRICES (sample:true). Replace with real partner prices before going live.
 * All money in USD. Room prices are per room per night (double room).
 */
window.MN_CATALOG = {
  sample: true,
  currency: "USD",
  markup: 0.20,            // agency margin added on top of costs
  defaultPax: 2,

  cities: {
    // Uzbekistan
    tashkent:   { name: "Tashkent",   country: "UZ", lat: 41.31, lon: 69.24, img: "tashkent-sky", desc: "The modern capital: Soviet-era metro palaces, the Hazrati Imam complex and the vast Chorsu bazaar." },
    samarkand:  { name: "Samarkand",  country: "UZ", lat: 39.65, lon: 66.96, img: "registan",     desc: "Timur's capital and the heart of the Silk Road — Registan, Shah-i-Zinda and Gur-e-Amir." },
    bukhara:    { name: "Bukhara",    country: "UZ", lat: 39.77, lon: 64.42, img: "lyabi-hauz",   desc: "A living medieval city of trading domes, madrasas and the 1,000-year-old Ark fortress." },
    khiva:      { name: "Khiva",      country: "UZ", lat: 41.38, lon: 60.36, img: "khiva-air",    desc: "Ichan-Kala — a complete walled city of minarets and palaces, a UNESCO site." },
    urgench:    { name: "Urgench",    country: "UZ", lat: 41.55, lon: 60.63, img: "khiva-air",    desc: "Airport city 35 km from Khiva.", hidden: true },
    shahrisabz: { name: "Shahrisabz", country: "UZ", lat: 39.05, lon: 66.83, img: "bibi-khanym",  desc: "Amir Timur's birthplace with the ruins of the grand Ak-Saray palace." },
    aydarkul:   { name: "Aydarkul yurt camp", country: "UZ", lat: 40.80, lon: 66.20, img: "yurt", desc: "Yurt camp in the Kyzylkum desert near Lake Aydarkul — camels, campfire and stars." },
    chimgan:    { name: "Chimgan & Charvak", country: "UZ", lat: 41.56, lon: 70.02, img: "chimgan", desc: "Mountains and a turquoise lake 1.5 hours from Tashkent." },
    fergana:    { name: "Fergana Valley", country: "UZ", lat: 40.47, lon: 71.72, img: "fergana", desc: "Silk weaving in Margilan, ceramics of Rishtan and the Khudayar Khan palace in Kokand." },
    termez:     { name: "Termez",     country: "UZ", lat: 37.22, lon: 67.28, img: "samanid",     desc: "Ancient Buddhist monasteries Fayaz-Tepa and Kara-Tepa on the Amu Darya." },
    nukus:      { name: "Nukus & Moynaq", country: "UZ", lat: 42.46, lon: 59.60, img: "kyzylkum", desc: "The Savitsky art museum and the ship cemetery of the vanished Aral Sea." },
    // Kazakhstan
    almaty:     { name: "Almaty",     country: "KZ", lat: 43.24, lon: 76.89, img: "autumn-mountains", desc: "Green city at the foot of the Tian Shan — Medeu, Shymbulak and Kok-Tobe." },
    charyn:     { name: "Charyn Canyon", country: "KZ", lat: 43.35, lon: 79.08, img: "kyzylkum", desc: "The 'Valley of Castles' — red canyon walls carved by the Charyn river." },
    turkistan:  { name: "Turkistan",  country: "KZ", lat: 43.30, lon: 68.25, img: "maturidi",   desc: "The mausoleum of Khoja Ahmed Yasawi, a holy site of the Turkic world." },
    // Kyrgyzstan
    bishkek:    { name: "Bishkek",    country: "KG", lat: 42.87, lon: 74.59, img: "autumn-mountains", desc: "Leafy capital and gateway to Ala-Archa national park and the Burana tower." },
    issykkul:   { name: "Issyk-Kul (Cholpon-Ata)", country: "KG", lat: 42.65, lon: 77.08, img: "chimgan", desc: "The 'warm lake' that never freezes, ringed by snowy peaks and petroglyphs." },
    karakol:    { name: "Karakol",    country: "KG", lat: 42.49, lon: 78.39, img: "autumn-mountains", desc: "Dungan mosque, Jeti-Oguz red rocks and alpine valleys." },
    osh:        { name: "Osh",        country: "KG", lat: 40.51, lon: 72.81, img: "fergana",    desc: "3,000-year-old city with the sacred Sulaiman-Too mountain and a huge bazaar." },
    // Tajikistan
    panjakent:  { name: "Panjakent",  country: "TJ", lat: 39.49, lon: 67.61, img: "afrosiyob",  desc: "Ruins of an ancient Sogdian city just across the border from Samarkand." },
    iskanderkul:{ name: "Iskanderkul", country: "TJ", lat: 39.08, lon: 68.37, img: "chimgan",   desc: "A turquoise mountain lake in the Fann mountains, named after Alexander the Great." },
    dushanbe:   { name: "Dushanbe",   country: "TJ", lat: 38.56, lon: 68.79, img: "tashkent-sky", desc: "Tajik capital with the Rudaki avenue, the national museum and Hissar fortress nearby." },
    khujand:    { name: "Khujand",    country: "TJ", lat: 40.28, lon: 69.62, img: "kukeldash",  desc: "One of Central Asia's oldest cities on the Syr Darya, with the Panjshanbe bazaar." }
  },

  // Known transfers (both directions). km, hours, mode: train | car | flight | border
  legs: [
    { a: "tashkent",  b: "samarkand", km: 300, h: 2.2, mode: "train", note: "Afrosiyob high-speed train" },
    { a: "samarkand", b: "bukhara",   km: 270, h: 1.7, mode: "train", note: "Afrosiyob high-speed train" },
    { a: "bukhara",   b: "tashkent",  km: 570, h: 3.9, mode: "train", note: "Afrosiyob high-speed train" },
    { a: "bukhara",   b: "khiva",     km: 450, h: 6.5, mode: "car",   note: "Through the Kyzylkum desert along the Amu Darya" },
    { a: "khiva",     b: "urgench",   km: 35,  h: 0.7, mode: "car" },
    { a: "urgench",   b: "tashkent",  km: 750, h: 1.5, mode: "flight", note: "Domestic flight" },
    { a: "tashkent",  b: "chimgan",   km: 85,  h: 1.5, mode: "car" },
    { a: "samarkand", b: "aydarkul",  km: 230, h: 4,   mode: "car",   note: "Via Nurata" },
    { a: "aydarkul",  b: "samarkand", km: 230, h: 4,   mode: "car" },
    { a: "samarkand", b: "shahrisabz",km: 90,  h: 2,   mode: "car",   note: "Over the Takhtakaracha pass" },
    { a: "samarkand", b: "panjakent", km: 60,  h: 1.5, mode: "border", note: "Incl. border crossing" },
    { a: "panjakent", b: "iskanderkul", km: 180, h: 4, mode: "car" },
    { a: "iskanderkul", b: "dushanbe", km: 130, h: 3,  mode: "car",   note: "Through the Anzob tunnel" },
    { a: "dushanbe",  b: "khujand",   km: 340, h: 5.5, mode: "car" },
    { a: "khujand",   b: "tashkent",  km: 150, h: 3,   mode: "border", note: "Incl. Oybek border crossing" },
    { a: "almaty",    b: "charyn",    km: 200, h: 3,   mode: "car" },
    { a: "charyn",    b: "karakol",   km: 230, h: 4.5, mode: "border", note: "Kegen–Karkyra border, summer season" },
    { a: "karakol",   b: "issykkul",  km: 220, h: 3.5, mode: "car" },
    { a: "issykkul",  b: "bishkek",   km: 250, h: 4,   mode: "car",   note: "Stop at the Burana tower" },
    { a: "bishkek",   b: "tashkent",  km: 480, h: 1.2, mode: "flight", note: "Flight" },
    { a: "tashkent",  b: "turkistan", km: 300, h: 5,   mode: "border" },
    { a: "tashkent",  b: "fergana",   km: 310, h: 4.5, mode: "car",   note: "Over the Kamchik pass" }
  ],

  hotelClasses: [
    { id: "comfort",  name: "Comfort 3★",          room: 70,  desc: "Clean, central, family-run hotels with breakfast." },
    { id: "superior", name: "Superior 4★",         room: 110, desc: "Modern 4-star hotels with restaurant and service." },
    { id: "boutique", name: "Boutique & heritage", room: 160, desc: "Historic houses and madrasa-style boutique hotels in the old towns." }
  ],
  singleSupplement: 0.8,   // single room costs 80% of a double room per person extra

  transport: [
    { id: "sedan",   name: "Sedan",            seats: 3,  day: 70,  desc: "Chevrolet or similar, A/C" },
    { id: "minivan", name: "Minivan",          seats: 6,  day: 110, desc: "Hyundai Staria or similar, A/C" },
    { id: "premium", name: "Premium van",      seats: 6,  day: 170, desc: "Mercedes V-Class, leather seats, Wi-Fi" },
    { id: "minibus", name: "Minibus",          seats: 15, day: 160, desc: "Mercedes Sprinter or similar" },
    { id: "bus",     name: "Coach",            seats: 35, day: 260, desc: "Comfortable tourist coach" }
  ],

  guide: {
    day: 60,                           // per day, English/Russian
    languages: { en: 0, ru: 0, tr: 20, ar: 25, de: 25, zh: 30, ko: 30, hi: 30, sv: 30 }, // extra per day
    names: { en: "English", ru: "Russian", tr: "Turkish", ar: "Arabic", de: "German", zh: "Chinese", ko: "Korean", hi: "Hindi", sv: "Swedish" },
    // Partner guides — add real profiles here (photo, languages, cities, bio). Reviews come from verified tourists.
    people: []
  },

  // Fixed costs per person
  fixed: {
    train: 35,         // per train ride (economy class)
    flight: 75,        // domestic flight
    border: 0,
    entryPerDay: 12,   // museum and monument tickets per sightseeing day
    welcomeDinner: 20
  }
};
