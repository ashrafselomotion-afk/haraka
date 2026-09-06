#!/usr/bin/env bash
# Renders product previews and OG cards from the served dist (expects a server on :4401 serving dist built with BASE=/).
set -e
cd "$(dirname "$0")/.."
BASE=/ node build.mjs >/dev/null
for id in invoice-kit vat-tracker ct-estimator cashflow-planner contracts-kit; do
  node scripts/shoot.mjs "http://localhost:4401/_previews/$id.html" "src/assets/img/preview-$id.png" --w 1280 --h 800 --dpr 2 --wait 1200 --light
done
for lang in en ar; do
  node scripts/shoot.mjs "http://localhost:4401/_previews/og-$lang.html" "src/assets/img/og-$lang.png" --w 1200 --h 630 --dpr 1 --wait 1200
  for id in invoice-kit vat-tracker ct-estimator cashflow-planner contracts-kit; do
    node scripts/shoot.mjs "http://localhost:4401/_previews/og-$id-$lang.html" "src/assets/img/og-$id-$lang.png" --w 1200 --h 630 --dpr 1 --wait 1200
  done
done
BASE=/ node build.mjs
