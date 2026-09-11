/* Portfolio interactions: nav, scroll reveal, project filter, contact form. */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- current year ---- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- sticky nav shadow ---- */
  var nav = $('#nav');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile menu ---- */
  var burger = $('#burger');
  var links = $('#nav-links');
  var setMenu = function (open) {
    links.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', function () {
    setMenu(!links.classList.contains('open'));
  });
  $$('#nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---- scroll reveal ---- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('in'); }, Math.min(i * 60, 240));
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- active nav link on scroll ---- */
  var sections = $$('main section[id]');
  var navAnchors = $$('#nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- project filter ---- */
  var chips = $$('.chip');
  var projects = $$('#work-grid .proj');
  var emptyMsg = $('#work-empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      var shown = 0;
      projects.forEach(function (p) {
        var tags = (p.dataset.tags || '').split(/\s+/);
        var match = filter === 'all' || tags.indexOf(filter) !== -1;
        p.hidden = !match;
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---- contact form (Formspree AJAX, no page redirect) ---- */
  var form = $('#contact-form');
  var status = $('#form-status');
  var submitBtn = $('#submit-btn');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        e.preventDefault();
        say('Form not connected yet — add your Formspree endpoint in index.html.', 'err');
        return;
      }
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        say('Thanks — message received. I will reply within one business day.', 'ok');
      }).catch(function () {
        say('Something went wrong. Please email me directly instead.', 'err');
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      });
    });
  }

  function say(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-note ' + kind;
  }
})();
