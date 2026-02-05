const express = require('express');
const router = express.Router();
const portalClassController = require('../controllers/portalClassController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/classes
 * @desc Get all classes (queries: isActive)
 */
router.get('/', portalClassController.getClasses);

/**
 * @route GET /api/portal/classes/:id
 * @desc Get class by ID with students and assignments
 */
router.get('/:id', portalClassController.getClassById);

/**
 * @route POST /api/portal/classes
 * @desc Create a new class (ADMIN only)
 */
router.post('/', portalClassController.createClass);

/**
 * @route PUT /api/portal/classes/:id
 * @desc Update a class (ADMIN only)
 */
router.put('/:id', portalClassController.updateClass);

/**
 * @route PATCH /api/portal/classes/:id/status
 * @desc Set class active/inactive (ADMIN only)
 */
router.patch('/:id/status', portalClassController.setClassStatus);

/**
 * @route DELETE /api/portal/classes/:id
 * @desc Soft delete a class (ADMIN only)
 */
router.delete('/:id', portalClassController.deleteClass);

module.exports = router;
