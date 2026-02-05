const express = require('express');
const router = express.Router();
const portalClassSubjectController = require('../controllers/portalClassSubjectController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/portal/my/assignments
 * @desc Get teacher's own ClassSubject assignments
 */
router.get('/assignments', portalClassSubjectController.getMyAssignments);

/**
 * @route GET /api/portal/my/classes
 * @desc Get teacher's assigned classes
 */
router.get('/classes', portalClassSubjectController.getMyClasses);

/**
 * @route GET /api/portal/my/subjects
 * @desc Get teacher's subjects (query: classId)
 */
router.get('/subjects', portalClassSubjectController.getMySubjects);

module.exports = router;
