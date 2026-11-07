// Compiles every Pelago code sample in the docs and compares the printed output with the block that follows it.
//
//   node scripts/check-samples.mjs            uses `pelago` from PATH, or $PELAGO
//
// Conventions for fenced blocks in content/docs/en-US:
//   ```pelago          a complete program (it has `fn main`): it must run, and when the next block is ```text its output must match
//   ```pelago error    a program that must fail to check; the next ```text block names the message it must contain
//   ```pelago exit     like a program, but it may end with a non-zero status
//   ```pelago frag     a fragment: only checked for syntax by wrapping it in a file with no `main` (must parse, names must resolve)
//   ```sh, ```text     never run
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "docs", "en-US");
const pelago = process.env.PELAGO || "pelago";
const tmp = mkdtempSync(join(tmpdir(), "pelago-docs-"));

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.mdx?$/.test(name)) yield p;
  }
}

function blocks(text) {
  const out = [];
  const re = /^```([^\n]*)\n([\s\S]*?)^```$/gm;
  let m;
  while ((m = re.exec(text))) {
    out.push({ info: m[1].trim(), code: m[2], line: text.slice(0, m.index).split("\n").length });
  }
  return out;
}

let failures = 0;
let checked = 0;
let n = 0;
const fail = (file, line, msg) => {
  failures++;
  console.error(`${relative(root, file)}:${line}: ${msg}`);
};

for (const file of files(root)) {
  const bs = blocks(readFileSync(file, "utf8"));
  bs.forEach((b, i) => {
    const [lang, kind] = b.info.split(/\s+/);
    if (lang !== "pelago") return;
    const next = bs[i + 1] && bs[i + 1].info === "text" ? bs[i + 1] : null;
    const src = join(tmp, `sample${n++}.pel`);
    writeFileSync(src, b.code);
    checked++;
    if (kind === "error") {
      const r = spawnSync(pelago, ["check", src], { encoding: "utf8" });
      if (r.status === 0) return fail(file, b.line, "expected an error, but the sample checks");
      if (next) {
        const want = next.code.trim().replace(/^[^ ]*: error: /, "");
        if (!(r.stdout + r.stderr).includes(want)) fail(file, b.line, `message not found: ${want}\n${r.stdout}${r.stderr}`);
      }
    } else if (kind === "frag") {
      const r = spawnSync(pelago, ["check", src], { encoding: "utf8" });
      if (r.status !== 0) fail(file, b.line, `fragment does not check:\n${r.stdout}${r.stderr}`);
    } else {
      if (!/fn main/.test(b.code)) return fail(file, b.line, "complete program needs `fn main` (use `pelago frag` for fragments)");
      const r = spawnSync(pelago, ["run", src], { encoding: "utf8" });
      if (r.status !== 0 && kind !== "exit" && !(next && /^stopped:/.test(next.code))) return fail(file, b.line, `does not run:\n${r.stdout}${r.stderr}`);
      if (next && r.stdout.trim() !== next.code.trim() && !(r.stdout + r.stderr).includes(next.code.trim()))
        fail(file, b.line, `output differs.\nexpected:\n${next.code.trim()}\nactual:\n${(r.stdout + r.stderr).trim()}`);
    }
  });
}
console.log(`${checked} samples checked, ${failures} problems`);
process.exit(failures ? 1 : 0);
