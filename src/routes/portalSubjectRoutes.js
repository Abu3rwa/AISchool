const express = require('express');
const router = express.Router();
const portalSubjectController = require('../controllers/portalSubjectController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/subjects
 * @desc Get all subjects (queries: isActive, classId)
 */
router.get('/', portalSubjectController.getSubjects);

/**
 * @route GET /api/portal/subjects/:id
 * @desc Get subject by ID with assignments
 */
router.get('/:id', portalSubjectController.getSubjectById);

/**
 * @route POST /api/portal/subjects
 * @desc Create a new subject (ADMIN only)
 */
router.post('/', portalSubjectController.createSubject);

/**
 * @route PUT /api/portal/subjects/:id
 * @desc Update a subject (ADMIN only)
 */
router.put('/:id', portalSubjectController.updateSubject);

/**
 * @route PATCH /api/portal/subjects/:id/status
 * @desc Set subject active/inactive (ADMIN only)
 */
router.patch('/:id/status', portalSubjectController.setSubjectStatus);

/**
 * @route DELETE /api/portal/subjects/:id
 * @desc Soft delete a subject (ADMIN only)
 */
router.delete('/:id', portalSubjectController.deleteSubject);

module.exports = router;
