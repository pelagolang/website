# Pelago docs

The documentation site, built with [Fumadocs](https://fumadocs.dev) on Next.js. It is a separate app from the marketing site in the repository root: its own `package.json`, lockfile and Vercel project.

```
cd apps/docs
npm ci
npm run dev        # http://localhost:3000/docs
npm run build
```

Node 22 or later. The same commands work in PowerShell.

## Content

Pages are in `content/docs`; `meta.json` files order them. `index.mdx` is hand-written. The pages under `language/`, `compiler/` and `project/` are **copies** of the design documents in [`pelagolang/pelago`](https://github.com/pelagolang/pelago), which stay the source of truth. Do not edit the copies; change the file in the compiler repository, then refresh:

```
node scripts/sync-docs.mjs ..\..\..\pelago     # path to a checkout of pelagolang/pelago
```

The script adds the frontmatter, rewrites links between documents and to repository files, and writes `.md` files (not `.mdx`) so braces and angle brackets in the text are never read as JSX. To add a page, add a line to the `pages` list in the script.

Do not edit `.source/`: Fumadocs MDX generates it.

## Brand

Colours and font follow the brand kit (teal, lagoon, deep sea, foam; Outfit). Logos in `public/brand` and the icons in `app/` are copies of `assets/brand` in the compiler repository. Outfit is under the SIL Open Font License (`app/fonts/OFL.txt`).

## Deploying on Vercel

Create a second Vercel project from this repository and set **Root Directory** to `apps/docs`; the Next.js preset does the rest. No domain is hard-coded: `SITE_URL` or Vercel's production URL sets `metadataBase`. Keep the docs under `/docs` so they can be served from a subdomain (`docs.example.com`) or routed from the main domain later.
