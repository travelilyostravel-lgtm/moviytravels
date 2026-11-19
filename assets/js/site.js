(function () {
  var cfg = window.MN || {};
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var nav = document.querySelector('.nav');
  document.querySelector('.burger').addEventListener('click', function () { nav.classList.toggle('is-open'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('is-open'); });

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
