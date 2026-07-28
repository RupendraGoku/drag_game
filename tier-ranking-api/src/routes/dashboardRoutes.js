import { Router } from 'express';
import { stats } from '../controllers/dashboardController.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', stats);

export default router;
