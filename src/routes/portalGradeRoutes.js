const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Core grade CRUD
router.get('/', gradeController.getGrades);
router.post('/', gradeController.createGrade);
router.post('/bulk', gradeController.bulkCreateGrades);
router.get('/:id', gradeController.getGradeById);
router.put('/:id', gradeController.updateGrade);
router.patch('/:id/publish', gradeController.publishGrade);
router.delete('/:id', gradeController.deleteGrade);

// Filtered views
router.get('/by-class/:classId', gradeController.getGradesByClass);
router.get('/by-student/:studentId', gradeController.getGradesByStudent);

module.exports = router;
