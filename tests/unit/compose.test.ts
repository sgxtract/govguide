import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  composeCityHub,
  composeGuide,
  composeListings,
  composeOffices,
  composePopular,
} from "@/lib/content/compose";
import {
  loadFileContent,
  type ContentStore,
} from "@/lib/content/loaders/file-loader";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/content");
const DEV = { showDrafts: true };
const PROD = { showDrafts: false };

let store: ContentStore;
beforeAll(async () => {
  store = await loadFileContent(FIXTURES);
});

/** A copy of the fixture store that one test can change. */
const copy = () => structuredClone(store);

function cityVersion(s: ContentStore, city: string, slug: string) {
  const found = s.cityServices.find((c) => c.city === city && c.slug === slug);
  if (!found) throw new Error(`no ${city}/${slug}`);
  return found;
}

describe("composeGuide", () => {
  it("national guide gets each city's offices for its agency", () => {
    const guide = composeGuide(store, "get-a-test-permit", PROD);

    expect(
      guide?.cities.map((c) => [c.city.slug, c.offices.map((o) => o.slug)]),
    ).toEqual([
      ["otherville", ["otherville-office"]],
      ["testville", ["testville-main-office"]],
    ]);
    expect(guide?.agency?.slug).toBe("test-permits-agency");
    expect(
      guide?.cities.find((c) => c.city.slug === "testville")?.tips,
    ).toEqual(["Photocopy shop across the street."]);
  });

  it("a city file's offices replace the default", () => {
    const s = copy();
    const extra = cityVersion(s, "testville", "get-a-test-permit");
    if (extra.scope === "national") extra.offices = [];

    const testville = composeGuide(s, "get-a-test-permit", PROD)?.cities.find(
      (c) => c.city.slug === "testville",
    );
    expect(testville?.offices).toEqual([]);
    expect(testville?.tips).toEqual(["Photocopy shop across the street."]);
  });

  it("a city drops out when its only office has [VERIFY] in production", () => {
    const s = copy();
    const office = s.offices.find((o) => o.slug === "otherville-office");
    if (office) office.address = "[VERIFY]";

    expect(
      composeGuide(s, "get-a-test-permit", PROD)?.cities.map(
        (c) => c.city.slug,
      ),
    ).toEqual(["testville"]);
    expect(composeGuide(s, "get-a-test-permit", DEV)?.cities).toHaveLength(2);
  });

  it("hides an unverified city file's tips in production", () => {
    const s = copy();
    const extra = cityVersion(s, "testville", "get-a-test-permit");
    extra.tips = ["[VERIFY] a tip"];

    const testville = composeGuide(s, "get-a-test-permit", PROD)?.cities.find(
      (c) => c.city.slug === "testville",
    );
    expect(testville?.tips).toEqual([]);
    expect(testville?.offices.map((o) => o.slug)).toEqual([
      "testville-main-office",
    ]);
  });

  it("local guide gives each city its own version", () => {
    const guide = composeGuide(store, "get-a-local-permit", PROD);

    expect(
      guide?.cities.map((c) => [
        c.city.slug,
        c.local?.requirements.map((r) => r.label),
        c.offices.map((o) => o.slug),
      ]),
    ).toEqual([
      ["otherville", ["Otherville cedula"], ["otherville-city-hall-office"]],
      [
        "testville",
        ["Testville barangay clearance"],
        ["testville-city-hall-office"],
      ],
    ]);
    expect(guide?.agency).toBeUndefined();
  });

  it("local guide shows only published city versions in production", () => {
    const s = copy();
    const other = cityVersion(s, "otherville", "get-a-local-permit");
    if (other.scope === "local") other.status = "draft";

    expect(
      composeGuide(s, "get-a-local-permit", PROD)?.cities.map(
        (c) => c.city.slug,
      ),
    ).toEqual(["testville"]);
    expect(
      composeListings(s, PROD).find((l) => l.slug === "get-a-local-permit")
        ?.cities,
    ).toEqual(["testville"]);
  });

  it("a local guide with no published version is hidden", () => {
    const s = copy();
    for (const city of ["testville", "otherville"]) {
      const version = cityVersion(s, city, "get-a-local-permit");
      if (version.scope === "local") version.status = "draft";
    }

    expect(composeGuide(s, "get-a-local-permit", PROD)).toBeUndefined();
    expect(composeListings(s, PROD).map((l) => l.slug)).not.toContain(
      "get-a-local-permit",
    );
    expect(composeGuide(s, "get-a-local-permit", DEV)?.cities).toHaveLength(2);
  });

  it("drafts are hidden in production", () => {
    expect(composeGuide(store, "draft-guide", PROD)).toBeUndefined();
    expect(composeGuide(store, "draft-guide", DEV)).toBeDefined();
  });

  it("unknown guide is undefined", () => {
    expect(composeGuide(store, "nope", DEV)).toBeUndefined();
  });
});

