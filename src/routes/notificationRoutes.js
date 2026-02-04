// Notification Routes - CRUD for notifications
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('notifications.create'), notificationController.createNotification);
router.post('/bulk', requirePermission('notifications.create'), notificationController.sendBulkNotifications);
router.get('/', requirePermission('notifications.read'), notificationController.getAllNotifications);
router.get('/my', requirePermission('notifications.read'), notificationController.getMyNotifications);
router.get('/my/unread', requirePermission('notifications.read'), notificationController.getMyUnreadNotifications);
router.put('/my/mark-all-read', requirePermission('notifications.update'), notificationController.markAllAsRead);
router.get('/:id', requirePermission('notifications.read'), notificationController.getNotificationById);
router.put('/:id', requirePermission('notifications.update'), notificationController.updateNotification);
router.put('/:id/read', requirePermission('notifications.update'), notificationController.markAsRead);
router.delete('/:id', requirePermission('notifications.delete'), notificationController.deleteNotification);

module.exports = router;
