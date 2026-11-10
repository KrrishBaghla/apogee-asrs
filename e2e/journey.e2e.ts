import { expect, test } from "@playwright/test";
import { boxes, open, tickAll, ticked, watchErrors } from "./helpers";

// The student journey in demo mode, where progress is saved in the browser.
const level1 = "/projects/web-space-picture-gallery";
const level2 = "/projects/web-asteroid-threat-dashboard";

test("a new student sees level 1 open and the rest locked", async ({ page }) => {
  await open(page, "/domains/web");
  await expect(page.getByText("Start here")).toHaveCount(1);
  await expect(page.getByText(/to unlock/)).toHaveCount(4);

  await open(page, level2);
  await expect(page.getByRole("heading", { name: "Your learning path" })).toBeVisible();
  await expect(boxes(page).first()).toBeDisabled();
});

test("finishing level 1 unlocks level 2, and progress survives a reload", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, level1);
  const count = await boxes(page).count();
  expect(count).toBeGreaterThanOrEqual(3);

  for (let i = 0; i < count - 1; i++) await boxes(page).nth(i).check({ force: true });
  await expect(page.getByRole("link", { name: /Start level 2/ })).toHaveCount(0);
  await boxes(page).nth(count - 1).check({ force: true });
  await expect(page.getByRole("link", { name: /Start level 2/ })).toBeVisible();

  await page.reload();
  await expect(ticked(page)).toHaveCount(count);

  await page.getByRole("link", { name: /Start level 2/ }).click();
  await expect(page).toHaveURL(new RegExp(`${level2}$`));
  await expect(boxes(page).first()).toBeEnabled();

  await open(page, "/");
  await expect(page.getByRole("link", { name: /^Continue/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "My path" })).toBeVisible();

  await open(page, "/domains/web");
  await expect(page.getByText("Complete", { exact: true })).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("unticking a step locks later levels again but keeps their ticks", async ({ page }) => {
  await open(page, level1);
  await tickAll(page);
  await open(page, level2);
  await boxes(page).first().check({ force: true });

  await open(page, level1);
  await boxes(page).first().uncheck({ force: true });

  await open(page, level2);
  await expect(boxes(page).first()).toBeDisabled();
  await expect(ticked(page)).toHaveCount(1);
});

test("each domain keeps its own progress", async ({ page }) => {
  await open(page, level1);
  await boxes(page).first().check({ force: true });

  await open(page, "/domains/ai-ml");
  await expect(page.getByText("Start here")).toHaveCount(1);

  await open(page, "/domains/web");
  await expect(page.getByText(/^\d+ of \d+ steps$/).first()).toBeVisible();
});

test("videos load only after pressing play", async ({ page }) => {
  await open(page, level1);
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Play video/ }).first().click();
  await expect(page.locator("iframe")).toHaveCount(1);
});

test("an unknown page shows the not-found screen", async ({ page }) => {
  // Next.js may already be streaming, so the status can be 200. It then marks the page noindex.
  const response = await page.goto("/projects/not-a-real-project");
  expect([200, 404]).toContain(response?.status());
  await expect(page.getByRole("heading", { name: /isn.t in orbit/ })).toBeVisible();
  if (response?.status() === 200) {
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  }
});

test("demo mode explains that accounts are off", async ({ page }) => {
  await open(page, "/login");
  await expect(page.getByText(/Accounts aren.t switched on yet/)).toBeVisible();
});
