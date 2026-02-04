// Schedule Routes - CRUD for schedules
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('schedules.create'), scheduleController.createSchedule);
router.get('/', requirePermission('schedules.read'), scheduleController.getAllSchedules);
router.get('/:id', requirePermission('schedules.read'), scheduleController.getScheduleById);
router.put('/:id', requirePermission('schedules.update'), scheduleController.updateSchedule);
router.delete('/:id', requirePermission('schedules.delete'), scheduleController.deleteSchedule);

module.exports = router;
