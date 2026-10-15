
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication required');
    }

    const token = authorization.slice(7);

    let payload;

    try {
      payload = jwt.verify(
        token,
        req.app.locals.config.JWT_SECRET
      );
    } catch (_err) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    if (!payload.sub) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw AppError.unauthorized('User account not found');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
