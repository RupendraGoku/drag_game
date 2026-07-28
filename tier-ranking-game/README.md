# Tier Ranking Game

Public React and Vite frontend for playing published tier-ranking games.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The public game runs at `http://localhost:5173` by default.

## Environment

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production, set `VITE_API_BASE_URL=https://api-ranking.example.com/api/v1`.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production build.
- `npm run preview` previews the production build locally.

## Routes

- `/` genre discovery page
- `/genres` all published genres
- `/play/:slug` dynamic tier-ranking game
- `/how-to-play` instructions
- `/*` not-found page

## Game Behavior

The game renders headings, category labels, tier rows and the 12 image items from the API. Each image ID exists in exactly one location: the unranked pool or one ranking row. Browser progress is saved under `tier-ranking-progress-{genreId}` and is reset when the API genre `version` changes.

The export action uses `html-to-image` and captures the heading, category tabs and ranked board without the unranked pool.
