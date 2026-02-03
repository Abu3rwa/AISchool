const authService = require('../services/authService');

/**
 * @desc Register a new user
 * @param {Object} req - Express request object (contains user data for registration)
 * @param {Object} res - Express response object
 */
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, tenantName } = req.body;
    // For a SaaS, initial registration might create a new tenant and a super admin user for that tenant
    const result = await authService.register(email, password, firstName, lastName, tenantName);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Login a user
 * @param {Object} req - Express request object (contains email and password)
 * @param {Object} res - Express response object
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

/**
 * @desc Get authenticated user details
 * @param {Object} req - Express request object (user details often attached by auth middleware)
 * @param {Object} res - Express response object
 */
exports.getMe = async (req, res) => {
  try {
    // Assuming user details are attached to req.user by a middleware
    const user = req.user; // Placeholder: actual implementation needs auth middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
