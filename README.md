# Earth Made — Stone Atelier

A luxury, single-page showcase for **Earth Made**: monolithic bathing vessels carved from a single block of natural stone.

**Live site:** https://yahbi.github.io/earthmade/

## The Collection

| No. | Piece | Material |
|-----|-------|----------|
| 001 | The Monolith | Honey Travertine |
| 002 | Lumen | Illuminated Onyx |
| 003 | Erebus | Black River Stone |
| 004 | Rosa | Rosa Marble |
| 005 | Aurora | Raw Rose Quartz |
| 006 | Calacatta | White Calacatta Marble |

## Pricing & commerce

Each piece is priced at **2.5–3× real supplier cost** (the buyer pays freight; the atelier keeps the margin). Costs are **actual published prices** from the manufacturing factories that sell on Alibaba — Alibaba's own listing pages block automated scraping and hide supplier email/phone behind a login, so prices/contacts are sourced from each factory's own site and Made-in-China.com.

| SKU | Piece | Material | Real cost | × | Retail | Supplier |
|-----|-------|----------|-----------|---|--------|----------|
| EM-001 | The Monolith | Honey Travertine | $2,300 | 2.78 | **$6,400** | Lux4home™ |
| EM-002 | Lumen | Illuminated Onyx | $5,000 | 2.90 | **$14,500** | Lux4home™ |
| EM-003 | Erebus | Black River Stone | $2,300 | 2.70 | **$6,200** | Lux4home™ (FLUMEN) |
| EM-004 | Rosa | Rosa Marble | $2,300 | 2.78 | **$6,400** | Lux4home™ (AUREA) |
| EM-005 | Aurora | Raw Rose Quartz | $30,000 | 2.50 | **$75,000** | New Home Stone |
| EM-006 | Calacatta | White Calacatta Marble | $1,783 | 2.92 | **$5,200** | Stone (Quanzhou) Supply Chain |

**Order flow:** buyer clicks *Acquire* → reserves with contact + delivery details → you are notified → you place the order with the supplier and send a secure payment link + freight quote. Freight is **client-arranged and paid by the buyer**.

### Two operator files (kept off the website, generated on the Desktop)
- `EarthMade_Supplier_Sourcing.csv` — clean sheet: SKU, item, material, supplier, **email, phone, location**, real wholesale, markup, our price, margin, source listing.
- `EarthMade_Shopify_Products.csv` — ready to bulk-import into Shopify (Products → Import): titles, descriptions, retail prices, SKUs, image URLs for all six pieces.

**Verified supplier contacts:** Lux4home™ (info@lux4home.com, +48 450 030 444), New Home Stone (jack@newhomestone.com), Xiamen Jiamei Stone (info@jiameistone.com, +86-592-5518264), HZX Stone (info@hzxco.com, +86 139 5929 9885), Stone (Quanzhou) Supply Chain (via Made-in-China.com).

### Wiring real payment (two options)
Open `site/js/shop.js` and set `SHOP_CONFIG`:
1. **Shopify (recommended):** import the products CSV, then paste your `shopifyDomain`, `storefrontAccessToken`, and each SKU's variant id. *Acquire* then sends buyers to Shopify's secure hosted checkout, and Shopify emails you each order.
2. **Reservation fallback (works today):** create a free form at [formspree.io](https://formspree.io) pointed at `quintessential.international@gmail.com`, paste its endpoint into `formEndpoint`. Every reservation is emailed to you. (With no endpoint set, the form opens a prefilled email as a safety net.)

> Prices, wholesale figures, and supplier details are researched market **estimates** — confirm exact quotes with suppliers before transacting.

## Stack

Hand-built, dependency-free static site — HTML, CSS, and vanilla JavaScript. No framework, no build step.

- `site/index.html` — markup
- `site/css/styles.css` — design tokens + full system
- `site/js/main.js` — loader, custom cursor, scroll reveals, parallax, lightbox, form
- `site/assets/img/` — optimized imagery (full + thumbnail variants)

## Run locally

```bash
cd site
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy

Pushing to `main` triggers `.github/workflows/pages.yml`, which publishes the `site/` directory to GitHub Pages.

---

© Earth Made Stone Atelier · Quarried responsibly · Carved by hand
