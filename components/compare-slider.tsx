"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";

type Side = { src: string; label: string };

function Tag({ side, className }: { side: string; className: string }) {
  return (
    <span className={`absolute top-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white ${className}`}>{side}</span>
  );
}

export function CompareSlider({
  before,
  after,
  alt,
  width,
  height,
}: {
  before: Side;
  after: Side;
  alt: string;
  width: number;
  height: number;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative overflow-hidden rounded-xl select-none" style={{ aspectRatio: `${width} / ${height}` }}>
      <Image src={after.src} alt={alt} fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={before.src} alt="" fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
        <Tag side={before.label} className="left-3" />
      </div>
      {position < 70 && <Tag side={after.label} className="right-3" />}

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Compare ${before.label} and ${after.label}`}
        className="peer absolute inset-0 h-full! w-full touch-pan-y opacity-0"
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white peer-focus-visible:bg-accent"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-white text-background shadow-lg">
          <ChevronsLeftRight className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
