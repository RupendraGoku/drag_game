import { Router } from 'express';
import { deleteImage, uploadImage } from '../controllers/uploadController.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadImageMiddleware } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { deleteImageSchema } from '../validators/genreValidators.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.post('/image', uploadImageMiddleware, uploadImage);
router.delete('/image', validateRequest(deleteImageSchema), deleteImage);

export default router;
