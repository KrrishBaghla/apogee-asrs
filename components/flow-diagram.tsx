import { Fragment } from "react";
import {
  Battery, Brain, Camera, ChartLine, Cloud, Code, Cog, Compass, Cpu, Database, Eye, File, Filter, Globe,
  Image, Layers, Map, Monitor, Moon, Radio, Rocket, Route, Satellite, Search, Server, Sun, Target, Telescope,
  Thermometer, Upload, User, Wifi, Zap, type LucideIcon,
} from "lucide-react";
import type { FlowIcon, ProjectDetail } from "@/lib/schema";

const icons: Record<FlowIcon, LucideIcon> = {
  user: User, globe: Globe, server: Server, database: Database, code: Code, image: Image, cpu: Cpu,
  camera: Camera, satellite: Satellite, radio: Radio, wifi: Wifi, map: Map, chart: ChartLine, brain: Brain,
  rocket: Rocket, telescope: Telescope, thermometer: Thermometer, battery: Battery, cog: Cog, monitor: Monitor,
  cloud: Cloud, sun: Sun, moon: Moon, file: File, upload: Upload, filter: Filter, target: Target, route: Route,
  search: Search, layers: Layers, compass: Compass, eye: Eye, zap: Zap,
};

export function FlowDiagram({ steps }: { steps: ProjectDetail["howItWorks"] }) {
  return (
    <ol className="flex flex-col gap-0 md:flex-row">
      {steps.map((step, index) => {
        const Icon = icons[step.icon];
        return (
          <Fragment key={step.label}>
            {index > 0 && (
              <li aria-hidden="true" className="flow-link ml-6 h-8 w-px md:mt-6 md:ml-0 md:h-px md:w-auto md:min-w-4 md:flex-[0.35]" />
            )}
            <li className="flex gap-4 md:flex-1 md:flex-col md:gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-domain/50 bg-surface text-domain">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg leading-tight">{step.label}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{step.detail}</p>
              </div>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
