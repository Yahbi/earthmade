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
