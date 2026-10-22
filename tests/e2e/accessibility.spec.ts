import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/testville",
  "/categories/permits",
  "/categories/other",
  "/services",
  "/services/get-a-test-permit",
  "/services/get-a-local-permit",
  "/agencies",
  "/agencies/test-permits-agency",
  "/search?q=permit",
  "/contribute",
  "/about",
  "/disclaimer",
  "/privacy",
  "/styleguide",
  "/nowhere",
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const path of PAGES) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path);
        if (path.includes("search")) {
          await expect(page.getByText(/result/)).toBeVisible();
        }
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}

test("keyboard users can skip straight to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});
