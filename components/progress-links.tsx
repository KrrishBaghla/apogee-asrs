"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { currentLevelIndex, levelStatuses, totalSteps, type Level } from "@/lib/progress";
import { signOut, useProgress } from "@/lib/progress-store";

// Returning students go straight back to the step they were on.
export function StartLink({
  levelsByDomain,
  className,
  children,
}: {
  levelsByDomain: Record<string, Level[]>;
  className: string;
  children: string;
}) {
  const { progress, ready } = useProgress();
  const levels = ready && progress.domain ? levelsByDomain[progress.domain] : undefined;
  const statuses = levels && levelStatuses(levels, progress.done);

  if (levels && statuses && totalSteps(statuses).done > 0) {
    const level = levels[currentLevelIndex(statuses)];
    return (
      <Link href={`/projects/${level.id}`} className={className}>
        Continue {level.title}
      </Link>
    );
  }
  return (
    <Link href="/domains" className={className}>
      {children}
    </Link>
  );
}

const navLink = "text-sm text-muted transition-colors hover:text-foreground";

export function AccountLinks() {
  const { progress, ready, status } = useProgress();
  if (!ready) return null;
  return (
    <>
      {progress.domain && status !== "signed-out" && (
        <Link href={`/domains/${progress.domain}`} className={navLink}>
          My path
        </Link>
      )}
      {status === "signed-out" && (
        <Link href="/login" className={navLink}>
          Log in
        </Link>
      )}
      {status === "signed-in" && (
        <button type="button" onClick={() => void signOut()} className={navLink}>
          Log out
        </button>
      )}
    </>
  );
}

export function DomainProgress({ levels }: { levels: Level[] }) {
  const { progress, ready } = useProgress();
  const { done, total } = totalSteps(levelStatuses(levels, progress.done));
  if (!ready || done === 0) return null;

  return (
    <div className="max-w-xs">
      <p className="mb-1.5 text-sm text-domain">
        {done} of {total} steps done
      </p>
      <ProgressBar done={done} total={total} label="Steps finished in this domain" />
    </div>
  );
}
