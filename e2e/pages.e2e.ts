import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPages, open, watchErrors } from "./helpers";

// Every page loads, fits the screen, shows its images and passes an automated accessibility scan.
for (const path of allPages) {
  test(`page ${path}`, async ({ page }) => {
    const errors = watchErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    // Scroll through so lazy images load.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 800) await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(0);

    const broken = await page.evaluate(() =>
      [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    );
    expect(broken, "broken images").toEqual([]);

    await expect(page.locator("h1")).toHaveCount(1);

    // Open every closed section so the scan checks what is inside them too.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const closed = page.locator('button[aria-expanded="false"]');
    while ((await closed.count()) > 0) await closed.first().click();

    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const problems = scan.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(" ")}`);
    expect(problems, "accessibility problems").toEqual([]);

    expect(errors, "browser errors").toEqual([]);
  });
}

test("the keyboard can reach and tick a step", async ({ page }) => {
  await open(page, "/projects/web-space-picture-gallery");
  const first = page.locator('aside input[type="checkbox"]').first();
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toBeChecked();
});

test("the first Tab shows a skip link that jumps to the content", async ({ page }) => {
  await open(page, "/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#content")).toBeFocused();
});
