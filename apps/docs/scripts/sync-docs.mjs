// Copies the Pelago design docs from a checkout of pelagolang/pelago into content/docs, adding the frontmatter
// Fumadocs needs. The files in the compiler repository stay the source of truth: edit them there, then rerun.
//   node scripts/sync-docs.mjs <path to a pelago checkout>
// Migrated pages are .md (not .mdx), so braces and angle brackets in the text are never read as JSX.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const src = process.argv[2];
if (!src || !existsSync(join(src, "ROADMAP.md"))) {
  console.error("usage: node scripts/sync-docs.mjs <path to a pelago checkout>");
  process.exit(1);
}
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "docs");
const repo = "https://github.com/pelagolang/pelago/blob/main";

// [source file, page path under content/docs, title, description]
const pages = [
  ["docs/design/basics.md", "language/basics", "Basics", "Variables, constants and the basic types."],
  ["docs/design/functions.md", "language/functions", "Functions", "Parameters, access modes (let, inout, sink), closures and calls."],
  ["docs/design/types.md", "language/types", "Types", "struct, enum, obj and interface."],
  ["docs/design/switch.md", "language/switch", "switch", "One construct for choosing by value and by shape."],
  ["docs/design/list-patterns.md", "language/list-patterns", "List patterns", "Matching on the shape of a list."],
  ["docs/design/collections.md", "language/collections", "Collections and strings", "Lists, maps, sets, strings and builders."],
  ["docs/design/errors.md", "language/errors", "Errors and stops", "Results, options, the ? operator and stops."],
  ["docs/design/concurrency.md", "language/concurrency", "Concurrency", "Tasks, channels and async."],
  ["docs/design/memory.md", "language/memory", "Memory", "Layout and ownership extras."],
  ["docs/design/modules.md", "language/modules", "Modules and imports", "Packages, modules and how imports resolve."],
  ["docs/design/keywords.md", "language/keywords", "Keywords", "The keyword table, hard and soft."],
  ["docs/design/comments.md", "language/comments", "Comments", "Why Pelago has its own comment syntax: ///, //~ and their block forms."],
  ["docs/design/samples.md", "language/samples", "Sample programs", "Sample programs written against the decided syntax."],
  ["docs/design/lexer.md", "compiler/lexer", "Lexer", "Tokens and the rules the lexer follows."],
  ["docs/design/parser.md", "compiler/parser", "Parser", "The syntax tree and the syntax checks."],
  ["docs/design/checker.md", "compiler/checker", "Checker", "Names, types and value semantics."],
  ["docs/design/ir.md", "compiler/ir", "IR", "Lowering the checked program to the intermediate representation."],
  ["docs/design/backend.md", "compiler/backend", "Backend", "Native x86-64 code from the IR."],
  ["docs/design/vectorise.md", "compiler/vectorise", "Vectoriser", "Speed work for the native backend (card A-11)."],
  ["ROADMAP.md", "project/roadmap", "Roadmap", "The vision, the decisions table and the phases."],
  ["docs/NEXT.md", "project/next", "Where we stopped", "What is done and what comes next."],
  ["docs/design/brand.md", "project/brand", "Brand", "The logo, colours and fonts."],
  ["docs/contributing/commits.md", "project/commits", "Commits and PR titles", "Conventional Commits in the Pelago repositories."],
  ["docs/contributing/pr-scenarios.md", "project/pr-scenarios", "PR scenarios", "How to fill in the pull request template for each kind of change."],
];

const urlOf = new Map(pages.map(([s, p]) => [s.split("/").pop(), `/docs/${p}`]));
const yaml = (s) => JSON.stringify(s);

// Folders written by this script; hand-written pages (index.mdx, meta.json) are left alone.
for (const dir of ["language", "compiler", "project"]) rmSync(join(out, dir), { recursive: true, force: true });

for (const [file, page, title, description] of pages) {
  let text = readFileSync(join(src, file), "utf8");
  text = text.replace(/^# .*\n+/, ""); // the title moves into the frontmatter
  text = text.replace(/\]\(([^)#]+?)(#[^)]*)?\)/g, (m, target, hash = "") => {
    if (/^(https?:|mailto:)/.test(target)) return m;
    const name = target.split("/").pop();
    if (urlOf.has(name)) return `](${urlOf.get(name)}${hash})`;
    const base = dirname(file);
    const parts = (target.startsWith("/") ? target.slice(1) : join(base, target)).split("/");
    return `](${repo}/${parts.join("/")}${hash})`;
  });
  const dest = join(out, `${page}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `---\ntitle: ${yaml(title)}\ndescription: ${yaml(description)}\n---\n\n${text.trimEnd()}\n`);
}

const meta = (title, list) => JSON.stringify({ title, pages: list }, null, 2) + "\n";
const names = (dir) => pages.filter(([, p]) => p.startsWith(dir + "/")).map(([, p]) => p.split("/")[1]);
writeFileSync(join(out, "language", "meta.json"), meta("Language", names("language")));
writeFileSync(join(out, "compiler", "meta.json"), meta("Compiler", names("compiler")));
writeFileSync(join(out, "project", "meta.json"), meta("Project", names("project")));
console.log(`wrote ${pages.length} pages`);
