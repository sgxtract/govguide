import { describe, expect, it } from "vitest";

import { parseTicked } from "@/features/services/checklist-store";

describe("parseTicked", () => {
  it("reads a saved list of ticked labels", () => {
    expect(parseTicked('["Valid ID","Photo"]')).toEqual(["Valid ID", "Photo"]);
  });

  it("starts empty when nothing is saved or the data is broken", () => {
    expect(parseTicked(null)).toEqual([]);
    expect(parseTicked("not json")).toEqual([]);
    expect(parseTicked('{"a":1}')).toEqual([]);
    expect(parseTicked('["ok", 3, null]')).toEqual(["ok"]);
  });
});
