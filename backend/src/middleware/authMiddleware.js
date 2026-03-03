const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token missing', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};
