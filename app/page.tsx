import { DomainRow } from "@/components/domain-card";
import { OrbitLab } from "@/components/orbit-lab";
import { StartLink } from "@/components/progress-links";
import { getDomains, getLevels } from "@/lib/content";

export default function Home() {
  const domains = getDomains();
  const levelsByDomain = Object.fromEntries(domains.map((domain) => [domain.id, getLevels(domain)]));

  return (
    <>
      <section className="overflow-x-clip">
        <div className="relative z-10 mx-auto grid max-w-6xl items-end gap-x-12 gap-y-5 px-4 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[auto_1fr]">
          <h1 className="font-display text-6xl leading-[0.98] font-light tracking-tight sm:text-8xl lg:whitespace-nowrap">
            Raise your apogee.
          </h1>
          <div>
            <p className="leading-relaxed text-muted">
              Apogee is the highest point of an orbit. Drag it outward and watch the physics change.
              Then learn to build the things that fly there.
            </p>
            <StartLink
              levelsByDomain={levelsByDomain}
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
            >
              Start at level 1
            </StartLink>
          </div>
        </div>
        <OrbitLab />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <h2 className="mb-10 font-display text-3xl font-light sm:text-4xl">Pick what you want to build.</h2>
        {domains.map((domain) => (
          <DomainRow key={domain.id} domain={domain} />
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <p className="max-w-3xl font-display text-4xl leading-tight font-light sm:text-6xl">
          The Moon is 384,400 km away. Level 1 is 408.
        </p>
        <p className="mt-5 max-w-xl text-lg text-muted">
          No experience needed. Five levels, each one higher, and every one ends with something real that you built.
        </p>
        <StartLink
          levelsByDomain={levelsByDomain}
          className="mt-7 inline-block rounded-full bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
        >
          Choose your domain
        </StartLink>
      </section>
    </>
  );
}
