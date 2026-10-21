# Pelago docs

The documentation site, built with [Fumadocs](https://fumadocs.dev) on Next.js. It is a separate app from the marketing site in the repository root: its own `package.json` and lockfile.

```
cd apps/docs
npm ci
npm run dev        # http://localhost:3000/docs
npm run build
```

Node 22 or later. The same commands work in PowerShell.

## Content

Pages are in `content/docs/<language>/`; `meta.json` files order them. The three sections (`language/`, `compiler/`, `project/`) are root folders, so they show as tabs and the sidebar shows only the open one. `index.mdx` is hand-written. The pages under the sections are **copies** of the design documents in [`pelagolang/pelago`](https://github.com/pelagolang/pelago), which stay the source of truth. Do not edit the copies; change the file in the compiler repository, then refresh:

```
node scripts/sync-docs.mjs ..\..\..\pelago     # path to a checkout of pelagolang/pelago
```

The script adds the frontmatter, rewrites links between documents and to repository files, and writes `.md` files (not `.mdx`) so braces and angle brackets in the text are never read as JSX. To add a page, add a line to the `pages` list in the script.

## Changelog

`/changelog` lists the GitHub releases of `pelagolang/pelago` and `/changelog/vscode` those of `pelagolang/vscode-pelago`, using Fumadocs' changelog component (`components/changelog.tsx`, installed with `npx @fumadocs/cli add changelog`) and `@fumadocs/changelog`. Pages are cached for an hour. GitHub allows 60 unauthenticated requests an hour; set a `GITHUB_TOKEN` environment variable on the host to raise that. While a repository has no releases the page says so, and if GitHub cannot be reached it says that instead of failing.

## Languages

`lib/i18n.ts` lists the languages: US English (default), UK English, Spanish, Chinese (zh-CN), Russian, Arabic (right to left), French and German. Each has a folder in `content/docs/` with the same layout (`index.mdx`, `meta.json`, `language/`, `compiler/`, `project/`). Every language has its own prefix: `/en-US/docs/...`, `/es/docs/...`.

A page missing in a language falls back to US English, so a language is translated page by page: copy the page from `en-US/` into the language folder at the same path and translate it (keep the frontmatter keys). To translate a section title, edit that folder's `meta.json` (`title`, `description`). UI text (search, table of contents, buttons) is in `lib/layout.shared.tsx`; `zh-CN` uses the official language pack, the others cover the visible strings and fall back to English for the rest. Pages translated by hand are not touched by the sync script, which only writes `en-US/`.

## Versions

Not set up: Pelago has no released versions yet. When it does, follow Fumadocs' root type pattern: one folder per version, each with `{"title": "0.1", "root": "version"}` in its `meta.json`, and the docs layout gets a version switcher.

Do not edit `.source/`: Fumadocs MDX generates it.

## Brand

Colours and font follow the brand kit (teal, lagoon, deep sea, foam; Outfit). Logos in `public/brand` and the icons in `app/` are copies of `assets/brand` in the compiler repository. Outfit is under the SIL Open Font License (`app/fonts/OFL.txt`).

## Deploying on GitHub Pages

The app is a static export (`output: 'export'`): `npm run build` writes plain files to `out/`. The Pages workflow in the repository root builds it with the marketing site and publishes both (see the root README). Because nothing runs on a server:

- there is no middleware, so every language, English included, has its own prefix (`/en-US/docs/...`) and `/` is a small redirect page;
- search is built once and runs in the browser (`/api/search` is a static JSON file);
- the changelog is fetched at build time; the workflow rebuilds daily to pick up releases;
- `NEXT_PUBLIC_BASE_PATH` sets the folder the site is served from (`/website` on a project site). Leave it unset for a custom domain or a local build.

Set `SITE_URL` for absolute URLs in the page metadata; no domain is hard-coded.
