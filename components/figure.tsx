import Image from "next/image";
import { CodeBlock } from "@/components/code-block";
import { CompareSlider } from "@/components/compare-slider";
import { VideoPlayer } from "@/components/video-player";
import { jpegSize } from "@/lib/media";
import type { Figure as FigureData } from "@/lib/schema";

const contentSizes = "(min-width: 1024px) 40rem, 100vw";

export function Credit({ credit, sourceUrl }: { credit: string; sourceUrl: string }) {
  return (
    <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-muted/80 underline-offset-2 hover:underline">
      {credit}
    </a>
  );
}

async function FigureBody({ figure }: { figure: FigureData }) {
  switch (figure.kind) {
    case "image":
      return (
        <Image
          src={figure.src}
          alt={figure.alt}
          {...await jpegSize(figure.src)}
          sizes={contentSizes}
          className="h-auto w-full rounded-xl"
        />
      );
    case "diagram":
      return (
        <div className="panel p-3 sm:p-5">
          <Image src={figure.src} alt={figure.alt} width={720} height={400} className="h-auto w-full" />
        </div>
      );
    case "video":
      return <VideoPlayer youtubeId={figure.youtubeId} title={figure.title} />;
    case "code":
      return <CodeBlock code={figure.code} language={figure.language} />;
    case "compare":
      return (
        <CompareSlider before={figure.before} after={figure.after} alt={figure.alt} {...await jpegSize(figure.after.src)} />
      );
  }
}

export function Figure({ figure }: { figure: FigureData }) {
  return (
    <figure>
      <FigureBody figure={figure} />
      <figcaption className="mt-2 text-sm leading-relaxed text-muted">
        {figure.caption}
        {(figure.kind === "image" || figure.kind === "compare") && (
          <>
            {" "}
            <Credit credit={figure.credit} sourceUrl={figure.sourceUrl} />
          </>
        )}
        {figure.kind === "video" && <span className="text-muted/80"> From {figure.channel}.</span>}
      </figcaption>
    </figure>
  );
}
