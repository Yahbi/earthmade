# Earth Made — Stone Atelier

A luxury, single-page showcase for **Earth Made**: monolithic bathing vessels carved from a single block of natural stone.

**Live site:** https://yahbi.github.io/earthmade/

## The Collection

| No. | Piece | Material | Price |
|-----|-------|----------|-------|
| 001 | The Monolith | Honey Travertine | $16,000 |
| 002 | Lumen | Illuminated Onyx | $24,000 |
| 003 | Erebus | Black River Stone | $16,500 |
| 004 | Rosa | Rosa Marble | $17,000 |
| 005 | Aurora | Raw Rose Quartz | $78,000 |
| 006 | Calacatta | White Calacatta Marble | $15,000 |
| 007 | Verde | Green Onyx | $19,500 |
| 008 | Nero | Black Marquina Marble | $17,500 |
| 009 | Lignum | Petrified Wood | $42,000 |
| 010 | Alba | White Onyx | $21,000 |
| 011 | Dune | Golden Sandstone | $15,500 |
| 012 | Atlas | Black Granite | $15,000 |

Every piece is made to order (roughly 4–20 weeks of carving plus freight). Beyond the twelve, fully bespoke commissions start at $30,000.

## Commerce

**Order flow:** the buyer clicks *Reserve* → submits contact and delivery details → the atelier is notified and confirms the piece, then sends a secure payment link and the regional freight figure within 24 hours.

**Freight:** every vessel is delivered door-to-door and fully insured in transit by Earth Made. A flat regional freight & insurance figure (typically $1,900–$3,400 by region) is confirmed with the reservation and paid by the client.

Sourcing, supplier contacts, wholesale costs, and margin analysis are kept **off this repository** in operator files on the owner's machine (`EarthMade_Master_Catalogue.csv` and companions), along with a Shopify publishing guide.

### Wiring real payment (two options)

Open `site/js/shop.js` and set `SHOP_CONFIG`:

1. **Shopify (recommended):** import the products CSV (operator file), then paste your `shopifyDomain`, `storefrontAccessToken`, and each SKU's variant id. *Reserve* then sends buyers to Shopify's secure hosted checkout, and Shopify emails you each order.
2. **Reservation fallback (works today):** create a free form at [formspree.io](https://formspree.io) pointed at your orders inbox and paste its endpoint into `formEndpoint`. Every reservation is emailed to you. (With no endpoint set, the form opens a prefilled email as a safety net.)

## Design — "Nocturne"

A dark gallery-at-dusk system: warm near-black canvas, bone serif display type (Fraunces), one honey accent, roman-numeral chapter marks, and studio photography that floats like spotlit sculpture. All renderings are illustrative — every natural stone is unique, and the site says so.

## Stack

Hand-built, dependency-free static site — HTML, CSS, and vanilla JavaScript. No framework, no build step.

- `site/index.html` — markup, Open Graph, JSON-LD product catalogue
- `site/css/styles.css` — design tokens + full system
- `site/js/main.js` — nav, reveals, lightbox, lazy-fade, inquiry form
- `site/js/shop.js` — Reserve modal, Shopify config, reservation fallback
- `site/assets/img/` — optimized imagery (WebP heroes, responsive thumbnails)

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
