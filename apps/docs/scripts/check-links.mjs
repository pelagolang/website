// Checks every link in the built docs (apps/docs/out): each internal href, resolved against the page it sits on the way a
// browser would, must reach a page or file that exists, and a #fragment must name an id on that page.
//
//   npm run build && node scripts/check-links.mjs        (BASE_PATH / NEXT_PUBLIC_BASE_PATH as in the build)
//
// Links to the marketing site (the pages in ../../src/pages, merged in at deploy time) are checked against that folder.
// Why this exists: a Markdown link such as `[Ownership](./ownership)` is left alone by Fumadocs and the browser resolves it
// against the page URL, which gives a 404. Inside a page, link to the file instead: `[Ownership](./ownership.md)`.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "out");
const marketing = join(here, "..", "..", "..", "src", "pages");
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? "").replace(/\/$/, "");
const origin = "http://site.test";

if (!existsSync(out)) {
  console.error("apps/docs/out is missing: run `npm run build` first");
  process.exit(2);
}

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "_next") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html")) pages.push(p);
  }
})(out);

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, "utf8");
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

/** The file a site path serves in the built docs, or null. */
function docsFile(path) {
  const f = join(out, decodeURIComponent(path));
  if (existsSync(f) && statSync(f).isFile()) return f;
  if (existsSync(f) && statSync(f).isDirectory() && existsSync(join(f, "index.html"))) return join(f, "index.html");
  return null;
}

/** Marketing pages: `/` is index.html, `/benchmarks/` is benchmarks.html, assets live under src/assets. */
function marketingFile(path) {
  const p = decodeURIComponent(path).replace(/^\/|\/$/g, "");
  if (p === "") return join(marketing, "index.html");
  const f = join(marketing, `${p}.html`);
  return existsSync(f) ? f : null;
}

const problems = [];
let checked = 0;
for (const page of pages) {
  const rel = page.slice(out.length).replace(/\\/g, "/").replace(/index\.html$/, "");
  // pages the docs app does not own at deploy time (redirect stubs, 404) are skipped
  if (rel === "/404.html" || rel.startsWith("/404/") || rel.startsWith("/_not-found")) continue;
  const pageUrl = new URL(base + rel, origin);
  const html = readFileSync(page, "utf8");
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
    const raw = decode(m[1]);
    if (!raw || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(raw) || raw.startsWith("//")) continue;
    checked++;
    const url = new URL(raw, pageUrl);
    if (url.origin !== origin) continue;
    let path = url.pathname;
    if (base) {
      if (path !== base && !path.startsWith(base + "/")) {
        problems.push(`${rel}: ${raw} -> ${url.pathname} is outside the base path ${base}`);
        continue;
      }
      path = path.slice(base.length) || "/";
    }
    let target = docsFile(path) ?? (path.startsWith("/docs") || /^\/[a-zA-Z]{2}(-[A-Za-z]+)?\/docs/.test(path) ? null : marketingFile(path));
    if (!target) {
      problems.push(`${rel}: link "${raw}" resolves to ${url.pathname}, which does not exist`);
      continue;
    }
    if (url.hash && target.startsWith(out) && !idsOf(target).has(decodeURIComponent(url.hash.slice(1)))) {
      problems.push(`${rel}: link "${raw}" points at #${url.hash.slice(1)}, which is not on ${url.pathname}`);
    }
  }
}

// The marketing pages link into the docs: those targets must exist too.
if (existsSync(marketing)) {
  for (const name of readdirSync(marketing).filter((n) => n.endsWith(".html"))) {
    const html = readFileSync(join(marketing, name), "utf8");
    for (const m of html.matchAll(/<a\s[^>]*?href="(\/[a-zA-Z]{2}(?:-[A-Za-z]+)?\/docs[^"]*)"/g)) {
      checked++;
      const [path, hash] = decode(m[1]).split("#");
      const target = docsFile(path);
      if (!target) problems.push(`src/pages/${name}: link "${m[1]}" does not exist in the docs`);
      else if (hash && !idsOf(target).has(hash)) problems.push(`src/pages/${name}: link "${m[1]}" points at a missing #${hash}`);
    }
  }
}

if (problems.length) {
  const unique = [...new Set(problems)];
  console.error(`${unique.length} broken link(s) in ${pages.length} pages:\n` + unique.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log(`${checked} links in ${pages.length} pages checked, 0 broken`);
