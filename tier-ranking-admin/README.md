# Tier Ranking Admin

Protected React and Vite dashboard for creating, previewing and publishing tier-ranking games.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The dashboard runs at `http://localhost:5174` by default.

## Environment

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_PUBLIC_GAME_URL=http://localhost:5173
```

For production, set `VITE_API_BASE_URL=https://api-ranking.example.com/api/v1` and `VITE_PUBLIC_GAME_URL=https://ranking.example.com`.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production build.
- `npm run preview` previews the production build locally.

## Workflow

1. Login with an admin account created by the API seed script.
2. Create a genre draft.
3. Edit top categories and ranking rows.
4. Upload at least one valid image.
5. Assign every image to one or more enabled top categories.
6. Preview the draft.
7. Save and publish.

You can also start a genre from the create screen by uploading a `.json` file. The import is saved as a draft, and cover/item images can be added afterward.

Refresh tokens are stored in secure HTTP-only cookies by the API. The dashboard keeps only the short-lived access token in web storage.
