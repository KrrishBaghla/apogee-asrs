"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import {
  altitudeFromSlider,
  eccentricAnomaly,
  formatDuration,
  orbitFor,
  sliderFromAltitude,
  speedAt,
} from "@/lib/orbit";

const landmarks = [
  { name: "Space Station", altitude: 408, fact: "Astronauts up here see about 16 sunrises every day." },
  { name: "GPS", altitude: 20200, fact: "GPS satellites circle here twice a day. Your phone listens to at least four of them." },
  { name: "Geostationary", altitude: 35786, fact: "Circle Earth at this height and one lap takes a day, so satellites seem to hover over one spot." },
  { name: "The Moon", altitude: 384400, fact: "Apollo crews took about three days to get this far." },
];

const SECONDS_PER_LAP = 14;
const START = 0.03;
const INTRO_TARGET = sliderFromAltitude(35786);

function layout(width: number, height: number, t: number) {
  const compact = width < 640;
  const earthX = width * (compact ? 0.17 : 0.16);
  const earthY = height / 2;
  const maxApogee = width - earthX - (compact ? 20 : 56);
  // The orbit is tallest at the Moon. Sizing the perigee from that keeps it inside the stage.
  const tallest = height / 2 - 14;
  const perigee = Math.min((compact ? 24 : 42) * 1.4, tallest ** 2 / maxApogee);
  const earthRadius = perigee / 1.4;
  const apogee = perigee * 1.05 + (maxApogee - perigee * 1.05) * t;
  const semiMajor = (apogee + perigee) / 2;
  return {
    earthRadius,
    earthX,
    earthY,
    perigee,
    apogee,
    semiMajor,
    semiMinor: Math.sqrt(apogee * perigee),
    eccentricity: (apogee - perigee) / (apogee + perigee),
    centerX: earthX + (apogee - perigee) / 2,
    maxApogee,
  };
}

