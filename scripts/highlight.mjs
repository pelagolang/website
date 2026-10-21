// Regenerates content/code/NAME.html (highlighted source) and NAME.out (program output) from every NAME.pel,
// using the `pelago` tool. Vercel has no Pelago binary, so the results are committed.
//   node scripts/highlight.mjs            rewrite the generated files
//   node scripts/highlight.mjs --check    fail if any generated file is stale (CI)
// The binary is `pelago` on PATH, or the path in the PELAGO environment variable.
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content", "code");
const pelago = process.env.PELAGO || "pelago";
const check = process.argv.includes("--check");

const names = readdirSync(dir).filter((f) => f.endsWith(".pel")).map((f) => f.slice(0, -4)).sort();
let stale = 0;

function put(file, text) {
  const old = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (old === text) return;
  if (check) {
    console.error(`stale: ${file}`);
    stale++;
  } else {
    writeFileSync(file, text);
    console.log(`wrote ${file}`);
  }
}

for (const name of names) {
  const src = join(dir, `${name}.pel`);
  const html = execFileSync(pelago, ["highlight", "--html", src], { encoding: "utf8" });
  put(join(dir, `${name}.html`), html);
  // Output of the program: standard output, then the stop message on standard error if it traps.
  const run = spawnSync(pelago, ["run", src], { encoding: "utf8" });
  put(join(dir, `${name}.out`), (run.stdout + run.stderr).trimEnd() + "\n");
}
if (stale) {
  console.error("run `node scripts/highlight.mjs` and commit the result");
  process.exit(1);
}
