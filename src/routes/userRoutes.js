const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin only)
 */
router.get('/', authMiddleware, requirePermission('users.read'), userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get single user by ID
 * @access Private (Admin or owner)
 */
router.get('/:id', authMiddleware, requirePermission('users.read'), userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user (e.g., by Admin)
 * @access Private (Admin only)
 */
router.post('/', authMiddleware, requirePermission('users.create'), userController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user by ID
 * @access Private (Admin or owner)
 */
router.put('/:id', authMiddleware, requirePermission('users.update'), userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Soft delete a user by ID
 * @access Private (Admin only)
 */
router.delete('/:id', authMiddleware, requirePermission('users.delete'), userController.deleteUser);

module.exports = router;