describe("composeListings", () => {
  it("lists visible guides by title, with agencies and cities", () => {
    const listings = composeListings(store, PROD);

    expect(listings.map((l) => l.slug)).toEqual([
      "get-a-local-permit",
      "get-a-test-permit",
    ]);
    const local = listings[0];
    expect(local?.agencies).toEqual([
      "otherville-city-hall",
      "testville-city-hall",
    ]);
    expect(local?.cities).toEqual(["otherville", "testville"]);
    expect(local?.lastVerified).toBe("2026-10-01");
    expect(listings[1]?.agencies).toEqual(["test-permits-agency"]);
  });

  it("filters by agency, including city versions of local guides", () => {
    expect(
      composeListings(store, PROD, { agency: "testville-city-hall" }).map(
        (l) => l.slug,
      ),
    ).toEqual(["get-a-local-permit"]);
    expect(
      composeListings(store, PROD, { agency: "test-permits-agency" }).map(
        (l) => l.slug,
      ),
    ).toEqual(["get-a-test-permit"]);
  });

  it("filters by category and city", () => {
    expect(composeListings(store, PROD, { category: "other" })).toEqual([]);
    expect(
      composeListings(store, PROD, { city: "otherville" }).map((l) => l.slug),
    ).toEqual(["get-a-local-permit", "get-a-test-permit"]);
  });

  it("never reports [VERIFY] as a date", () => {
    const listing = composeListings(store, DEV).find(
      (l) => l.slug === "draft-guide",
    );
    expect(listing?.lastVerified).toBeUndefined();
  });
});

describe("composePopular", () => {
  it("keeps file order and skips hidden guides", () => {
    const s = copy();
    s.popular = ["draft-guide", "get-a-test-permit"];

    expect(composePopular(s, PROD).map((l) => l.slug)).toEqual([
      "get-a-test-permit",
    ]);
  });
});

describe("composeOffices", () => {
  it("filters by city and agency", () => {
    expect(
      composeOffices(store, PROD, { agency: "test-permits-agency" }).map(
        (o) => `${o.city}/${o.slug}`,
      ),
    ).toEqual([
      "otherville/otherville-office",
      "testville/testville-main-office",
    ]);
    expect(
      composeOffices(store, PROD, { city: "otherville" }).map((o) => o.slug),
    ).toEqual(["otherville-city-hall-office", "otherville-office"]);
  });

  it("lists offices with the same slug in two cities", () => {
    const s = copy();
    const office = s.offices.find((o) => o.slug === "otherville-office");
    if (office) office.slug = "testville-main-office";

    expect(
      composeOffices(s, PROD, { agency: "test-permits-agency" }).map(
        (o) => `${o.city}/${o.slug}`,
      ),
    ).toEqual([
      "otherville/testville-main-office",
      "testville/testville-main-office",
    ]);
  });
});

describe("composeCityHub", () => {
  it("lists the city's offices and its local guides", () => {
    const hub = composeCityHub(store, "otherville", PROD);

    expect(hub?.city.name).toBe("Otherville");
    expect(hub?.localGuides.map((l) => l.slug)).toEqual(["get-a-local-permit"]);
    expect(hub?.offices.map((o) => o.slug)).toEqual([
      "otherville-city-hall-office",
      "otherville-office",
    ]);
  });

  it("is undefined for an unknown city", () => {
    expect(composeCityHub(store, "nope", PROD)).toBeUndefined();
  });
});
