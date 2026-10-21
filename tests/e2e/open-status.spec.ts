import { expect, test } from "@playwright/test";

// The fixture office is open Monday to Friday, 8:00 AM to 5:00 PM, and
// tests/fixtures/content/holidays.yaml has a holiday on 2026-12-30.
const OFFICE = "/testville/agencies/test-permits-agency";

/** A moment in Philippine time (UTC+8). */
const manila = (iso: string) => new Date(`${iso}+08:00`);

test("shows open now during office hours", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T10:00:00")); // Wednesday
  await page.goto(OFFICE);
  await expect(page.getByText("Open now")).toBeVisible();
  await expect(page.getByText("Closes 5:00 PM")).toBeVisible();
});

test("warns when the office closes within the hour", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T16:20:00"));
  await page.goto(OFFICE);
  await expect(page.getByText("Closes soon")).toBeVisible();
  await expect(page.getByText("At 5:00 PM, in 40 minutes")).toBeVisible();
});

test("on a weekend, says when it opens next", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-24T10:00:00")); // Saturday
  await page.goto(OFFICE);
  await expect(page.getByText("Closed now")).toBeVisible();
  await expect(page.getByText("Opens Monday at 8:00 AM")).toBeVisible();
});

test("on a public holiday, says closed today", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-12-30T10:00:00")); // Wednesday
  await page.goto(OFFICE);
  await expect(page.getByText("Closed today")).toBeVisible();
  await expect(
    page.getByText(/Test Holiday\. Opens tomorrow at 8:00 AM/),
  ).toBeVisible();
});

test("the home page lists the office with its status", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T10:00:00"));
  await page.goto("/testville");
  const offices = page.getByRole("region", { name: "Offices" });
  await expect(offices.getByText("Testville Main Office")).toBeVisible();
  await expect(offices.getByText("Open now")).toBeVisible();
});
