/**
 * User Controller v1
 * Handles HTTP requests for user management
 */

const { userService } = require('../../application/services/userService');
const { okResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');

const userV1Controller = {
  async listUsers(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await userService.listUsersV1({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search,
      });
      return res.status(200).json(okResponse(result.data, result.meta));
    } catch (err) {
      return next(err);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserByIdV1(req.params.id);
      return res.status(200).json(okResponse(user));
    } catch (err) {
      return next(err);
    }
  },

  async createUser(req, res, next) {
    try {
      const { email, password, fullName, role, status } = req.body;

      if (!email || !password) {
        throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400);
      }

      const user = await userService.createUserV1({
        email,
        password,
        fullName,
        role,
        status,
      });

      return res.status(201).json(okResponse(user));
    } catch (err) {
      return next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUserV1(req.params.id, req.body);
      return res.status(200).json(okResponse(user));
    } catch (err) {
      return next(err);
    }
  },

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUserV1(req.params.id);
      return res.status(200).json(okResponse({ message: 'User deleted successfully' }));
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { userV1Controller };

