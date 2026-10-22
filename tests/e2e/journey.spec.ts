import { expect, test } from "@playwright/test";

test("finds a guide from the home page and ticks off what to bring", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Most looked up" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Otherville" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Testville" })).toBeVisible();

  await page.getByLabel("What do you need to get done?").fill("permit");
  await page
    .getByRole("list", { name: "Search results" })
    .getByRole("link", { name: "Get a test permit" })
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Get a test permit" }),
  ).toBeVisible();

  const validId = page.getByRole("checkbox", { name: /Valid ID/ });
  await validId.check();
  await page.reload();
  await expect(validId).toBeChecked(); // remembered on this phone

  await expect(page.getByText("1 of 2 ready")).toBeVisible();

  await page.getByRole("button", { name: "Clear ticks" }).click();
  await expect(validId).not.toBeChecked();
  await expect(page.getByText("0 of 2 ready")).toBeVisible();
});

test("guide shows the facts people came for", async ({ page }) => {
  await page.goto("/services/get-a-test-permit");

  const steps = page.locator("#route ol > li");
  await expect(steps).toHaveCount(3);
  await expect(steps.first()).toContainText("Fill out the application form");

  // ₱100.00 + ₱50.50
  await expect(page.locator("#fees tfoot")).toContainText("₱150.50");
  await expect(page.locator("#where")).toContainText("Monday to Friday");
  await expect(page.locator("#where")).toContainText("8:00 AM – 5:00 PM");
  await expect(page.getByText("Draft, not published")).toHaveCount(0);
});

test("prints a clean sheet without the screen-only parts", async ({ page }) => {
  await page.goto("/services/get-a-test-permit");
  await page.emulateMedia({ media: "print" });

  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("button", { name: /Print/ })).toBeHidden();
  // The print-only line saying what the sheet is.
  await expect(page.getByText("GovGuide: an independent guide")).toBeVisible();
});
