# Project context: Sadhana Circle

Paste this whole document into Copilot Chat (e.g. as the first message, or via `@workspace` context) before asking it to make changes. It explains what the app is, how it's built, and where everything lives.

## What this app is

A daily spiritual-practice ("sadhana") tracker for a devotee community. Users sign in with Google, log their daily practice, and see everyone else's logs on a public leaderboard to motivate each other. Fields tracked per day: sleep time (previous night), wake-up time, rounds of japa chanted, reading minutes, listening minutes, Mangal aarti attended (yes/no), seva/service done (yes/no), Srimad Bhagavatam reading minutes. Each day's log produces a computed score.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — both the "web app" and, via PWA manifest, installable on Android home screen
- **Supabase** — Postgres database, Google OAuth auth, Row Level Security for permissions. No custom backend server.
- **Tailwind CSS** — styling via design tokens defined in `tailwind.config.ts`
- **lucide-react** — icon set
- Deployed on **Vercel** (free tier), connected to a GitHub repo for auto-deploy on push

## Visual design

Warm **amber/saffron** theme on a light cream background (not dark mode). Design tokens (in `tailwind.config.ts` → `theme.extend.colors`): `bg`, `bg-elevated`, `bg-card`, `ink`, `ink-muted`, `gold`, `gold-soft`, `tulsi`, `saffron`, `peacock`, `peacock-deep`, `peacock-light`. Custom fonts: Fraunces (display/headings) + Work Sans (body), loaded via `next/font/google` in `app/layout.tsx`. Global styles/utility classes (`.card`, `.btn-primary`, `.divider-gold`, `.fade-in-up`, `.feather-sway`) live in `app/globals.css`.

Decorative motifs are **original SVG illustrations** (not copyrighted artwork/photos): `PeacockFeather.tsx`, `Flute.tsx`, `LotusDivider.tsx`, `HeroBanner.tsx`. Note: `HeroBanner.tsx` currently expects a user-supplied photo at `public/hero-krishna.jpg` (via `next/image`) — if that file is missing, the image will 404 visually but the build won't fail.

## App structure — bottom tab navigation (mobile-app style)

Layout is a phone-width column (`max-w-md mx-auto`) with a fixed bottom nav bar (`components/BottomNav.tsx`), 4 tabs:

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | **Home** — personal dashboard. Server component. Shows greeting, hero banner, *today's own* stats (rounds/reading/listening/wake time as `StatCard`s, mangal aarti/seva as badges), and a rotating `QuoteCard` (original text, not scripture quotes — see Content rules below). If not signed in, shows a sign-in CTA. |
| `/entry` | `app/entry/page.tsx` → `components/EntryForm.tsx` | **Log** — client component form to create/update *today's* entry (upsert on `user_id + entry_date`). Redirects to `/` on save. |
| `/board` | `app/board/page.tsx` | **Board** — public leaderboard. Server component. Everyone's entries for *today*, sorted by score, top 3 get gold/silver/bronze card styling, each row shows a `ScoreRing` (mala-bead visual, 16 beads = 16-round target). |
| `/profile` | `app/profile/page.tsx` | **Profile** — server component. Avatar, name, join date, computed stats: total days logged, current streak (consecutive days, computed in JS from entry dates), average score. `SignOutButton.tsx` is a client component (needs `onClick`) rendered inside this server page. |

Auth pages: `app/login/page.tsx` (Google sign-in button, client component) and `app/auth/callback/route.ts` (OAuth code exchange route handler).

## Data layer

**`lib/supabase/client.ts`** — browser Supabase client (`createBrowserClient`), used in client components.
**`lib/supabase/server.ts`** — server Supabase client (`createServerClient` with cookie handling), used in server components/route handlers.

**`supabase/schema.sql`** — the full DB schema, run once in Supabase's SQL Editor. Two tables:
- `profiles` (id references `auth.users`, full_name, avatar_url, created_at) — auto-populated via a Postgres trigger (`handle_new_user`) on every new `auth.users` signup.
- `sadhana_entries` (id, user_id FK → profiles, entry_date, sleep_time, wake_time, rounds_chanted, reading_minutes, listening_minutes, mangal_aarti bool, seva bool, bhagavatam_minutes, score, created_at, updated_at; unique on `user_id + entry_date`).

Row Level Security: everyone can `SELECT` all rows in both tables (this is intentional — the whole point of the app is public visibility to motivate the group). Users can only `INSERT`/`UPDATE` their own rows (`auth.uid() = user_id`).

## Scoring logic

**`lib/scoring.ts`** — single source of truth for all point values, in a `POINTS` constant object at the top of the file (wake-time thresholds, points per round, per-15-minutes of reading/listening/Bhagavatam, mangal aarti, seva, a bonus for hitting the 16-round target). `calculateScore(entry)` computes the total; called client-side in `EntryForm.tsx` right before the Supabase upsert, and the resulting number is stored in the `score` column (not recomputed on every read). **If you change scoring rules, this is the only file that should need editing** — but note existing stored `score` values in the DB won't retroactively update unless you re-save those rows.

## Content/copyright constraints (please respect these when generating code or content)

- Do not embed real photographs of deities, temples, or any copyrighted/watermarked images found online. The hero image slot is designed to accept a **user-supplied** local file only (`public/hero-krishna.jpg`), never a fetched or generated copy of existing artwork.
- `QuoteCard.tsx` intentionally uses short **original** reflections, not verbatim scripture translations, to avoid quoting copyrighted translations (e.g. Bhagavad-Gita As It Is is copyrighted). Keep any future quote content original or clearly public-domain.

## PWA / installability

`next.config.js` wraps the app with `next-pwa` (disabled in dev). `public/manifest.json` defines the installable app metadata (name, colors, icons). Icons at `public/icons/icon-192.png` / `icon-512.png` are simple generated mala-bead-ring graphics in the amber palette, not real photos.

## Environment variables

Two required, in `.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Same two variables must be set in Vercel's project settings for the deployed build.

## Known current state / open items

- `public/hero-krishna.jpg` is expected by `HeroBanner.tsx` but may not exist yet in the repo — the user is adding their own licensed/personal photo there.
- No history/analytics view yet beyond today's board and profile aggregate stats — no per-day historical charts.
- No editing of past days' entries (form only reads/writes *today's* row).
- No private/hidden fields — everything is public by design (explicit product decision, not an oversight).
- Scoring is intentionally simple for now (flagged as "refine later" by the user) — expect requests to tune `lib/scoring.ts`.

## How to work on this project

Standard Next.js App Router conventions apply. Server components fetch data directly with the Supabase server client (no API routes needed for reads). Client components (forms, buttons with interactivity, anything using hooks) are marked `"use client"` at the top and use the Supabase browser client. Styling should stay within the existing Tailwind token system (`bg`, `ink`, `gold`, etc.) rather than introducing new arbitrary colors, to keep the amber/saffron theme consistent.
