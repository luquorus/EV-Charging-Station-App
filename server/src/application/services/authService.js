/**
 * Auth Service
 * Business logic for authentication
 */

const { userRepository } = require('../../domain/repositories/userRepository');
const { refreshTokenRepository } = require('../../domain/repositories/refreshTokenRepository');
const { hashPassword, verifyPassword } = require('../../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const { AppError } = require('../../utils/errors');
const { UserRoles, UserStatus, toUserDto } = require('../../domain/entities/userEntity');
const crypto = require('crypto');

const authService = {
  /**
   * Register new user (optional, or admin-only)
   */
  async register({ email, password, fullName, role = UserRoles.USER }) {
    // Check if user exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('VALIDATION_ERROR', 'Email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      passwordHash,
      fullName,
      role,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return toUserDto(user);
  },

  /**
   * Login
   */
  async login({ email, password }) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('AUTH_ERROR', 'Invalid email or password', 401);
    }

    // Check status
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('AUTH_ERROR', 'Account is disabled', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('AUTH_ERROR', 'Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshTokenValue = signRefreshToken({ userId: user.id });

    // Hash refresh token before storing
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');

    // Calculate expiry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    return {
      user: toUserDto(user),
      accessToken,
      refreshToken: refreshTokenValue, // Return plain token for client
      expiresIn: 900, // 15 minutes in seconds
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenValue) {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenValue);
    } catch (err) {
      throw new AppError('AUTH_ERROR', 'Invalid refresh token', 401);
    }

    // Hash token to find in DB
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const tokenDoc = await refreshTokenRepository.findByTokenHash(refreshTokenHash);

    if (!tokenDoc) {
      throw new AppError('AUTH_ERROR', 'Refresh token not found', 401);
    }

    // Check if revoked
    if (tokenDoc.revokedAt) {
      throw new AppError('AUTH_ERROR', 'Refresh token revoked', 401);
    }

    // Check if expired
    if (new Date() > tokenDoc.expiresAt) {
      throw new AppError('AUTH_ERROR', 'Refresh token expired', 401);
    }

    // Get user
    const user = await userRepository.findById(payload.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppError('AUTH_ERROR', 'User not found or disabled', 401);
    }

    // Revoke old token (rotation)
    await refreshTokenRepository.revoke(tokenDoc.id);

    // Generate new tokens
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshTokenValue = signRefreshToken({ userId: user.id });
    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshTokenValue)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store new refresh token
    const newTokenDoc = await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
      expiresIn: 900,
    };
  },

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshTokenValue) {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const tokenDoc = await refreshTokenRepository.findByTokenHash(refreshTokenHash);
    if (tokenDoc) {
      await refreshTokenRepository.revoke(tokenDoc.id);
    }
  },
};

module.exports = { authService };

