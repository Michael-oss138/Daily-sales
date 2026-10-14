const AppError = require('../utils/AppError');

/**
 * Validate parts of the request with Zod schemas.
 * Usage: validate({ body: schema, query: schema, params: schema })
 * Parsed (and coerced) values are placed on req.validated.
 */
function validate(schemas) {
  return (req, _res, next) => {
    const validated = {};
    const issues = [];
    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (result.success) {
        validated[part] = result.data;
      } else {
        for (const i of result.error.issues) {
          issues.push({ in: part, path: i.path.join('.'), message: i.message });
        }
      }
    }
    if (issues.length) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', issues));
    }
    req.validated = validated;
    next();
  };
}

module.exports = validate;
