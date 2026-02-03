const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin only)
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get single user by ID
 * @access Private (Admin or owner)
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user (e.g., by Admin)
 * @access Private (Admin only)
 */
router.post('/', userController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user by ID
 * @access Private (Admin or owner)
 */
router.put('/:id', userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Soft delete a user by ID
 * @access Private (Admin only)
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
