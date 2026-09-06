/* Haraka client script: theme, currency, menu, live invoice, threshold checker, checkout, reveal. */
(function () {
  'use strict';
  var html = document.documentElement;
  var lang = html.lang || 'en';
  var cfg = {};
  try { cfg = JSON.parse(document.getElementById('haraka-cfg').textContent); } catch (e) {}
  html.classList.remove('no-js');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* Theme */
  var themeBtn = $('.theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = html.getAttribute('data-theme') === 'dark' ||
      (!html.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    html.setAttribute('data-theme', next); store('haraka-theme', next);
  });

  /* Menu */
  var menuBtn = $('.menu-btn'), links = $('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });
  }

  /* Number formatting: Western digits everywhere, grouping by locale */
  var nf2 = new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nf0 = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
  function money(n) { return nf2.format(n); }

  /* Currency */
  var cur = store('haraka-cur') || (lang === 'ar' ? 'aed' : 'usd');
  function applyCur() {
    html.setAttribute('data-cur', cur);
    $$('[data-usd]').forEach(function (el) {
      var usd = +el.getAttribute('data-usd'), aed = +el.getAttribute('data-aed');
      var text = cur === 'aed'
        ? (lang === 'ar' ? nf0.format(aed) + ' د.إ' : 'AED ' + nf0.format(aed))
        : '$' + nf0.format(usd);
      el.textContent = text;
    });
    $$('.cur-toggle button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cur') === cur ? 'true' : 'false'); });
  }
  $$('.cur-toggle button').forEach(function (b) {
    b.addEventListener('click', function () { cur = b.getAttribute('data-cur'); store('haraka-cur', cur); applyCur(); });
  });
  applyCur();

  /* Live invoice */
  var inv = $('#inv');
  if (inv) {
    var rows = $$('tr[data-line]', inv);
    var sub = $('#inv-sub'), vat = $('#inv-vat'), tot = $('#inv-total');
    function calc() {
      var s = 0;
      rows.forEach(function (r) {
        var q = parseFloat($('.qty', r).value) || 0, rate = parseFloat($('.rate', r).value) || 0;
        var a = q * rate; s += a;
        $('.amt', r).textContent = money(a);
        $('.vat', r).textContent = money(a * 0.05);
      });
      sub.textContent = money(s); vat.textContent = money(s * 0.05); tot.textContent = money(s * 1.05);
    }
    inv.addEventListener('input', calc);
    calc();
  }

  /* Threshold checker */
  var chk = $('#check');
  if (chk) {
    var rev = $('#c-rev'), prof = $('#c-prof');
    var t = cfg.check || {};
    function fmtAed(n) { return lang === 'ar' ? nf0.format(n) + ' د.إ' : 'AED ' + nf0.format(n); }
    function run() {
      var r = parseFloat(String(rev.value).replace(/[^\d.]/g, '')) || 0;
      var p = parseFloat(String(prof.value).replace(/[^\d.]/g, '')) || 0;
      var vs = $('#c-vat-status');
      if (r >= 375000) { vs.textContent = t.vatMandatory; vs.className = 'status warn'; }
      else if (r >= 187500) { vs.textContent = t.vatVoluntary; vs.className = 'status ok'; }
      else { vs.textContent = t.vatBelow; vs.className = 'status ok'; }
      var taxable = Math.max(0, p - 375000), tax = taxable * 0.09;
      var cs = $('#c-ct-status');
      if (r < 3000000 && r > 0) { cs.textContent = t.ctRelief; cs.className = 'status ok'; }
      else { cs.textContent = t.ctBand; cs.className = 'status'; }
      $('#c-taxable').textContent = fmtAed(taxable);
      $('#c-payable').textContent = fmtAed(tax);
    }
    chk.addEventListener('input', run);
    run();
  }

  /* Checkout */
  var dlg = $('#notify');
  function openCheckout(url) {
    if (url) {
      if (window.LemonSqueezy && window.LemonSqueezy.Url && cfg.lemonOverlay) { window.LemonSqueezy.Url.Open(url); }
      else { window.open(url, '_blank', 'noopener'); }
      return;
    }
    if (dlg && typeof dlg.showModal === 'function') { dlg.showModal(); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-checkout]');
    if (!b) return;
    e.preventDefault();
    openCheckout(b.getAttribute('data-checkout'));
  });
  if (dlg) {
    $('.dlg-close', dlg).addEventListener('click', function () { dlg.close(); });
    $('form', dlg).addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('input[type=email]', dlg).value.trim();
      var subj = encodeURIComponent(cfg.mailSubject || 'Haraka launch');
      var body = encodeURIComponent((cfg.mailBody || 'Notify me at: ') + email + '\n\n' + location.href);
      location.href = 'mailto:' + (cfg.supportEmail || '') + '?subject=' + subj + '&body=' + body;
      dlg.close();
    });
  }

  /* Reveal on scroll */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }
})();
