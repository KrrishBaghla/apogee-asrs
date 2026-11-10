import { expect, test } from "@playwright/test";
import { boxes, tickAll, ticked } from "./helpers";

// Runs against a real Supabase project, so it is off by default. To run it, start the site with
// keys in .env.local (`npm run dev`) and email confirmation off, then:
//   E2E_ACCOUNTS_URL=http://localhost:3000 npm run test:e2e -- accounts --project=desktop
// Each run creates one account named apogee.test.<number>@example.com. Delete it afterwards
// under Authentication > Users in Supabase.
const base = process.env.E2E_ACCOUNTS_URL;
test.skip(!base, "Set E2E_ACCOUNTS_URL to test real accounts");

const project = "/projects/web-space-picture-gallery";

test("sign up, save progress, and see it on another device", async ({ page, browser }) => {
  const email = `apogee.test.${Date.now()}@example.com`;
  const password = `test-pass-${Date.now()}`;

  await page.goto(base + project);
  await expect(page.getByText("to tick off steps")).toBeVisible();
  await expect(boxes(page).first()).toBeDisabled();

  await page.goto(`${base}/login?next=${project}`);
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Your name").fill("Test Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`${project}$`), { timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible();

  await expect(boxes(page).first()).toBeEnabled();
  const count = await tickAll(page);
  await expect(page.getByRole("link", { name: /Start level 2/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(ticked(page)).toHaveCount(count);

  await page.getByRole("button", { name: "Log out" }).first().click();
  await expect(boxes(page).first()).toBeDisabled();

  const other = await (await browser.newContext()).newPage();
  await other.goto(`${base}/login?next=${project}`);
  await other.getByLabel("Email").fill(email);
  await other.getByLabel("Password").fill("wrong-password");
  await other.locator('button[type="submit"]').click();
  await expect(other.getByText(/don.t match/)).toBeVisible();
  await other.getByLabel("Password").fill(password);
  await other.locator('button[type="submit"]').click();
  await expect(other).toHaveURL(new RegExp(`${project}$`), { timeout: 15_000 });
  // A fresh device loads the account from Supabase, which can take a few seconds in `npm run dev`.
  await expect(ticked(other)).toHaveCount(count, { timeout: 15_000 });
});
