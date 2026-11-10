import Link from "next/link";
import { AccountLinks } from "@/components/progress-links";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
            <ellipse cx="16" cy="16" rx="14" ry="7" fill="none" stroke="currentColor" strokeOpacity="0.5" transform="rotate(-25 16 16)" />
            <circle cx="28.7" cy="10" r="2.6" fill="var(--accent)" />
          </svg>
          <span className="font-display text-lg">{site.club}</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/domains" className="text-sm text-muted transition-colors hover:text-foreground">
            Domains
          </Link>
          <AccountLinks />
        </nav>
      </div>
    </header>
  );
}
