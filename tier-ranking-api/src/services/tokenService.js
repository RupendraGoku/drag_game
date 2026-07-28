import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const createAccessToken = (admin) =>
  jwt.sign(
    {
      role: admin.role,
      email: admin.email
    },
    env.jwtAccessSecret,
    {
      subject: admin._id.toString(),
      expiresIn: env.accessTokenTtl
    }
  );

export const createRefreshToken = async (admin, req) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ jti: tokenId }, env.jwtRefreshSecret, {
    subject: admin._id.toString(),
    expiresIn: `${env.refreshTokenDays}d`
  });

  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    admin: admin._id,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  return token;
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtAccessSecret);
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret);
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    path: '/api/v1/auth',
    maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    path: '/api/v1/auth'
  });
};

export const rotateRefreshToken = async (token, req, res, admin) => {
  const record = await RefreshToken.findOne({
    tokenHash: hashToken(token),
    revokedAt: null
  });

  if (!record || record.expiresAt <= new Date()) {
    throw new ApiError(401, 'Refresh session is no longer valid');
  }

  if (record.admin.toString() !== admin._id.toString()) {
    throw new ApiError(401, 'Refresh session does not match the admin account');
  }

  record.revokedAt = new Date();
  await record.save();

  const refreshToken = await createRefreshToken(admin, req);
  setRefreshCookie(res, refreshToken);
  return refreshToken;
};
