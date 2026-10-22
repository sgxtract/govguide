import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ContentError,
  loadFileContent,
} from "@/lib/content/loaders/file-loader";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/content");
const GUIDE = "services/get-a-test-permit.yaml";
const LOCAL = "cities/testville/services/get-a-local-permit.yaml";

const tempDirs: string[] = [];

/** Copies the fixture content to a temp folder so a test can break it. */
async function copyOfFixtures(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "govguide-content-"));
  tempDirs.push(dir);
  await cp(FIXTURES, dir, { recursive: true });
  return dir;
}

/** Replaces text in one file of a content folder. */
async function edit(root: string, file: string, from: string, to: string) {
  const full = path.join(root, file);
  const text = await readFile(full, "utf8");
  if (!text.includes(from)) throw new Error(`"${from}" not found in ${file}`);
  await writeFile(full, text.replace(from, to));
}

/** Loads content and returns the reported problems (none = []). */
async function problemsIn(root: string): Promise<string[]> {
  try {
    await loadFileContent(root);
    return [];
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => rm(d, { recursive: true })));
});

describe("loadFileContent", () => {
  it("loads national guides, city files and popular", async () => {
    const store = await loadFileContent(FIXTURES);

    expect(store.cities.map((c) => c.slug)).toEqual([
      "otherville",
      "testville",
    ]);
    expect(store.services.map((s) => `${s.slug}:${s.scope}`).sort()).toEqual([
      "draft-guide:national",
      "get-a-local-permit:local",
      "get-a-test-permit:national",
      "get-an-online-permit:national",
    ]);
    expect(
      store.cityServices.map((c) => `${c.city}/${c.slug}:${c.scope}`).sort(),
    ).toEqual([
      "otherville/get-a-local-permit:local",
      "testville/get-a-local-permit:local",
      "testville/get-a-test-permit:national",
    ]);
    expect(store.popular).toEqual(["get-a-test-permit"]);
    const guide = store.services.find((s) => s.slug === "get-a-test-permit");
    expect(
      guide?.scope === "national" && guide.fees.map((f) => f.amount),
    ).toEqual([100, 50.5]);
  });

  it("rejects a misspelled field instead of dropping it", async () => {
    const root = await copyOfFixtures();
    await edit(root, GUIDE, "tips:", "tipz:");

    const problems = await problemsIn(root);
    expect(problems.join("\n")).toContain('Unrecognized key: "tipz"');
  });

  it("rejects a reference to an agency that doesn't exist", async () => {
    const root = await copyOfFixtures();
    await edit(root, GUIDE, "agency: test-permits-agency", "agency: nope");

    expect((await problemsIn(root)).join("\n")).toContain(
      'Unknown agency "nope"',
    );
  });

  it("refuses to publish a guide that still has [VERIFY]", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      GUIDE,
      "processingTime: Same day",
      'processingTime: "[VERIFY]"',
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      "Published, but it (or its agency/offices) still contains [VERIFY]",
    );
  });

  it("hides, doesn't reject, a national guide's unverified office", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "cities/testville/offices/testville-main-office.yaml",
      'opens: "08:00"',
      'opens: "[VERIFY]"',
    );

    expect(await problemsIn(root)).toEqual([]);
  });

  it("refuses to publish a city version whose office still has [VERIFY]", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "cities/testville/offices/testville-city-hall-office.yaml",
      'opens: "08:00"',
      'opens: "[VERIFY]"',
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      "Published, but it (or its agency/offices) still contains [VERIFY]",
    );
  });

  it("refuses to publish a city version while the guide's national file has [VERIFY]", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "services/get-a-local-permit.yaml",
      "summary: Apply for a fictional permit at your city hall.",
      'summary: "Apply for a fictional permit [VERIFY]"',
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      "services/get-a-local-permit.yaml\n  ✖ Published, but it (or its agency/offices) still contains [VERIFY]",
    );
  });

  it("allows [VERIFY] in drafts", async () => {
    const store = await loadFileContent(FIXTURES);
    const draft = store.services.find((s) => s.slug === "draft-guide");
    expect(draft?.scope === "national" && draft.processingTime).toBe(
      "[VERIFY]",
    );
  });

  it("rejects file names that aren't valid slugs", async () => {
    const root = await copyOfFixtures();
    await cp(path.join(root, GUIDE), path.join(root, "services/Bad_Name.yaml"));

    expect((await problemsIn(root)).join("\n")).toContain(
      "File name must be lowercase-words-with-dashes",
    );
  });

  it("reports every problem at once", async () => {
    const root = await copyOfFixtures();
    await edit(root, GUIDE, "tips:", "tipz:");
    await edit(
      root,
      "services/draft-guide.yaml",
      "category: permits",
      "category: nope",
    );

    expect(await problemsIn(root)).toHaveLength(2);
  });

  it("rejects requirements in a local guide's national file", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "services/get-a-local-permit.yaml",
      "category: permits",
      "category: permits\nrequirements: []",
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      'Unrecognized key: "requirements"',
    );
  });

  it("rejects a city file for a guide that doesn't exist", async () => {
    const root = await copyOfFixtures();
    await cp(
      path.join(root, "cities/testville/services/get-a-test-permit.yaml"),
      path.join(root, "cities/testville/services/nope.yaml"),
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      'Unknown guide "nope": no content/services/nope.yaml',
    );
  });

  it("rejects requirements in a city file for a national guide", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "cities/testville/services/get-a-test-permit.yaml",
      "tips:",
      "requirements: []\ntips:",
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      'Unrecognized key: "requirements"',
    );
  });

  it("rejects an office from another city", async () => {
    const root = await copyOfFixtures();
    await edit(root, LOCAL, "testville-city-hall-office", "otherville-office");

    expect((await problemsIn(root)).join("\n")).toContain(
      'Office "otherville-office" is not in testville',
    );
  });

  it("rejects an office of another agency", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      LOCAL,
      "  - testville-city-hall-office",
      "  - testville-main-office",
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      'Office "testville-main-office" belongs to "test-permits-agency", not "testville-city-hall"',
    );
  });

  it("rejects an unknown popular guide", async () => {
    const root = await copyOfFixtures();
    await edit(root, "popular.yaml", "- get-a-test-permit", "- nope");

    expect((await problemsIn(root)).join("\n")).toContain(
      'Unknown popular service "nope"',
    );
  });

  it("rejects a city folder with a reserved name", async () => {
    const root = await copyOfFixtures();
    await mkdir(path.join(root, "cities/services"));
    await cp(
      path.join(root, "cities/otherville/city.yaml"),
      path.join(root, "cities/services/city.yaml"),
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      'City folder name "services" is reserved',
    );
  });
});
