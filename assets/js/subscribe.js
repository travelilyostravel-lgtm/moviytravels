/* Moviy Nomad — "Subscribe" corner card (bottom-right, above the contact button).
   It slides in when a visitor reaches the END of something: the video section, the last slide of a tour
   presentation, the end of a guides/partners list, or the bottom of any page. The e-mail goes into the
   customer base (register_customer) and the action is logged as "subscribe" in the customer's card. */
(function () {
  if (window.__mnSub || /account\.html/.test(location.pathname)) return; window.__mnSub = 1;   /* not on the client cabinet */
  var L = (document.documentElement.lang || "en").slice(0, 2);
  var TX = {
    en: ["Subscribe to Moviy Nomad", "New tours, group dates and special offers — straight to your inbox, about once a month.", "Your e-mail", "WhatsApp (optional)", "Subscribe", "Thank you! You're subscribed.", "Please enter a valid e-mail.", "Subscribe", "No spam. Unsubscribe any time."],
    ru: ["Подпишитесь на Moviy Nomad", "Новые туры, даты групп и спецпредложения — примерно раз в месяц на вашу почту.", "Ваш e-mail", "WhatsApp (необязательно)", "Подписаться", "Спасибо! Вы подписаны.", "Введите правильный e-mail.", "Подписка", "Без спама. Отписаться можно в любой момент."],
    uz: ["Moviy Nomad'ga obuna bo'ling", "Yangi turlar, guruh sanalari va maxsus takliflar — oyiga taxminan bir marta pochtangizga.", "E-mail manzilingiz", "WhatsApp (ixtiyoriy)", "Obuna bo'lish", "Rahmat! Siz obuna bo'ldingiz.", "To'g'ri e-mail kiriting.", "Obuna", "Spam yo'q. Istalgan vaqtda obunani bekor qilish mumkin."],
    tr: ["Moviy Nomad'a abone olun", "Yeni turlar, grup tarihleri ve özel teklifler — ayda yaklaşık bir kez e-postanıza.", "E-posta adresiniz", "WhatsApp (isteğe bağlı)", "Abone ol", "Teşekkürler! Abone oldunuz.", "Geçerli bir e-posta girin.", "Abone ol", "Spam yok. İstediğiniz zaman ayrılabilirsiniz."],
    ar: ["اشترك في Moviy Nomad", "جولات جديدة ومواعيد المجموعات وعروض خاصة — إلى بريدك مرة في الشهر تقريبًا.", "بريدك الإلكتروني", "واتساب (اختياري)", "اشترك", "شكرًا! تم اشتراكك.", "أدخل بريدًا إلكترونيًا صحيحًا.", "اشتراك", "لا رسائل مزعجة. يمكنك إلغاء الاشتراك في أي وقت."],
    de: ["Moviy Nomad abonnieren", "Neue Touren, Gruppentermine und Angebote — etwa einmal im Monat in Ihr Postfach.", "Ihre E-Mail", "WhatsApp (optional)", "Abonnieren", "Danke! Sie haben abonniert.", "Bitte gültige E-Mail eingeben.", "Abo", "Kein Spam. Jederzeit abbestellbar."],
    sv: ["Prenumerera på Moviy Nomad", "Nya resor, gruppdatum och erbjudanden — ungefär en gång i månaden till din e-post.", "Din e-post", "WhatsApp (valfritt)", "Prenumerera", "Tack! Du prenumererar nu.", "Ange en giltig e-post.", "Prenumerera", "Ingen spam. Avsluta när du vill."],
    zh: ["订阅 Moviy Nomad", "新线路、团期和优惠——每月约一封邮件。", "您的邮箱", "WhatsApp（可选）", "订阅", "谢谢！订阅成功。", "请输入有效的邮箱。", "订阅", "无垃圾邮件，可随时退订。"],
    hi: ["Moviy Nomad की सदस्यता लें", "नए टूर, ग्रुप की तारीखें और खास ऑफ़र — महीने में लगभग एक बार आपके ईमेल पर।", "आपका ईमेल", "WhatsApp (वैकल्पिक)", "सदस्यता लें", "धन्यवाद! आपकी सदस्यता हो गई।", "सही ईमेल दर्ज करें।", "सदस्यता", "कोई स्पैम नहीं। कभी भी सदस्यता छोड़ें।"],
    ko: ["Moviy Nomad 구독하기", "새 투어, 그룹 출발일, 특별 혜택 — 한 달에 한 번 정도 이메일로 보내드려요.", "이메일 주소", "WhatsApp (선택)", "구독하기", "감사합니다! 구독되었습니다.", "올바른 이메일을 입력하세요.", "구독", "스팸 없음. 언제든 구독 해지 가능."]
  };
  var T = TX[L] || TX.en;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (get("mn_sub") === "1") return;
  function cfg() { var c = window.MN_SB || {}; return c.url && c.anonKey ? { url: c.url, anon: c.anonKey } : null; }
  function rpc(fn, p) {
    var c = cfg(); if (!c || !c.url) return Promise.reject(new Error("no config"));
    return fetch(c.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: { "Content-Type": "application/json", apikey: c.anon, Authorization: "Bearer " + c.anon }, body: JSON.stringify({ p: p }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  var snoozed = +(get("mn_sub_later") || 0) > Date.now();
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var wrap = document.createElement("div"); wrap.className = "msub"; wrap.setAttribute("data-free", ""); wrap.hidden = true;
  wrap.innerHTML =
    '<div class="msub__card" role="dialog" aria-label="' + esc(T[0]) + '" hidden>' +
      '<button type="button" class="msub__x" aria-label="×">×</button>' +
      '<div class="msub__ico" aria-hidden="true">🔔</div><h4>' + esc(T[0]) + '</h4><p>' + esc(T[1]) + '</p>' +
      '<form class="msub__f" data-noreg novalidate><input type="email" name="email" required placeholder="' + esc(T[2]) + '" autocomplete="email">' +
      '<button type="submit" class="btn btn--gold">' + esc(T[4]) + '</button><small class="msub__err" aria-live="polite"></small></form>' +
      '<small class="msub__note">' + esc(T[8]) + '</small></div>' +
    '<button type="button" class="msub__btn" aria-label="' + esc(T[0]) + '"><span aria-hidden="true">🔔</span><b>' + esc(T[7]) + '</b></button>';
  document.body.appendChild(wrap);
  var card = wrap.querySelector(".msub__card");
  function open() { wrap.hidden = false; card.hidden = false; wrap.classList.add("is-open"); }
  window.MN_SUB_OPEN = open;
  function close() { card.hidden = true; wrap.classList.remove("is-open"); put("mn_sub_later", String(Date.now() + 7 * 864e5)); }
  wrap.querySelector(".msub__btn").onclick = function () { if (card.hidden) open(); else close(); };
  wrap.querySelector(".msub__x").onclick = close;
  wrap.querySelector("form").onsubmit = function (e) {
    e.preventDefault(); var f = e.target, em = f.email.value.replace(/\s+/g, "").toLowerCase(), err = f.querySelector(".msub__err");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { err.textContent = T[6]; return; }
    var vid = get("mn_vid") || "", page = location.pathname;
    f.querySelector("button").disabled = true;
    rpc("register_customer", { vid: vid, provider: "email", email: em, lang: L, page: page })
      .then(function () { put("mn_cust", "1"); return rpc("track_event", { vid: vid, event: "subscribe", detail: "newsletter · " + em, page: page }).catch(function () {}); })
      .then(function () { put("mn_sub", "1"); card.innerHTML = '<div class="msub__ok">✅ ' + esc(T[5]) + '</div>'; setTimeout(function () { wrap.remove(); }, 3500); })
      .catch(function () { f.querySelector("button").disabled = false; err.textContent = T[6]; });
  };

  // ---- when to show: the visitor reached the end of something
  var shown = false;
  function reached(src) {
    if (shown) return; shown = true; wrap.hidden = false;
    try { window.MNtrack && window.MNtrack("subscribe_prompt", src); } catch (e) {}
    if (!snoozed) setTimeout(open, 400);
  }
  var targets = [];
  ["#videos .vask", ".vgrid .vcard:last-child", ".pt-more", "#pt-seeall", ".partners-list", "footer", "[data-sub-trigger]"].forEach(function (s) {
    document.querySelectorAll(s).forEach(function (el) { targets.push([el, s]); });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { reached(x.target.__mnSubSrc || "end"); io.disconnect(); } }); }, { threshold: 0.4 });
    targets.forEach(function (t) { t[0].__mnSubSrc = t[1]; io.observe(t[0]); });
    // tour presentations are a horizontal deck: watch the dots / last slide too
    var deck = document.getElementById("deck");
    if (deck) {
      var mo = new MutationObserver(function () { var dots = document.querySelectorAll("#dots > *"); if (dots.length && dots[dots.length - 1].classList.contains("is-on")) reached("deck-last-slide"); });
      mo.observe(document.getElementById("dots") || deck, { subtree: true, attributes: true, childList: true });
    }
  } else { setTimeout(function () { reached("timer"); }, 60000); }
})();
