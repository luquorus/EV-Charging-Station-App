/**
 * User Service
 * Business logic for user management
 */

const { userRepository } = require('../../domain/repositories/userRepository');
const { hashPassword } = require('../../utils/password');
const { AppError } = require('../../utils/errors');
const { toUserDto, UserRoles, UserStatus } = require('../../domain/entities/userEntity');

const userService = {
  async listUsersV1({ page, limit, search }) {
    const { items, total } = await userRepository.findAll({ page, limit, search });
    return {
      data: items.map(toUserDto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getUserByIdV1(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found', 404);
    }
    return toUserDto(user);
  },

  async createUserV1(userData) {
    // Check if email exists
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) {
      throw new AppError('VALIDATION_ERROR', 'Email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const user = await userRepository.create({
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      role: userData.role || UserRoles.USER,
      status: userData.status || UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return toUserDto(user);
  },

  async updateUserV1(id, updates) {
    // Check if user exists
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found', 404);
    }

    // If email is being updated, check if new email exists
    if (updates.email && updates.email !== user.email) {
      const existing = await userRepository.findByEmail(updates.email);
      if (existing) {
        throw new AppError('VALIDATION_ERROR', 'Email already exists', 400);
      }
    }

    // Hash password if provided
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }

    const updated = await userRepository.update(id, updates);
    return toUserDto(updated);
  },

  async deleteUserV1(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found', 404);
    }
    await userRepository.update(id, { status: UserStatus.DISABLED }); // Soft delete
  },
};

module.exports = { userService };

