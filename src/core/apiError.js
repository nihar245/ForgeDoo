// ApiError & helpers
// Usage:
//   throw notFound('Work order not found');
//   throw new ApiError(422, 'Validation failed', 'validation_error', { details: [...] })
// Fields:
//   status (number) - HTTP status
//   message (string) - human readable
//   code (string) - machine-friendly snake_case identifier
//   meta (object) - optional structured context (e.g., { details: [...] })
// The errorHandler middleware normalizes these into a JSON response.
export class ApiError extends Error {
  constructor(status, message, code, meta) {
    super(message);
    this.status = status;
    this.code = code || standardCodeFor(status) || 'error';
    if (meta) this.meta = meta; // optional structured context
  }
}

function standardCodeFor(status){
  switch(status){
    case 400: return 'bad_request';
    case 401: return 'unauthorized';
    case 403: return 'forbidden';
    case 404: return 'not_found';
    case 409: return 'conflict';
    case 422: return 'validation_error';
    default: return undefined;
  }
}

export function notFound(message = 'Not found', meta) { return new ApiError(404, message, 'not_found', meta); }
export function badRequest(message = 'Bad request', meta) { return new ApiError(400, message, 'bad_request', meta); }
export function unauthorized(message = 'Unauthorized', meta) { return new ApiError(401, message, 'unauthorized', meta); }
export function forbidden(message = 'Forbidden', meta) { return new ApiError(403, message, 'forbidden', meta); }
