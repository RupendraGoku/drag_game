import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
