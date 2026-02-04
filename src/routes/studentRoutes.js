// Student Routes - CRUD for students
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('students.create'), studentController.createStudent);
router.get('/', requirePermission('students.read'), studentController.getAllStudents);
router.get('/:id', requirePermission('students.read'), studentController.getStudentById);
router.put('/:id', requirePermission('students.update'), studentController.updateStudent);
router.delete('/:id', requirePermission('students.delete'), studentController.deleteStudent);

module.exports = router;
