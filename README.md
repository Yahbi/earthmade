# Earthmade — Stone Bathing Vessels

A single-page showcase for **Earthmade**: monolithic bathing vessels, each cut
from one block of natural stone by partner stone workshops.

**Live site:** https://yahbi.github.io/earthmade/

## Collection

Eleven pieces, made to order. The live site is the only source of truth for the
collection, materials, dimensions and prices — deliberately not mirrored here,
so the two can never drift apart.

## Commerce

The buyer purchases in full at checkout. Earthmade then commissions the piece,
imports it as **importer of record**, and delivers it.

Every price includes freight, crating, export documentation, all-risk transit
insurance to full replacement value, and all **import duty and customs charges**.
US state sales tax is calculated at checkout where Earthmade is registered to
collect it, and is the only amount ever added to the listed price.

Delivery is to the ground-floor threshold within the **United States**. Rigging,
craning and stair carries are quoted separately. International commissions are
not offered at present.

Sourcing, supplier identities, wholesale costs and margin analysis are kept
**off this repository**, in operator files on the owner's machine.

## Stack

Hand-built, dependency-free static site — HTML, CSS and vanilla JavaScript. No
framework, no build step.

- `site/index.html` — markup, Open Graph, JSON-LD product catalogue
- `site/privacy.html` — privacy policy and terms of sale
- `site/css/styles.css` — design tokens and full system
- `site/js/main.js` — nav, reveals, lightbox, enquiry form
- `site/js/shop.js` — acquire modal and checkout handoff
- `site/assets/img/` — optimized imagery (WebP heroes, responsive thumbnails)

Configuration lives in `SHOP_CONFIG` in `site/js/shop.js`. No email address or
credential is written into any file in this repository; the enquiry and order
forms post to an external form endpoint.

## Run locally

```bash
cd site && python3 -m http.server 4173
```

Then open http://localhost:4173

## Deploy

Pushing to `main` triggers `.github/workflows/pages.yml`, which publishes the
`site/` directory to GitHub Pages. Only `site/` is published.

---

© Earthmade
