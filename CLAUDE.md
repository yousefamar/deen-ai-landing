# deen.ai landing page — maintenance charter

This repo **is the live `https://deen.ai`** (verified by curling the domain — it serves this
repo's title "deen.ai - AI + Islam" and the Gallery section). Yousef's job for Claude here:
**maintain the deen.ai website.**

## What this is
Static [Eleventy](https://www.11ty.dev/) site, deployed to **GitHub Pages**.

- `index.njk` — the source template (Nunjucks). Tailwind + FontAwesome both via CDN `<script>`
  (no local build of CSS). Hero (logo + "AI + Islam" + WhatsApp community button) and a Gallery.
- `_data/gallery.json` — the data that drives the Gallery grid. Each entry:
  `{ title, description, img, url, tags[] }`. Tag values that render a coloured pill:
  `Product` (green), `Dataset` (blue), `Model` (yellow), `Code` (purple), `Evaluation` (pink).
  Any other tag value renders nothing.
- `index.html` — the **rendered output of `index.njk`, committed into the repo.**
- `.github/workflows/static.yml` — on push to `main`, uploads the whole repo (`path: '.'`) and
  deploys to Pages. **It does NOT run Eleventy.**

## ⚠️ The one gotcha that bites every time
CI serves `index.html` **as-is** — there is no build step in the Action. So editing `index.njk`
or `_data/gallery.json` does **nothing** in production until you **regenerate and commit
`index.html`**. Always rebuild after touching the template or the data.

### Rebuild `index.html`
```bash
# from repo root. Ignore the stale index.html during the build so it isn't read as a
# template (its permalink would collide with index.njk's).
printf 'index.html\nnode_modules\n' > .eleventyignore
npx -y @11ty/eleventy@2 --input=. --output=.
rm -f .eleventyignore
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
