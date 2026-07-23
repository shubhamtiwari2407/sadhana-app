# Sadhana Circle

A daily sadhana tracker: log your practice, see a public feed of everyone's sadhana, and earn points.
Works as a website and installs on Android as an app (PWA — no Play Store needed).

Everything below is free at community scale.

---

## 1. Create your Supabase project (free database + Google login)

1. Go to https://supabase.com → sign up → **New project**.
2. Wait for it to finish provisioning (~2 min).
3. In the left sidebar, go to **SQL Editor** → **New query**, paste in the contents of
   `supabase/schema.sql` from this project, and click **Run**. This creates the
   `profiles` and `sadhana_entries` tables with the right permissions.
4. Go to **Project Settings → API**. Copy:
   - `Project URL`
   - `anon public` key
   You'll paste these into `.env.local` in step 3 below.

## 2. Turn on Google login

1. In Supabase: **Authentication → Providers → Google** → toggle it on.
2. You need a Google OAuth Client ID/Secret:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create a project (or use an existing one) → **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Under **Authorized redirect URIs**, add the callback URL Supabase shows you on the
     Google provider settings page (looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`)
   - Copy the generated **Client ID** and **Client Secret** into the Supabase Google provider
     settings, and click **Save**.
3. In Supabase **Authentication → URL Configuration**, set:
   - **Site URL**: your deployed site URL (you'll get this in step 4; use `http://localhost:3000`
     for now and update it after deploying)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and, later, your deployed
     `https://yourapp.vercel.app/auth/callback`

## 3. Run it locally

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase Project URL and anon key into .env.local
npm run dev
```

Open http://localhost:3000 — sign in with Google, add today's sadhana, and see it on the feed.

## 4. Deploy for free (Vercel)

1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. In the Vercel project's **Environment Variables**, add the same two variables from
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Vercel gives you a free `https://yourapp.vercel.app` URL.
5. Go back to Supabase **Authentication → URL Configuration** and update the **Site URL**
   and **Redirect URLs** to use your real Vercel domain (keep localhost too if you want to
   keep developing locally).

## 5. Install on Android

Open your deployed URL in Chrome on Android → tap the **⋮** menu → **Add to Home screen**.
It'll behave like a normal app icon, no Play Store needed.

---

## Where things live

- `supabase/schema.sql` — database tables and permissions (run once, in Supabase)
- `lib/scoring.ts` — every point value used to score a day's sadhana. Change a number here
  and the whole app updates.
- `components/EntryForm.tsx` — the daily log-your-sadhana form
- `app/page.tsx` — the public feed / leaderboard (home page)
- `app/login/page.tsx` — Google sign-in

## Adjusting the scoring later

Open `lib/scoring.ts` — every activity's point value is a single named constant in the
`POINTS` object at the top of the file. Nothing else needs to change.

## Notes on privacy

Right now every field of every entry is visible to everyone who opens the app (per your
choice: fully public). If you ever want to hide specific fields or make the feed private
to logged-in users only, that's a small change to the Supabase Row Level Security policy
in `supabase/schema.sql` and the query in `app/page.tsx` — just ask.
