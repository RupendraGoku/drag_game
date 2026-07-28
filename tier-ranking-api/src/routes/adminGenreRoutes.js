import { Router } from 'express';
import {
  activate,
  create,
  deactivate,
  duplicate,
  getOne,
  listGenres,
  preview,
  publish,
  remove,
  unpublish,
  update
} from '../controllers/adminGenreController.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createGenreSchema, idParamSchema, listGenresSchema, updateGenreSchema } from '../validators/genreValidators.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', validateRequest(listGenresSchema), listGenres);
router.post('/', validateRequest(createGenreSchema), create);
router.get('/:id', validateRequest(idParamSchema), getOne);
router.patch('/:id', validateRequest(updateGenreSchema), update);
router.delete('/:id', validateRequest(idParamSchema), remove);
router.patch('/:id/publish', validateRequest(idParamSchema), publish);
router.patch('/:id/unpublish', validateRequest(idParamSchema), unpublish);
router.patch('/:id/activate', validateRequest(idParamSchema), activate);
router.patch('/:id/deactivate', validateRequest(idParamSchema), deactivate);
router.post('/:id/duplicate', validateRequest(idParamSchema), duplicate);
router.get('/:id/preview', validateRequest(idParamSchema), preview);

export default router;
