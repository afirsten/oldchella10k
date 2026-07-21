# Ripped-Chella

A mobile-first shared fitness tracker for the nine-person Oldchella 2026 crew. Vercel serves the static app and three small Functions; an Upstash Redis integration stores the shared state.

Public reads need no credentials. Writes require the participant's PIN or the master PIN. This is deliberate casual deterrence, not a full account system.

## PIN handoff

The generated PIN list is in:

```text
secrets/pins.local.txt
```

Everything under `secrets/` is ignored by Git. Keep that file private.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. In the Vercel project, open **Storage → Create Database → Upstash Redis** and connect it to this project.
3. Confirm Vercel created either:
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4. Add these production environment variables in **Settings → Environment Variables**:

   - `PARTICIPANT_PINS` — paste the entire contents of `secrets/participant-pins.local.json`
   - `MASTER_PIN` — paste the value from `secrets/master-pin.local.txt`

5. Deploy or redeploy the project.
6. Visit `/api/state` on the Vercel URL. The first request initializes the shared Andrew/Joe/Matt seed data.

No database migration or package installation is required.

## Local development

Install/use the Vercel CLI, link the project, and pull its environment:

```sh
vercel link
vercel env pull .env.local
vercel dev
```

Opening the site through `python3 -m http.server` still shows demo data, but protected writes intentionally fail because static Python hosting does not run `/api`.

## API

- `GET /api/state` — public activity and participation
- `POST /api/activities` — add activity with `personId`, `activityDate`, and `pin`
- `DELETE /api/activities` — delete one activity with `activityId`, `personId`, and `pin`
- `PUT /api/participation` — update status with `personId` and `pin`

A participant PIN can modify only its matching person. The master PIN can modify anyone and bypass a lockout. Five incorrect attempts lock that visitor out of the selected profile for 30 minutes.
