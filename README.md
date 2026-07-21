# Oldchella 10K

A mobile-first group push-up tracker for the nine-person Oldchella 2026 crew, heading to Joshua Tree on October 22–25.

## Run locally

This first version has no build step or dependencies:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Current MVP

- Shared 10,000-rep progress goal
- Leaderboard for all nine confirmed attendees
- Quick mobile rep logging with optional notes
- Recent activity feed
- Local browser persistence

Activity is currently stored in `localStorage`, so it is device-specific. The next production step is a small shared backend with passwordless sign-in.
