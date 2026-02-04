// Enrollment Routes - CRUD for enrollments
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('enrollments.create'), enrollmentController.createEnrollment);
router.get('/', requirePermission('enrollments.read'), enrollmentController.getAllEnrollments);
router.get('/:id', requirePermission('enrollments.read'), enrollmentController.getEnrollmentById);
router.put('/:id', requirePermission('enrollments.update'), enrollmentController.updateEnrollment);
router.delete('/:id', requirePermission('enrollments.delete'), enrollmentController.deleteEnrollment);

module.exports = router;
