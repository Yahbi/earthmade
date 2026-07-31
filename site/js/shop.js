/* =====================================================================
   EARTH MADE — Acquire / checkout layer
   ---------------------------------------------------------------------
   Two modes, auto-selected:
   1) SHOPIFY  — if a Shopify domain + Storefront token + product ids are
      set below, "Acquire" sends the buyer straight to Shopify's secure
      hosted checkout (Shopify takes payment and emails you the order).
   2) RESERVE  — until Shopify is wired, "Acquire" opens a reservation
      panel. On submit it POSTs to formEndpoint (a Formspree/Basin form
      pointed at your private inbox) so you are notified of every order,
      then you send a payment link. No address is stored in this file.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);

  const SHOP_CONFIG = {
    // --- Fill these to switch on real Shopify checkout ----------------
    shopifyDomain: '',            // e.g. 'earth-made.myshopify.com'
    storefrontAccessToken: '',    // Storefront API access token
    // Map each SKU to its Shopify *variant* id (number or gid):
    variants: {
      'EM-001': '', 'EM-002': '', 'EM-003': '', 'EM-004': '', 'EM-006': '',
      'EM-007': '', 'EM-008': '', 'EM-009': '', 'EM-010': '', 'EM-011': '', 'EM-012': '',
    },
    // --- Reservation fallback ----------------------------------------
    // Create a free form at https://formspree.io (or Basin) pointed at your private inbox
    // and paste its endpoint here. Your address is NEVER written into this file.
    formEndpoint: 'https://formspree.io/f/mvzeneok',
    // Orders are delivered by the form endpoint above. No address is exposed in this file.
  };

  const fmt = n => '$' + Number(n).toLocaleString('en-US');

  /* ---------- Shopify direct checkout ---------- */
  function shopifyReady(sku){
    return SHOP_CONFIG.shopifyDomain && SHOP_CONFIG.storefrontAccessToken && SHOP_CONFIG.variants[sku];
  }
  function goToShopify(sku){
    // Permalink checkout: /cart/{variantId}:{qty}  → Shopify hosted checkout
    const v = String(SHOP_CONFIG.variants[sku]).replace(/^gid.*\//, '');
    window.location.href = `https://${SHOP_CONFIG.shopifyDomain}/cart/${v}:1`;
  }

  /* ---------- Reservation modal ---------- */
  const modal = $('#checkout');
  const f = {
    title: $('#coTitle'), mat: $('#coMat'), price: $('#coPrice'), freight: $('#coFreight'),
    sku: $('#coSku'), item: $('#coItem'), form: $('#coForm'),
    status: $('#coStatus'), submit: $('#coSubmit'), img: $('#coImg'),
  };
  let active = null;

  let lastFocus = null;
  const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';
  const main = document.querySelector('#top');

  function openModal(d){
    active = d;
    lastFocus = document.activeElement;
    if (f.img){ if (d.img){ f.img.src = d.img; f.img.alt = d.piece; f.img.style.display = 'block'; } else { f.img.style.display = 'none'; } }
    f.title.textContent = d.piece;
    f.mat.textContent = d.material;
    f.price.textContent = (d.price && !Number.isNaN(d.price)) ? fmt(d.price) : 'Price on request';
    if (f.freight) f.freight.textContent =
      'This price includes freight, crating, full transit insurance and all import duty and customs charges. We are the importer of record — nothing further is payable on delivery. Where we are registered to collect it, state sales tax is shown at checkout.';
    f.sku.value = d.sku;
    f.item.value = `${d.piece} — ${d.material}`;
    f.status.textContent = '';
    f.submit.querySelector('span').textContent = 'Reserve this piece';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    main?.setAttribute('inert', '');
    setTimeout(() => $('#coName')?.focus(), 360);
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    main?.removeAttribute('inert');
    lastFocus?.focus?.();
  }
  // Focus trap while the reservation modal is open
  modal?.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    const items = [...modal.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  // Wire Acquire buttons
  document.querySelectorAll('.piece__buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = {
        img: btn.dataset.img,
        sku: btn.dataset.sku,
        piece: btn.dataset.piece,
        material: btn.dataset.material,
        price: +btn.dataset.price,
        freight: +btn.dataset.freight || 0,
        label: btn.querySelector('span').textContent.trim(),
      };
      if (shopifyReady(d.sku)) goToShopify(d.sku);
      else openModal(d);
    });
  });

  $('#coClose')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  /* ---------- Submit a reservation ---------- */
  f.form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#coName').value.trim();
    const email = $('#coEmail').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const accepted = $('#coAccept')?.checked;
    if (!name || !emailOk || !accepted){
      f.status.style.color = '#8a6528';
      f.status.textContent = !name ? 'Please share your name.'
        : !emailOk ? 'Please enter a valid email.'
        : 'Please confirm you accept the terms of sale.';
      return;
    }
    f.status.style.color = '';
    f.status.textContent = 'Sending…';
    f.submit.disabled = true;

    const payload = {
      _subject: `Earth Made — Reservation: ${active.piece} (${fmt(active.price)})`,
      sku: active.sku,
      item: f.item.value,
      price_usd: active.price,
      indicative_freight_usd: active.freight || 'TBD',
      name, email,
      phone: $('#coPhone').value.trim(),
      delivery_city: $('#coCity').value.trim(),
      shipping_address: $('#coAddr').value.trim(),
      notes: $('#coNote').value.trim(),
      shipping_terms: 'All-in: freight, crating, full transit insurance, and all import duty/customs carried by Earth Made as importer of record. State sales tax added at checkout where registered. Delivery to ground-floor threshold; rigging excluded.',
      // Consent record — the evidence trail behind the final-sale position
      terms_accepted: 'YES — buyer ticked acceptance of the made-to-order final-sale terms',
      terms_accepted_at: new Date().toISOString(),
    };

    try {
      if (SHOP_CONFIG.formEndpoint){
        const res = await fetch(SHOP_CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Network');
      } else {
        throw new Error('No endpoint configured');
      }
      f.form.reset();
      f.status.style.color = '';
      f.status.textContent = 'Reserved. The atelier will confirm your piece and send a secure payment link within 24 hours.';
    } catch (err){
      f.status.style.color = '#8a6528';
      f.status.textContent = 'We could not send that just now. Please try again in a moment, or use the enquiry form below.';
    } finally {
      f.submit.disabled = false;
    }
  });
})();
