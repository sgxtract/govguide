import { afterEach, describe, expect, it, vi } from "vitest";

import { readCity, resolveCity, writeCity } from "@/features/cities/city-store";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resolveCity", () => {
  it("one city is always chosen", () => {
    expect(resolveCity("x", ["a"])).toEqual({ chosen: "a" });
  });

  it("uses the stored city when this guide has it", () => {
    expect(resolveCity("b", ["a", "b"])).toEqual({ chosen: "b" });
  });

  it("reports a stored city this guide doesn't have", () => {
    expect(resolveCity("c", ["a", "b"])).toEqual({ missing: "c" });
  });

  it("chooses nothing when nothing is stored", () => {
    expect(resolveCity(null, ["a", "b"])).toEqual({});
  });
});

describe("city store", () => {
  it("still remembers the choice when storage throws", () => {
    const blocked = () => {
      throw new Error("blocked");
    };
    vi.stubGlobal("localStorage", {
      getItem: blocked,
      setItem: blocked,
      removeItem: blocked,
    });
    vi.stubGlobal("window", { dispatchEvent: () => true });

    writeCity("otherville");

    expect(readCity()).toBe("otherville");
  });
});
