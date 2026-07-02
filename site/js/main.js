/* =====================================================================
   EARTH MADE — interaction layer (minimalist)
   ===================================================================== */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
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

  /* ---------- Mobile menu (with focus management) ---------- */
  const burger = $('#burger'), menu = $('#menu'), main = $('#top');
  const menuLinks = $$('.menu__links a');
  function toggleMenu(open){
    const willOpen = open ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', willOpen);
    nav.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    menu.setAttribute('aria-hidden', String(!willOpen));
    document.body.style.overflow = willOpen ? 'hidden' : '';
    if (main) main.toggleAttribute('inert', willOpen);
    if (willOpen) setTimeout(() => menuLinks[0]?.focus(), 60);
    else burger.focus();
  }
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

  /* ---------- Stat counters ---------- */
  const stats = $$('.stat__num[data-count]');
  if (stats.length){
    const sio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        if (reduced){ el.textContent = target; obs.unobserve(el); return; }
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

  /* ---------- Lightbox (unified .js-lb) ---------- */
  const tiles = $$('.js-lb');
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const items = tiles.map(t => ({
    full: t.dataset.full,
    cap:  t.dataset.cap || t.closest('figure')?.querySelector('figcaption')?.textContent || t.alt || '',
  }));
  let idx = 0, lastFocus = null;
  function openLb(i){
    lastFocus = document.activeElement;
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].full; lbImg.alt = items[idx].cap;
    lbCap.textContent = items[idx].cap;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose')?.focus();
  }
  function closeLb(){
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }
  tiles.forEach((t, i) => t.addEventListener('click', () => openLb(i)));
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

  /* ---------- Lazy imagery emerges from the dark ---------- */
  document.body.classList.add('lazyfade');
  $$('img[loading="lazy"]').forEach(img => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  /* ---------- Inquiry form ---------- */
  const form = $('#inquireForm'), status = $('#formStatus');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk){
      status.textContent = !name ? 'Please share your name.' : 'Please enter a valid email.';
      status.style.color = '#b07d3a';
      return;
    }
    status.style.color = '';
    status.textContent = 'Thank you — the atelier will be in touch within two days.';
    form.reset();
  });
})();
