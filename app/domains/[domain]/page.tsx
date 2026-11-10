import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DomainIcon } from "@/components/domain-card";
import { LevelPath } from "@/components/level-path";
import { getDomain, getDomains, getLevels } from "@/lib/content";

// Every page here is prerendered, so nothing is gained by streaming a placeholder.
export const instant = false;

export function generateStaticParams() {
  return getDomains().map((domain) => ({ domain: domain.id }));
}

export async function generateMetadata(props: PageProps<"/domains/[domain]">): Promise<Metadata> {
  const { domain: id } = await props.params;
  return { title: getDomain(id)?.name };
}

export default async function DomainPage(props: PageProps<"/domains/[domain]">) {
  const { domain: id } = await props.params;
  const domain = getDomain(id);
  if (!domain) notFound();

  return (
    <div data-domain={domain.id} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/domains" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All domains
      </Link>

      <h1 className="mt-7 flex items-center gap-4 font-display text-5xl font-light tracking-tight sm:text-7xl">
        {domain.name}
        <DomainIcon domain={domain} className="hidden size-9 text-domain sm:block" />
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{domain.description}</p>

      <LevelPath domainId={domain.id} levels={getLevels(domain)} />
    </div>
  );
}
