import { expect, test } from "@playwright/test";

// The fixture office is open Monday to Friday, 8:00 AM to 5:00 PM, and
// tests/fixtures/content/holidays.yaml has a holiday on 2026-12-30.
// The agency page lists every city's office, so each test looks at one.
const OFFICE = "/agencies/test-permits-agency";
const CARD = "#testville-testville-main-office";

/** A moment in Philippine time (UTC+8). */
const manila = (iso: string) => new Date(`${iso}+08:00`);

test("shows open now during office hours", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T10:00:00")); // Wednesday
  await page.goto(OFFICE);
  const card = page.locator(CARD);
  await expect(card.getByText("Open now")).toBeVisible();
  await expect(card.getByText("Closes 5:00 PM")).toBeVisible();
});

test("warns when the office closes within the hour", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T16:20:00"));
  await page.goto(OFFICE);
  const card = page.locator(CARD);
  await expect(card.getByText("Closes soon")).toBeVisible();
  await expect(card.getByText("At 5:00 PM, in 40 minutes")).toBeVisible();
});

test("on a weekend, says when it opens next", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-24T10:00:00")); // Saturday
  await page.goto(OFFICE);
  const card = page.locator(CARD);
  await expect(card.getByText("Closed now")).toBeVisible();
  await expect(card.getByText("Opens Monday at 8:00 AM")).toBeVisible();
});

test("on a public holiday, says closed today", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-12-30T10:00:00")); // Wednesday
  await page.goto(OFFICE);
  const card = page.locator(CARD);
  await expect(card.getByText("Closed today")).toBeVisible();
  await expect(
    card.getByText(/Test Holiday\. Opens tomorrow at 8:00 AM/),
  ).toBeVisible();
});

test("the city page lists the office with its status", async ({ page }) => {
  await page.clock.setFixedTime(manila("2026-10-21T10:00:00"));
  await page.goto("/testville");
  const row = page
    .getByRole("region", { name: "Offices" })
    .getByRole("listitem")
    .filter({ hasText: "Testville Main Office" });
  await expect(row.getByText("Open now")).toBeVisible();
});
