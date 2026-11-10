"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { OrbitStack } from "@/components/orbit-stack";
import { ProgressBar } from "@/components/progress-bar";
import { currentLevelIndex, levelStatuses, totalSteps, type Level, type LevelStatus } from "@/lib/progress";
import { progressStore, useProgress } from "@/lib/progress-store";
import type { ProjectSummary } from "@/lib/schema";
import { levelNames, levelOrbits } from "@/lib/site";

export type PathLevel = Level & Pick<ProjectSummary, "summary"> & { heroSrc: string | null };

function Status({ level, status }: { level: number; status: LevelStatus }) {
  if (status.complete && status.unlocked) {
    return (
      <p className="mt-0.5 inline-flex items-center gap-1.5 text-domain">
        <Check className="size-4" aria-hidden="true" />
        Complete
      </p>
    );
  }
  if (!status.unlocked) {
    return (
      <p className="mt-0.5 inline-flex items-center gap-1.5 text-muted">
        <Lock className="size-3.5" aria-hidden="true" />
        Finish level {level - 1} to unlock
      </p>
    );
  }
  if (status.done === 0) return <p className="mt-0.5 text-accent">Start here</p>;
  return (
    <div className="mt-1.5">
      <p className="text-accent">
        {status.done} of {status.total} steps
      </p>
      <div className="mt-1.5">
        <ProgressBar done={status.done} total={status.total} label={`Level ${level} steps finished`} />
      </div>
    </div>
  );
}

export function LevelPath({ domainId, levels }: { domainId: string; levels: PathLevel[] }) {
  const { progress, ready } = useProgress();
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => progressStore.setDomain(domainId), [domainId]);

  const statuses = levelStatuses(levels, progress.done);
  const focused = hovered ?? levels[currentLevelIndex(statuses)].level;
  const overall = totalSteps(statuses);

  return (
    <div className="mt-10">
      <div className="grid items-center gap-x-10 gap-y-6 md:grid-cols-[1fr_17rem]">
        <OrbitStack highlight={focused} className="w-full" />
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Your progress</span>
            <span className="text-muted">
              {overall.done} of {overall.total} steps
            </span>
          </div>
          <ProgressBar done={overall.done} total={overall.total} label="Steps finished in this domain" />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Every level reaches a higher orbit. Level {focused} takes you to {levelOrbits[focused].place}, {levelOrbits[focused].height}.
          </p>
        </div>
      </div>

      <ol className="mt-10" onMouseLeave={() => setHovered(null)}>
        {levels.map((level, index) => {
          const status = statuses[index];
          const dimmed = ready && !status.unlocked;
          return (
            <li key={level.id} className="border-t border-line">
              <Link
                href={`/projects/${level.id}`}
                onMouseEnter={() => setHovered(level.level)}
                onFocus={() => setHovered(level.level)}
                onBlur={() => setHovered(null)}
                className="group grid gap-x-6 gap-y-4 py-7 sm:grid-cols-[13rem_1fr] md:grid-cols-[13rem_1fr_11rem]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
                  {level.heroSrc && (
                    <Image
                      src={level.heroSrc}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 13rem, 100vw"
                      className={`object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none ${
                        dimmed ? "opacity-50 saturate-50" : ""
                      }`}
                    />
                  )}
                  <span className="absolute bottom-1 left-3 font-display text-4xl font-light text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">
                    {level.level}
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-2xl transition-colors group-hover:text-domain sm:text-3xl">
                    {level.title}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-muted">{level.summary}</p>
                </div>
                <div className="text-sm sm:col-start-2 md:col-start-3 md:text-right">
                  <p>{levelNames[level.level]}</p>
                  {ready && <Status level={level.level} status={status} />}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
