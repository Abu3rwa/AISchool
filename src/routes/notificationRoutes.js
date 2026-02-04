// Notification Routes - CRUD for notifications
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', notificationController.createNotification);
router.post('/bulk', notificationController.sendBulkNotifications);
router.get('/', notificationController.getAllNotifications);
router.get('/my', notificationController.getMyNotifications);
router.get('/my/unread', notificationController.getMyUnreadNotifications);
router.put('/my/mark-all-read', notificationController.markAllAsRead);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
