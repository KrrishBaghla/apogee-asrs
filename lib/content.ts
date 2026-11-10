import fs from "node:fs";
import path from "node:path";
import {
  domainsSchema,
  projectDetailSchema,
  type Domain,
  type ProjectDetail,
  type ProjectSummary,
} from "./schema";
import type { Level } from "./progress";

const contentDir = path.join(process.cwd(), "content");

export function getDomains(): Domain[] {
  const raw = fs.readFileSync(path.join(contentDir, "domains.json"), "utf8");
  return domainsSchema.parse(JSON.parse(raw));
}

export function getDomain(id: string): Domain | undefined {
  return getDomains().find((domain) => domain.id === id);
}

export function getProjectSummary(
  id: string,
): { domain: Domain; project: ProjectSummary } | undefined {
  for (const domain of getDomains()) {
    const project = domain.projects.find((item) => item.id === id);
    if (project) return { domain, project };
  }
}

// Returns null until a project's learning path has been written.
export function getProjectDetail(id: string): ProjectDetail | null {
  const file = path.join(contentDir, "projects", `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return projectDetailSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

export function getLevels(domain: Domain): (Level & { summary: string; heroSrc: string | null })[] {
  return domain.projects.map((project) => {
    const detail = getProjectDetail(project.id);
    return {
      id: project.id,
      level: project.level,
      title: project.title,
      summary: project.summary,
      stepIds: detail?.checklist.map((step) => step.id) ?? [],
      heroSrc: detail?.hero.src ?? null,
    };
  });
}
