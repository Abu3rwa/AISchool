// Attendance Routes - CRUD for attendance
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('attendance.create'), attendanceController.createAttendance);
router.get('/', requirePermission('attendance.read'), attendanceController.getAllAttendances);
router.get('/:id', requirePermission('attendance.read'), attendanceController.getAttendanceById);
router.put('/:id', requirePermission('attendance.update'), attendanceController.updateAttendance);
router.delete('/:id', requirePermission('attendance.delete'), attendanceController.deleteAttendance);

module.exports = router;
