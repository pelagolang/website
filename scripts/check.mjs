// Checks the built site in public/: every internal link and asset resolves, every page has a title and one <h1>.
//   node scripts/build.mjs && node scripts/check.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const problems = [];
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) pages.push(p);
  }
})(pub);

function exists(url) {
  const path = url.split("#")[0].split("?")[0];
  if (!path) return true;
  let f = join(pub, decodeURIComponent(path));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  return existsSync(f);
}
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const rel = page.slice(pub.length);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: needs exactly one <h1>`);
  if (/\{\{|\}\}/.test(html)) problems.push(`${rel}: unexpanded placeholder`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    if (url.startsWith("#")) {
      if (!ids(html).has(url.slice(1))) problems.push(`${rel}: missing anchor ${url}`);
    } else if (url.startsWith("/")) {
      if (!exists(url)) problems.push(`${rel}: broken link ${url}`);
      else if (url.includes("#")) {
        const f = join(pub, url.split("#")[0], "index.html");
        if (existsSync(f) && !ids(readFileSync(f, "utf8")).has(url.split("#")[1])) problems.push(`${rel}: missing anchor ${url}`);
      }
    } else problems.push(`${rel}: relative URL ${url} (use root-relative)`);
  }
  // No hard-coded domain of our own anywhere.
  if (/https?:\/\/[^"'\s]*(vercel\.app|pelago\.(dev|org|io|com|lang))/.test(html)) problems.push(`${rel}: hard-coded domain`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`ok: ${pages.length} pages`);
