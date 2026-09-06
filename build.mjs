#!/usr/bin/env node
// Haraka static build: JSON content -> bilingual static site in dist/.
// Usage: node build.mjs            (BASE defaults to config.base)
//        BASE=/ node build.mjs     (for a custom domain at the root)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREVIEWS, ogCard } from './src/templates/previews.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');
const J = (p) => JSON.parse(readFileSync(join(SRC, p), 'utf8'));
const cfg = J('data/config.json');
const { products, plans } = J('data/products.json');
const legal = existsSync(join(SRC, 'content/legal.json')) ? J('content/legal.json') : null;
const T = { en: J('content/en.json'), ar: J('content/ar.json') };
const BASE = (process.env.BASE || cfg.base || '/').replace(/\/?$/, '/');
const SITE = (process.env.SITE_URL || cfg.siteUrl).replace(/\/$/, '');
const YEAR = new Date().getFullYear();

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const url = (lang, path = '') => BASE + (lang === 'ar' ? 'ar/' : '') + path.replace(/^\//, '');
const abs = (lang, path = '') => SITE + url(lang, path);
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);
const money = (lang, usd, aed) => `<span class="num" data-usd="${usd}" data-aed="${aed}">${lang === 'ar' ? `${aed.toLocaleString('en-AE')} د.إ` : `$${usd}`}</span>`;

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets'), { recursive: true });
cpSync(join(SRC, 'assets'), join(DIST, 'assets'), { recursive: true });
const cssV = hash(readFileSync(join(SRC, 'assets/css/site.css')));
const jsV = hash(readFileSync(join(SRC, 'assets/js/site.js')));

const write = (rel, html) => { const p = join(DIST, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };

/* ---------- SVG icons (UI glyphs only) ---------- */
const I = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="moon"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:var(--flip,none)"><path d="M15 6l-6 6 6 6"/></svg>'
};
const favicon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0b7a5b"/><rect x="14" y="21" width="36" height="7" rx="3.5" fill="#fff"/><rect x="14" y="36" width="22" height="7" rx="3.5" fill="#fff"/></svg>');

