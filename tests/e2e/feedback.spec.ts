import { expect, test } from "@playwright/test";

test("a guide's report link opens the form with the page filled in", async ({
  page,
}) => {
  await page.goto("/testville/services/get-a-test-permit");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");

  const url = new URL(href ?? "");
  expect(url.pathname).toMatch(/\/issues\/new$/);
  expect(url.searchParams.get("template")).toBe("outdated-info.yml");
  expect(url.searchParams.get("page")).toMatch(
    /\/testville\/services\/get-a-test-permit$/,
  );
});

test("an office page can report a change too", async ({ page }) => {
  await page.goto("/testville/agencies/test-permits-agency");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");
  expect(new URL(href ?? "").searchParams.get("page")).toMatch(
    /\/testville\/agencies\/test-permits-agency$/,
  );
});

test("an empty category offers to suggest a service for that city", async ({
  page,
}) => {
  await page.goto("/testville/categories/other");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");
  const url = new URL(href ?? "");
  expect(url.searchParams.get("template")).toBe("suggest-service.yml");
  expect(url.searchParams.get("city")).toBe("Testville");
});

test("every page links to the contribute page", async ({ page }) => {
  await page.goto("/testville");
  await page
    .getByRole("link", { name: "Help keep this guide accurate" })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Help keep GovGuide accurate",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Don't send personal information" }),
  ).toBeVisible();
});
