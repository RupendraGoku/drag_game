import { Router } from 'express';
import {
  getFeaturedGenres,
  getGenreBySlug,
  getGenres,
  getRelated
} from '../controllers/publicGenreController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { publicGenresSchema, slugParamSchema } from '../validators/genreValidators.js';

const router = Router();

router.get('/', validateRequest(publicGenresSchema), getGenres);
router.get('/featured', getFeaturedGenres);
router.get('/:slug/related', validateRequest(slugParamSchema), getRelated);
router.get('/:slug', validateRequest(slugParamSchema), getGenreBySlug);

export default router;
