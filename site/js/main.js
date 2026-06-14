/* =====================================================================
   EARTH MADE — interaction layer
   ===================================================================== */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  const lLine  = $('.loader__line i');
  const lCount = $('#loaderCount');
  function startSite(){
    document.body.classList.add('ready');
    loader && loader.classList.add('is-done');
  }
  function runLoader(){
    if (reduced || !loader){ startSite(); return; }
    let p = 0;
    const tick = setInterval(() => {
      p += Math.max(1, Math.round((100 - p) * 0.08));
      if (p >= 100){ p = 100; clearInterval(tick); }
      if (lCount) lCount.textContent = String(p).padStart(2, '0');
      if (lLine)  lLine.style.transform = `scaleX(${p / 100})`;
      if (p === 100) setTimeout(startSite, 320);
    }, 90);
  }
  window.addEventListener('load', runLoader);
  // Safety: never trap the user behind the loader
  setTimeout(() => { if (loader && !loader.classList.contains('is-done')) startSite(); }, 4000);

  /* ---------- Year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Custom cursor ---------- */
  if (fine){
    const cursor = $('.cursor');
    document.body.classList.add('cursor-ready');
    let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
    addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY;
      const d = cursor.querySelector('.cursor__dot');
      d.style.left = cx + 'px'; d.style.top = cy + 'px';
    });
    const ring = cursor.querySelector('.cursor__ring');
    (function loop(){
      rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    const hoverOn  = () => cursor.classList.add('is-hover');
    const hoverOff = () => cursor.classList.remove('is-hover');
    $$('[data-cursor="hover"], a, button').forEach(el => {
      el.addEventListener('mouseenter', hoverOn);
      el.addEventListener('mouseleave', hoverOff);
    });
  }

  /* ---------- Scroll progress + nav state ---------- */
  const nav = $('#nav');
  const prog = $('#scrollProgress');
  let lastY = 0;
  function onScroll(){
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.width = (y / h * 100) + '%';
    nav.classList.toggle('is-solid', y > 40);
    // hide on scroll down, show on scroll up (past hero)
    if (y > innerHeight * 0.9){
      nav.classList.toggle('is-hidden', y > lastY && y - lastY > 4);
    } else { nav.classList.remove('is-hidden'); }
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function toggleMenu(open){
    const willOpen = open ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', willOpen);
    nav.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    menu.setAttribute('aria-hidden', String(!willOpen));
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }
  burger?.addEventListener('click', () => toggleMenu());
  $$('.menu__links a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal-up, .reveal-img, .reveal-stagger').forEach(el => io.observe(el));

  /* ---------- Manifesto word-by-word ---------- */
  const words = $$('.manifesto__body .word');
  if (words.length){
    const mio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        words.forEach((w, i) => setTimeout(() => w.classList.add('lit'), i * 55));
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    mio.observe($('.manifesto__body'));
  }

  /* ---------- Stat counters ---------- */
  const stats = $$('.stat__num[data-count]');
  if (stats.length){
    const sio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        if (reduced){ el.textContent = target; obs.unobserve(el); return; }
        let cur = 0; const dur = 1400, t0 = performance.now();
        (function step(now){
          const k = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(eased * target);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    stats.forEach(s => sio.observe(s));
  }

  /* ---------- Parallax (hero + inquire bg) ---------- */
  const heroImg = $('#heroImg');
  const inqBg   = $('.inquire__bg');
  if (!reduced){
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroImg && y < innerHeight) heroImg.style.transform = `translateY(${y * 0.18}px) scale(1.06)`;
        if (inqBg){
          const r = inqBg.closest('.inquire').getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0){
            inqBg.style.transform = `translateY(${(r.top) * -0.06}px) scale(1.08)`;
          }
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduced){
    $$('.btn--solid, .nav__cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Unified lightbox (collection + spotlight + gallery) ---------- */
  const tiles = $$('.js-lb');
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const items = tiles.map(t => ({
    full: t.dataset.full,
    cap:  t.dataset.cap || t.closest('figure')?.querySelector('figcaption')?.textContent || t.alt || ''
  }));
  let idx = 0;
  function openLb(i){
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].full; lbImg.alt = items[idx].cap;
    lbCap.textContent = items[idx].cap;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){ lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
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

  /* ---------- Inquiry form ---------- */
  const form = $('#inquireForm'), status = $('#formStatus');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk){
      status.textContent = !name ? 'Please share your name.' : 'Please enter a valid email.';
      status.style.color = '#e0a85a';
      return;
    }
    status.style.color = '';
    status.textContent = 'Thank you — the atelier will be in touch within two days.';
    form.reset();
  });
})();
