import { Figure } from "@/components/figure";
import type { ProjectDetail } from "@/lib/schema";

export function ExternalLink({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-domain underline-offset-4 hover:underline">
      {label}
    </a>
  );
}

export function Roadmap({ steps }: { steps: ProjectDetail["roadmap"] }) {
  return (
    <ol className="wrap-anywhere">
      {steps.map((step, index) => (
        <li key={step.title} className="relative pb-14 pl-12 last:pb-0 sm:pl-16">
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="absolute top-10 bottom-0 left-[1.1875rem] w-px bg-line" />
          )}
          <span className="absolute top-0 left-0 grid size-10 place-items-center rounded-full border border-domain/50 font-display text-lg text-domain">
            {index + 1}
          </span>

          <h3 className="pt-1 font-display text-2xl sm:text-3xl">{step.title}</h3>
          <p className="mt-2 text-domain">{step.learn}</p>
          <p className="mt-3 leading-7 text-foreground/85">{step.explain}</p>

          {step.figure && (
            <div className="mt-5">
              <Figure figure={step.figure} />
            </div>
          )}

          <div className="mt-5 border-l-2 border-accent pl-4">
            <p className="font-medium text-accent">Your turn</p>
            <p className="mt-1 leading-7">{step.implement}</p>
            <p className="mt-1 text-sm text-muted">When you finish: {step.outcome}</p>
          </div>

          {step.resources.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {step.resources.map((resource) => (
                <li key={resource.url}>
                  <ExternalLink {...resource} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
