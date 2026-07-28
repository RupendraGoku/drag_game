import { ApiError } from '../utils/ApiError.js';

export const requireAdmin = (req, _res, next) => {
  if (!req.admin || !['admin', 'superadmin'].includes(req.admin.role)) {
    return next(new ApiError(403, 'Admin privileges required'));
  }

  return next();
};