export function OrbitLab() {
  const [t, setT] = useState(START);
  const [size, setSize] = useState({ width: 1200, height: 480 });
  const [touched, setTouched] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const satellite = useRef<SVGCircleElement>(null);
  const speedLabel = useRef<HTMLSpanElement>(null);
  const live = useRef({ t: START, size });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    live.current = { t, size };
  }, [t, size]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The one page-load moment: the orbit rises from the Space Station to geostationary height.
  useEffect(() => {
    if (touched) return;
    if (reduceMotion) {
      const frame = requestAnimationFrame(() => setT(INTRO_TARGET));
      return () => cancelAnimationFrame(frame);
    }
    const begin = performance.now();
    let frame = requestAnimationFrame(function rise(now) {
      const progress = Math.min((now - begin) / 2800, 1);
      const eased = 1 - (1 - progress) ** 3;
      setT(START + (INTRO_TARGET - START) * eased);
      if (progress < 1) frame = requestAnimationFrame(rise);
    });
    return () => cancelAnimationFrame(frame);
  }, [touched, reduceMotion]);

  // The satellite moves outside React state so the page doesn't re-render every frame.
  useEffect(() => {
    let frame = 0;
    let lastLabel = 0;
    let meanAnomaly = Math.PI;

    function place(now: number, delta: number) {
      const shape = layout(live.current.size.width, live.current.size.height, live.current.t);
      meanAnomaly = (meanAnomaly + (delta / SECONDS_PER_LAP) * 2 * Math.PI) % (2 * Math.PI);
      const E = eccentricAnomaly(meanAnomaly, shape.eccentricity);
      const x = shape.earthX - shape.semiMajor * (Math.cos(E) - shape.eccentricity);
      const y = shape.earthY + shape.semiMinor * Math.sin(E);
      satellite.current?.setAttribute("cx", String(x));
      satellite.current?.setAttribute("cy", String(y));

      if (now - lastLabel > 120 && speedLabel.current) {
        lastLabel = now;
        const orbit = orbitFor(altitudeFromSlider(live.current.t));
        const height = (1 - Math.cos(E)) / 2;
        const r = orbit.perigee + (orbit.apogee - orbit.perigee) * height;
        speedLabel.current.textContent = `${speedAt(r, orbit.semiMajorAxis).toFixed(2)} km/s`;
      }
    }

    let previous = performance.now();
    frame = requestAnimationFrame(function tick(now) {
      place(now, reduceMotion ? 0 : (now - previous) / 1000);
      previous = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  function moveTo(next: number) {
    setTouched(true);
    setT(Math.min(Math.max(next, 0), 1));
  }

  function dragTo(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const shape = layout(size.width, size.height, 0);
    const start = shape.perigee * 1.05;
    moveTo((event.clientX - bounds.left - shape.earthX - start) / (shape.maxApogee - start));
  }

  const shape = layout(size.width, size.height, t);
  const altitude = altitudeFromSlider(t);
  const orbit = orbitFor(altitude);
  const apogeeX = shape.earthX + shape.apogee;
  const nearest = landmarks.reduce((best, item) =>
    Math.abs(sliderFromAltitude(item.altitude) - t) < Math.abs(sliderFromAltitude(best.altitude) - t) ? item : best,
  );
  const atLandmark = Math.abs(sliderFromAltitude(nearest.altitude) - t) < 0.02;
  const altitudeLabel = `${Math.round(altitude).toLocaleString("en-US")} km`;

  return (
    <div>
      <div ref={stage} className="mt-6 h-[260px] sm:h-[400px] lg:h-[max(320px,min(36vw,640px,calc(100vh-23rem)))]">
        <svg
          width="100%"
          height="100%"
          className="cursor-ew-resize touch-pan-y select-none"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragTo(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons) dragTo(event);
          }}
        >
          <defs>
            <radialGradient id="earth-day" cx="28%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#8fb4ff" />
              <stop offset="38%" stopColor="#2f4aa8" />
              <stop offset="72%" stopColor="#121748" />
              <stop offset="100%" stopColor="#0c0c0d" />
            </radialGradient>
            <radialGradient id="earth-air" cx="50%" cy="50%" r="50%">
              <stop offset="78%" stopColor="#7ea6ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7ea6ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={shape.earthX} cy={shape.earthY} r={shape.earthRadius * 1.28} fill="url(#earth-air)" />
          <circle cx={shape.earthX} cy={shape.earthY} r={shape.earthRadius} fill="url(#earth-day)" />

          <line x1={shape.earthX} y1={shape.earthY} x2={apogeeX} y2={shape.earthY} stroke="var(--line)" />
          <ellipse
            cx={shape.centerX}
            cy={shape.earthY}
            rx={shape.semiMajor}
            ry={shape.semiMinor}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity="0.55"
          />

          <circle cx={apogeeX} cy={shape.earthY} r="15" fill="none" stroke="var(--accent)" strokeOpacity="0.4" />
          <circle cx={apogeeX} cy={shape.earthY} r="6" fill="var(--accent)" />
          <text
            x={apogeeX + (t > 0.72 ? -24 : 24)}
            y={shape.earthY + 5}
            textAnchor={t > 0.72 ? "end" : "start"}
            fill="var(--accent)"
            fontSize="15"
          >
            {touched ? "Apogee" : "Drag me"}
          </text>

          <circle ref={satellite} r="4.5" fill="#fff" />
        </svg>
      </div>

      <div className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={t}
          onChange={(event) => moveTo(Number(event.target.value))}
          aria-label="Apogee height"
          aria-valuetext={altitudeLabel}
          className="w-full"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {landmarks.map((item) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={atLandmark && item === nearest}
              onClick={() => moveTo(sliderFromAltitude(item.altitude))}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                atLandmark && item === nearest ? "border-accent text-accent" : "border-line text-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:max-w-3xl">
          <div>
            <dt className="text-sm text-muted">Highest point</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums sm:text-4xl">{altitudeLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Speed right now</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums sm:text-4xl">
              <span ref={speedLabel}>0.00 km/s</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">One full orbit</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums sm:text-4xl">{formatDuration(orbit.period)}</dd>
          </div>
        </dl>
        <p className="mt-5 min-h-12 max-w-xl text-muted" aria-live="polite">
          {atLandmark ? nearest.fact : "Keep going. Try reaching the Moon."}
        </p>
      </div>
    </div>
  );
}
