import { z } from "zod";

const text = z.string().min(1);
const slug = z.string().regex(/^[a-z0-9-]+$/);

// Length limits keep the pages easy to read: a long passage fails validation.
const short = text.max(140);
const sentence = text.max(240);
const passage = text.max(460);

const link = z.object({ label: text, url: z.url() });

const photoPath = z.string().regex(/^\/media\/[a-z0-9-]+\/[a-z0-9-]+\.jpg$/);
const diagramPath = z.string().regex(/^\/media\/[a-z0-9-]+\/[a-z0-9-]+\.svg$/);
const youtubeId = z.string().regex(/^[\w-]{11}$/);

export const flowIcons = [
  "user", "globe", "server", "database", "code", "image", "cpu", "camera", "satellite",
  "radio", "wifi", "map", "chart", "brain", "rocket", "telescope", "thermometer", "battery",
  "cog", "monitor", "cloud", "sun", "moon", "file", "upload", "filter", "target", "route",
  "search", "layers", "compass", "eye", "zap",
] as const;

const photo = z.object({ src: photoPath, alt: sentence, credit: short, sourceUrl: z.url() });

const video = z.object({ youtubeId, title: text, channel: text, why: sentence });

const figureSchema = z.discriminatedUnion("kind", [
  photo.extend({ kind: z.literal("image"), caption: sentence }),
  z.object({ kind: z.literal("diagram"), src: diagramPath, alt: sentence, caption: sentence }),
  z.object({
    kind: z.literal("video"),
    youtubeId,
    title: text,
    channel: text,
    caption: sentence,
  }),
  z.object({
    kind: z.literal("code"),
    language: z.enum(["html", "css", "javascript", "python", "cpp", "bash", "json"]),
    code: text.max(900),
    caption: sentence,
  }),
  z.object({
    kind: z.literal("compare"),
    before: z.object({ src: photoPath, label: text.max(30) }),
    after: z.object({ src: photoPath, label: text.max(30) }),
    alt: sentence,
    caption: sentence,
    credit: short,
    sourceUrl: z.url(),
  }),
]);

export const projectSummarySchema = z.object({
  id: slug,
  level: z.number().int().min(1).max(5),
  title: text,
  summary: text,
});

export const domainSchema = z.object({
  id: slug,
  name: text,
  tagline: text,
  description: text,
  icon: z.enum(["web", "ai", "embedded"]),
  skills: z.array(text).min(3),
  projects: z.array(projectSummarySchema).length(5),
});

export const domainsSchema = z.array(domainSchema).length(3);

export const projectDetailSchema = z.object({
  id: slug,
  hero: photo,
  overview: z.object({
    what: sentence,
    why: sentence,
    spaceRelevance: sentence,
    finalOutput: sentence,
    difficulty: z.number().int().min(1).max(5),
    estimatedTime: text,
  }),
  // The whole project as a simple left-to-right picture.
  howItWorks: z
    .array(z.object({ icon: z.enum(flowIcons), label: text.max(28), detail: text.max(90) }))
    .min(3)
    .max(5),
  keyIdeas: z
    .array(z.object({ term: text.max(40), meaning: sentence }))
    .min(3)
    .max(4),
  videos: z.array(video).min(1).max(2),
  // Hardware projects only. Costs are rough guides.
  parts: z
    .array(z.object({ name: text, why: short, cost: text.max(30) }))
    .optional(),
  prerequisites: z.object({
    knowledge: z.array(text).min(1),
    programming: z.array(text).min(1),
    mathPhysics: z.array(text).min(1),
    software: z.array(text).min(1),
  }),
  technologies: z
    .array(
      z.object({
        name: text,
        why: text,
        priority: z.enum(["Essential", "Recommended"]),
      }),
    )
    .min(1),
  roadmap: z
    .array(
      z.object({
        title: text.max(50),
        learn: sentence,
        explain: passage,
        implement: sentence,
        outcome: short,
        figure: figureSchema.optional(),
        resources: z.array(link),
      }),
    )
    .min(3),
  resources: z
    .array(z.object({ category: text, links: z.array(link).min(1) }))
    .min(1),
  deliverables: z.array(text).min(1),
  // Step ids are permanent: student progress is stored against them.
  checklist: z.array(z.object({ id: slug, label: text })).min(3),
});

export type Domain = z.infer<typeof domainSchema>;
export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;
export type Figure = z.infer<typeof figureSchema>;
export type FlowIcon = (typeof flowIcons)[number];
