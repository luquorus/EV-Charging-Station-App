/**
 * User Routes v1
 */

const express = require('express');
const { userV1Controller } = require('../../controllers/userV1Controller');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', userV1Controller.listUsers);
router.get('/:id', userV1Controller.getUserById);
router.post('/', userV1Controller.createUser);
router.put('/:id', userV1Controller.updateUser);
router.delete('/:id', userV1Controller.deleteUser);

module.exports = { userV1Router: router };

