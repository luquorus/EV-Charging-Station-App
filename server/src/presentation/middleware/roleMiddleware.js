/**
 * Role Middleware
 * Check if user has required role(s)
 */

const { AppError } = require('../../utils/errors');

/**
 * Create middleware to check role
 * @param {...string} allowedRoles - Roles allowed to access
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('AUTH_ERROR', 'Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          403,
        ),
      );
    }

    next();
  };
}

module.exports = { requireRole };

