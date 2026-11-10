# Apogee Space Research Suite

The learning site for **Apogee**, the college space club. A student logs in, picks one of three domains, and works through five projects in order. Each project is a guided path with pictures, diagrams, videos and a checklist. Ticking every step unlocks the next project.

| Domain | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|---|---|---|---|---|---|
| Web Development | Space Picture Gallery | Asteroid Threat Dashboard | Live ISS Tracker | What's Above Me | Mission Control Dashboard |
| AI/ML | Telescope Image Enhancer | Mars Crater Detector | Exoplanet Hunter | Galaxy Classifier | Lunar Rover Pathfinder |
| Embedded & Robotics | Mini Space Weather Station | ISS Pointer | Mini CanSat | Autonomous Rover | Vision-Guided Rover |

## Run it on your computer

You need [Node.js](https://nodejs.org) 24 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without Supabase keys the site runs in **demo mode**: everything works, and progress is saved in the browser instead of an account. To switch on accounts, follow [supabase/README.md](supabase/README.md).

## Change the projects

Every project is one JSON file in [content/projects/](content/projects/). The pages are built from these files, so you never need to touch the code to change what students read. [content/README.md](content/README.md) explains every field.

After an edit, run:

```bash
npm run check:content   # checks every project file is complete and valid
npm run check:links     # opens every link and video, and reports any that are broken
```

To add a picture to a project:

```bash
npm run add:image -- <image url> <project id> <name>
```

It downloads the picture, shrinks it, removes its hidden metadata and saves it to `public/media/<project id>/`. Only use pictures you're allowed to reuse, such as NASA or ESA images, and fill in the `credit` field.

Don't change a checklist step's `id` once students are using the site. Their ticks are saved by `id`, so changing it clears that tick for everyone. Changing the `label` is fine.

## Check everything works

```bash
npm run lint        # code style
npm run typecheck   # type errors
npm test            # unlock rules and project files
npm run test:e2e    # the site in a real browser, on desktop and phone
```

`test:e2e` builds the site in demo mode and checks the student journey, every page at desktop and phone size, broken images, and an automated accessibility scan. It never touches real accounts.

To also test real sign-up and saving against your Supabase project, start `npm run dev` with your keys set and email confirmation off, then run:

```bash
E2E_ACCOUNTS_URL=http://localhost:3000 npm run test:e2e -- accounts --project=desktop
```

Each run creates one account named `apogee.test.<number>@example.com`. Delete it afterwards under **Authentication > Users** in Supabase.

## Put it online

The site is a standard Next.js app, so [Vercel](https://vercel.com) works with no extra setup:

1. Push this folder to a GitHub repository.
2. Import the repository on Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under **Environment Variables**.
4. In Supabase, add the site's address under **Authentication > URL Configuration**.

Before real students sign up, decide on email confirmation, as described in step 3 of [supabase/README.md](supabase/README.md).

## How it's built

- [Next.js](https://nextjs.org) 16 with the App Router, React 19, TypeScript and Tailwind CSS.
- [Supabase](https://supabase.com) for logins and saved progress. Row level security means each student can only read and change their own rows.
- [Zod](https://zod.dev) checks every project file against [lib/schema.ts](lib/schema.ts).
- The unlock rule lives in one small function in [lib/progress.ts](lib/progress.ts).
- Vitest for unit tests, Playwright and axe for browser and accessibility tests.

| Folder | What's in it |
|---|---|
| `app/` | The pages: home, domains, a domain's path, a project, and login |
| `components/` | The pieces the pages are made of |
| `content/` | The three domains and fifteen projects |
| `lib/` | Loading content, the unlock rule, and saving progress |
| `public/media/` | Pictures and diagrams, one folder per project |
| `supabase/` | The database tables and the accounts setup guide |
| `e2e/` and `tests/` | Browser tests and unit tests |
