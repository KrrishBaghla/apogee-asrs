import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDomains, getProjectDetail } from "../lib/content";

describe("curriculum content", () => {
  const domains = getDomains();
  const projects = domains.flatMap((domain) => domain.projects);

  it("has levels 1 to 5 in order in every domain", () => {
    for (const domain of domains) {
      expect(domain.projects.map((project) => project.level)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it("uses unique project ids", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has valid learning paths with unique step ids", () => {
    const details = projects.flatMap((project) => {
      const detail = getProjectDetail(project.id);
      if (detail) expect(detail.id).toBe(project.id);
      return detail ? [detail] : [];
    });
    const stepIds = details.flatMap((detail) => detail.checklist.map((step) => step.id));
    expect(new Set(stepIds).size).toBe(stepIds.length);
  });

  const everyProject = domains.flatMap((domain) =>
    domain.projects.map((project) => ({ id: project.id, domain: domain.id })),
  );

  describe.each(everyProject)("$id", ({ id, domain }) => {
    const detail = getProjectDetail(id);
    if (!detail) return;
    const figures = detail.roadmap.flatMap((phase) => (phase.figure ? [phase.figure] : []));

    it("shows as well as tells", () => {
      expect(figures.length).toBeGreaterThanOrEqual(Math.ceil(detail.roadmap.length / 2));
      expect(figures.some((figure) => figure.kind === "diagram")).toBe(true);
    });

    it("has every media file on disk, in its own folder", () => {
      const files = [
        detail.hero.src,
        ...figures.flatMap((figure) => {
          if (figure.kind === "image" || figure.kind === "diagram") return [figure.src];
          if (figure.kind === "compare") return [figure.before.src, figure.after.src];
          return [];
        }),
      ];
      for (const file of files) {
        expect(file.startsWith(`/media/${id}/`), file).toBe(true);
        expect(fs.existsSync(path.join(process.cwd(), "public", file)), file).toBe(true);
      }
    });

    it("ends by pushing the finished work to GitHub", () => {
      expect(detail.checklist.at(-1)?.label).toMatch(/GitHub/);
    });

    it("lists parts for hardware projects", () => {
      if (domain === "embedded") expect(detail.parts?.length ?? 0).toBeGreaterThan(0);
    });
  });
});
