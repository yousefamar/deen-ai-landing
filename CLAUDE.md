# deen.ai landing page — maintenance charter

This repo **is the live `https://deen.ai`** (verified by curling the domain — it serves this
repo's title "deen.ai - AI + Islam" and the Gallery section). Yousef's job for Claude here:
**maintain the deen.ai website.**

## What this is
Static [Eleventy](https://www.11ty.dev/) site, deployed to **GitHub Pages**.

- `index.njk` — the source template (Nunjucks). Tailwind is **precompiled** to `tailwind.css`
  (no more CDN runtime); FontAwesome is gone, the 2 icons (WhatsApp, chevron) are **inline SVG**.
  Full SEO head (title, meta description, canonical, Open Graph + Twitter Card, favicons/manifest,
  `theme-color`) and 3 JSON-LD blocks (Organization, WebSite, and a CollectionPage/ItemList
  auto-generated from `gallery.json`). Hero (logo + "AI + Islam" + WhatsApp button) and a Gallery.
- `_data/gallery.json` — the data that drives the Gallery grid. Each entry:
  `{ title, description, img, url, tags[], hidden? }`. `hidden: true` omits the entry from both the
  grid and the JSON-LD. Tag values that render a coloured pill:
  `Product` (green), `Dataset` (blue), `Model` (yellow), `Code` (purple), `Evaluation` (pink).
  Any other tag value renders nothing.
- **i18n (34 locales):** `index.njk` paginates over `_data/locales.json` to emit one page per locale —
  `index.html` (en = root + x-default) plus `<code>/index.html` for the other 33 (`ar/`, `de/`, …). Each
  locale's strings live in `_data/i18n/<code>.json` (full UI + SEO fields: title/meta/OG, `htmlLang`,
  `ogLocale`, `dir`; non-en are AI drafts flagged `_draft`/`_review`). Per-page SEO (canonical, reciprocal
  hreflang + x-default, OG locale alternates, JSON-LD) is data-driven, so **adding a locale = add its JSON +
  add the code to `locales.json` + rebuild** (no template change). **Auto-localize:** a tiny `<head>` script
  redirects ONLY the homepage `/` to the visitor's browser-language locale (locale pages never redirect, so
  crawlers index every version); a crawlable language switcher (top corner, real `<a>` links to all locales)
  lets users override, choice remembered in `localStorage`. RTL (`dir=rtl`) for ar/ur/fa/ps/ug/sd/ckb; the
  logo+wordmark row is forced `dir=ltr` so the logo stays left.
- **Committed build outputs — ALL of these:** `index.html`, every `<code>/index.html` locale page, the
  generated `sitemap.xml` (from `sitemap.njk`, loops `locales`), and `tailwind.css` (minified, tree-shaken).
  `git add -A` after a rebuild to catch them all.
- SEO assets: `og-image.png` (1200×630 social card; **source** is `og/card.html`, render it with
  the headless-Chrome command below), `robots.txt`, `sitemap.njk` (→ generates `sitemap.xml`), `site.webmanifest`.
- `.github/workflows/static.yml` — on push to `main`, uploads the whole repo (`path: '.'`) and
  deploys to Pages. **It does NOT build anything** (no Eleventy, no Tailwind).

## ⚠️ The one gotcha that bites every time
CI builds **nothing** — it serves committed files as-is. So editing `index.njk`, `_data/*.json`, an i18n
string, or any Tailwind class does **nothing** in production until you **rebuild and commit ALL outputs**:
`index.html`, all 33 `<code>/index.html` locale pages, `sitemap.xml`, AND `tailwind.css` (`git add -A` is
safest). Always rebuild after touching a template, the data, the locales, or styling.

### Rebuild (regenerates all locale pages + `sitemap.xml` + `tailwind.css`)
```bash
# from repo root. First run only: `npm install` (pulls eleventy + tailwind devDeps; node_modules is gitignored).
npm run build      # eleventy (all 34 locales + sitemap) + tailwindcss --minify. Commit ALL outputs (git add -A).
```
`npm run html` and `npm run css` run the two halves separately if needed. The `html` script runs
`gen-ignore.mjs` first, which **generates `.eleventyignore` from `locales.json`** (so `index.html`, the
generated locale dirs, `privacy`/`og`/`CLAUDE.md` aren't re-read as templates) then cleans it up. Adding a
locale needs no script edit — `gen-ignore.mjs` and `sitemap.njk` both read `locales.json`.

### Regenerate the social card (`og-image.png`)
Source is `og/card.html` (real `deen.png` logo + the mosque silhouette in `og/mosque.svg`, recoloured).
Tune it, then render at exactly 1200×630 while the local server (below) is running:
```bash
google-chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=3500 --user-data-dir="$(mktemp -d)" \
  --screenshot="$PWD/og-image.png" "http://127.0.0.1:8099/og/card.html?v=a"
```

### Preview locally (matches production: root is served directly)
```bash
python3 -m http.server 8099 --bind 127.0.0.1   # then open http://127.0.0.1:8099/
```
Local assets (`/deen.png`, `/islamchat-preview.jpg`, etc.) resolve from repo root, same as Pages.

## Gallery image maintenance
Most `img` values are **remote URLs on the listed projects' own sites**, so they rot:
SPA rebuilds change hashed asset filenames (`logo.<hash>.png`), domains die, etc. When fixing:

1. Check every image: `curl -s -o /dev/null -w '%{http_code} %{content_type}' -L <url>`.
   Broken = non-200, or `text/html` (a 200 HTML page is an SPA fallback / removed asset, not an image).
2. Find a replacement from the project's **own live HTML** — prefer stable canonical assets
   (`og:image` meta, favicons, `android-chrome-512x512.png`) over hashed bundle paths.
   `curl -sL <site> | grep -ioE '<meta[^>]+og:image[^>]*>|<link[^>]+icon[^>]*>'`
3. If the project's **domain is dead** (no DNS), remove the entry entirely — its `url` link is
   dead too. (Hadith.is was removed for this reason, 2026-06.)
4. Square logos go into 16:9 `object-cover object-top` cards (crops top slice) — acceptable but
   not ideal; a wide og-card preview looks better when one exists.
5. Rebuild `index.html` and visually verify (every `img` should have `naturalWidth > 0`).

## This repo's place in the family
This repo now lives at `~/proj/code/deen-ai/landing` (sibling repos under `~/proj/code/deen-ai/`:
`bot`, `api`, `skills`, `old`, `legacy-bot`). Shared context: `../CLAUDE.md`.

## Sibling repo `../old` (DEPRECATED)
The old single-file chatbot app (GH `deen-ai`). **No longer on `deen.ai`**, it now lives at
`old.deen.ai`. Don't confuse it with this repo. Active product chat surfaces (e.g. IslamChat) are on
their own subdomains (`islamchat.deen.ai`, repo `~/proj/code/chat`).
