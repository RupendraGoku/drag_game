import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import path from 'path';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/environment.js';
import { uploadImageMiddleware } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { loginSchema } from '../validators/authValidators.js';
import { createGenreSchema, deleteImageSchema, listGenresSchema, publicGenresSchema, slugParamSchema, updateGenreSchema } from '../validators/genreValidators.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { clearRefreshCookie, createAccessToken, hashToken, setRefreshCookie, verifyAccessToken, verifyRefreshToken } from '../services/tokenService.js';
import {
  cardPayload,
  createFileGenre,
  findFileGenre,
  getFileStore,
  publicGenres,
  removeFileGenre,
  saveFileStore,
  updateFileGenre,
  uploadDir,
  validateFilePublish
} from '../services/fileStoreService.js';

const fileAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Authentication required');

  const payload = verifyAccessToken(token);
  const admin = getFileStore().admins.find((entry) => entry._id === payload.sub && entry.isActive);
  if (!admin) throw new ApiError(401, 'Admin account is inactive or unavailable');
  req.admin = admin;
  next();
});

const adminPayload = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive
});

const fileIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const fileUpdateGenreSchema = updateGenreSchema.extend({
  params: fileIdParamSchema.shape.params
});

const createRefreshToken = async (admin, req) => {
  const token = jwt.sign({ jti: crypto.randomUUID() }, env.jwtRefreshSecret, {
    subject: admin._id,
    expiresIn: `${env.refreshTokenDays}d`
  });
  getFileStore().refreshTokens.push({
    tokenHash: hashToken(token),
    admin: admin._id,
    expiresAt: new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  await saveFileStore();
  return token;
};

const authRoutes = Router();

authRoutes.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const admin = getFileStore().admins.find((entry) => entry.email === email);
    if (!admin || !admin.isActive || !(await bcrypt.compare(req.body.password, admin.passwordHash))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = createAccessToken(admin);
    setRefreshCookie(res, await createRefreshToken(admin, req));
    return sendSuccess(res, 200, 'Logged in successfully', { accessToken, admin: adminPayload(admin) });
  })
);

authRoutes.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new ApiError(401, 'Refresh token required');

    const payload = verifyRefreshToken(token);
    const store = getFileStore();
    const record = store.refreshTokens.find((entry) => entry.tokenHash === hashToken(token) && !entry.revokedAt);
    const admin = store.admins.find((entry) => entry._id === payload.sub && entry.isActive);
    if (!record || !admin || record.admin !== admin._id || new Date(record.expiresAt) <= new Date()) {
      throw new ApiError(401, 'Refresh session is no longer valid');
    }

    record.revokedAt = new Date().toISOString();
    const accessToken = createAccessToken(admin);
    setRefreshCookie(res, await createRefreshToken(admin, req));
    await saveFileStore();
    return sendSuccess(res, 200, 'Token refreshed successfully', { accessToken, admin: adminPayload(admin) });
  })
);

authRoutes.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (token) {
      const record = getFileStore().refreshTokens.find((entry) => entry.tokenHash === hashToken(token) && !entry.revokedAt);
      if (record) {
        record.revokedAt = new Date().toISOString();
        await saveFileStore();
      }
    }
    clearRefreshCookie(res);
    return sendSuccess(res, 200, 'Logged out successfully');
  })
);

authRoutes.get('/me', fileAuth, (req, res) => sendSuccess(res, 200, 'Admin profile fetched successfully', { admin: adminPayload(req.admin) }));

const publicGenreRoutes = Router();

publicGenreRoutes.get('/', validateRequest(publicGenresSchema), (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const genres = publicGenres()
    .filter((genre) => [genre.name, genre.heading, genre.description].join(' ').toLowerCase().includes(search))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return sendSuccess(res, 200, 'Published genres fetched successfully', genres.map(cardPayload));
});

publicGenreRoutes.get('/featured', (_req, res) => sendSuccess(res, 200, 'Featured genres fetched successfully', publicGenres().slice(0, 8).map(cardPayload)));

publicGenreRoutes.get('/:slug/related', validateRequest(slugParamSchema), (req, res) => {
  findFileGenre(req.params.slug, true);
  return sendSuccess(
    res,
    200,
    'Related genres fetched successfully',
    publicGenres()
      .filter((genre) => genre.slug !== req.params.slug)
      .slice(0, 4)
      .map(cardPayload)
  );
});

publicGenreRoutes.get('/:slug', validateRequest(slugParamSchema), (req, res) => sendSuccess(res, 200, 'Genre fetched successfully', findFileGenre(req.params.slug, true)));

const adminGenreRoutes = Router();
adminGenreRoutes.use(fileAuth);

