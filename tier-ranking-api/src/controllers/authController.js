import { Admin } from '../models/Admin.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  clearRefreshCookie,
  createAccessToken,
  createRefreshToken,
  hashToken,
  rotateRefreshToken,
  setRefreshCookie,
  verifyRefreshToken
} from '../services/tokenService.js';

const adminPayload = (admin) => ({
  id: admin._id.toString(),
  name: admin.name,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!admin || !admin.isActive || !(await admin.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = createAccessToken(admin);
  const refreshToken = await createRefreshToken(admin, req);
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, 200, 'Logged in successfully', {
    accessToken,
    admin: adminPayload(admin)
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');

  const payload = verifyRefreshToken(token);
  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive) throw new ApiError(401, 'Admin account is inactive or unavailable');

  await rotateRefreshToken(token, req, res, admin);
  const accessToken = createAccessToken(admin);

  return sendSuccess(res, 200, 'Token refreshed successfully', {
    accessToken,
    admin: adminPayload(admin)
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await RefreshToken.findOneAndUpdate({ tokenHash: hashToken(token), revokedAt: null }, { revokedAt: new Date() });
  }
  clearRefreshCookie(res);
  return sendSuccess(res, 200, 'Logged out successfully');
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Admin profile fetched successfully', {
    admin: adminPayload(req.admin)
  });
});
