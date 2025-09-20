import { logger } from '../core/logger.js';
import { ApiError, badRequest } from '../core/apiError.js';

// Unified error response shape:
// {
//   error: string (human message),
//   code: machine_code (snake_case),
//   status: http status number,
//   requestId: correlation id,
//   details?: array|object (validation or field-specific info),
//   meta?: object (additional context when provided)
// }
export function errorHandler(err, req, res, _next) { // eslint-disable-line no-unused-vars
  let wrapped = err;

  // JSON body parse errors (thrown by express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    wrapped = badRequest('Malformed JSON body');
  }

  // Joi validation errors (schema.validate / Joi.object().validate)
  if (err && err.isJoi) {
    const details = err.details?.map(d => ({ message: d.message, path: d.path, type: d.type }));
    wrapped = new ApiError(422, 'Validation failed', 'validation_error', { details });
  }

  // PG errors (unique violation, foreign key, etc.)
  if (err && err.code && err.severity && err.length !== undefined) { // crude pg error detection
    const pgCode = err.code;
    switch(pgCode){
      case '23505': // unique_violation
        wrapped = new ApiError(409, 'Resource conflict (duplicate value)', 'conflict', { constraint: err.constraint });
        break;
      case '23503': // foreign_key_violation
        wrapped = new ApiError(409, 'Related resource constraint violation', 'fk_violation', { table: err.table, detail: err.detail });
        break;
      case '22P02': // invalid_text_representation (e.g., UUID parse)
        wrapped = new ApiError(400, 'Invalid input syntax', 'invalid_input', { detail: err.detail });
        break;
      default:
        // leave as original unless not an ApiError
        if (!(wrapped instanceof ApiError)) wrapped = new ApiError(500, 'Database error', 'db_error');
    }
  }

  const isApi = wrapped instanceof ApiError;
  if (!isApi) {
    logger.error({ err, requestId: req.id }, 'Unhandled error');
  }

  const status = wrapped.status || 500;
  const payload = {
    error: wrapped.message || 'Internal Server Error',
    code: wrapped.code || 'internal_error',
    status,
    requestId: req.id
  };
  if (wrapped.meta?.details) payload.details = wrapped.meta.details;
  else if (wrapped.meta) payload.meta = wrapped.meta;

  res.status(status).json(payload);
}
