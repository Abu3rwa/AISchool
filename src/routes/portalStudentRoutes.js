const express = require('express');
const router = express.Router();
const portalStudentController = require('../controllers/portalStudentController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/students
 * @desc Get all students (queries: classId, isActive)
 */
router.get('/', portalStudentController.getStudents);

/**
 * @route GET /api/portal/students/:id
 * @desc Get student by ID
 */
router.get('/:id', portalStudentController.getStudentById);

/**
 * @route POST /api/portal/students
 * @desc Create a new student (ADMIN only)
 */
router.post('/', portalStudentController.createStudent);

/**
 * @route PUT /api/portal/students/:id
 * @desc Update a student (ADMIN only)
 */
router.put('/:id', portalStudentController.updateStudent);

/**
 * @route PATCH /api/portal/students/:id/status
 * @desc Set student active/inactive (ADMIN only)
 */
router.patch('/:id/status', portalStudentController.setStudentStatus);

/**
 * @route DELETE /api/portal/students/:id
 * @desc Soft delete a student (ADMIN only)
 */
router.delete('/:id', portalStudentController.deleteStudent);

module.exports = router;
