/* =====================================================================
   ATELIER EARTHMADE — Acquire / checkout layer
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
    // --- Real Shopify checkout ----------------------------------------
    // Live store on the branded domain (bought 2026-08-01). Variant ids are real.
    // Using the branded host avoids a 301 hop and keeps atelierearthmade.com in the
    // address bar through checkout, which matters at these prices.
    shopifyDomain: 'atelierearthmade.com',

    // Master switch for hosted Shopify checkout.
    liveCheckout: true,

    // Map each SKU to its Shopify variant id.
    variants: {
      'EM-001': '48462859141361', 'EM-002': '48462859665649',
      'EM-003': '48462859895025', 'EM-004': '48462860026097',
      'EM-006': '48462860550385', 'EM-007': '48462860648689',
      'EM-008': '48462860812529', 'EM-009': '48462861074673',
      'EM-010': '48462861172977', 'EM-011': '48462861467889',
      'EM-012': '48462861566193', 'EM-013': '48464189260017',
      'EM-014': '48464189292785', 'EM-015': '48464189325553',
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
    return SHOP_CONFIG.liveCheckout && SHOP_CONFIG.shopifyDomain && SHOP_CONFIG.variants[sku];
  }
  function goToShopify(sku){
    // Permalink checkout: /cart/{variantId}:{qty}  → Shopify hosted checkout.
    // The consent record rides along as cart attributes and lands on the order —
    // the same evidence trail the reservation form sends to Formspree.
    const v = String(SHOP_CONFIG.variants[sku]).replace(/^gid.*\//, '');
    const q = new URLSearchParams({
      'attributes[Terms accepted]': 'YES — buyer ticked acceptance of the made-to-order final-sale terms',
      'attributes[Terms accepted at]': new Date().toISOString(),
      'attributes[Source]': 'earthmade marketing site',
    });
    window.location.href = `https://${SHOP_CONFIG.shopifyDomain}/cart/${v}:1?${q}`;
  }

  /* ---------- Reservation modal ---------- */
  const modal = $('#checkout');
  const f = {
    title: $('#coTitle'), mat: $('#coMat'), price: $('#coPrice'), freight: $('#coFreight'),
    sku: $('#coSku'), item: $('#coItem'), form: $('#coForm'),
    status: $('#coStatus'), submit: $('#coSubmit'), img: $('#coImg'),
  };
  let active = null;
  // True while the open modal is in live-checkout mode: slim consent step
  // (terms tick only), then straight to Shopify's hosted checkout.
  let activeLive = false;

  let lastFocus = null;
  const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';
  // The header and the footer sit outside <main id="top">, so inerting #top alone
  // left the nav links and the twenty-three footer links exposed behind the panel.
  function setBackgroundInert(on){
    ['#top', '#nav', 'footer'].forEach(sel => document.querySelector(sel)?.toggleAttribute('inert', on));
  }

  function openModal(d){
    active = d;
    activeLive = shopifyReady(d.sku);
    lastFocus = document.activeElement;
    if (f.img){ if (d.img){ f.img.src = d.img; f.img.alt = d.piece; f.img.style.display = 'block'; } else { f.img.style.display = 'none'; } }
    f.title.textContent = d.piece;
    f.mat.textContent = d.material;
    f.price.textContent = (d.price && !Number.isNaN(d.price)) ? fmt(d.price) : 'Price on request';
    if (f.freight) f.freight.textContent =
      'This price includes freight, crating, transit insurance with the sum insured stated in writing on your order, and all import duty and customs charges. We are the importer of record — nothing further is payable on delivery. Where we are registered to collect it, state sales tax is shown at checkout.';
    f.sku.value = d.sku;
    f.item.value = `${d.piece} — ${d.material}`;
    f.status.textContent = '';
    // Live mode collects only consent — Shopify checkout collects the rest.
    f.form.querySelectorAll('.co-row, .field').forEach(el => { el.style.display = activeLive ? 'none' : ''; });
    const eyebrow = $('.checkout__eyebrow', modal);
    if (eyebrow) eyebrow.textContent = activeLive ? 'Acquire' : 'Reserve';
    f.submit.querySelector('span').textContent = activeLive ? 'Proceed to secure checkout' : 'Reserve this piece';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    setTimeout(() => (activeLive ? $('#coAccept') : $('#coName'))?.focus(), 360);
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setBackgroundInert(false);
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
      // Both modes open the modal: reserve mode shows the full form, live mode
      // shows the consent step. Either way the buyer ticks the terms first.
      openModal(d);
    });
  });

  $('#coClose')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  /* ---------- Submit a reservation ---------- */
  f.form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (activeLive){
      if (!$('#coAccept')?.checked){
        f.status.classList.add('is-error');
        f.status.textContent = 'Please confirm you accept the terms of sale.';
        return;
      }
      f.status.classList.remove('is-error');
      f.status.textContent = 'Opening secure checkout…';
      goToShopify(active.sku);
      return;
    }
    const name = $('#coName').value.trim();
    const email = $('#coEmail').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const accepted = $('#coAccept')?.checked;
    if (!name || !emailOk || !accepted){
      f.status.classList.add('is-error');
      f.status.textContent = !name ? 'Please share your name.'
        : !emailOk ? 'Please enter a valid email.'
        : 'Please confirm you accept the terms of sale.';
      return;
    }
    f.status.classList.remove('is-error');
    f.status.textContent = 'Sending…';
    f.submit.disabled = true;

    const payload = {
      _subject: `Atelier Earthmade — Reservation: ${active.piece} (${fmt(active.price)})`,
      sku: active.sku,
      item: f.item.value,
      price_usd: active.price,
      indicative_freight_usd: active.freight || 'TBD',
      name, email,
      phone: $('#coPhone').value.trim(),
      delivery_city: $('#coCity').value.trim(),
      shipping_address: $('#coAddr').value.trim(),
      notes: $('#coNote').value.trim(),
      shipping_terms: 'All-in: freight, crating, transit insurance with the sum insured stated in writing, and all import duty/customs carried by Atelier Earthmade as importer of record. State sales tax added at checkout where registered. Delivery to ground-floor threshold; rigging excluded.',
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
      f.status.classList.remove('is-error');
      f.status.textContent = 'Reserved. The atelier will confirm your piece and send a secure payment link within 24 hours.';
    } catch (err){
      f.status.classList.add('is-error');
      f.status.textContent = 'We could not send that just now. Please try again in a moment, or use the enquiry form below.';
    } finally {
      f.submit.disabled = false;
    }
  });
})();
