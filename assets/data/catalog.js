/* Moviy Nomad — catalog: cities, routes, services and prices.
 * !!! SAMPLE PRICES (sample:true). Replace with real partner prices before going live.
 * All money in USD. Room prices are per room per night (double room).
 */
window.MN_CATALOG = {
  sample: true,
  currency: "USD",
  markup: 0.20,            // agency margin added on top of costs
  defaultPax: 2,
  openCountries: ["UZ", "CA"],   // countries with live prices; others show "coming soon" (admin can change)

  // Cities and transfers are generated into assets/data/places.js (build/tours_data.py).

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
