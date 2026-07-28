import { Admin } from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const payload = verifyAccessToken(token);
  const admin = await Admin.findById(payload.sub);

  if (!admin || !admin.isActive) {
    throw new ApiError(401, 'Admin account is inactive or unavailable');
  }

  req.admin = admin;
  next();
});
