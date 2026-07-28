import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PUBLIC_APP_URL',
  'ADMIN_APP_URL'
];

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

const csv = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const seedAdmins = () => {
  if (process.env.ADMIN_SEED_USERS) {
    try {
      const parsed = JSON.parse(process.env.ADMIN_SEED_USERS);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((admin) => ({
          name: admin.name || admin.email,
          email: admin.email,
          password: admin.password,
          role: admin.role || 'admin'
        }));
      }
    } catch (_error) {
      throw new Error('ADMIN_SEED_USERS must be valid JSON');
    }
  }

  return [
    {
      name: process.env.FIRST_ADMIN_NAME || 'Super Admin',
      email: process.env.FIRST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.FIRST_ADMIN_PASSWORD || 'change-this-password',
      role: 'superadmin'
    }
  ];
};

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT || 5000),
  dataStore: process.env.DATA_STORE || 'mongo',
  isFileStore: (process.env.DATA_STORE || 'mongo') === 'file',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tier-ranking',
  publicAppUrl: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  adminAppUrl: process.env.ADMIN_APP_URL || 'http://localhost:5174',
  corsOrigins: [
    process.env.PUBLIC_APP_URL || 'http://localhost:5173',
    process.env.ADMIN_APP_URL || 'http://localhost:5174',
    ...csv(process.env.CORS_ORIGINS)
  ],
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 30),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'tier-ranking'
  },
  seedAdmins: seedAdmins(),
  firstAdmin: {
    name: process.env.FIRST_ADMIN_NAME || 'Super Admin',
    email: process.env.FIRST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.FIRST_ADMIN_PASSWORD || 'change-this-password'
  }
};
