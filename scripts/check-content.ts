/**
 * Validates everything in /content and prints a status report.
 * Run with: pnpm content:check
 */
import path from "node:path";

import { isDueForReverification } from "../src/lib/content/freshness";
import { hasPlaceholders } from "../src/lib/content/integrity";
import {
  ContentError,
  loadFileContent,
} from "../src/lib/content/loaders/file-loader";

async function main() {
  const store = await loadFileContent(path.join(process.cwd(), "content"));

  console.log("✔ Content is valid\n");
  console.log(
    `  ${store.cities.length} cities · ${store.agencies.length} agencies · ` +
      `${store.offices.length} offices · ${store.services.length} services\n`,
  );

  for (const s of store.services) {
    const notes = [
      s.status,
      hasPlaceholders(s) && "has [VERIFY]",
      s.status === "published" &&
        isDueForReverification(s.lastVerified) &&
        "due for re-verification",
    ].filter(Boolean);
    console.log(`  ${s.city}/${s.slug}  (${notes.join(", ")})`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof ContentError ? error.message : error);
  process.exit(1);
});
