const AppError = require('../utils/AppError');

function notFound(req, _res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place where errors become responses.
 * Shape: { error: { code, message, details? } }
 * Unexpected errors never leak internals to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    err = new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  } else if (err.type === 'entity.too.large') {
    err = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  } else if (err.name === 'CastError') {
    err = AppError.badRequest(`Invalid value for ${err.path}`);
  }

  if (err instanceof AppError) {
    const body = { error: { code: err.code, message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (req.app.get('env') !== 'test') {
    console.error('Unhandled error:', err);
  }
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
}

module.exports = { notFound, errorHandler };