/* ---------- layout ---------- */
function head({ lang, title, desc, path, ogImage, jsonld = [], noindex = false }) {
  const t = T[lang], other = t.otherLang;
  const canonical = abs(lang, path), alt = abs(other, path);
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang === 'en' ? 'en-AE' : 'ar-AE'}" href="${canonical}">
<link rel="alternate" hreflang="${other === 'en' ? 'en-AE' : 'ar-AE'}" href="${alt}">
<link rel="alternate" hreflang="x-default" href="${abs('en', path)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${cfg.brand}"><meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}${BASE}assets/img/${ogImage || 'og-' + lang + '.png'}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${cfg.themeColor.light}"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="${cfg.themeColor.dark}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-${scriptHash}' https://assets.lemonsqueezy.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src https://*.lemonsqueezy.com; connect-src 'self' https://*.lemonsqueezy.com; base-uri 'self'; form-action 'self' mailto:; object-src 'none'">
<link rel="icon" href="${favicon}">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<link rel="preload" href="${BASE}assets/fonts/${lang === 'ar' ? 'ibm-plex-sans-arabic-arabic-600-normal' : 'geist-latin-wght-normal'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${BASE}assets/css/site.css?v=${cssV}">
<script>${inlineScript}</script>
${jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body>`;
}
const inlineScript = `try{var t=localStorage.getItem('haraka-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
const scriptHash = createHash('sha256').update(inlineScript).digest('base64');

function nav(lang, path, opts = {}) {
  const t = T[lang], home = url(lang, '');
  const anchor = (id) => (opts.home ? '#' + id : home + '#' + id);
  return `<header class="nav"><div class="wrap">
  <a class="logo" href="${home}" aria-label="${cfg.brand}"><span class="mark" aria-hidden="true"></span>${lang === 'ar' ? cfg.brandAr : cfg.brand}</a>
  <nav class="nav-links" id="nav-links" aria-label="Primary">
    <a href="${anchor('templates')}">${t.nav.templates}</a><a href="${anchor('pricing')}">${t.nav.pricing}</a><a href="${url(lang, 'faq/')}">${t.nav.faq}</a>
    <a class="btn btn-primary btn-sm m-cta" href="${anchor('pricing')}">${t.nav.cta}</a>
  </nav>
  <div class="nav-right">
    <a class="lang-btn" href="${url(t.otherLang, path)}" hreflang="${t.otherLang}" lang="${t.otherLang}">${t.otherLangLabel}</a>
    <button class="icon-btn theme-btn" type="button" aria-label="${t.nav.theme}">${I.sun}${I.moon}</button>
    <a class="btn btn-primary btn-sm nav-cta" href="${anchor('pricing')}">${t.nav.cta}</a>
    <button class="icon-btn menu-btn" type="button" aria-label="${t.nav.menu}" aria-expanded="false" aria-controls="nav-links">${I.menu}</button>
  </div>
</div></header>`;
}

function footer(lang) {
  const t = T[lang];
  return `<footer><div class="wrap">
  <div class="cols">
    <div><a class="logo" href="${url(lang, '')}"><span class="mark" aria-hidden="true"></span>${lang === 'ar' ? cfg.brandAr : cfg.brand}</a><p style="margin-top:12px;max-width:34ch">${t.footer.blurb}</p></div>
    <div><h4>${t.nav.templates}</h4><ul>${products.map((p) => `<li><a href="${url(lang, 'templates/' + p.slug + '/')}">${p[lang].name}</a></li>`).join('')}</ul></div>
    <div><h4>${t.footer.legal}</h4><ul>
      <li><a href="${url(lang, 'terms/')}">${t.footer.terms}</a></li><li><a href="${url(lang, 'privacy/')}">${t.footer.privacy}</a></li>
      <li><a href="${url(lang, 'refunds/')}">${t.footer.refunds}</a></li><li><a href="${url(lang, 'license/')}">${t.footer.license}</a></li>
      <li><a href="mailto:${cfg.supportEmail}">${t.footer.contact}</a></li></ul></div>
  </div>
  <div class="bottom"><span>${t.footer.operated} ${t.footer.notAdvice}</span><span>&copy; ${YEAR} ${cfg.brand}. ${t.footer.rights}</span></div>
</div></footer>
<dialog class="notify" id="notify"><form method="dialog"><h3>${t.checkout.title}</h3><p>${t.checkout.body}</p>
<label class="sr" for="notify-email">${t.checkout.email}</label><input id="notify-email" type="email" required placeholder="${t.checkout.email}" autocomplete="email">
<div class="row"><button type="button" class="btn btn-ghost btn-sm dlg-close">${t.checkout.close}</button><button type="submit" class="btn btn-primary btn-sm">${t.checkout.send}</button></div></form></dialog>
<script type="application/json" id="haraka-cfg">${JSON.stringify({ lang, supportEmail: cfg.supportEmail, lemonOverlay: cfg.lemon.overlay, mailSubject: t.checkout.mailSubject, mailBody: 'Notify me at: ', check: t.check }).replace(/</g, '\\u003c')}</script>
${cfg.lemon.storeUrl ? '<script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>' : ''}
<script src="${BASE}assets/js/site.js?v=${jsV}" defer></script>
</body></html>`;
}

/* ---------- blocks ---------- */
const bundle = plans.find((p) => p.id === 'complete'), pro = plans.find((p) => p.id === 'pro');
const productCard = (lang, p, cls, d) => {
  const t = T[lang];
  return `<a class="card reveal ${cls}" data-d="${d}" href="${url(lang, 'templates/' + p.slug + '/')}">
  <div class="shot"><img src="${BASE}assets/img/preview-${p.id}.png" alt="${esc(p[lang].name)}" loading="lazy" width="1280" height="800"></div>
  <div class="body"><h3>${p[lang].name}</h3><p>${p[lang].short}</p>
  <div class="meta"><span class="fmt">${t.lineup.formats[p.formats[0]]}</span><span class="price">${money(lang, p.priceUsd, p.priceAed)}</span></div></div></a>`;
};

function pricingBlock(lang) {
  const t = T[lang];
  const plan = (pl) => `<div class="plan ${pl.highlight ? 'hi' : ''} reveal">${pl.highlight ? `<span class="tag">${t.pricing.popular}</span>` : ''}
    <h3>${pl[lang].name}</h3><p class="p-short">${pl[lang].short}</p>
    <div class="p-price"><span class="amt">${money(lang, pl.priceUsd, pl.priceAed)}</span><span class="per">${pl.kind === 'yearly' ? t.pricing.perYear : t.pricing.oneTime}</span>${pl.compareUsd ? `<span class="was">${money(lang, pl.compareUsd, pl.compareAed)}</span>` : ''}</div>
    <ul>${pl[lang].includes.map((i) => `<li>${i}</li>`).join('')}</ul>
    <button class="btn ${pl.highlight ? 'btn-primary' : 'btn-ghost'}" type="button" data-checkout="${esc(pl.checkoutUrl)}" data-plan="${pl.id}">${pl[lang].cta}</button></div>`;
  return `<section class="pricing" id="pricing"><div class="wrap">
  <div class="sec-head"><div><h2>${t.pricing.h2}</h2><p class="lede">${t.pricing.sub}</p></div>
    <div class="cur-toggle" role="group" aria-label="${t.nav.currency}"><button type="button" data-cur="usd" aria-pressed="false">USD</button><button type="button" data-cur="aed" aria-pressed="false">AED</button></div></div>
  <div class="plans">${plan(bundle)}${plan(pro)}</div>
  <div class="singles"><h3>${t.pricing.single}</h3><div class="single-grid">${products.map((p) => `<div class="single"><span class="n">${p[lang].name}</span><span class="f">${t.lineup.formats[p.formats[0]]}</span>
    <div class="row"><span class="price">${money(lang, p.priceUsd, p.priceAed)}</span><a href="${url(lang, 'templates/' + p.slug + '/')}">${t.lineup.view}</a></div></div>`).join('')}</div></div>
  <div class="fine"><span>${t.pricing.secure}</span><span>${t.pricing.aed}</span></div>
</div></section>`;
}

function faqBlock(lang, limit) {
  const t = T[lang], items = legal ? legal.faq[lang] : [];
  const list = (limit ? items.slice(0, limit) : items).map((q, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q.q)}</summary><div class="a">${esc(q.a)}</div></details>`).join('');
  return `<section class="faq" id="faq"><div class="wrap"><div class="sec-head"><h2>${t.faq.h2}</h2></div><div class="list">${list}</div>${limit && items.length > limit ? `<a class="more" href="${url(lang, 'faq/')}">${t.faq.more}</a>` : ''}</div></section>`;
}

/* ---------- pages ---------- */
function homePage(lang) {
  const t = T[lang], h = t.hero;
  const lines = h.demoLines.map((d, i) => { const qty = [1, 1, 12][i], rate = [8500, 14000, 350][i]; return `<tr data-line><td>${d}</td><td class="r hide-s"><input class="qty" type="number" min="0" step="1" value="${qty}" aria-label="${h.demoQty}"></td><td class="r"><input class="rate" type="number" min="0" step="50" value="${rate}" aria-label="${h.demoRate}"></td><td class="r num vat hide-s"></td><td class="r num amt"></td></tr>`; }).join('');
  const faqLd = legal ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: legal.faq[lang].slice(0, 8).map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) } : null;
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: cfg.brand, url: abs(lang, ''), email: cfg.supportEmail, address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' } };
  const cards = [productCard(lang, products[0], 'c-7', 0), productCard(lang, products[1], 'c-5', 1), productCard(lang, products[2], 'c-4', 0), productCard(lang, products[3], 'c-4', 1), productCard(lang, products[4], 'c-4', 2)].join('');
  return head({ lang, title: t.meta.title, desc: t.meta.description, path: '', jsonld: [org, faqLd].filter(Boolean) }) + nav(lang, '', { home: true }) + `
<main>
<section class="hero"><div class="wrap">
  <div class="hero-copy"><h1>${h.h1}</h1><p class="lede">${h.sub}</p>
    <div class="hero-actions"><a class="btn btn-primary btn-lg" href="#pricing">${h.primary}</a><a class="btn btn-ghost btn-lg" href="#templates">${h.secondary}</a></div></div>
  <div class="inv" id="inv" aria-label="${h.demoTitle}"><span class="inv-hint">${h.demoHint}</span>
    <div class="inv-top"><div class="inv-title">${h.demoTitle}<small>${lang === 'ar' ? 'Tax Invoice' : 'فاتورة ضريبية'}</small></div><div class="inv-no num" dir="ltr">INV-2026-0042<b>06 Sep 2026</b></div></div>
    <div class="inv-parties"><div><div class="k">${h.demoFrom}</div><b>Noor Digital Studio</b><div class="trn">${h.demoTrn} <span class="num">100 3456 7890 0003</span></div></div><div><div class="k">${h.demoTo}</div><b>Al Wadi Trading LLC</b><div class="trn">${h.demoTrn} <span class="num">100 9876 5432 0003</span></div></div></div>
    <table><thead><tr><th>${h.demoDesc}</th><th class="r hide-s">${h.demoQty}</th><th class="r">${h.demoRate}</th><th class="r hide-s">${h.demoVat}</th><th class="r">${h.demoAmount}</th></tr></thead><tbody>${lines}</tbody></table>
    <div class="inv-totals"><div><span>${h.demoSubtotal}</span><span class="num" id="inv-sub"></span></div><div><span>${h.demoVatTotal}</span><span class="num" id="inv-vat"></span></div><div class="total"><span>${h.demoTotal} (${h.demoCurrency})</span><span class="num" id="inv-total"></span></div></div>
  </div>
</div></section>

<section class="lineup" id="templates"><div class="wrap">
  <div class="sec-head reveal"><h2>${t.lineup.h2}</h2><p class="lede">${t.lineup.sub}</p></div>
  <div class="grid12">${cards}</div>
</div></section>

<section class="facts"><div class="wrap">
  <div class="sec-head reveal"><h2>${t.facts.h2}</h2></div>
  <div class="grid4 reveal">${t.facts.items.map((f) => `<div class="fact"><div class="n num">${f.n}</div><div class="l">${f.l}</div></div>`).join('')}</div>
  <p class="note">${t.facts.note}</p>
</div></section>

<section class="check" id="check"><div class="wrap">
  <div class="sec-head reveal"><h2>${t.check.h2}</h2><p class="lede">${t.check.sub}</p></div>
  <div class="panel reveal">
    <div class="inputs">
      <div class="field"><label for="c-rev">${t.check.revenue}</label><div class="in"><span>AED</span><input id="c-rev" inputmode="numeric" value="420000"></div></div>
      <div class="field"><label for="c-prof">${t.check.profit}</label><div class="in"><span>AED</span><input id="c-prof" inputmode="numeric" value="510000"></div></div>
      <p class="disc">${t.check.disclaimer}</p>
    </div>
    <div class="results">
      <div class="result"><h3>${t.check.vatTitle}</h3><p class="status" id="c-vat-status"></p></div>
      <div class="result"><h3>${t.check.ctTitle}</h3><p class="status" id="c-ct-status"></p>
        <div class="rows"><div><span>${t.check.ctTaxable}</span><b id="c-taxable"></b></div><div><span>${t.check.ctPayable}</span><b id="c-payable"></b></div></div></div>
    </div>
  </div>
</div></section>

<section class="how"><div class="wrap">
  <div class="sec-head reveal"><h2>${t.how.h2}</h2></div>
  <ol>${t.how.steps.map((s, i) => `<li class="reveal" data-d="${i}"><h3>${s.h}</h3><p>${s.p}</p></li>`).join('')}</ol>
</div></section>

${pricingBlock(lang)}
${faqBlock(lang, 6)}

<section class="final"><div class="wrap"><div><h2>${t.final.h2}</h2><p>${t.final.sub}</p></div><a class="btn btn-lg" href="#pricing">${t.final.cta}</a></div></section>
</main>` + footer(lang);
}

function productPage(lang, p) {
  const t = T[lang], d = p[lang], path = 'templates/' + p.slug + '/';
  const related = products.filter((x) => x.id !== p.id).slice(0, 2);
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: d.name, description: d.short, image: `${SITE}${BASE}assets/img/preview-${p.id}.png`, brand: { '@type': 'Brand', name: cfg.brand }, offers: { '@type': 'Offer', price: p.priceUsd, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: abs(lang, path) } };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: cfg.brand, item: abs(lang, '') }, { '@type': 'ListItem', position: 2, name: d.name, item: abs(lang, path) }] };
  return head({ lang, title: `${d.name}: ${cfg.brand}`, desc: d.short, path, ogImage: `og-${p.id}-${lang}.png`, jsonld: [ld, crumbs] }) + nav(lang, path) + `
<main>
<section class="p-hero"><div class="wrap">
  <div><a class="back" href="${url(lang, '')}#templates">${I.back}${t.product.back}</a>
    <h1>${d.name}</h1><p class="lede">${d.lede}</p>
    <div class="p-badges"><span class="badge">${t.product.language}</span>${p.apps.map((a) => `<span class="badge">${a}</span>`).join('')}</div></div>
  <aside class="buy-card"><div class="p-price"><span class="amt">${money(lang, p.priceUsd, p.priceAed)}</span><span class="per">${t.pricing.oneTime}</span></div>
    <button class="btn btn-primary btn-lg" type="button" data-checkout="${esc(p.checkoutUrl)}" data-product="${p.id}">${t.product.buy}: ${d.name}</button>
    <p class="alt">${t.product.orBundle} <a href="${url(lang, '')}#pricing">${bundle[lang].name}</a>, ${money(lang, bundle.priceUsd, bundle.priceAed)}</p>
    <p class="g">${t.product.guarantee}</p></aside>
</div></section>
<section class="p-preview"><div class="wrap"><div class="frame"><img src="${BASE}assets/img/preview-${p.id}.png" alt="${esc(d.name)}: ${t.product.preview}" width="1280" height="800" fetchpriority="high"></div><p class="cap">${t.product.previewNote}</p></div></section>
<section class="p-body"><div class="wrap"><div class="two">
  <div><h2>${t.product.features}</h2><ul class="feat">${d.features.map((f) => `<li>${f}</li>`).join('')}</ul><div class="p-who"><b>${t.product.who}:</b> ${d.who}</div></div>
  <div><h2>${t.product.inside}</h2><div class="inside">${d.inside.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('')}</div></div>
</div></div></section>
<section class="related"><div class="wrap"><h2>${t.product.related}</h2><div class="rel-grid">${related.map((r, i) => productCard(lang, r, '', i)).join('')}</div></div></section>
</main>` + footer(lang);
}

function legalPage(lang, key) {
  const t = T[lang], doc = legal[key][lang], path = key + '/';
  const keys = ['terms', 'privacy', 'refunds', 'license'];
  return head({ lang, title: `${doc.title}: ${cfg.brand}`, desc: doc.sections[0].p[0].slice(0, 155), path }) + nav(lang, path) + `
<main><div class="wrap"><article class="prose"><h1>${esc(doc.title)}</h1><p class="upd">${t.legalNav.updated}: <time datetime="${doc.updated}">${doc.updated}</time></p>
<nav class="legal-nav" aria-label="${t.footer.legal}">${keys.map((k) => `<a href="${url(lang, k + '/')}"${k === key ? ' aria-current="page"' : ''}>${t.footer[k]}</a>`).join('')}</nav>
${doc.sections.map((s) => `<h2>${esc(s.h)}</h2>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}
<p style="margin-top:32px"><a href="mailto:${cfg.supportEmail}">${cfg.supportEmail}</a></p></article></div></main>` + footer(lang);
}

function faqPage(lang) {
  const t = T[lang], path = 'faq/';
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: legal.faq[lang].map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) };
  return head({ lang, title: `${t.faq.h2}: ${cfg.brand}`, desc: t.meta.description, path, jsonld: [ld] }) + nav(lang, path) + `<main class="faq-page">${faqBlock(lang, 0)}</main>` + footer(lang);
}

function notFound(lang) {
  const t = T[lang];
  return head({ lang, title: `${t.notFound.title}: ${cfg.brand}`, desc: t.notFound.body, path: '404.html', noindex: true }) + nav(lang, '') + `<main><div class="wrap nf"><div><h1>${t.notFound.title}</h1><p>${t.notFound.body}</p><a class="btn btn-primary" href="${url(lang, '')}">${t.notFound.home}</a></div></div></main>` + footer(lang);
}

/* ---------- emit ---------- */
const pages = [];
for (const lang of ['en', 'ar']) {
  const pre = lang === 'ar' ? 'ar/' : '';
  write(pre + 'index.html', homePage(lang)); pages.push(abs(lang, ''));
  for (const p of products) { write(pre + 'templates/' + p.slug + '/index.html', productPage(lang, p)); pages.push(abs(lang, 'templates/' + p.slug + '/')); }
  if (legal) {
    for (const k of ['terms', 'privacy', 'refunds', 'license']) { write(pre + k + '/index.html', legalPage(lang, k)); pages.push(abs(lang, k + '/')); }
    write(pre + 'faq/index.html', faqPage(lang)); pages.push(abs(lang, 'faq/'));
  }
}
write('404.html', notFound('en'));
for (const [id, fn] of Object.entries(PREVIEWS)) write('_previews/' + id + '.html', fn());
for (const lang of ['en', 'ar']) {
  write(`_previews/og-${lang}.html`, ogCard({ lang, title: T[lang].hero.h1, sub: T[lang].hero.sub, brand: cfg.brand, brandAr: cfg.brandAr }));
  for (const p of products) write(`_previews/og-${p.id}-${lang}.html`, ogCard({ lang, title: p[lang].name, sub: p[lang].short, brand: cfg.brand, brandAr: cfg.brandAr, price: lang === 'ar' ? `${p.priceAed} د.إ` : `$${p.priceUsd}` }));
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: ${BASE}_previews/\nSitemap: ${SITE}${BASE}sitemap.xml\n`);
write('manifest.webmanifest', JSON.stringify({ name: cfg.brand, short_name: cfg.brand, start_url: BASE, display: 'browser', background_color: cfg.themeColor.light, theme_color: cfg.themeColor.light, icons: [{ src: favicon, sizes: 'any', type: 'image/svg+xml' }] }));
write('.nojekyll', '');
console.log(`built ${pages.length} pages -> dist/ (BASE=${BASE}${legal ? '' : ', legal.json missing: legal/faq pages skipped'})`);
