/* ============================================================
   PORUS CITIZEN SERVICES — script.js
   ============================================================ */
(function () {
  'use strict';

  /* ── Helpers ── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  /* ── Navbar: scroll shadow ── */
  const navbar = $('#navbar');
  function onScroll () {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Hamburger ── */
  const hamburger = $('#nav-hamburger');
  const mobileNav = $('#nav-mobile');

  function setMenu (open) {
    hamburger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () =>
    setMenu(!mobileNav.classList.contains('open')));
  $$('a', mobileNav).forEach(a =>
    a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => {
    if (mobileNav.classList.contains('open') && !navbar.contains(e.target))
      setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open'))
      setMenu(false);
  });

  /* ── Scroll-reveal ── */
  const fadeEls = $$('.fade-up');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Active nav link ── */
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-links a[href^="#"]');

  function markActive () {
    let current = '';
    const offset = 80;
    sections.forEach(s => {
      if (window.scrollY + offset >= s.offsetTop) current = s.id;
    });
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === '#' + current;
      a.classList.toggle('nav-active', active);
      a.style.color      = '';
      a.style.fontWeight = '';
    });
  }

  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

  /* ── Smooth scroll ── */
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });


  /* ============================================================
     EMAIL JS — CONFIGURATION
     ============================================================
     1. Sign up / log in at https://www.emailjs.com
     2. Add an Email Service (Gmail, Outlook, etc.) and copy its ID
        → replace  YOUR_SERVICE_ID  below
     3. Create an Email Template and copy its ID
        → replace  YOUR_TEMPLATE_ID  below
        In the template body you can use these variables:
          {{from_name}}   — sender's name
          {{from_email}}  — sender's email (set as Reply-To)
          {{subject}}     — message subject
          {{message}}     — message body
        ⚠️  Set the "To Email" field in the template dashboard to:
              info@poruscitizen.com
     4. Go to Account → General → Public Key and copy it
        → replace  YOUR_PUBLIC_KEY  below
     ============================================================ */
  var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← paste your Public Key here
  var EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← paste your Service ID here
  var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← paste your Template ID here


  /* ── Dynamically load the EmailJS SDK (no HTML change needed) ── */
  function loadEmailJS (callback) {
    if (window.emailjs) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function () {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      callback();
    };
    script.onerror = function () {
      console.error('EmailJS SDK failed to load.');
    };
    document.head.appendChild(script);
  }

  loadEmailJS(function () { /* SDK ready */ });


  /* ── Contact form ── */
  var form    = $('#contact-form');
  var btn     = $('#form-submit');
  var success = $('#form-success');

  /* Inject a reusable error banner just below the form */
  var errorBanner = document.createElement('div');
  errorBanner.id        = 'form-error';
  errorBanner.className = 'form-error-banner';
  errorBanner.setAttribute('role', 'alert');
  errorBanner.setAttribute('aria-live', 'assertive');
  errorBanner.style.display = 'none';
  if (form) form.parentNode.insertBefore(errorBanner, form.nextSibling);

  function showError (msg) {
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
  }
  function hideError () {
    errorBanner.style.display = 'none';
    errorBanner.textContent   = '';
  }

  function setFieldErr (el, msg) {
    el.classList.add('error');
    var sp = el.parentElement.querySelector('.field-error');
    if (sp) { sp.textContent = msg; sp.classList.add('show'); }
  }
  function clrFieldErr (el) {
    el.classList.remove('error');
    var sp = el.parentElement.querySelector('.field-error');
    if (sp) sp.classList.remove('show');
  }

  function resetBtn () {
    btn.disabled    = false;
    btn.textContent = 'Send Message';
  }

  if (form) {
    /* Clear individual field errors on user input */
    $$('input,textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { clrFieldErr(el); hideError(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError();

      var n  = $('#f-name');
      var em = $('#f-email');
      var s  = $('#f-subject');
      var m  = $('#f-message');
      var valid = true;

      /* Field validation */
      if (!n.value.trim())  { setFieldErr(n,  'Name is required.');           valid = false; } else clrFieldErr(n);
      if (!em.value.trim()) { setFieldErr(em, 'Email is required.');          valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()))
                            { setFieldErr(em, 'Enter a valid email address.'); valid = false; }
      else clrFieldErr(em);
      if (!s.value.trim())  { setFieldErr(s,  'Subject is required.');        valid = false; } else clrFieldErr(s);
      if (!m.value.trim())  { setFieldErr(m,  'Message is required.');        valid = false; } else clrFieldErr(m);

      if (!valid) return;

      /* Guard: SDK not yet loaded */
      if (!window.emailjs) {
        showError('Email service is not ready yet. Please try again in a moment.');
        return;
      }

      btn.disabled    = true;
      btn.textContent = 'Sending…';

      /*
        Template variables sent to EmailJS.
        These names must match the variables you used inside your
        EmailJS template (e.g. {{from_name}}, {{from_email}}, etc.).
        The destination address is set on the template in the dashboard.
        ⚠️  Make sure the "To Email" in the template is: info@poruscitizen.com
      */
      var templateParams = {
        from_name:  n.value.trim(),
        from_email: em.value.trim(),
        subject:    s.value.trim(),
        message:    m.value.trim()
      };

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          /* SUCCESS — hide form, show confirmation, clear fields */
          form.style.display = 'none';
          success.classList.add('show');
          form.reset();
          /* Re-enable button in case user navigates back */
          resetBtn();
        })
        .catch(function (err) {
          /* FAILURE — show banner error, re-enable button */
          console.error('EmailJS send error:', err);
          showError(
            'Sorry, we couldn\'t send your message. Please try again or email us directly at info@poruscitizen.com.'
          );
          resetBtn();
        });
    });
  }

})();
