# Pelago website

The site for [Pelago](https://github.com/pelagolang/pelago): a static site with no dependencies and no framework. Pages are plain HTML in `src/pages/`, wrapped by `src/layout.html` and assembled by one Node script into `public/`.

The documentation site is a separate Fumadocs app in [`apps/docs`](apps/docs); this README is about the marketing site.

## Why this stack

A language site is mostly text and code. Plain HTML and CSS load instantly, work without JavaScript (one small script adds copy buttons), need no `npm install`, and cannot break when a framework changes. Vercel serves the output as is. A heavier generator would add a dependency tree to maintain for six pages.

## Commands

Node 20 or later. In PowerShell or any shell:

```
node scripts/build.mjs       # src/ + content/ -> public/
node scripts/check.mjs       # every link, anchor and asset in public/ resolves
node scripts/serve.mjs       # preview at http://localhost:3000 (after a build)
```

`npm run build`, `check` and `dev` do the same.

## Layout

| Path | What |
|---|---|
| `src/pages/*.html` | One file per page, with a title, description and nav key in a leading comment |
| `src/layout.html` | Head, header, footer |
| `src/assets/` | CSS, the Outfit font (OFL) and the brand files, copied from `assets/brand` in the Pelago repository |
| `content/code/*.pel` | Every example on the site. `*.html` (highlighted) and `*.out` (program output) next to them are generated and committed |
| `content/bench.json` | The benchmark numbers (method and caveats are on the page) |

Pages pull examples in with `{{code:name}}` and the table with `{{bench}}`.

## Examples must compile

Vercel has no Pelago binary, so the highlighted HTML and the outputs are generated here and committed. After changing a `.pel` file:

```
node scripts/highlight.mjs   # needs `pelago` on PATH, or set PELAGO to its path
```

CI builds the compiler, runs `pelago check content/code` and `node scripts/highlight.mjs --check`, so an example that stops compiling, or a generated file that is stale, fails the build.

## Deploying on Vercel

Import the repository; `vercel.json` sets the build command (`node scripts/build.mjs`) and the output folder (`public`). No domain is written anywhere in the source. Canonical links, the sitemap and the Open Graph image URL use `SITE_URL` if set, otherwise Vercel's `VERCEL_PROJECT_PRODUCTION_URL`; with neither, pages use root-relative links.

## Brand

Colours: Pelago Teal `#0E7C86`, Lagoon `#5FD0C8`, Deep Sea `#0B2239`, Foam `#F4F6F8`. Wordmark outlined in the logo SVGs, text in Outfit. Rules: [`docs/design/brand.md`](https://github.com/pelagolang/pelago/blob/main/docs/design/brand.md).

## Licence

MIT OR Apache-2.0, at your option (`LICENSE-MIT`, `LICENSE-APACHE`). Outfit is under the SIL Open Font License (`src/assets/fonts/OFL.txt`).
