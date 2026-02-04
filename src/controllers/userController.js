const userService = require('../services/userService');

/**
 * @desc Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) return res.status(401).json({ message: 'Unauthorized' });
    const users = await userService.getAllUsers(req.user.tenantId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await userService.getUserById(req.params.id, req.user.tenantId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUser = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) return res.status(401).json({ message: 'Unauthorized' });
    const userData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) return res.status(401).json({ message: 'Unauthorized' });
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.user.tenantId);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) return res.status(401).json({ message: 'Unauthorized' });
    const deletedUser = await userService.deleteUser(req.params.id, req.user.tenantId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
