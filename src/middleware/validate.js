export function validate(schema) {
  return async (req, _res, next) => {
    try {
      const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
      req.body = value;
      next();
    } catch (err) {
      err.status = 400;
      err.message = 'Validation error';
      err.details = err.details?.map(d => ({ message: d.message, path: d.path }));
      next(err);
    }
  };
}
