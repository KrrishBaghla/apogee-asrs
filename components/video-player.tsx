"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

// Shows a thumbnail first. YouTube only loads once the student presses play.
export function VideoPlayer({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 grid size-full cursor-pointer place-items-center"
        >
          <Image
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
          />
          <span className="relative grid size-16 place-items-center rounded-full bg-accent text-background shadow-lg transition-transform group-hover:scale-110 motion-reduce:transform-none">
            <Play className="ml-1 size-7" fill="currentColor" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
