const express = require('express');
const router = express.Router();
const portalTeacherController = require('../controllers/portalTeacherController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/teachers
 * @desc Get all teachers (ADMIN only)
 */
router.get('/', portalTeacherController.getTeachers);

/**
 * @route GET /api/portal/teachers/:id
 * @desc Get teacher by ID with assignments (ADMIN only)
 */
router.get('/:id', portalTeacherController.getTeacherById);

/**
 * @route POST /api/portal/teachers
 * @desc Create a new teacher - returns temp password (ADMIN only)
 */
router.post('/', portalTeacherController.createTeacher);

/**
 * @route PUT /api/portal/teachers/:id
 * @desc Update teacher info (ADMIN only)
 */
router.put('/:id', portalTeacherController.updateTeacher);

/**
 * @route PATCH /api/portal/teachers/:id/status
 * @desc Set teacher active/inactive (ADMIN only)
 */
router.patch('/:id/status', portalTeacherController.setTeacherStatus);

/**
 * @route POST /api/portal/teachers/:id/reset-password
 * @desc Reset teacher password - returns temp password (ADMIN only)
 */
router.post('/:id/reset-password', portalTeacherController.resetTeacherPassword);

/**
 * @route DELETE /api/portal/teachers/:id
 * @desc Soft delete a teacher (ADMIN only)
 */
router.delete('/:id', portalTeacherController.deleteTeacher);

module.exports = router;
