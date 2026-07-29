# Tier Ranking API Documentation

Base URL: `/api/v1`

All responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Validation errors return:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "items", "message": "At least one image item is required" }
  ]
}
```

## Public Genres

`GET /genres`

Returns published and active genre cards. Optional query: `search`.

`GET /genres/featured`

Returns up to 8 published and active genres.

`GET /genres/:slug`

Returns a full playable genre. Unpublished and inactive genres return 404.

`GET /genres/:slug/related`

Returns related published genres.

## Admin Auth

`POST /auth/login`

Body:

```json
{ "email": "admin@example.com", "password": "change-this-password", "rememberMe": true }
```

Returns an access token and sets a HTTP-only refresh-token cookie.

`POST /auth/refresh`

Rotates the refresh token cookie and returns a new access token.

`POST /auth/logout`

Revokes the current refresh token and clears the cookie.

`GET /auth/me`

Requires `Authorization: Bearer <accessToken>`.

## Admin Genres

All admin genre routes require a bearer access token.

`GET /admin/genres`

Query: `search`, `status`, `isActive`, `sort`, `page`, `limit`.

`POST /admin/genres`

Creates a draft or published genre. Publishing is rejected until all publishing requirements pass.

This endpoint also accepts `multipart/form-data` with a JSON file field named `genreJson`. Imported JSON is saved as a draft, so cover and item images can be uploaded later from the admin editor.

`GET /admin/genres/:id`

Returns one editable genre.

`PATCH /admin/genres/:id`

Updates a genre and increments `version` so public saved progress can detect incompatible changes.

`DELETE /admin/genres/:id`

Deletes a genre.

`PATCH /admin/genres/:id/publish`

Validates and publishes a genre.

`PATCH /admin/genres/:id/unpublish`

Moves the genre back to draft.

`PATCH /admin/genres/:id/activate`

Makes a genre publicly accessible if it is published.

`PATCH /admin/genres/:id/deactivate`

Removes a genre from public access.

`POST /admin/genres/:id/duplicate`

Creates an inactive draft copy.

`GET /admin/genres/:id/preview`

Returns draft or published data for protected admin preview.

## Uploads

`POST /admin/uploads/image`

Multipart body field: `image`.

Allowed MIME types: JPEG, PNG, WebP. Maximum size: 5 MB.

`DELETE /admin/uploads/image`

Body:

```json
{ "publicId": "cloudinary-public-id" }
```

## Dashboard

`GET /admin/dashboard/stats`

Returns genre totals, image totals, category totals, recent genres and incomplete drafts.
