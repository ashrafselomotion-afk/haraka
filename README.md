# Haraka

Bilingual (English + Arabic) storefront for UAE business templates. Static site, no framework.

- `src/content/en.json`, `src/content/ar.json`: interface copy
- `src/content/legal.json`: terms, privacy, refunds, license, FAQ (both languages)
- `src/data/products.json`: products, plans, prices, checkout URLs
- `src/data/config.json`: brand, site URL, base path, Lemon Squeezy store, support email
- `src/templates/previews.mjs`: preview renderers (screenshotted into `src/assets/img/preview-*.png`)
- `build.mjs`: builds `dist/` (run `node build.mjs`; `BASE=/ node build.mjs` for a root domain)
- `scripts/shoot.mjs`: headless Chrome screenshot helper (previews, OG images)

Deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

## Connecting checkout

1. Create a Lemon Squeezy store and one product per entry in `products.json` (5 templates, Complete bundle, Pro yearly subscription).
2. Paste each product's checkout URL into its `checkoutUrl` field and the store URL into `config.json` > `lemon.storeUrl`.
3. Push. Buy buttons open the Lemon Squeezy overlay; until then they show a notify-me dialog.
