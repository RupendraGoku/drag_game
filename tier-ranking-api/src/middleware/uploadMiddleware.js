import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedJsonMimeTypes = ['application/json', 'text/json', 'application/schema+json'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(422, 'Only JPEG, PNG and WebP images are allowed'));
    }
    return cb(null, true);
  }
});

export const uploadImageMiddleware = upload.single('image');

const jsonUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const hasJsonExtension = file.originalname?.toLowerCase().endsWith('.json');
    if (!hasJsonExtension && !allowedJsonMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(422, 'Only JSON files are allowed'));
    }
    return cb(null, true);
  }
});

export const uploadGenreJsonMiddleware = jsonUpload.fields([
  { name: 'genreJson', maxCount: 1 },
  { name: 'genre', maxCount: 1 },
  { name: 'json', maxCount: 1 }
]);
