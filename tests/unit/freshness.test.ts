import { describe, expect, it } from "vitest";

import { isDueForReverification } from "@/lib/content/freshness";

const today = new Date("2026-10-20T00:00:00Z");

describe("isDueForReverification", () => {
  it("is not due within 6 months", () => {
    expect(isDueForReverification("2026-05-01", today)).toBe(false);
  });

  it("is due exactly 6 months later", () => {
    expect(isDueForReverification("2026-04-20", today)).toBe(true);
  });

  it("is due when never verified", () => {
    expect(isDueForReverification("[VERIFY]", today)).toBe(true);
  });
});
