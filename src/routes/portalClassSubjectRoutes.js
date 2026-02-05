const express = require('express');
const router = express.Router();
const portalClassSubjectController = require('../controllers/portalClassSubjectController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/class-subjects
 * @desc Get all assignments (queries: classId, teacherId, subjectId) (ADMIN only)
 */
router.get('/', portalClassSubjectController.getAssignments);

/**
 * @route POST /api/portal/class-subjects
 * @desc Assign teacher to class+subject (ADMIN only)
 */
router.post('/', portalClassSubjectController.createAssignment);

/**
 * @route PUT /api/portal/class-subjects/:id
 * @desc Update assignment (change teacher) (ADMIN only)
 */
router.put('/:id', portalClassSubjectController.updateAssignment);

/**
 * @route DELETE /api/portal/class-subjects/:id
 * @desc Remove assignment (ADMIN only)
 */
router.delete('/:id', portalClassSubjectController.deleteAssignment);

module.exports = router;
