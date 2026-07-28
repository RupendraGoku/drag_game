# Tier Ranking API

Shared Node.js, Express.js and MongoDB backend for the public tier-ranking game and protected admin dashboard.

## Setup

```bash
npm install
cp .env.example .env
npm run seed:admin
npm run seed:examples
npm run dev
```

The API runs at `http://localhost:5000/api/v1` by default.

## Environment

Set `PUBLIC_APP_URL`, `ADMIN_APP_URL` and `CORS_ORIGINS` to the exact deployed origins that should call the API. Refresh tokens are issued as secure HTTP-only cookies in production.

Cloudinary uploads require `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. Draft seed data uses remote sample image URLs and does not upload files.

## Cloudinary Setup

1. Create a Cloudinary account.
2. Copy the cloud name, API key and API secret into `.env`.
3. Set `CLOUDINARY_FOLDER=tier-ranking` or another folder name.
4. The upload endpoint validates JPEG, PNG and WebP files, limits each file to 5 MB, and sends images through Cloudinary with automatic quality and format optimization.

## CORS Examples

Local development:

```bash
PUBLIC_APP_URL=http://localhost:5173
ADMIN_APP_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Production:

```bash
PUBLIC_APP_URL=https://ranking.example.com
ADMIN_APP_URL=https://admin-ranking.example.com
CORS_ORIGINS=https://ranking.example.com,https://admin-ranking.example.com
```

## Sample Data

`npm run seed:examples` creates two published sample genres with 12 image items each, editable top categories, editable ranking rows and remote sample image URLs. Use `npm run seed:admin` first so the example genres can be associated with an admin account.

## Commands

- `npm run dev` starts the API with nodemon.
- `npm start` starts the API for production.
- `npm run seed:admin` creates the first admin from `.env`.
- `npm run seed:examples` inserts two published sample genres.

## Deployment

1. Create a MongoDB Atlas database.
2. Create a Cloudinary account and upload preset credentials.
3. Set all environment variables in the hosting platform.
4. Set `NODE_ENV=production`.
5. Set `PUBLIC_APP_URL=https://ranking.example.com`, `ADMIN_APP_URL=https://admin-ranking.example.com` and `CORS_ORIGINS` with both deployed origins.
6. Run `npm start`.

## API Docs

See [docs/API.md](docs/API.md) and [docs/postman_collection.json](docs/postman_collection.json).
