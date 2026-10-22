import MiniSearch from "minisearch";
import { describe, expect, it } from "vitest";

import { searchOptions, type SearchDoc } from "@/features/search/engine";

const docs: SearchDoc[] = [
  {
    id: "guide:license",
    kind: "guide",
    title: "Get a new driver's license",
    summary: "Apply for your first driver's license.",
    keywords: "lisensya driving license",
    agency: "Land Transportation Office (LTO)",
    category: "Vehicles & Driving",
    url: "/services/license",
  },
  {
    id: "guide:birth",
    kind: "guide",
    title: "Get a copy of your birth certificate",
    summary: "Request a certified copy.",
    keywords: "birth cert NSO",
    agency: "Philippine Statistics Authority (PSA)",
    category: "IDs & Documents",
    url: "/services/birth",
  },
];

function search(query: string): string[] {
  const index = new MiniSearch<SearchDoc>(searchOptions);
  index.addAll(docs);
  return index.search(query).map((r) => r.id as string);
}

describe("search", () => {
  it("finds a guide by an everyday Filipino word", () => {
    expect(search("lisensya")[0]).toBe("guide:license");
  });

  it("ignores filler words in a full question", () => {
    expect(search("paano kumuha ng birth certificate")[0]).toBe("guide:birth");
  });

  it("tolerates a small typo", () => {
    expect(search("licence")[0]).toBe("guide:license");
  });

  it("matches while the word is still being typed", () => {
    expect(search("certif")[0]).toBe("guide:birth");
  });

  it("finds a guide by an old agency name", () => {
    expect(search("NSO")[0]).toBe("guide:birth");
  });

  it("returns nothing for an unrelated word", () => {
    expect(search("passport")).toEqual([]);
  });
});
