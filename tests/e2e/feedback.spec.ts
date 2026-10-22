import { expect, test } from "@playwright/test";

test("a guide's report link opens the form with the page filled in", async ({
  page,
}) => {
  await page.goto("/services/get-a-test-permit");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");

  const url = new URL(href ?? "");
  expect(url.pathname).toMatch(/\/issues\/new$/);
  expect(url.searchParams.get("template")).toBe("outdated-info.yml");
  expect(url.searchParams.get("page")).toMatch(
    /\/services\/get-a-test-permit$/,
  );
});

test("an office page can report a change too", async ({ page }) => {
  await page.goto("/agencies/test-permits-agency");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");
  expect(new URL(href ?? "").searchParams.get("page")).toMatch(
    /\/agencies\/test-permits-agency$/,
  );
});

test("an empty category offers to suggest a service", async ({ page }) => {
  await page.goto("/categories/other");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");
  const url = new URL(href ?? "");
  expect(url.searchParams.get("template")).toBe("suggest-service.yml");
});

test("a city page suggests a service for that city", async ({ page }) => {
  await page.goto("/testville");
  const href = await page
    .getByRole("link", { name: "Report on GitHub" })
    .getAttribute("href");
  expect(new URL(href ?? "").searchParams.get("city")).toBe("Testville");
});

test("every page links to the contribute page", async ({ page }) => {
  await page.goto("/testville");
  await page.getByRole("link", { name: "Help keep this accurate" }).click();
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
