// Keeps the translated docs in step with the US English source (content/docs/en-US). No translation service is
// called: pages are translated by a person or by Claude in a normal session (see TRANSLATING.md), and this script
// tells you what needs doing, checks the result, and records it.
//
//   node scripts/translations.mjs status [--lang ar,de] [--json]   what is missing or out of date
//   node scripts/translations.mjs prepare <lang> <page>            print a page with heading ids, ready to translate
//   node scripts/translations.mjs check [--lang ..] [--page ..]    validate every translated page against its source
//   node scripts/translations.mjs record [--lang ..] [--page ..]   check, then mark translated pages as current
//
// <page> is a path under en-US without the extension: `language/switch`, `index`, `language/meta` (the folder's meta.json).
// translations.lock.json stores, per language and page, a hash of the English source it was translated from. A page
// whose English source changed since then shows as stale. A page that has no entry but exists is "unrecorded".
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "content", "docs");
const source = join(docs, "en-US");
const lockFile = join(root, "translations.lock.json");

export const LANGUAGES = {
  "en-GB": "British English",
  es: "Spanish",
  "zh-CN": "Simplified Chinese",
  ru: "Russian",
  ar: "Arabic",
  fr: "French",
  de: "German",
};

const sha = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

// Headings get an explicit id from their English text, so translated pages keep the same anchors.
function slugger() {
  const seen = new Map();
  return (text) => {
    const slug = text.toLowerCase().replace(/`/g, "").replace(/[^\p{L}\p{N}\p{M}_\- ]/gu, "").trim().replace(/ /g, "-");
    const n = seen.get(slug) ?? 0;
    seen.set(slug, n + 1);
    return n ? `${slug}-${n}` : slug;
  };
}
function eachHeading(body, fn) {
  let fence = false;
  return body.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && /^(#{1,6}) (.+?)\s*$/.exec(line);
    return m ? fn(m[1], m[2], line) : line;
  });
}
export function withHeadingIds(body) {
  const slug = slugger();
  return eachHeading(body, (hashes, text, line) => (/\[#[^\]]+\]\s*$/.test(text) ? line : `${hashes} ${text} [#${slug(text)}]`)).join("\n");
}
const headingIds = (body) => eachHeading(body, (_h, text) => /\[#([^\]]+)\]\s*$/.exec(text)?.[1] ?? "").filter(Boolean);

const fences = (t) => (t.match(/^\s*(```|~~~)/gm) || []).length;
const targets = (t) => [...t.matchAll(/\]\(([^)\s]+)/g)].map((m) => m[1]).sort().join("\n");

/** Problems with a translated page, as a list of messages (empty when it looks right). */
export function problems(rel, src, out) {
  if (rel.endsWith(".json")) {
    try {
      const a = JSON.parse(src);
      const b = JSON.parse(out);
      const keys = (o) => Object.keys(o).sort().join();
      return keys(a) === keys(b) && JSON.stringify(a.pages) === JSON.stringify(b.pages) && a.root === b.root ? [] : ["meta.json keys, `root` or `pages` differ from the source"];
    } catch (e) {
      return [`invalid JSON: ${e.message}`];
    }
  }
  const p = [];
  const s = withHeadingIds(src);
  if (!/^---\n[\s\S]*?\n---\n/.test(out)) p.push("frontmatter is missing");
  if (!/^title: /m.test(out)) p.push("frontmatter has no title");
  if (fences(s) !== fences(out)) p.push(`code fences: ${fences(s)} in the source, ${fences(out)} here`);
  const a = headingIds(s).join(" ");
  const b = headingIds(out).join(" ");
  if (a !== b) p.push("heading ids differ from the source (every heading must end with the same [#id] as in `prepare` output)");
  if (targets(s) !== targets(out)) p.push("link targets differ from the source");
  return p;
}

const args = process.argv.slice(2);
const cmd = args[0] ?? "status";
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const langs = (opt("lang") ? opt("lang").split(",") : Object.keys(LANGUAGES)).filter((l) => LANGUAGES[l] || console.error(`unknown language ${l}`));
const onlyPage = opt("page");
const lock = existsSync(lockFile) ? JSON.parse(readFileSync(lockFile, "utf8")) : { pages: {} };

const pages = walk(source)
  .map((p) => relative(source, p).replaceAll("\\", "/"))
  .filter((p) => /\.(md|mdx)$/.test(p) || p.endsWith("meta.json"))
  .filter((p) => !onlyPage || p.replace(/\.(md|mdx)$/, "").replace(/\.json$/, "") === onlyPage)
  .filter((p) => p !== "meta.json" || onlyPage) // the root meta.json lists folders only; it is copied, not translated
  .sort();
const pageName = (rel) => rel.replace(/\.(md|mdx)$/, "").replace(/\.json$/, "");

function stateOf(lang, rel) {
  const target = join(docs, lang, rel);
  const entry = lock.pages[`${lang}/${rel}`];
  const current = sha(readFileSync(join(source, rel), "utf8"));
  if (!existsSync(target)) return "missing";
  if (!entry) return "unrecorded";
  return entry.source === current ? "ok" : "stale";
}

if (cmd === "status") {
  const rows = [];
  for (const lang of langs) for (const rel of pages) rows.push({ lang, page: pageName(rel), file: rel, state: stateOf(lang, rel) });
  if (args.includes("--json")) {
    console.log(JSON.stringify(rows.filter((r) => r.state !== "ok"), null, 2));
  } else {
    for (const lang of langs) {
      const mine = rows.filter((r) => r.lang === lang);
      const count = (s) => mine.filter((r) => r.state === s).length;
      console.log(`${lang.padEnd(6)} ok ${count("ok")}  stale ${count("stale")}  missing ${count("missing")}  unrecorded ${count("unrecorded")}   (${mine.length} pages)`);
    }
    const todo = rows.filter((r) => r.state === "missing" || r.state === "stale");
    if (todo.length) console.log(`\n${todo.length} page${todo.length === 1 ? "" : "s"} to translate; list them with --json`);
  }
} else if (cmd === "prepare") {
  const [, lang, page] = args;
  const rel = pages.find((p) => pageName(p) === page) ?? (existsSync(join(source, `${page}.json`)) ? `${page}.json` : undefined);
  if (!rel || !LANGUAGES[lang]) {
    console.error("usage: prepare <lang> <page>   (e.g. prepare ar language/switch)");
    process.exit(1);
  }
  const text = readFileSync(join(source, rel), "utf8");
  process.stdout.write(rel.endsWith(".json") ? text : withHeadingIds(text));
} else if (cmd === "check" || cmd === "record") {
  let bad = 0;
  let recorded = 0;
  for (const lang of langs) {
    for (const rel of pages) {
      const target = join(docs, lang, rel);
      if (!existsSync(target)) continue;
      const srcText = readFileSync(join(source, rel), "utf8");
      const out = readFileSync(target, "utf8");
      if (out === srcText) continue; // still the English copy
      const found = problems(rel, srcText, out);
      if (found.length) {
        bad++;
        console.error(`${lang}/${rel}:\n  - ${found.join("\n  - ")}`);
        continue;
      }
      if (cmd === "record" && stateOf(lang, rel) !== "ok") {
        lock.pages[`${lang}/${rel}`] = { source: sha(srcText) };
        recorded++;
      }
    }
  }
  if (cmd === "record") {
    writeFileSync(lockFile, JSON.stringify({ pages: Object.fromEntries(Object.entries(lock.pages).sort()) }, null, 2) + "\n");
    console.log(`recorded ${recorded} page${recorded === 1 ? "" : "s"}`);
  }
  if (bad) {
    console.error(`${bad} translated page${bad === 1 ? "" : "s"} failed the checks`);
    process.exit(1);
  }
  if (cmd === "check") console.log("ok");
} else {
  console.error("commands: status, prepare, check, record");
  process.exit(1);
}
