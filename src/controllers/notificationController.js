// Notification Controller - handles notification CRUD operations
const notificationService = require('../services/notificationService');

/**
 * @desc Get all notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notifications = await notificationService.getAllNotifications(req.user.tenantId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNotificationById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notification = await notificationService.getNotificationById(req.params.id, req.user.tenantId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createNotification = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notificationData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newNotification = await notificationService.createNotification(notificationData);
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateNotification = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedNotification = await notificationService.updateNotification(req.params.id, req.body, req.user.tenantId);
    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteNotification = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedNotification = await notificationService.deleteNotification(req.params.id, req.user.tenantId);
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get notifications for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notifications = await notificationService.getNotificationsByUser(req.user.id, req.user.tenantId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get unread notifications for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyUnreadNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notifications = await notificationService.getUnreadNotifications(req.user.id, req.user.tenantId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mark a notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notification = await notificationService.markAsRead(req.params.id, req.user.tenantId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Mark all notifications as read for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = await notificationService.markAllAsRead(req.user.id, req.user.tenantId);
    res.status(200).json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Send bulk notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendBulkNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { userIds, message } = req.body;
    if (!userIds || !Array.isArray(userIds) || !message) {
      return res.status(400).json({ message: 'userIds (array) and message are required' });
    }
    const notifications = await notificationService.sendBulkNotifications(userIds, message, req.user.tenantId);
    res.status(201).json(notifications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
