import type { Options } from "minisearch";

/**
 * One searchable thing: a guide or an agency's offices. Built on the server
 * at build time (build-index.ts), searched in the browser (search-box.tsx).
 */
export type SearchDoc = {
  id: string;
  kind: "guide" | "office";
  title: string;
  summary: string;
  keywords: string;
  /** Agency name for guides; acronym/old names for offices. */
  agency: string;
  category: string;
  url: string;
};

// Words that carry no meaning in a search like "paano kumuha ng birth
// certificate" or "how do I get a passport". English + Filipino.
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "my",
  "i",
  "how",
  "do",
  "get",
  "need",
  "where",
  "what",
  "is",
  "can",
  "ang",
  "ng",
  "sa",
  "mga",
  "na",
  "ko",
  "ako",
  "paano",
  "kumuha",
  "saan",
  "magkano",
  "ano",
  "para",
  "po",
]);

/** Lowercase, strip accents (ñ → n), drop stop words. */
function processTerm(term: string): string | null {
  const clean = term
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return STOP_WORDS.has(clean) ? null : clean;
}

export const searchOptions: Options<SearchDoc> = {
  fields: ["title", "keywords", "summary", "agency", "category"],
  storeFields: ["kind", "title", "summary", "agency", "url"],
  processTerm,
  searchOptions: {
    // A match in the title or keywords matters more than one in the summary.
    boost: { title: 3, keywords: 3, agency: 1.5 },
    prefix: true, // "cert" finds "certificate" while typing
    fuzzy: 0.2, // tolerate small typos: "licence", "pasport"
    combineWith: "OR",
  },
};
