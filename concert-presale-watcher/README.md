# Concert Presale Watcher (MVP)

Watch-and-alert site for niche artists.

This repo is now set up as:
- `apps/web`: Next.js dashboard + API routes
- `apps/worker`: polling worker (calls `POST /api/poll` on an interval)
- `database/schema.sql`: Postgres schema for artists/events/snapshots/alerts

## MVP flow

1. Add artists to your watchlist (manual or Spotify artist ID import).
2. Poll Ticketmaster + Eventbrite for each followed artist.
3. Normalize to one `events` table and snapshot raw source payloads.
4. Detect changes (`new_event`, `status_changed`, `ticket_url_changed`, `on_sale_moved_earlier`).
5. Send alerts to Discord/email/SMS when configured.

## Database setup (Supabase Postgres)

1. Create a Supabase project.
2. Run [`database/schema.sql`](./database/schema.sql) in SQL editor.
3. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into `apps/web/.env.local`.

## Environment

Copy examples:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/worker/.env.example apps/worker/.env
```

Set whichever integrations you want:
- Ticketmaster: `TICKETMASTER_API_KEY`
- Eventbrite: `EVENTBRITE_PRIVATE_TOKEN`
- Spotify import: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- Email alerts: `RESEND_API_KEY`, `ALERT_FROM_EMAIL`, `ALERT_TO_EMAIL`
- SMS alerts: Twilio vars
- Discord alerts: `DISCORD_WEBHOOK_URL`

Optional poll protection:
- Set `POLL_SECRET` in web and worker.

Login gate (recommended for Vercel):
- `AUTH_PASSWORD`: password users enter on `/login`
- `AUTH_COOKIE_VALUE`: long random string used for session cookie validation

## Run

From repo root:

```bash
npm install
npm run dev
```

Then run worker in another shell:

```bash
npm run dev --workspace=@apps/worker
```

Open `http://localhost:3000`.

## API routes

- `GET/POST /api/watchlist`
- `DELETE /api/watchlist/:id`
- `POST /api/watchlist/import-spotify`
- `GET /api/events`
- `GET /api/alerts`
- `POST /api/poll`
- `GET /api/health`

## Deploy To Vercel

1. Import this repo into Vercel.
2. Set the Vercel project **Root Directory** to `concert-presale-watcher/apps/web`.
3. Add environment variables in Vercel Project Settings:
   - Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Recommended auth: `AUTH_PASSWORD`, `AUTH_COOKIE_VALUE`
   - Optional integrations: Ticketmaster/Eventbrite/Spotify/Discord/Resend/Twilio/POLL_SECRET
4. Deploy.

Notes:
- If `AUTH_PASSWORD` + `AUTH_COOKIE_VALUE` are set, middleware protects the site and API with a `/login` page.
- `/api/poll` still works for your worker/cron when it sends `x-poll-secret` matching `POLL_SECRET`.

## Notes

- Poll endpoint is admin-style for now (no user auth in MVP).
- If alert channel keys are missing, alerts are still stored in DB.
- Start with one city + a constrained artist list before widening coverage.
