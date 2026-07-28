import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/environment.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import { fileStoreRoutes } from './routes/fileStoreRoutes.js';
import adminGenreRoutes from './routes/adminGenreRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import publicGenreRoutes from './routes/publicGenreRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { uploadDir } from './services/fileStoreService.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevOrigin =
        !env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');

      if (!origin || env.corsOrigins.includes(origin) || isLocalDevOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(apiRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use('/uploads', express.static(uploadDir));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API healthy', data: { uptime: process.uptime() } });
});

app.use('/api/v1/auth', env.isFileStore ? fileStoreRoutes.authRoutes : authRoutes);
app.use('/api/v1/genres', env.isFileStore ? fileStoreRoutes.publicGenreRoutes : publicGenreRoutes);
app.use('/api/v1/admin/genres', env.isFileStore ? fileStoreRoutes.adminGenreRoutes : adminGenreRoutes);
app.use('/api/v1/admin/uploads', env.isFileStore ? fileStoreRoutes.uploadRoutes : uploadRoutes);
app.use('/api/v1/admin/dashboard', env.isFileStore ? fileStoreRoutes.dashboardRoutes : dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
