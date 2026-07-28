import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  createGenre,
  deleteGenre,
  duplicateGenre,
  getAdminGenre,
  listAdminGenres,
  publishGenre,
  setGenreActive,
  setGenreStatus,
  updateGenre
} from '../services/genreService.js';

export const listGenres = asyncHandler(async (req, res) => {
  const result = await listAdminGenres(req.query);
  return sendSuccess(res, 200, 'Genres fetched successfully', result.genres, result.pagination);
});

export const create = asyncHandler(async (req, res) => {
  const genre = await createGenre(req.body, req.admin._id);
  return sendSuccess(res, 201, 'Genre created successfully', genre);
});

export const getOne = asyncHandler(async (req, res) => {
  const genre = await getAdminGenre(req.params.id);
  return sendSuccess(res, 200, 'Genre fetched successfully', genre);
});

export const update = asyncHandler(async (req, res) => {
  const genre = await updateGenre(req.params.id, req.body);
  return sendSuccess(res, 200, 'Genre updated successfully', genre);
});

export const remove = asyncHandler(async (req, res) => {
  await deleteGenre(req.params.id);
  return sendSuccess(res, 200, 'Genre deleted successfully');
});

export const publish = asyncHandler(async (req, res) => {
  const genre = await publishGenre(req.params.id);
  return sendSuccess(res, 200, 'Genre published successfully', genre);
});

export const unpublish = asyncHandler(async (req, res) => {
  const genre = await setGenreStatus(req.params.id, 'draft');
  return sendSuccess(res, 200, 'Genre unpublished successfully', genre);
});

export const activate = asyncHandler(async (req, res) => {
  const genre = await setGenreActive(req.params.id, true);
  return sendSuccess(res, 200, 'Genre activated successfully', genre);
});

export const deactivate = asyncHandler(async (req, res) => {
  const genre = await setGenreActive(req.params.id, false);
  return sendSuccess(res, 200, 'Genre deactivated successfully', genre);
});

export const duplicate = asyncHandler(async (req, res) => {
  const genre = await duplicateGenre(req.params.id, req.admin._id);
  return sendSuccess(res, 201, 'Genre duplicated successfully', genre);
});

export const preview = asyncHandler(async (req, res) => {
  const genre = await getAdminGenre(req.params.id);
  return sendSuccess(res, 200, 'Genre preview fetched successfully', genre);
});
