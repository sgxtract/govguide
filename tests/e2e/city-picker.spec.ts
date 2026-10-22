import { expect, test } from "@playwright/test";

// The fixtures have two cities: the national guide has an office in each, and
// the city-run guide has a different version for each.

test("picker remembers the city across guides and reloads", async ({
  page,
}) => {
  await page.goto("/services/get-a-test-permit");
  await page.getByLabel("Your city").selectOption({ label: "Otherville" });
  await expect(page.getByText("Otherville Office")).toBeVisible();
  await expect(page.getByText("Testville Main Office")).toBeHidden();

  await page.goto("/services/get-a-local-permit");
  await expect(page.getByText("Otherville cedula")).toBeVisible();
  await expect(page.getByText("Testville barangay clearance")).toBeHidden();

  await page.reload();
  await expect(page.getByLabel("Your city")).toHaveValue("otherville");
});

test("asks for a city before showing one", async ({ page }) => {
  await page.goto("/services/get-a-local-permit");
  await expect(page.getByLabel("Your city")).toHaveValue("");
  await expect(
    page.getByText("Choose your city to see where to go."),
  ).toBeVisible();
  await expect(page.getByText("Testville barangay clearance")).toBeHidden();
  await expect(page.getByText("Otherville cedula")).toBeHidden();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every city's block is shown", async ({ page }) => {
    await page.goto("/services/get-a-local-permit");
    await expect(
      page.getByRole("heading", { name: "Testville", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Otherville", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Testville barangay clearance")).toBeVisible();
    await expect(page.getByText("Otherville cedula")).toBeVisible();
  });
});

test("search finds a city-run guide by city name", async ({ page }) => {
  await page.goto("/search?q=otherville");
  await expect(
    page
      .getByRole("list", { name: "Search results" })
      .getByRole("link", { name: "Get a local permit" }),
  ).toBeVisible();
});
