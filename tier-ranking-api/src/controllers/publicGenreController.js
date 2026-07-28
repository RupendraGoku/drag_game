import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  getPublicGenreBySlug,
  getRelatedGenres,
  listPublicGenres,
  sortGenreForPublic
} from '../services/genreService.js';

const cardPayload = (genre) => ({
  id: genre._id?.toString?.() || genre.id,
  name: genre.name,
  slug: genre.slug,
  heading: genre.heading,
  description: genre.description,
  coverImage: genre.coverImage,
  itemCount: genre.items?.length || 0,
  tierCount: genre.tiers?.filter((tier) => tier.isActive).length || 0,
  categories: genre.topCategories?.filter((category) => category.isActive) || [],
  updatedAt: genre.updatedAt
});

export const getGenres = asyncHandler(async (req, res) => {
  const genres = await listPublicGenres(req.query);
  return sendSuccess(res, 200, 'Published genres fetched successfully', genres.map(cardPayload));
});

export const getFeaturedGenres = asyncHandler(async (_req, res) => {
  const genres = await listPublicGenres({});
  return sendSuccess(res, 200, 'Featured genres fetched successfully', genres.slice(0, 8).map(cardPayload));
});

export const getGenreBySlug = asyncHandler(async (req, res) => {
  const genre = await getPublicGenreBySlug(req.params.slug);
  return sendSuccess(res, 200, 'Genre fetched successfully', sortGenreForPublic(genre));
});

export const getRelated = asyncHandler(async (req, res) => {
  const genres = await getRelatedGenres(req.params.slug);
  return sendSuccess(res, 200, 'Related genres fetched successfully', genres.map(cardPayload));
});
