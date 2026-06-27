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
- `index.html` + `tailwind.css` — the **committed build outputs** (`index.html` is rendered from
  `index.njk`; `tailwind.css` is the minified, tree-shaken stylesheet). Both must be committed.
- SEO assets: `og-image.png` (1200×630 social card; **source** is `og/card.html`, render it with
  the headless-Chrome command below), `robots.txt`, `sitemap.xml`, `site.webmanifest`.
- `.github/workflows/static.yml` — on push to `main`, uploads the whole repo (`path: '.'`) and
  deploys to Pages. **It does NOT build anything** (no Eleventy, no Tailwind).

## ⚠️ The one gotcha that bites every time
CI builds **nothing** — it serves committed files as-is. So editing `index.njk`, `_data/gallery.json`,
or any Tailwind class does **nothing** in production until you **regenerate and commit both
`index.html` AND `tailwind.css`**. Always rebuild after touching a template, the data, or styling.

### Rebuild (regenerates `index.html` + `tailwind.css`)
```bash
# from repo root. First run only: `npm install` (pulls eleventy + tailwind devDeps; node_modules is gitignored).
npm run build      # = eleventy render (html) + tailwindcss --minify (css). Commit both outputs.
```
`npm run html` and `npm run css` run the two halves separately if needed. The `html` script writes a
temporary `.eleventyignore` (so `index.html`/`privacy`/`og`/`CLAUDE.md` aren't read as templates) and
cleans it up afterwards.

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

## Sibling repo `../deen-ai` — DEPRECATED
The old single-file chatbot app. **No longer on `deen.ai`** — it now lives at `old.deen.ai`.
Don't confuse it with this repo. Active product chat surfaces (e.g. IslamChat) are on their own
subdomains (`islamchat.deen.ai`).
