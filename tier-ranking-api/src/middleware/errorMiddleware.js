import { env } from '../config/environment.js';
import { ApiError } from '../utils/ApiError.js';

export const notFoundMiddleware = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorMiddleware = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value already exists';
    errors = Object.keys(err.keyPattern || {}).map((field) => ({
      field,
      message: `${field} must be unique`
    }));
  }

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  const response = {
    success: false,
    message,
    errors
  };

  if (!env.isProduction) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
