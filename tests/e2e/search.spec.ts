import { expect, test } from "@playwright/test";

test("doesn't download search until someone uses it", async ({ page }) => {
  const indexRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("search-index.json")) indexRequests.push(r.url());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(indexRequests).toHaveLength(0);

  await page.getByLabel("What do you need to get done?").focus();
  await expect.poll(() => indexRequests.length).toBe(1);
});

test("understands Filipino phrasing, typos and agency keywords", async ({
  page,
}) => {
  await page.goto("/");
  const box = page.getByLabel("What do you need to get done?");
  const results = page.getByRole("list", { name: "Search results" });

  for (const query of [
    "paano kumuha ng pahintulot",
    "pemit",
    "old permits office",
  ]) {
    await box.fill(query);
    await expect(
      results.getByRole("link", { name: "Get a test permit" }),
    ).toBeVisible();
  }
});

test("Enter opens a shareable search page", async ({ page }) => {
  await page.goto("/");
  const box = page.getByLabel("What do you need to get done?");
  await box.fill("permit");
  await box.press("Enter");

  await expect(page).toHaveURL(/\/search\?q=permit$/);
  await expect(
    page
      .getByRole("list", { name: "Search results" })
      .getByRole("link", { name: "Get a test permit" }),
  ).toBeVisible();
});

test("says so when nothing matches", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("What do you need to get done?").fill("passport");
  await expect(page.getByText("Nothing matches “passport”.")).toBeVisible();
});

test("never shows drafts in results", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("What do you need to get done?")
    .fill("unfinished draft");
  await expect(page.getByText(/Nothing matches/)).toBeVisible();
});
