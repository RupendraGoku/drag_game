import { getDashboardStats } from '../services/genreService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const stats = asyncHandler(async (_req, res) => {
  const data = await getDashboardStats();
  return sendSuccess(res, 200, 'Dashboard stats fetched successfully', data);
});
