"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { levelStatuses, type Level } from "@/lib/progress";
import { progressStore, useProgress } from "@/lib/progress-store";
import { levelOrbits } from "@/lib/site";

type Props = {
  projectId: string;
  domainId: string;
  steps: { id: string; label: string }[];
  levels: Level[];
};

export function ProjectChecklist({ projectId, domainId, steps, levels }: Props) {
  const { progress, ready, status, canTick, error } = useProgress();
  const reduceMotion = useReducedMotion();

  useEffect(() => progressStore.setDomain(domainId), [domainId]);

  const statuses = levelStatuses(levels, progress.done);
  const index = levels.findIndex((level) => level.id === projectId);
  const level = statuses[index];
  const next = levels[index + 1];
  const signedOut = ready && status === "signed-out";
  const locked = ready && !signedOut && !level.unlocked;
  const blocking = levels[statuses.findIndex((item) => !item.complete)];
  const finished = ready && canTick && level.unlocked && level.complete;

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl">Your checklist</h2>
        <p className="text-sm text-muted">
          {level.done} of {level.total}
        </p>
      </div>
      <div className="mt-3">
        <ProgressBar done={level.done} total={level.total} label="Steps finished in this project" />
      </div>

      {signedOut && (
        <p className="mt-4 text-sm text-muted">
          <Link
            href={`/login?next=/projects/${projectId}`}
            className="text-accent underline underline-offset-4"
          >
            Log in
          </Link>{" "}
          to tick off steps and save your progress.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-[#ff9a8a]">
          {error}
        </p>
      )}

      {locked && (
        <p className="mt-4 flex gap-2 text-sm text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            You can read everything here. Finish{" "}
            <Link href={`/projects/${blocking.id}`} className="text-domain underline underline-offset-4">
              {blocking.title}
            </Link>{" "}
            to start ticking.
          </span>
        </p>
      )}

      <ul className="mt-4 space-y-1">
        {steps.map((step) => {
          const checked = progress.done.includes(step.id);
          return (
            <li key={step.id}>
              <label
                className={`flex gap-3 rounded-lg p-2 text-sm leading-snug transition-colors ${
                  locked || signedOut ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-white/5"
                }`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  disabled={locked || !ready || !canTick}
                  onChange={() => progressStore.toggleStep(step.id)}
                />
                <span
                  className={`mt-px grid size-5 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    checked ? "border-domain bg-domain text-background" : "border-muted/60"
                  }`}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                </span>
                <span className={checked ? "text-muted" : ""}>{step.label}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {finished && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 border-t border-line pt-4"
        >
          <p className="font-display text-lg">You reached {levelOrbits[levels[index].level].place}.</p>
          {next ? (
            <Link
              href={`/projects/${next.id}`}
              className="mt-3 inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Start level {next.level}: {next.title}
            </Link>
          ) : (
            <p className="mt-1 text-sm text-muted">That was the last level. You finished this whole domain.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
