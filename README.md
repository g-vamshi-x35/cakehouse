# Cake House

Website and ordering app for Cake House (Sri Marlapolama Bakery), Berhampur.
One Next.js 15 project serves everything:

| Part | URL |
| --- | --- |
| Public website (home, menu, custom cake, about, classes, contact) | `/` |
| Customer account (orders, addresses, wishlist, notifications) | `/account` |
| Staff login | `/staff/login` |
| Owner dashboard | `/dashboard/owner` |
| Employee dashboard | `/dashboard/employee` |
| Delivery dashboard | `/dashboard/delivery` |

Backend services: **Supabase** (database, auth, storage), **Razorpay** (payments),
**Resend** (email).

## 1. Setup

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see comments in `.env.example`). Without the Supabase values
the public website still runs, but login, accounts, dashboards and online ordering
are disabled (protected pages redirect to the login page).

Apply the database migrations in `supabase/migrations/` to your Supabase project
(in order, via the Supabase SQL editor or `npx supabase db push`).

## 2. Run locally (development)

```bash
npm run dev
```

Open http://localhost:3000.

## 3. Host locally (production build)

```bash
npm run build
npm start
```

This serves the optimized production build on http://localhost:3000
(`npm start -- -p 8080` for another port). To make it reachable from other devices
on your network, open `http://<your-computer-ip>:3000`.

## 4. Deploy

The app deploys to Vercel with no extra config:

1. Import the GitHub repo at https://vercel.com/new.
2. Add every variable from `.env.local` under Project → Settings → Environment Variables.
3. Deploy. Add your domain under Project → Settings → Domains.
4. In Supabase → Authentication → URL Configuration, set the Site URL to your domain
   so login and password-reset emails link to the live site.

The birthday-reminder endpoint (`/api/cron/birthdays`) expects
`Authorization: Bearer <CRON_SECRET>`; schedule it with Vercel Cron or any cron service.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also runs lint and type checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Seed products into Supabase (needs `SUPABASE_SERVICE_ROLE_KEY`) |
