import { describe, expect, it } from "vitest";

import { stripQuery } from "@/features/analytics/strip-query";

describe("stripQuery", () => {
  it("drops the search words", () => {
    expect(stripQuery("https://govguide.example/search?q=juan+dela+cruz")).toBe(
      "https://govguide.example/search",
    );
  });

  it("drops a #hash", () => {
    expect(stripQuery("https://govguide.example/services/x#steps")).toBe(
      "https://govguide.example/services/x",
    );
  });

  it("leaves a plain address alone", () => {
    expect(stripQuery("https://govguide.example/sorsogon")).toBe(
      "https://govguide.example/sorsogon",
    );
  });
});
