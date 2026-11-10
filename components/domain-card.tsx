import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, CircuitBoard, Globe } from "lucide-react";
import { OrbitStack } from "@/components/orbit-stack";
import { DomainProgress } from "@/components/progress-links";
import { getLevels } from "@/lib/content";
import type { Domain } from "@/lib/schema";

const icons = { web: Globe, ai: BrainCircuit, embedded: CircuitBoard };

export function DomainIcon({ domain, className }: { domain: Domain; className?: string }) {
  const Icon = icons[domain.icon];
  return <Icon className={className} aria-hidden="true" />;
}

export function DomainRow({ domain, detailed = false }: { domain: Domain; detailed?: boolean }) {
  const first = domain.projects[0];
  const last = domain.projects[domain.projects.length - 1];
  const levels = getLevels(domain);
  const picture = levels[levels.length - 1].heroSrc;

  return (
    <Link
      href={`/domains/${domain.id}`}
      data-domain={domain.id}
      className="group grid items-center gap-x-10 gap-y-5 border-t border-line py-9 md:grid-cols-[1fr_1fr_14rem]"
    >
      <div>
        <h3 className="font-display text-4xl font-light transition-colors group-hover:text-domain sm:text-5xl">
          {domain.name}
        </h3>
        <p className="mt-2 text-lg text-domain">{domain.tagline}</p>
      </div>
      <div className="space-y-3 text-muted">
        <p>
          <span className="text-foreground">You begin with</span> {first.title}.{" "}
          <span className="text-foreground">You finish with</span> {last.title}.
        </p>
        {detailed && <p className="text-sm">Skills: {domain.skills.join(", ")}</p>}
        <DomainProgress levels={levels} />
      </div>
      {picture ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
          <Image
            src={picture}
            alt=""
            fill
            sizes="(min-width: 768px) 14rem, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        </div>
      ) : (
        <OrbitStack className="hidden w-full md:block" />
      )}
    </Link>
  );
}
