(function () {
  var cfg = window.MN || {};
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40 || document.body.classList.contains('subpage')); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var nav = document.querySelector('.nav');
  // phones: the menu opens right under the header (whatever is above it) and scrolls if it is long
  document.querySelector('.burger').addEventListener('click', function () {
    var hd = document.querySelector('.header'), b = hd ? hd.getBoundingClientRect().bottom : 78;
    document.documentElement.style.setProperty('--nav-top', Math.max(0, Math.round(b)) + 'px');
    nav.classList.toggle('is-open');
    document.body.classList.toggle('nav-open', nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a[href]') && !e.target.closest('.dd > a, [data-dd]')) document.body.classList.remove('nav-open'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('is-open'); });
  [].forEach.call(nav.querySelectorAll('.nav__ddb'), function (b) { b.addEventListener('click', function () { if (window.innerWidth <= 860) b.parentNode.classList.toggle('is-open'); }); });

  // Desktop: if the menu does not fit next to the logo (long words in some languages), shrink it, then move
  // the last plain links into the "More" dropdown — never let it overlap the logo or the buttons (2026-11-28)
  (function fitNav() {
    var logo = document.querySelector('.logo'), right = document.querySelector('.header__right');
    if (!logo || !right || !nav) return;
    var moreDd = nav.querySelectorAll('.nav__dd'), more = moreDd.length ? moreDd[moreDd.length - 1].querySelector('.nav__ddm') : null, moved = [];
    function over() {
      var a = logo.getBoundingClientRect(), r = right.getBoundingClientRect(), L = 1e9, R = -1e9;
      [].forEach.call(nav.children, function (c) { if (c.offsetParent === null) return; var b = c.getBoundingClientRect(); if (b.width) { L = Math.min(L, b.left); R = Math.max(R, b.right); } });
      return L < a.right + 8 || R > r.left - 8 || nav.scrollWidth > nav.clientWidth + 2;
    }
    function run() {
      nav.classList.remove('nav--s1', 'nav--s2');
      moved.forEach(function (m) { m.a.classList.remove('nav__moved'); m.p.insertBefore(m.a, m.n); }); moved = [];
      if (window.innerWidth <= 1024) return;
      if (over()) nav.classList.add('nav--s1');
      if (over()) nav.classList.add('nav--s2');
      var plain = [].filter.call(nav.children, function (el) { return el.tagName === 'A' && !el.classList.contains('nav__m') && !el.classList.contains('nav__home'); });
      while (more && over() && plain.length > 2) { var a = plain.pop(); moved.push({ a: a, p: a.parentNode, n: a.nextSibling }); a.classList.add('nav__moved'); more.insertBefore(a, more.firstChild); }
    }
    var t; run(); window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(run, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    window.addEventListener('load', run);
    // the right-hand buttons (cabinet, currency) are added by other scripts after this runs — re-fit when they change size
    if (window.ResizeObserver) { var lw = 0; new ResizeObserver(function () { var w = Math.round(right.getBoundingClientRect().width); if (w !== lw) { lw = w; clearTimeout(t); t = setTimeout(run, 60); } }).observe(right); }
  })();

  // Language menu
  var lang = document.querySelector('.lang');
  lang.querySelector('.lang__btn').addEventListener('click', function (e) { e.stopPropagation(); lang.classList.toggle('is-open'); });
  document.addEventListener('click', function () { lang.classList.remove('is-open'); });

  // Country tabs
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      document.querySelectorAll('.country').forEach(function (c) { c.classList.toggle('is-active', c.id === t.getAttribute('aria-controls')); });
    });
  });

  // Ready tours: country tabs
  var ttabs = document.querySelectorAll('.ttab');
  ttabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var c = t.getAttribute('data-tc');
      ttabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      document.querySelectorAll('.tgrid').forEach(function (g) {
        var on = g.getAttribute('data-tc-panel') === c; g.classList.toggle('is-active', on);
        if (on) g.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
      });
    });
  });

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }

  // Contact chooser: WhatsApp / Telegram / Instagram
  var modal = document.getElementById('contact');
  if (!modal) return;
  var tourLabel = modal.querySelector('.modal__tour');
  var waLink = modal.querySelector('.opt--wa');
  function waUrl(tour) {
    var msg = tour ? cfg.msgTour.replace('{tour}', tour) : cfg.msgGeneral;
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
  }
  function openModal(tour) {
    tourLabel.textContent = tour || '';
    waLink.href = waUrl(tour);
    modal.classList.add('is-open');
    modal.querySelector('.opt').focus();
  }
  function closeModal() { modal.classList.remove('is-open'); }
  document.querySelectorAll('[data-contact]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openModal(b.getAttribute('data-tour') || ''); });
  });
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.modal__close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  // Direct WhatsApp buttons get the localized message too
  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waUrl(a.getAttribute('data-tour') || ''); });
})();
