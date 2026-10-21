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
  console.log(
    `  ${store.cities.length} cities, ${store.agencies.length} agencies, ` +
      `${store.offices.length} offices, ${store.services.length} guides\n`,
  );

  for (const s of store.services) {
    const notes = [
      s.status,
      hasPlaceholders(s) && `has ${VERIFY}`,
      s.status === "published" &&
        isDueForReverification(s.lastVerified) &&
        "due for re-verification",
    ].filter(Boolean);
    console.log(`  ${s.city}/${s.slug}  (${notes.join(", ")})`);
  }

  if (process.argv.includes("--todo")) await printTodo();
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
