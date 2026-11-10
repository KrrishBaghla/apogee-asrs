import type { Metadata } from "next";
import { DomainRow } from "@/components/domain-card";
import { getDomains } from "@/lib/content";

export const metadata: Metadata = { title: "Choose your domain" };

export default function DomainsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-5xl font-light tracking-tight sm:text-7xl">Choose your domain</h1>
      <p className="mt-4 mb-12 max-w-xl text-lg text-muted">
        Each one starts from zero. You can switch later, and your progress stays saved.
      </p>
      {getDomains().map((domain) => (
        <DomainRow key={domain.id} domain={domain} detailed />
      ))}
    </div>
  );
}
