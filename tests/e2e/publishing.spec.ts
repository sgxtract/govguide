import { expect, test } from "@playwright/test";

// The accuracy rule, checked end to end: drafts and unknown pages never
// reach the public, and published guides carry correct metadata.

test("drafts and unknown pages are 404", async ({ page }) => {
  for (const path of [
    "/testville/services/draft-guide",
    "/nowhere",
    "/testville/categories/nope",
    "/testville/agencies/nope",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("sitemap lists published pages only", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/testville/services/get-a-test-permit");
  expect(xml).toContain("<lastmod>2026-10-01</lastmod>");
  expect(xml).not.toContain("draft-guide");
  expect(xml).not.toContain("/search");
});

test("guide carries structured data naming the agency as provider", async ({
  page,
}) => {
  await page.goto("/testville/services/get-a-test-permit");
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const service = blocks
    .map((b) => JSON.parse(b) as Record<string, unknown>)
    .find((d) => d["@type"] === "GovernmentService");

  expect(service).toMatchObject({
    name: "Get a test permit",
    provider: { name: "Test Permits Agency" },
  });
});

test("share card is generated for each guide", async ({ request }) => {
  const res = await request.get(
    "/testville/services/get-a-test-permit/opengraph-image",
  );
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
});
