@AGENTS.md

# Apogee Space Research Suite

Learning site for the Apogee college space club. See README.md for what it does and how to run it.

## Scope

Keep it simple: login, pick 1 of 3 domains, 5 projects each, tick steps, unlock the next project.
There are no XP, badges, streaks or leaderboards. Don't add them unless asked.

## Rules that are easy to break

- **Next.js 16 with `cacheComponents` and `partialPrefetching`.** Read `node_modules/next/dist/docs/` before writing Next code.
  - `dynamicParams` isn't allowed. Unknown ids call `notFound()`.
  - Reading the clock or files during prerender needs `"use cache"`; see `lib/media.ts`.
- **Content is data.** Pages render `content/projects/*.json`, validated by `lib/schema.ts`. Change content there, not in components. Run `npm run check:content` after edits.
- **Checklist step ids are permanent.** Saved progress is keyed by step id. Never rename or reuse one.
- **The last checklist step of every project is pushing the work to GitHub.** The content tests enforce this.
- **One progress interface** in `lib/progress-store.ts`: `subscribe`, `getState`, `toggleStep`, `setDomain`.
  - Browser storage is used when Supabase keys are missing (demo mode); Supabase when they're set.
  - Components use `useProgress()` and never call Supabase directly.
- **The unlock rule** is `levelStatuses` in `lib/progress.ts`, unit tested in `tests/progress.test.ts`.
  - Level 1 is always open, and each later level needs every earlier one complete.
  - Unticking re-locks later levels but keeps their ticks.
- **Supabase is client-side only, protected by row level security** (`supabase/schema.sql`).
  - Only the URL and publishable key belong in the app.
  - Never use or ask for the secret or `service_role` key.
- **Theme:** warm black and grey with a gold accent (`app/globals.css` tokens). Avoid blue-tinted UI; it was dropped for looking generic.
- **Accessibility:** every page must pass the axe scan in `e2e/pages.e2e.ts`.
  - Scrollable regions need `tabIndex={0}`.
  - Animations respect reduced motion.
  - Images need meaningful `alt` text and a `credit`.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Local site at http://localhost:3000 |
| `npm run lint`, `npm run typecheck`, `npm test` | Checks to run before finishing a change |
| `npm run test:e2e` | Builds in demo mode on port 3100, runs browser and accessibility tests |
| `npm run check:links` | Checks every URL and YouTube video in the content |
| `npm run add:image -- <url> <project id> <name>` | Adds a picture to `public/media/<project id>/` |
