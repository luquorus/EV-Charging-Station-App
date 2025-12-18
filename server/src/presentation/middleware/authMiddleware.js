/**
 * Auth Middleware
 * Verify JWT access token and attach user to request
 */

const { verifyAccessToken } = require('../../utils/jwt');
const { userRepository } = require('../../domain/repositories/userRepository');
const { AppError } = require('../../utils/errors');
const { UserStatus } = require('../../domain/entities/userEntity');

/**
 * Middleware to verify JWT and attach user to req.user
 */
async function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('AUTH_ERROR', 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw new AppError('AUTH_ERROR', 'Invalid or expired token', 401);
    }

    // Get user from DB
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('AUTH_ERROR', 'User not found', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('AUTH_ERROR', 'Account is disabled', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware };

