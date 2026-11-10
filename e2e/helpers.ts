import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

type DomainFile = { id: string; projects: { id: string }[] }[];

export const domains: DomainFile = JSON.parse(readFileSync("content/domains.json", "utf8"));
export const projectIds = domains.flatMap((domain) => domain.projects.map((project) => project.id));
export const allPages = ["/", "/domains", "/login", ...domains.map((d) => `/domains/${d.id}`), ...projectIds.map((id) => `/projects/${id}`)];

export const boxes = (page: Page) => page.locator('aside input[type="checkbox"]');
export const ticked = (page: Page) => page.locator('aside input[type="checkbox"]:checked');

// Pages read saved progress after they load, so wait until the checklist has switched on.
export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

export async function tickAll(page: Page) {
  const count = await boxes(page).count();
  for (let i = 0; i < count; i++) {
    const box = boxes(page).nth(i);
    if (!(await box.isChecked())) await box.check({ force: true });
  }
  await expect(ticked(page)).toHaveCount(count);
  return count;
}

// Collects page crashes and console errors so each test can assert there were none.
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}
