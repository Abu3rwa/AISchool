// Notification Service - business logic for notifications
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc Get all notifications for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of notification objects
 */
exports.getAllNotifications = async (tenantId) => {
  return await Notification.find({ tenantId, deleted: false })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get single notification by ID
 * @param {string} id - Notification ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Notification object
 */
exports.getNotificationById = async (id, tenantId) => {
  return await Notification.findOne({ _id: id, tenantId, deleted: false })
    .populate('user', 'name email');
};

/**
 * @desc Create a new notification
 * @param {Object} notificationData - Data for the new notification, including tenantId
 * @returns {Object} - Newly created notification object
 */
exports.createNotification = async (notificationData) => {
  // Validate user belongs to tenant
  const user = await User.findOne({ 
    _id: notificationData.user, 
    tenantId: notificationData.tenantId 
  });
  if (!user) {
    throw new Error('User not found or does not belong to tenant');
  }

  const newNotification = new Notification(notificationData);
  await newNotification.save();

  return await Notification.findById(newNotification._id)
    .populate('user', 'name email');
};

/**
 * @desc Update a notification by ID
 * @param {string} id - Notification ID
 * @param {Object} updateData - Data to update the notification
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated notification object
 */
exports.updateNotification = async (id, updateData, tenantId) => {
  // Validate user if provided
  if (updateData.user) {
    const user = await User.findOne({ 
      _id: updateData.user, 
      tenantId 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  return await Notification.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email');
};

/**
 * @desc Soft delete a notification by ID
 * @param {string} id - Notification ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted notification object
 */
exports.deleteNotification = async (id, tenantId) => {
  return await Notification.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get notifications for a specific user
 * @param {string} userId - User ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of notification objects
 */
exports.getNotificationsByUser = async (userId, tenantId) => {
  return await Notification.find({ 
    user: userId, 
    tenantId, 
    deleted: false 
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get unread notifications for a specific user
 * @param {string} userId - User ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of unread notification objects
 */
exports.getUnreadNotifications = async (userId, tenantId) => {
  return await Notification.find({ 
    user: userId, 
    isRead: false,
    tenantId, 
    deleted: false 
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Mark a notification as read
 * @param {string} id - Notification ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated notification object
 */
exports.markAsRead = async (id, tenantId) => {
  return await Notification.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { isRead: true },
    { new: true }
  ).populate('user', 'name email');
};

/**
 * @desc Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Update result
 */
exports.markAllAsRead = async (userId, tenantId) => {
  return await Notification.updateMany(
    { user: userId, tenantId, isRead: false, deleted: false },
    { isRead: true }
  );
};

/**
 * @desc Send notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {string} message - Notification message
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of created notification objects
 */
exports.sendBulkNotifications = async (userIds, message, tenantId) => {
  const notifications = [];
  
  for (const userId of userIds) {
    // Validate user belongs to tenant
    const user = await User.findOne({ _id: userId, tenantId });
    if (user) {
      const notification = new Notification({
        tenantId,
        user: userId,
        message,
        isRead: false
      });
      await notification.save();
      notifications.push(notification);
    }
  }

  return await Notification.find({ _id: { $in: notifications.map(n => n._id) } })
    .populate('user', 'name email');
};
