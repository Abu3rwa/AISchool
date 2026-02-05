const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc Get all users
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Array} - Array of user objects
 */
exports.getAllUsers = async (tenantId) => {
  // Filters users by tenantId 
  return await User.find({ tenantId, deleted: false })
    .select('-password')
    .populate('roles', 'name')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get single user by ID
 * @param {string} id - User ID
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - User object
 */
exports.getUserById = async (id, tenantId) => {
  return await User.findOne({ _id: id, tenantId, deleted: false })
    .select('-password')
    .populate('roles', 'name permissions');
};

/**
 * @desc Create a new user
 * @param {Object} userData - Data for the new user, including tenantId
 * @returns {Object} - Newly created user object
 */
exports.createUser = async (userData) => {
  // Check email uniqueness globally
  const existing = await User.findOne({ email: userData.email, deleted: false });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  // Hash password if provided
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }

  const newUser = new User(userData);
  await newUser.save();

  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * @desc Update a user by ID
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update the user
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - Updated user object
 */
exports.updateUser = async (id, updateData, tenantId) => {
  // If password is being updated, hash it
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  // Filters user by tenantId to prevent cross-tenant data leakage
  return await User.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
};

/**
 * @desc Soft delete a user by ID
 * @param {string} id - User ID
 * @param {string} tenantId - The ID of the authenticated tenant
 * @returns {Object} - Soft deleted user object
 */
exports.deleteUser = async (id, tenantId) => {
  return await User.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  ).select('-password');
};
