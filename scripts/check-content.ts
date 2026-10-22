/**
 * Validates everything in /content and prints a status report.
 *
 *   pnpm content:check   validate, then one line per guide
 *   pnpm content:todo    also list every [VERIFY] still to fill in, by file and line
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { isDueForReverification } from "../src/lib/content/freshness";
import { hasPlaceholders } from "../src/lib/content/integrity";
import {
  ContentError,
  loadFileContent,
} from "../src/lib/content/loaders/file-loader";
import { VERIFY } from "../src/lib/content/verify";

const root = path.join(process.cwd(), "content");

async function main() {
  const store = await loadFileContent(root);

  console.log("✔ Content is valid\n");
  const local = store.services.filter((s) => s.scope === "local");
  console.log(
    `  ${store.cities.length} cities, ${store.agencies.length} agencies, ` +
      `${store.offices.length} offices, ${store.services.length} guides ` +
      `(${store.services.length - local.length} national, ${local.length} local), ` +
      `${store.cityServices.length} city files\n`,
  );

  for (const s of store.services) {
    if (s.scope === "national") {
      console.log(`  ${s.slug}  (${notes(s).join(", ")})`);
      continue;
    }
    console.log(`  ${s.slug}  (local)`);
    for (const version of store.cityServices) {
      if (version.scope === "local" && version.slug === s.slug) {
        console.log(`    ${version.city}: ${notes(version).join(", ")}`);
      }
    }
  }

  if (process.argv.includes("--todo")) await printTodo();
}

/** "published, has [VERIFY], due for re-verification" for one guide. */
function notes(guide: { status: string; lastVerified: string }): string[] {
  return [
    guide.status,
    hasPlaceholders(guide) && `has ${VERIFY}`,
    guide.status === "published" &&
      isDueForReverification(guide.lastVerified) &&
      "due for re-verification",
  ].filter((note): note is string => typeof note === "string");
}

/** Every line that still contains [VERIFY], grouped by file. */
async function printTodo() {
  const files = (await readdir(root, { recursive: true }))
    .filter((f) => f.endsWith(".yaml"))
    .sort();

  let total = 0;
  console.log(`\n${VERIFY} still to fill in:\n`);
  for (const file of files) {
    const lines = (await readFile(path.join(root, file), "utf8")).split("\n");
    const hits = lines
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      // Comments explain the convention; they aren't values.
      .filter(({ line }) => line.includes(VERIFY) && !line.startsWith("#"));
    if (hits.length === 0) continue;
    total += hits.length;
    console.log(`  content/${file}  (${hits.length})`);
    for (const { line, n } of hits) console.log(`    ${n}: ${line}`);
  }
  console.log(
    total === 0
      ? `\n✔ No ${VERIFY} left.`
      : `\n${total} values to verify. When a guide has none left, set status: published.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof ContentError ? error.message : error);
  process.exit(1);
});
