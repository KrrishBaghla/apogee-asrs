import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Accordion } from "@/components/accordion";
import { Credit } from "@/components/figure";
import { FlowDiagram } from "@/components/flow-diagram";
import { ProjectChecklist } from "@/components/project-checklist";
import { ExternalLink, Roadmap } from "@/components/roadmap";
import { VideoPlayer } from "@/components/video-player";
import { getDomains, getLevels, getProjectDetail, getProjectSummary } from "@/lib/content";
import type { ProjectDetail } from "@/lib/schema";
import { levelNames } from "@/lib/site";

// Every page here is prerendered, so nothing is gained by streaming a placeholder.
export const instant = false;

export function generateStaticParams() {
  return getDomains().flatMap((domain) => domain.projects.map((project) => ({ id: project.id })));
}

export async function generateMetadata(props: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: getProjectSummary(id)?.project.title };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 font-display text-3xl font-light sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BeforeYouStart({ detail }: { detail: ProjectDetail }) {
  const { prerequisites, technologies } = detail;
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div className="grid gap-5 sm:grid-cols-2">
        <Bullets title="What you should know" items={prerequisites.knowledge} />
        <Bullets title="Programming" items={prerequisites.programming} />
        <Bullets title="Maths and physics" items={prerequisites.mathPhysics} />
        <Bullets title="Software to install" items={prerequisites.software} />
      </div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Technologies">
        <table className="w-full min-w-md text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-medium">Technology</th>
              <th className="py-2 pr-4 font-medium">Why we need it</th>
              <th className="py-2 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {technologies.map((tech) => (
              <tr key={tech.name} className="border-b border-line/50 last:border-0">
                <td className="py-2 pr-4 text-foreground">{tech.name}</td>
                <td className="py-2 pr-4">{tech.why}</td>
                <td className={`py-2 ${tech.priority === "Essential" ? "text-domain" : ""}`}>{tech.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function ProjectPage(props: PageProps<"/projects/[id]">) {
  const { id } = await props.params;
  const found = getProjectSummary(id);
  if (!found) notFound();

  const { domain, project } = found;
  const detail = getProjectDetail(id);

  const heading = (
    <>
      <Link href={`/domains/${domain.id}`} className="inline-flex items-center gap-1.5 text-sm hover:text-domain">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {domain.name}
      </Link>
      <p className="mt-6 text-domain">
        Level {project.level}, {levelNames[project.level]}
      </p>
      <h1 className="mt-1 font-display text-5xl font-light tracking-tight sm:text-7xl">{project.title}</h1>
      <p className="mt-3 max-w-2xl text-lg">{project.summary}</p>
    </>
  );

  if (!detail) {
    return (
      <div data-domain={domain.id} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {heading}
        <p className="panel mt-10 p-5 text-muted">The learning path for this project is being written.</p>
      </div>
    );
  }

  const { overview, hero } = detail;

  return (
    <div data-domain={domain.id}>
      <header className="relative isolate -mt-16 flex min-h-[30rem] items-end overflow-hidden sm:min-h-[36rem]">
        <Image src={hero.src} alt={hero.alt} fill preload sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/55 to-background/30" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-8 sm:px-6">
          {heading}
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted">Difficulty</dt>
              <dd>{overview.difficulty} of 5</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted">Time</dt>
              <dd>{overview.estimatedTime}</dd>
            </div>
          </dl>
          <p className="mt-3">
            <Credit credit={`Image: ${hero.credit}`} sourceUrl={hero.sourceUrl} />
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-x-12 gap-y-14 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-16">
          <section>
            <p className="font-display text-2xl leading-snug font-light sm:text-3xl">{overview.what}</p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="font-medium text-domain">Why it matters</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{overview.why}</dd>
              </div>
              <div>
                <dt className="font-medium text-domain">The space link</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{overview.spaceRelevance}</dd>
              </div>
              <div>
                <dt className="font-medium text-domain">What you end up with</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{overview.finalOutput}</dd>
              </div>
            </dl>
          </section>

          <Section title="How it works">
            <FlowDiagram steps={detail.howItWorks} />
          </Section>

          <Section title="Watch this first">
            <div className={`grid gap-6 ${detail.videos.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {detail.videos.map((video) => (
                <div key={video.youtubeId}>
                  <VideoPlayer youtubeId={video.youtubeId} title={video.title} />
                  <p className="mt-3 font-medium">{video.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {video.why} <span className="text-muted/80">From {video.channel}.</span>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Ideas you will meet">
            <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {detail.keyIdeas.map((idea) => (
                <div key={idea.term}>
                  <dt className="font-display text-xl text-domain">{idea.term}</dt>
                  <dd className="mt-1 leading-relaxed text-foreground/85">{idea.meaning}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {detail.parts && (
            <Section title="What you need to buy">
              {/* Focusable so keyboard users can scroll the table sideways on small screens. */}
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Parts list">
                <table className="w-full min-w-md text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-2 pr-4 font-medium">Part</th>
                      <th className="py-2 pr-4 font-medium">Why</th>
                      <th className="py-2 font-medium">Rough cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {detail.parts.map((part) => (
                      <tr key={part.name} className="border-b border-line/50 last:border-0">
                        <td className="py-2 pr-4 text-foreground">{part.name}</td>
                        <td className="py-2 pr-4">{part.why}</td>
                        <td className="py-2 whitespace-nowrap">{part.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          <Accordion title="Before you start: what to know and install">
            <BeforeYouStart detail={detail} />
          </Accordion>

          <Section title="Your learning path">
            <Roadmap steps={detail.roadmap} />
          </Section>

          <Section title="What you hand in">
            <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85">
              {detail.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Accordion title="More resources">
            <div className="grid gap-5 text-sm sm:grid-cols-2">
              {detail.resources.map((group) => (
                <div key={group.category}>
                  <h3 className="font-medium">{group.category}</h3>
                  <ul className="mt-1 space-y-1">
                    {group.links.map((resource) => (
                      <li key={resource.url}>
                        <ExternalLink {...resource} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Accordion>
        </div>

        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <ProjectChecklist
            projectId={project.id}
            domainId={domain.id}
            steps={detail.checklist}
            levels={getLevels(domain)}
          />
        </aside>
      </div>
    </div>
  );
}
