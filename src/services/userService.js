const User = require('../models/User'); // Ensure this matches your model file name

/**
 * @desc Get all users
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Array} - Array of user objects
 */
exports.getAllUsers = async (tenantId) => {
  // Filters users by tenantId to prevent cross-tenant data leakage
  return await User.find({ tenantId, deleted: false }).select('-password');
};

/**
 * @desc Get single user by ID
 * @param {string} id - User ID
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - User object
 */
exports.getUserById = async (id, tenantId) => {
  // Filters user by tenantId to prevent cross-tenant data leakage
  return await User.findOne({ _id: id, tenantId, deleted: false }).select('-password');
};

/**
 * @desc Create a new user
 * @param {Object} userData - Data for the new user, including tenantId
 * @returns {Object} - Newly created user object
 */
exports.createUser = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

/**
 * @desc Update a user by ID
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update the user
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - Updated user object
 */
exports.updateUser = async (id, updateData, tenantId) => {
  // Filters user by tenantId to prevent cross-tenant data leakage
  return await User.findOneAndUpdate({ _id: id, tenantId, deleted: false }, updateData, { new: true }).select('-password');
};

/**
 * @desc Soft delete a user by ID
 * @param {string} id - User ID
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - Soft deleted user object
 */
exports.deleteUser = async (id, tenantId) => {
  // Filters user by tenantId to prevent cross-tenant data leakage
  return await User.findOneAndUpdate({ _id: id, tenantId, deleted: false }, { deleted: true, deletedAt: new Date() }, { new: true }).select('-password');
};
