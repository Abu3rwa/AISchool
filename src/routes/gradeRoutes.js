// Grade Routes - CRUD for grades
const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('grades.create'), gradeController.createGrade);
router.get('/', requirePermission('grades.read'), gradeController.getAllGrades);
router.get('/:id', requirePermission('grades.read'), gradeController.getGradeById);
router.put('/:id', requirePermission('grades.update'), gradeController.updateGrade);
router.delete('/:id', requirePermission('grades.delete'), gradeController.deleteGrade);

module.exports = router;
