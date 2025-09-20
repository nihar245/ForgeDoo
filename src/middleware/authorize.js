import { forbidden } from '../core/apiError.js';

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return next(forbidden('Insufficient role'));
    }
    next();
  };
}
