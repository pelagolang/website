// Builds the static site: src/pages/*.html + src/layout.html + content/ -> public/. No dependencies.
//   node scripts/build.mjs
// Absolute URLs (canonical, Open Graph image) use SITE_URL, or Vercel's VERCEL_PROJECT_PRODUCTION_URL when set;
// with neither, the pages use root-relative URLs and no domain is written anywhere.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public");
const read = (...p) => readFileSync(join(root, ...p), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let site = (process.env.SITE_URL || "").trim();
if (!site && process.env.VERCEL_PROJECT_PRODUCTION_URL) site = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
site = site.replace(/\/$/, "");

const layout = read("src", "layout.html");
const nav = [
  ["tour", "/tour/", "Tour"],
  ["docs", "/docs/", "Docs"],
  ["benchmarks", "/benchmarks/", "Benchmarks"],
  ["install", "/install/", "Install"],
  ["editors", "/editors/", "Editors"],
];

function code(name, { run = true } = {}) {
  const html = read("content", "code", `${name}.html`).trim();
  const src = read("content", "code", `${name}.pel`);
  let s = `<figure class="code"><div class="code-bar"><span>${name}.pel</span><button type="button" class="copy" data-copy hidden>Copy</button></div>${html}<textarea hidden data-source>${esc(src)}</textarea>`;
  if (run) {
    s += `<figcaption><span class="out-label">output</span><pre class="out"><code>${esc(read("content", "code", `${name}.out`).trimEnd())}</code></pre></figcaption>`;
  }
  return s + "</figure>";
}

function bench() {
  const data = JSON.parse(read("content", "bench.json"));
  const max = Math.max(...data.rows.map((r) => Math.max(r.pelago, r.c_o2, r.rust)));
  const f = (x) => x.toFixed(3);
  const r = (x) => `${x.toFixed(2)}×`;
  const rows = data.rows
    .map((row) => {
      const bar = (v, cls) => `<span class="bar ${cls}" style="width:${((v / max) * 100).toFixed(1)}%"></span>`;
      const win = row.ratio_o2 <= 1 ? "win" : "lose";
      return `<tr><th scope="row">${row.name}</th><td class="bars"><span class="bar-row">${bar(row.pelago, "p")}<i>${f(row.pelago)}</i></span><span class="bar-row">${bar(row.c_o2, "c")}<i>${f(row.c_o2)}</i></span><span class="bar-row">${bar(row.rust, "r")}<i>${f(row.rust)}</i></span></td><td class="num ${win}">${r(row.ratio_o2)}</td><td class="num ${row.ratio_rust <= 1 ? "win" : "lose"}">${r(row.ratio_rust)}</td></tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table class="bench"><thead><tr><th>program</th><th>seconds, best of ${data.runs} <span class="legend"><b class="p"></b>Pelago <b class="c"></b>C -O2 <b class="r"></b>Rust -O</span></th><th>vs C -O2</th><th>vs Rust</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">geometric mean</th><td></td><td class="num">${r(data.geomean_c)}</td><td class="num">${r(data.geomean_rust)}</td></tr></tfoot></table></div>`;
}

function expand(text) {
  return text
    .replace(/\{\{code:([\w-]+)(?::(norun))?\}\}/g, (_, n, flag) => code(n, { run: flag !== "norun" }))
    .replace(/\{\{bench\}\}/g, bench)
    .replace(/\{\{bench:(\w+)\}\}/g, (_, k) => String(JSON.parse(read("content", "bench.json"))[k]));
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = readdirSync(join(root, "src", "pages")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const raw = read("src", "pages", file);
  const meta = {};
  const body = raw.replace(/^<!--([\s\S]*?)-->\s*/, (_, block) => {
    for (const line of block.trim().split("\n")) {
      const i = line.indexOf(":");
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return "";
  });
  const name = file.slice(0, -5);
  const path = name === "index" ? "/" : name === "404" ? "/404.html" : `/${name}/`;
  const title = meta.title ? `${meta.title} · Pelago` : "Pelago · A self-hosting systems language";
  const navHtml = nav
    .map(([key, href, label]) => `<a href="${href}"${key === meta.nav ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  const page = layout
    .replace(/\{\{title\}\}/g, esc(title))
    .replace(/\{\{description\}\}/g, esc(meta.description || "Pelago is a self-hosting systems language. Native code. No GC. No runtime."))
    .replace(/\{\{nav\}\}/g, navHtml)
    .replace(/\{\{canonical\}\}/g, site ? `<link rel="canonical" href="${site}${path}">` : "")
    .replace(/\{\{og_image\}\}/g, `${site}/assets/brand/og-1200x630.png`)
    .replace(/\{\{content\}\}/g, () => expand(body));
  const dest = name === "index" || name === "404" ? join(out, `${name}.html`) : join(out, name, "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, page);
}

cpSync(join(root, "src", "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "src", "static"), out, { recursive: true });
writeFileSync(
  join(out, "robots.txt"),
  `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ""}`
);
if (site) {
  const urls = pages.filter((f) => f !== "404.html").map((f) => (f === "index.html" ? "/" : `/${f.slice(0, -5)}/`));
  writeFileSync(
    join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${site}${u}</loc></url>`).join("\n")}\n</urlset>\n`
  );
}
console.log(`built ${pages.length} pages into public/${site ? ` (site ${site})` : " (no site URL, relative links)"}`);
