import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ContentError,
  loadFileContent,
} from "@/lib/content/loaders/file-loader";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/content");
const GUIDE = "cities/testville/services/get-a-test-permit.yaml";

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
  it("loads valid content and derives slugs from file names", async () => {
    const store = await loadFileContent(FIXTURES);

    expect(store.cities.map((c) => c.slug)).toEqual(["testville"]);
    expect(store.services.map((s) => s.slug).sort()).toEqual([
      "draft-guide",
      "get-a-test-permit",
    ]);
    const guide = store.services.find((s) => s.slug === "get-a-test-permit");
    expect(guide?.city).toBe("testville");
    expect(guide?.fees.map((f) => f.amount)).toEqual([100, 50.5]);
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

  it("refuses to publish a guide whose office still has [VERIFY]", async () => {
    const root = await copyOfFixtures();
    await edit(
      root,
      "cities/testville/offices/testville-main-office.yaml",
      'opens: "08:00"',
      'opens: "[VERIFY]"',
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      "still contains [VERIFY]",
    );
  });

  it("allows [VERIFY] in drafts", async () => {
    const store = await loadFileContent(FIXTURES);
    const draft = store.services.find((s) => s.slug === "draft-guide");
    expect(draft?.processingTime).toBe("[VERIFY]");
  });

  it("rejects file names that aren't valid slugs", async () => {
    const root = await copyOfFixtures();
    await cp(
      path.join(root, GUIDE),
      path.join(root, "cities/testville/services/Bad_Name.yaml"),
    );

    expect((await problemsIn(root)).join("\n")).toContain(
      "File name must be lowercase-words-with-dashes",
    );
  });

  it("reports every problem at once", async () => {
    const root = await copyOfFixtures();
    await edit(root, GUIDE, "tips:", "tipz:");
    await edit(
      root,
      "cities/testville/services/draft-guide.yaml",
      "category: permits",
      "category: nope",
    );

    expect(await problemsIn(root)).toHaveLength(2);
  });
});
