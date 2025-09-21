export function validate(schema) {
  return async (req, _res, next) => {
    try {
      console.log('🔍 [VALIDATION] Validating request body:', req.body)
      const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
      console.log('✅ [VALIDATION] Validation passed, cleaned body:', value)
      req.body = value;
      next();
    } catch (err) {
      console.error('❌ [VALIDATION] Validation failed:', {
        originalBody: req.body,
        error: err.message,
        details: err.details?.map(d => ({ message: d.message, path: d.path, value: d.context?.value }))
      })
      err.status = 422;
      err.message = 'Validation error';
      err.details = err.details?.map(d => ({ message: d.message, path: d.path }));
      next(err);
    }
  };
}
