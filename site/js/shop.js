/* =====================================================================
   EARTH MADE — Acquire / checkout layer
   ---------------------------------------------------------------------
   Two modes, auto-selected:
   1) SHOPIFY  — if a Shopify domain + Storefront token + product ids are
      set below, "Acquire" sends the buyer straight to Shopify's secure
      hosted checkout (Shopify takes payment and emails you the order).
   2) RESERVE  — until Shopify is wired, "Acquire" opens a reservation
      panel. On submit it POSTs to FORM_ENDPOINT (e.g. a Formspree form
      pointed at quintessential.international@gmail.com) so you are
      notified of every order, then you send a payment link + freight quote.
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
      'EM-001': '', 'EM-002': '', 'EM-003': '', 'EM-004': '', 'EM-005': '', 'EM-006': '',
      'EM-007': '', 'EM-008': '', 'EM-009': '', 'EM-010': '', 'EM-011': '', 'EM-012': '',
    },
    // --- Reservation fallback ----------------------------------------
    // Create a free form at https://formspree.io pointed at your inbox,
    // then paste its endpoint here. Until then, reservations are captured
    // locally and a prefilled email opens as a safety net.
    formEndpoint: '',
    ordersEmail: 'quintessential.international@gmail.com',
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

  function openModal(d){
    active = d;
    if (f.img){ if (d.img){ f.img.src = d.img; f.img.alt = d.piece; f.img.style.display = 'block'; } else { f.img.style.display = 'none'; } }
    f.title.textContent = d.piece;
    f.mat.textContent = d.material;
    f.price.textContent = (d.price && !Number.isNaN(d.price)) ? fmt(d.price) : 'Price on request';
    if (f.freight) f.freight.textContent =
      'Freight & insurance are confirmed with your reservation — typically $1,900–$3,400 by region, arranged by us and paid by you.';
    f.sku.value = d.sku;
    f.item.value = `${d.piece} — ${d.material}`;
    f.status.textContent = '';
    f.submit.querySelector('span').textContent = d.label === 'Reserve' ? 'Reserve this piece' : 'Reserve this piece';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#coName')?.focus(), 360);
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

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
    if (!name || !emailOk){
      f.status.style.color = '#e0a85a';
      f.status.textContent = !name ? 'Please share your name.' : 'Please enter a valid email.';
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
      shipping_terms: 'Delivered & fully insured by Earth Made; regional freight confirmed with reservation, paid by client.',
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
        // No endpoint yet — open a prefilled email as a safety net.
        const body = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('%0D%0A');
        window.location.href = `mailto:${SHOP_CONFIG.ordersEmail}?subject=${encodeURIComponent(payload._subject)}&body=${body}`;
      }
      f.form.reset();
      f.status.style.color = '';
      f.status.textContent = 'Reserved. The atelier will confirm your piece and send a secure payment link within 24 hours.';
    } catch (err){
      f.status.style.color = '#e0a85a';
      f.status.textContent = `Could not send — please email ${SHOP_CONFIG.ordersEmail} and we will arrange it.`;
    } finally {
      f.submit.disabled = false;
    }
  });
})();
