import { ApiError } from '../utils/ApiError.js';

const flattenErrors = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));

export const validateRequest = (schema) => async (req, _res, next) => {
  const result = await schema.safeParseAsync({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return next(new ApiError(422, 'Validation failed', flattenErrors(result.error.issues)));
  }

  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;
  return next();
};
