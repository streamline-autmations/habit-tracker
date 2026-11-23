# Baseline

Personal daily-reset / habit tracker. Single-user, no auth, mobile-first PWA.

## First-time setup (do this once, in order)

1. **Run the database schema.**
   Open the Baseline Supabase project → SQL editor →
   https://lpjwfjkgqpgydzozuusj.supabase.co
   Paste the entire contents of `supabase/schema.sql` and run it.
   This creates the tables, disables RLS (single-user app), and seeds the
   quotes, the three habits, and your settings row.

2. **Install + run.**
   ```
   cd baseline
   npm install
   npm run dev
   ```
   Open the Network URL it prints on your phone (same Wi-Fi), or
   http://localhost:5174 on desktop.

3. **Install on your phone.**
   Open the deployed URL in mobile Safari/Chrome → Share → Add to Home
   Screen. Or use the "Add to home screen" button in Settings (Android).

## Deploy (Vercel)

```
npm i -g vercel   # if not installed
vercel            # from the baseline/ folder, follow prompts
```
Set the two env vars in the Vercel project (same as `.env`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Build command `npm run build`, output dir `dist`.

## Notes

- Single user: every row uses `user_id = 'me'`. No login by design.
- Offline: check-ins / cravings / slips / journal queue to localStorage and
  replay when you're back online.
- Streak start / quit date is editable in Settings ("Started quitting on").
- Icons in `public/icons/` are generated placeholders
  (`node scripts/gen-icons.mjs`) — swap with real art anytime.
- Stack: React 18 + TS + Vite + Tailwind + Framer Motion + Recharts +
  Supabase + vite-plugin-pwa.