adminGenreRoutes.get('/', validateRequest(listGenresSchema), (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const search = (req.query.search || '').toLowerCase();
  let genres = [...getFileStore().genres];

  if (search) genres = genres.filter((genre) => [genre.name, genre.slug, genre.heading].join(' ').toLowerCase().includes(search));
  if (req.query.status && req.query.status !== 'all') genres = genres.filter((genre) => genre.status === req.query.status);
  if (req.query.isActive && req.query.isActive !== 'all') genres = genres.filter((genre) => genre.isActive === (req.query.isActive === 'true'));
  if (req.query.sort === 'name') genres.sort((a, b) => a.name.localeCompare(b.name));
  else if (req.query.sort === 'newest') genres.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else genres.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const total = genres.length;
  return sendSuccess(res, 200, 'Genres fetched successfully', genres.slice((page - 1) * limit, page * limit), {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

adminGenreRoutes.post('/', validateRequest(createGenreSchema), asyncHandler(async (req, res) => sendSuccess(res, 201, 'Genre created successfully', await createFileGenre(req.body, req.admin._id))));
adminGenreRoutes.get('/:id', validateRequest(fileIdParamSchema), (req, res) => sendSuccess(res, 200, 'Genre fetched successfully', findFileGenre(req.params.id)));
adminGenreRoutes.patch('/:id', validateRequest(fileUpdateGenreSchema), asyncHandler(async (req, res) => sendSuccess(res, 200, 'Genre updated successfully', await updateFileGenre(req.params.id, req.body))));
adminGenreRoutes.delete('/:id', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => {
  await removeFileGenre(req.params.id);
  return sendSuccess(res, 200, 'Genre deleted successfully');
}));
adminGenreRoutes.patch('/:id/publish', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => {
  const genre = findFileGenre(req.params.id);
  validateFilePublish(genre);
  genre.status = 'published';
  genre.publishedAt = genre.publishedAt || new Date().toISOString();
  genre.version += 1;
  genre.updatedAt = new Date().toISOString();
  await saveFileStore();
  return sendSuccess(res, 200, 'Genre published successfully', genre);
}));
adminGenreRoutes.patch('/:id/unpublish', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => sendSuccess(res, 200, 'Genre unpublished successfully', await updateFileGenre(req.params.id, { status: 'draft' }))));
adminGenreRoutes.patch('/:id/activate', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => sendSuccess(res, 200, 'Genre activated successfully', await updateFileGenre(req.params.id, { isActive: true }))));
adminGenreRoutes.patch('/:id/deactivate', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => sendSuccess(res, 200, 'Genre deactivated successfully', await updateFileGenre(req.params.id, { isActive: false }))));
adminGenreRoutes.post('/:id/duplicate', validateRequest(fileIdParamSchema), asyncHandler(async (req, res) => {
  const original = findFileGenre(req.params.id);
  const copy = structuredClone(original);
  delete copy._id;
  copy.name = `${original.name} Copy`;
  copy.slug = `${original.slug}-copy-${Date.now()}`;
  copy.status = 'draft';
  copy.isActive = false;
  return sendSuccess(res, 201, 'Genre duplicated successfully', await createFileGenre(copy, req.admin._id));
}));
adminGenreRoutes.get('/:id/preview', validateRequest(fileIdParamSchema), (req, res) => sendSuccess(res, 200, 'Genre preview fetched successfully', findFileGenre(req.params.id)));

const uploadRoutes = Router();
uploadRoutes.use(fileAuth);

uploadRoutes.post('/image', uploadImageMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Image file is required');
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(uploadDir, fileName), req.file.buffer);
  return sendSuccess(res, 201, 'Image uploaded successfully', {
    url: `${req.protocol}://${req.get('host')}/uploads/${fileName}`,
    publicId: `local/${fileName}`,
    width: 0,
    height: 0
  });
}));

uploadRoutes.delete('/image', validateRequest(deleteImageSchema), asyncHandler(async (req, res) => {
  if (req.body.publicId?.startsWith('local/')) {
    await fs.rm(path.join(uploadDir, path.basename(req.body.publicId)), { force: true });
  }
  return sendSuccess(res, 200, 'Image deleted successfully');
}));

const dashboardRoutes = Router();
dashboardRoutes.use(fileAuth);
dashboardRoutes.get('/stats', (req, res) => {
  const genres = getFileStore().genres;
  return sendSuccess(res, 200, 'Dashboard stats fetched successfully', {
    totalGenres: genres.length,
    publishedGenres: genres.filter((genre) => genre.status === 'published').length,
    draftGenres: genres.filter((genre) => genre.status === 'draft').length,
    activeGenres: genres.filter((genre) => genre.isActive).length,
    inactiveGenres: genres.filter((genre) => !genre.isActive).length,
    totalUploadedImages: genres.reduce((sum, genre) => sum + genre.items.length, 0),
    totalRankingRows: genres.reduce((sum, genre) => sum + genre.tiers.length, 0),
    totalTopCategories: genres.reduce((sum, genre) => sum + genre.topCategories.length, 0),
    recentlyCreated: [...genres].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    recentlyEdited: [...genres].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
    draftsNeedingCompletion: genres.filter((genre) => genre.status === 'draft')
  });
});

export const fileStoreRoutes = {
  authRoutes,
  publicGenreRoutes,
  adminGenreRoutes,
  uploadRoutes,
  dashboardRoutes
};
