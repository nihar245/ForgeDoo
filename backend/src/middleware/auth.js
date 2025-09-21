import { verifyAccess, verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../core/apiError.js';
import { logger } from '../core/logger.js';

export function requireAuth(req, res, next) {
  let token;
  const header = req.headers.authorization;
  if (header) {
    const parts = header.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    else if(process.env.NODE_ENV !== 'production') logger.debug('Auth failed: malformed Authorization header value=%s', header);
  }
  // Fallback to cookie if no token from header
  if (!token && req.cookies?.access_token) token = req.cookies.access_token;
  if (!token) {
    if(process.env.NODE_ENV !== 'production') logger.debug('Auth failed: missing access token (header & cookie)');
    return next(unauthorized());
  }
  const payload = verifyAccess(token) || verifyToken(token);
  if (!payload) {
    if(process.env.NODE_ENV !== 'production') logger.debug('Auth failed: invalid or expired token');
    return next(unauthorized());
  }
  if(process.env.NODE_ENV !== 'production') logger.debug('Auth success userId=%s role=%s path=%s', payload.userId, payload.role, req.path);
  req.user = { id: payload.userId, role: payload.role };
  next();
}
