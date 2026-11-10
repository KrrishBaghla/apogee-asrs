# Writing Apogee content

Each project is one file, `content/projects/<id>.json`, checked by `lib/schema.ts`. Pages only render this data.

## Who it is for

A first-year college student who may be new to the topic. Write the way a friendly senior would explain it.

- Short sentences and everyday words. Explain a term the first time it appears.
- Teach the idea, then say what to do. `explain` must leave the reader understanding something, not point them elsewhere.
- Use analogies and real numbers where they help.
- Sentence case, no hype, no emojis, no em dashes.
- Everything stated as fact must be checked: APIs, dataset names, physics, prices.

## Every project has

| Field | What it is |
|---|---|
| `hero` | A striking landscape photo, at least 1200 px wide, shown across the top of the page and as the thumbnail |
| `overview` | What, why, space link, final result, difficulty, time |
| `howItWorks` | 3 to 5 boxes that show the whole project as a left-to-right flow |
| `keyIdeas` | 3 or 4 terms the student will meet, each explained in a sentence or two |
| `videos` | 1 or 2 videos to watch first, each with a reason to watch it |
| `parts` | Hardware projects only: every part, why it is needed, rough cost |
| `prerequisites`, `technologies` | What to know and what to use |
| `roadmap` | The steps. Each has `learn`, `explain`, `implement`, `outcome`, optional `figure`, `resources` |
| `resources`, `deliverables` | Links by category, and what to hand in |
| `checklist` | Tickable steps. The last one always includes pushing the finished work to GitHub |

Step ids in `checklist` are permanent, because progress is saved against them.

## Figures

At least half of the roadmap steps need a `figure`, and at least one must be a `diagram`. Pick what teaches that step best, and use a mix.

- `image`: a real photo that shows the thing being discussed.
- `diagram`: a hand-drawn SVG that explains a mechanism, such as a request going to a server or a transit dip in a light curve.
- `video`: a short video on exactly that step.
- `code`: a short snippet (at most about 25 lines) the student will actually use. Comment it.
- `compare`: two images of the same size, shown with a drag slider. Good for before and after.

## Photos

- Sources: NASA (`https://images-api.nasa.gov/search?q=...&media_type=image`), ESA, or Wikimedia Commons under a licence that allows reuse. Never use an image with an unclear licence.
- Save with `npm run add:image -- <url> <project id> <name>`. It lands in `public/media/<project id>/`.
- `credit` names the source and any licence, such as `NASA/JPL-Caltech` or `Jane Doe, CC BY-SA 4.0, Wikimedia Commons`. `sourceUrl` is the page the image came from.
- Open every saved image and look at it. It must really show what the caption says.

## Diagrams

Save as `public/media/<project id>/<name>.svg`. They sit on a dark panel and load as images, so they can't use page styles.

- `viewBox` about `0 0 720 400`, no width or height attributes, no background rectangle, no scripts or external files.
- Text: `font-family="Verdana, Arial, sans-serif"`, `font-size` 15 or larger, fill `#f1eee6`. Secondary text `#a8a5a0`. Lines `#5e5c58`. Boxes `#232325`. Highlight `#f5c48a`.
- Domain colour: web `#ee9a6c`, AI/ML `#c8d86a`, embedded `#86d8c9`.
- One idea per diagram, few words, and nothing touching or overlapping.
- Render it and look at it before finishing.

## Videos

- Use reputable channels, and pick videos that are short and suit a beginner.
- Confirm with `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=<id>`. Take `title` and `channel` from that reply. A failed reply means the video can't be used.

## Before finishing

`npm run check:content` and `npm run check:links -- <prefix>`. A link that fails gets replaced or removed, never guessed.
