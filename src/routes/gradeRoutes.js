// Grade Routes - CRUD for grades (legacy routes, use /api/portal/grades instead)
const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', gradeController.createGrade);
router.get('/', gradeController.getGrades);
router.get('/:id', gradeController.getGradeById);
router.put('/:id', gradeController.updateGrade);
router.delete('/:id', gradeController.deleteGrade);

module.exports = router;
