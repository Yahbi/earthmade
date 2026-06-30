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

Each piece is priced at **2.5–3× the researched wholesale (Alibaba/manufacturer) cost**. The buyer pays freight; the atelier keeps the margin.

| SKU | Piece | Material | Wholesale (est.) | × | Retail |
|-----|-------|----------|------------------|---|--------|
| EM-001 | The Monolith | Honey Travertine | $2,200 | 2.82 | **$6,200** |
| EM-002 | Lumen | Illuminated Onyx | $6,800 | 2.76 | **$18,800** |
| EM-003 | Erebus | Black River Stone | $2,900 | 2.72 | **$7,900** |
| EM-004 | Rosa | Rosa Marble | $4,200 | 2.76 | **$11,600** |
| EM-005 | Aurora | Raw Rose Quartz | $12,000 | 3.00 | **$36,000** |
| EM-006 | Calacatta | White Calacatta Marble | $4,800 | 2.75 | **$13,200** |

**Order flow:** buyer clicks *Acquire* → reserves with contact + delivery details → you are notified → you place the order with the supplier and send a secure payment link + freight quote. Freight is **client-arranged and paid by the buyer**.

### Two operator files (kept off the website, generated on the Desktop)
- `EarthMade_Supplier_Sourcing.csv` — per-piece wholesale cost, markup, retail, margin, and **real supplier contacts** (Lux4home, Xiamen Jiamei, HZX Stone, New Home Stone) with email/phone/location + Alibaba category links.
- `EarthMade_Shopify_Products.csv` — ready to bulk-import into Shopify (Products → Import). Includes titles, descriptions, retail prices, SKUs, and image URLs for all six pieces.

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
