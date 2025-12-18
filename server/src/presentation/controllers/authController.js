/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const { authService } = require('../../application/services/authService');
const { okResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');

const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName, role } = req.body;

      if (!email || !password) {
        throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400);
      }

      const user = await authService.register({ email, password, fullName, role });
      return res.status(201).json(okResponse({ user }));
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400);
      }

      const result = await authService.login({ email, password });

      // Set refresh token in HttpOnly cookie (for web admin panel)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json(
        okResponse({
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        }),
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      // Try to get refresh token from cookie (web) or body (mobile)
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError('VALIDATION_ERROR', 'Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      // Update cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(
        okResponse({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        }),
      );
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookie
      res.clearCookie('refreshToken');

      return res.status(200).json(okResponse({ message: 'Logged out successfully' }));
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { authController };

