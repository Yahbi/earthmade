/* =====================================================================
   ATELIER EARTHMADE — interaction layer (minimalist)
   ===================================================================== */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Scripts are running: release the copy that the reveal styles hold at opacity:0.
  document.documentElement.classList.remove('no-js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal the hero at once (no artificial loader)
  const ready = () => document.body.classList.add('ready');
  if (document.readyState !== 'loading') ready();
  else document.addEventListener('DOMContentLoaded', ready);

  /* ---------- Year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Nav state (solid + hide on scroll down) ---------- */
  const nav = $('#nav');
  let lastY = 0;
  function onScroll(){
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (y > innerHeight * 0.9){
      nav.classList.toggle('is-hidden', y > lastY && y - lastY > 4);
    } else { nav.classList.remove('is-hidden'); }
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Background inert ----------
     The header and the footer live OUTSIDE <main id="top">, so inerting #top
     alone left the six nav links, the burger and the twenty-three footer links
     exposed behind every overlay: reachable by a screen reader's virtual cursor
     and, for the mobile menu (which has no Tab trap), reachable by Tab as well.
     `keepNav` is true for the mobile menu only — its close control IS the burger,
     which is painted above the overlay on purpose. */
  const footer = $('footer');
  function setBackgroundInert(on, keepNav = false){
    $('#top')?.toggleAttribute('inert', on);
    footer?.toggleAttribute('inert', on);
    nav?.toggleAttribute('inert', on && !keepNav);
  }

  /* ---------- Mobile menu (with focus management) ---------- */
  const burger = $('#burger'), menu = $('#menu');
  const menuLinks = $$('.menu__links a');
  function toggleMenu(open){
    const willOpen = open ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', willOpen);
    nav.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    burger.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
    burger.setAttribute('aria-controls', 'menu');
    menu.setAttribute('aria-hidden', String(!willOpen));
    // The closed menu is visibility:hidden in CSS; inert is the belt-and-braces
    // guarantee that its seven links leave the tab order.
    menu.toggleAttribute('inert', !willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
    // Nav stays live: the burger doubles as the menu's close control.
    setBackgroundInert(willOpen, true);
    if (willOpen) setTimeout(() => menuLinks[0]?.focus(), 60);
    else burger.focus();
  }
  // The menu starts closed, so start it inert — toggleMenu only runs on interaction.
  menu?.toggleAttribute('inert', true);
  burger?.addEventListener('click', () => toggleMenu());
  menuLinks.forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) toggleMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal-up, .reveal-img, .reveal-stagger').forEach(el => io.observe(el));

  /* ---------- Cinematic settle: play once when a full-bleed layer reveals ---------- */
  if (!reduced){
    const settlers = $$('.interlude, .candela, .inquire');
    if (settlers.length){
      const kb = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){ e.target.classList.add('kb'); kb.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      settlers.forEach(s => kb.observe(s));
    }
  }

  /* ---------- Stat counters ---------- */
  const stats = $$('.stat__num[data-count]');
  if (stats.length){
    const sio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        if (reduced || target <= 1){ el.textContent = target; obs.unobserve(el); return; }
        const dur = 1200, t0 = performance.now();
        (function step(now){
          const k = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round((1 - Math.pow(1 - k, 3)) * target);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    stats.forEach(s => sio.observe(s));
  }

  /* ---------- Hero film ----------
     Deferred on purpose: the poster image is the LCP element, so the film is
     only fetched after load, only on a connection that can carry it, and only
     if the visitor has not asked for reduced motion. */
  (() => {
    const v = $('#heroVideo');
    if (!v) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;
    const start = () => {
      // Pick by the pixel width actually being painted, not by CSS width alone —
      // a 1440-wide retina laptop paints 2880 and deserves the 4K file, while a
      // 1280 phone at dpr 3 does not (it would burn 5 MB to fill 720 CSS px).
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const painted = innerWidth * dpr;
      const slow = conn && /3g/.test(conn.effectiveType || '');
      // The 1440 file is 2560 px wide, so painted === 2560 is an exact match and
      // must NOT reach for the 3840 file — that is the common 1280@2x / 2560@1x
      // laptop, and it would spend 4.3 MB where 2.3 MB is already pixel-perfect.
      const src = (innerWidth < 700 || slow) ? 'assets/video/hero-canyon-720.mp4'
                : painted > 2560          ? 'assets/video/hero-canyon-2160.mp4'
                                          : 'assets/video/hero-canyon-1440.mp4';
      v.src = src;
      v.play().then(() => v.classList.add('is-playing')).catch(() => {});
    };
    if (document.readyState === 'complete') setTimeout(start, 600);
    else addEventListener('load', () => setTimeout(start, 600));
  })();

  /* ---------- Lightbox (unified .js-lb) ---------- */
  const tiles = $$('.js-lb');
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const items = tiles.map(t => ({
    full: t.dataset.full,
    cap:  t.dataset.cap || t.closest('figure')?.querySelector('figcaption')?.textContent || t.alt || '',
  }));
  let idx = 0, lastFocus = null;
  function openLb(i){
    // Only capture the trigger on the FIRST open. Arrow keys and the prev/next
    // buttons re-enter openLb while the dialog is up, and were overwriting
    // lastFocus with #lbClose — so closing returned focus to a hidden button
    // instead of the thumbnail the visitor came from.
    if (!lb.classList.contains('is-open')) lastFocus = document.activeElement;
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].full; lbImg.alt = items[idx].cap;
    lbCap.textContent = items[idx].cap;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    lb.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    // Focus only once the dialog is actually visible — focusing a
    // visibility:hidden element is a no-op and strands the keyboard user.
    requestAnimationFrame(() => $('#lbClose')?.focus());
  }
  function closeLb(){
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    lb.removeAttribute('aria-modal');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    lastFocus?.focus?.();
  }
  // Each tile is a real control: focusable, announced, and operable by keyboard
  tiles.forEach((t, i) => {
    t.addEventListener('click', () => openLb(i));
    t.setAttribute('tabindex', '0');
    t.setAttribute('role', 'button');
    if (!t.hasAttribute('aria-label')){
      t.setAttribute('aria-label', `View larger: ${items[i].cap || t.alt || 'image'}`);
    }
    t.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLb(i); }
    });
  });
  // Keep Tab inside the dialog while it is open
  lb?.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !lb.classList.contains('is-open')) return;
    const f = [...lb.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  $('#lbClose')?.addEventListener('click', closeLb);
  $('#lbPrev')?.addEventListener('click', () => openLb(idx - 1));
  $('#lbNext')?.addEventListener('click', () => openLb(idx + 1));
  lb?.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') openLb(idx + 1);
    if (e.key === 'ArrowLeft') openLb(idx - 1);
  });

  /* ---------- Inquiry form ---------- */
  const form = $('#inquireForm'), status = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk){
      status.textContent = !name ? 'Please share your name.' : 'Please enter a valid email.';
      status.classList.add('is-error');
      return;
    }
    // Deliver the enquiry via the form endpoint. No address appears in this file.
    const ENDPOINT = window.EARTHMADE_FORM_ENDPOINT || '';
    const piece = $('#material')?.value?.trim();
    const city = $('#location')?.value?.trim();
    const msg = $('#message')?.value?.trim();
    status.textContent = 'Sending…';
    try {
      if (!ENDPOINT) throw new Error('no endpoint');
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Atelier Earthmade — Private enquiry${piece ? ': ' + piece : ''}`,
                               name, email, city, piece, message: msg }),
      });
      if (!res.ok) throw new Error('network');
    } catch (err) {
      status.classList.add('is-error');
      status.textContent = 'We could not send that just now — please try again in a moment.';
      return;
    }
    status.classList.remove('is-error');
    status.textContent = 'Thank you — your enquiry has reached the atelier. We reply within two working days.';
    form.reset();
  });
})();
