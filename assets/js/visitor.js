/* Moviy Nomad — visitors & customer base (2026-11-23).
   - counts visits/pages and logs important actions (tour opened, WhatsApp clicked, request sent…)
   - looking around is free; on the FIRST real action the visitor is asked to sign in:
     "Continue with Google" (one click) or name + e-mail (+ optional phone). Then the action continues.
   - everything goes to Supabase (site_visitors / site_customers / site_events) and is shown in admin → "Mijozlar". */
(function () {
  var SB = window.MN_SB || {}; if (!SB.url || !SB.anonKey) return;
  var GOOGLE_ON = true;                        // switched on once Google sign-in is configured in Supabase
  var LANG = (window.MN_LANG || document.documentElement.lang || "en").slice(0, 2);
  var LS = window.localStorage, SS = window.sessionStorage;
  (function () {   // Google one-click sign-in module
    if (/\/(admin|agent|partner)\//.test(location.pathname) || window.MN_GSI) return;
    var me = document.querySelector('script[src*="visitor.js"]'); if (!me) return;
    var sc = document.createElement("script"); sc.src = me.src.replace(/visitor\.js.*$/, "gsi.js?v=1"); document.head.appendChild(sc);
  })();
  function get(k, s) { try { return (s || LS).getItem(k); } catch (e) { return null; } }
  function put(k, v, s) { try { (s || LS).setItem(k, v); } catch (e) {} }
  var vid = get("mn_vid"); if (!vid) { vid = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); put("mn_vid", vid); }
  function hdr(tok) { return { "Content-Type": "application/json", apikey: SB.anonKey, Authorization: "Bearer " + (tok || SB.anonKey) }; }
  function rpc(fn, p, tok) { return fetch(SB.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: hdr(tok), body: JSON.stringify({ p: p }), keepalive: true }).then(function (r) { return r.ok ? r.json() : r.text().then(function (t) { throw new Error(t); }); }); }
  var page = location.pathname + location.search;
  function track(ev, detail) { rpc("track_event", { vid: vid, event: ev, detail: String(detail || "").slice(0, 300), page: page }).catch(function () {}); }
  window.MN_TRACK = track;

  // ---------------------------------------------------------------- texts (10 languages)
  var TX = {
    en: ["How would you like to continue?", "Sign in once — your quotes, requests and bookings stay with you, and we can send you updates.", "Continue with Google", "or with e-mail", "Your name", "E-mail", "Phone / WhatsApp (optional)", "Continue", "Later", "We use your details only to arrange your trip and send Moviy Nomad news. No spam.", "Please enter a valid e-mail.", "Thank you!", "Google sign-in did not work. Please try again or use e-mail."],
    ru: ["Как вы хотите продолжить?", "Войдите один раз — ваши расчёты, заявки и бронирования сохранятся, и мы сможем присылать новости.", "Продолжить с Google", "или по e-mail", "Ваше имя", "E-mail", "Телефон / WhatsApp (необязательно)", "Продолжить", "Позже", "Мы используем ваши данные только для организации поездки и новостей Moviy Nomad. Без спама.", "Введите правильный e-mail.", "Спасибо!", "Вход через Google не удался. Попробуйте ещё раз или укажите e-mail."],
    uz: ["Saytga qanday kirasiz?", "Bir marta kiring — hisob-kitoblaringiz, so'rov va bronlaringiz saqlanadi, sizga yangiliklar yuborib turamiz.", "Google orqali davom etish", "yoki e-mail orqali", "Ismingiz", "E-mail", "Telefon / WhatsApp (ixtiyoriy)", "Davom etish", "Keyinroq", "Ma'lumotlaringiz faqat sayohatingizni tashkil qilish va Moviy Nomad yangiliklari uchun ishlatiladi. Spam yo'q.", "E-mailni to'g'ri yozing.", "Rahmat!", "Google orqali kirib bo'lmadi. Qayta urinib ko'ring yoki e-mail yozing."],
    tr: ["Nasıl devam etmek istersiniz?", "Bir kez giriş yapın — teklifleriniz, talepleriniz ve rezervasyonlarınız saklanır, size haber gönderebiliriz.", "Google ile devam et", "veya e-posta ile", "Adınız", "E-posta", "Telefon / WhatsApp (isteğe bağlı)", "Devam", "Sonra", "Bilgilerinizi yalnızca seyahatinizi düzenlemek ve Moviy Nomad haberleri için kullanırız. Spam yok.", "Geçerli bir e-posta girin.", "Teşekkürler!", "Google ile giriş olmadı. Tekrar deneyin veya e-posta girin."],
    ar: ["كيف تريد المتابعة؟", "سجّل مرة واحدة — تبقى عروضك وطلباتك وحجوزاتك محفوظة، ونرسل لك الأخبار.", "المتابعة عبر Google", "أو عبر البريد الإلكتروني", "اسمك", "البريد الإلكتروني", "الهاتف / واتساب (اختياري)", "متابعة", "لاحقًا", "نستخدم بياناتك فقط لتنظيم رحلتك وإرسال أخبار Moviy Nomad. بدون رسائل مزعجة.", "أدخل بريدًا إلكترونيًا صحيحًا.", "شكرًا!", "تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى أو استخدم البريد الإلكتروني."],
    de: ["Wie möchten Sie fortfahren?", "Einmal anmelden — Ihre Angebote, Anfragen und Buchungen bleiben gespeichert, und wir können Ihnen Neuigkeiten senden.", "Weiter mit Google", "oder per E-Mail", "Ihr Name", "E-Mail", "Telefon / WhatsApp (optional)", "Weiter", "Später", "Wir nutzen Ihre Daten nur für Ihre Reise und Moviy-Nomad-Neuigkeiten. Kein Spam.", "Bitte gültige E-Mail eingeben.", "Danke!", "Anmeldung mit Google fehlgeschlagen. Bitte erneut versuchen oder E-Mail nutzen."],
    sv: ["Hur vill du fortsätta?", "Logga in en gång — dina offerter, förfrågningar och bokningar sparas och vi kan skicka nyheter.", "Fortsätt med Google", "eller med e-post", "Ditt namn", "E-post", "Telefon / WhatsApp (valfritt)", "Fortsätt", "Senare", "Vi använder dina uppgifter bara för din resa och Moviy Nomad-nyheter. Ingen spam.", "Ange en giltig e-postadress.", "Tack!", "Inloggning med Google misslyckades. Försök igen eller använd e-post."],
    zh: ["您想如何继续？", "登录一次——您的报价、咨询和预订都会保存，我们也会给您发送最新消息。", "使用 Google 继续", "或使用邮箱", "您的姓名", "邮箱", "电话 / WhatsApp（可选）", "继续", "稍后", "您的信息仅用于安排行程和发送 Moviy Nomad 消息，不会发送垃圾邮件。", "请输入有效的邮箱。", "谢谢！", "Google 登录未成功，请重试或使用邮箱。"],
    hi: ["आप कैसे आगे बढ़ना चाहेंगे?", "एक बार साइन इन करें — आपके कोटेशन, अनुरोध और बुकिंग सुरक्षित रहेंगे, और हम आपको अपडेट भेज सकेंगे।", "Google से जारी रखें", "या ई-मेल से", "आपका नाम", "ई-मेल", "फ़ोन / WhatsApp (वैकल्पिक)", "जारी रखें", "बाद में", "हम आपकी जानकारी केवल यात्रा की व्यवस्था और Moviy Nomad समाचार के लिए उपयोग करते हैं। कोई स्पैम नहीं।", "कृपया सही ई-मेल लिखें।", "धन्यवाद!", "Google से साइन इन नहीं हो सका। फिर से कोशिश करें या ई-मेल दें।"],
    ko: ["어떻게 계속하시겠어요?", "한 번만 로그인하면 견적, 문의, 예약이 저장되고 소식을 보내 드릴 수 있어요.", "Google로 계속하기", "또는 이메일로", "이름", "이메일", "전화 / WhatsApp (선택)", "계속", "나중에", "정보는 여행 준비와 Moviy Nomad 소식 전달에만 사용합니다. 스팸 없음.", "올바른 이메일을 입력하세요.", "감사합니다!", "Google 로그인에 실패했어요. 다시 시도하거나 이메일을 입력하세요."]
  };
  var T = TX[LANG] || TX.en;

  // ---------------------------------------------------------------- page view
  // our own staff (founder, managers) are not counted as visitors
  var STAFF = get("mn_staff") === "1";
  // home page: live counter of visitors
  (function () {
    var box = document.getElementById("hcount"); if (!box) return;
    fetch(SB.url + "/rest/v1/rpc/site_counter", { method: "POST", headers: hdr(), body: "{}" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (!c || !c.total) return;
      var span = box.querySelector(".hcount__t"), tpl = box.getAttribute("data-t"), dtp = box.getAttribute("data-d"), fmt = function (n) { try { return n.toLocaleString(LANG === "uz" ? "ru" : LANG); } catch (e) { return String(n); } };
      box.hidden = false; var t0 = performance.now(), dur = 1400;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        span.innerHTML = tpl.replace("{n}", "<b>" + fmt(Math.round(c.total * e)) + "</b>") + (c.today ? ' <span class="hcount__d">· ' + dtp.replace("{t}", "<b>" + fmt(Math.round(c.today * e)) + "</b>") + '</span>' : "");
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }).catch(function () {});
  })();
  if (!STAFF) rpc("track_visit", { vid: vid, lang: LANG, page: page, title: document.title, ref: document.referrer ? document.referrer.slice(0, 300) : "", dev: navigator.userAgent.slice(0, 200) })
    .then(function (r) { if (r === "known") put("mn_cust", "1"); }).catch(function () {});

  // ---------------------------------------------------------------- back from Google
  var hp = new URLSearchParams(location.hash.slice(1));
  if (hp.get("access_token") && get("mn_gate_google", SS)) {
    var tok = hp.get("access_token");
    history.replaceState(null, "", location.pathname + location.search);
    SS.removeItem("mn_gate_google");
    rpc("register_customer", { vid: vid, provider: "google", lang: LANG, page: page }, tok)
      .then(function () { put("mn_cust", "1"); toast(T[11]); }).catch(function () {});
  }

  function known() { return get("mn_cust") === "1"; }
  function skipped() { return get("mn_gate_skip", SS) === "1"; }

  // ---------------------------------------------------------------- the sign-in box
  var css = ".mng{position:fixed;inset:0;z-index:10000;background:rgba(10,25,45,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".mng__box{background:#fff;color:#1b2a3a;max-width:420px;width:100%;border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:inherit;max-height:92vh;overflow:auto}" +
    ".mng h3{margin:0 0 6px;font-size:21px;color:#12355b}.mng p{margin:0 0 16px;font-size:14px;color:#5b6b7c;line-height:1.5}" +
    ".mng__g{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;border:1px solid #d6dde6;border-radius:12px;background:#fff;font-weight:700;font-size:15px;cursor:pointer;color:#1b2a3a}" +
    ".mng__g:hover{background:#f5f8fb}.mng__or{text-align:center;font-size:12.5px;color:#8a97a5;margin:14px 0 10px}" +
    ".mng__gsi{display:flex;justify-content:center;min-height:44px}.mng__orb{display:block;width:100%;background:none;border:0;cursor:pointer;text-decoration:underline}.mng form[hidden]{display:none}" +
    ".mng input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d6dde6;border-radius:10px;margin-bottom:8px;font-size:15px}" +
    ".mng__go{width:100%;padding:13px;border:0;border-radius:12px;background:#e9b949;color:#12355b;font-weight:800;font-size:15px;cursor:pointer}" +
    ".mng__later{display:block;margin:12px auto 0;background:none;border:0;color:#7a8796;font-size:13px;text-decoration:underline;cursor:pointer}" +
    ".mng__note{font-size:11.5px!important;color:#8a97a5!important;margin:12px 0 0!important}.mng__err{color:#c8553d;font-size:13px;min-height:16px}" +
    ".mng-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#12355b;color:#fff;padding:12px 18px;border-radius:12px;z-index:10001;font-weight:600}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  function toast(t) { var d = document.createElement("div"); d.className = "mng-toast"; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  var G = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  function gate(after) {
    if (document.querySelector(".mng")) return;
    var w = document.createElement("div"); w.className = "mng"; w.setAttribute("data-mng", "1"); w.dir = LANG === "ar" ? "rtl" : "ltr";
    w.innerHTML = '<div class="mng__box" role="dialog" aria-modal="true"><h3>' + T[0] + '</h3><p>' + T[1] + '</p>' +
      (GOOGLE_ON ? '<div class="mng__gsi" id="mng-gsi"><button type="button" class="mng__g" id="mng-g">' + G + T[2] + '</button></div><button type="button" class="mng__or mng__orb" id="mng-or">' + T[3] + '</button>' : '') +
      '<form id="mng-f"' + (GOOGLE_ON ? ' hidden' : '') + '><input name="email" type="email" required autocomplete="email" placeholder="' + T[5] + '"><div class="mng__err" id="mng-e"></div><button class="mng__go" type="submit">' + T[7] + '</button></form>' +
      '<button type="button" class="mng__later" id="mng-l">' + T[8] + '</button><p class="mng__note">' + T[9] + '</p></div>';
    document.body.appendChild(w);
    function close(ok) { w.remove(); if (ok) toast(T[11]); if (after) setTimeout(after, 30); }
    var gb = w.querySelector("#mng-g"), box = w.querySelector("#mng-gsi");
    var gdone = function (err) { if (err) { w.querySelector("#mng-e").textContent = T[12]; w.querySelector("#mng-f").hidden = false; return; } put("mn_cust", "1"); if (window.MN_GSI) window.MN_GSI.cancel(); close(true); };
    var useGsi = function () {   // Google's own button ("Continue as …" with the visitor's Gmail) + the account list (One Tap)
      if (!window.MN_GSI || !box) return false;
      window.MN_GSI.button(box, gdone).catch(function () {}); window.MN_GSI.prompt(gdone).catch(function () {});
      return true;
    };
    if (gb) {
      gb.onclick = function () { track("signin_start", "google"); if (!useGsi()) { put("mn_gate_google", "1", SS); location.href = SB.url + "/auth/v1/authorize?provider=google&redirect_to=" + encodeURIComponent(location.href.split("#")[0]); } };
      if (!useGsi()) { var tries = 0, iv = setInterval(function () { if (useGsi() || ++tries > 20) clearInterval(iv); }, 250); }
    }
    var orb = w.querySelector("#mng-or"); if (orb) orb.onclick = function () { w.querySelector("#mng-f").hidden = false; orb.hidden = true; w.querySelector("#mng-f input").focus(); };
    w.querySelector("#mng-l").onclick = function () { put("mn_gate_skip", "1", SS); track("signin_later", ""); close(false); };
    w.querySelector("#mng-f").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = f.email.value.replace(/\s+/g, "").toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { w.querySelector("#mng-e").textContent = T[10]; return; }
      rpc("register_customer", { vid: vid, provider: "email", email: em, lang: LANG, page: page })
        .then(function () { put("mn_cust", "1"); close(true); })
        .catch(function () { w.querySelector("#mng-e").textContent = T[10]; });
    };
  }
  window.MN_GATE = gate;
  (function () {   /* extra small scripts on public pages; bump ?v= when the file changes (browser cache) */
    if (/\/(admin|agent|partner)\//.test(location.pathname)) return;
    var me = document.querySelector('script[src*="visitor.js"]'); if (!me) return;
    ["cabdot.js?v=1", "fx.js?v=1"]   /* subscribe card removed 26.11.2026: the e-mail from the first sign-in already goes to the customer base */.forEach(function (f) { var sc = document.createElement("script"); sc.src = me.src.replace(/visitor\.js.*$/, f); sc.defer = true; document.body.appendChild(sc); });
  })();

  // ---------------------------------------------------------------- what counts as an "action"
  function freeEl(el) {
    return el.closest(".mng,.lang,.burger,.nav,[data-free],.modal__close,[aria-label='Close'],.wx,.slides__dots,.hero__dots") ||
      (el.tagName === "A" && /^#/.test(el.getAttribute("href") || ""));
  }
  function label(el) {
    var h = el.getAttribute && el.getAttribute("href") || "";
    var hd = el.querySelector && el.querySelector("h2,h3,h4,.tour__title,.card__title");
    var t = (el.getAttribute("aria-label") || (hd && hd.textContent) || el.textContent || el.value || "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (/wa\.me|whatsapp/i.test(h)) return ["contact", "WhatsApp"];
    if (/t\.me|telegram/i.test(h)) return ["contact", "Telegram"];
    if (/^mailto:/i.test(h)) return ["contact", "E-mail"];
    if (/instagram/i.test(h)) return ["contact", "Instagram"];
    return ["click", t + (h && !/^#/.test(h) ? " → " + h.slice(0, 120) : "")];
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a,button,[role=button],input[type=submit],summary,.tour,.card,[data-tour]");
    if (!el || freeEl(el)) return;
    if (el.closest("form") && (el.type === "submit" || (el.tagName === "BUTTON" && !el.getAttribute("type")))) return;   // the submit handler decides
    if (el.__mnPass) return;
    var l = label(el); track(l[0], l[1]);
    if (known() || skipped()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    gate(function () { el.__mnPass = true; try { el.click(); } finally { setTimeout(function () { el.__mnPass = false; }, 0); } });
  }, true);
  // forms on the site (request, booking, story): the e-mail typed there joins the customer base automatically
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f || f.closest(".mng,[data-noreg]") || f.__mnPass) return;
    var fe = f.querySelector("input[type=email],input[name*=mail]"), em = fe ? fe.value.replace(/\s+/g, "").toLowerCase() : "";
    var what = (f.getAttribute("data-kind") || f.id || "form") + (f.querySelector("[name=tour_title],[name=tour]") ? ": " + (f.querySelector("[name=tour_title],[name=tour]").value || "") : "");
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      var nm = f.querySelector("[name*=name]"), ph = f.querySelector("input[type=tel],[name*=phone],[name*=whatsapp]");
      rpc("register_customer", { vid: vid, provider: "email", email: em, name: nm ? nm.value.trim() : "", phone: ph ? ph.value.trim() : "", lang: LANG, page: page })
        .then(function () { put("mn_cust", "1"); track("request", what); }).catch(function () { track("request", what); });
      return;
    }
    track("request", what);
    if (known() || skipped()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    gate(function () { f.__mnPass = true; if (f.requestSubmit) f.requestSubmit(); else f.submit(); setTimeout(function () { f.__mnPass = false; }, 0); });
  }, true);
})();
