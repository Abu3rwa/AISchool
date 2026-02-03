const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is in ../models/User.js
const Tenant = require('../models/Tenant'); // Assuming Tenant model is in ../models/Tenant.js
const { Schema } = require('mongoose');

/**
 * @desc Register a new user and potentially a new tenant
 * @param {string} email
 * @param {string} password
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} [tenantName] - Optional: if provided, a new tenant is created
 * @returns {Object} - Created user object
 */
exports.register = async (email, password, firstName, lastName, tenantName) => {
  let tenantId;

  // If tenantName is provided, create a new tenant
  if (tenantName) {
    const newTenant = new Tenant({ name: tenantName, slug: tenantName.toLowerCase().replace(/\s/g, '-') });
    await newTenant.save();
    tenantId = newTenant._id;
  } else {
    // In a real app, if tenantName is not provided, you'd likely expect a tenantId to be passed
    // or infer it from the context (e.g., inviting user to an existing tenant)
    throw new Error('Tenant name or ID is required for registration.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    tenantId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: tenantName ? 'SCHOOL_ADMIN' : 'TEACHER', // First user of a new tenant is SCHOOL_ADMIN
    // Add default roles or assign based on tenant setup
  });

  await newUser.save();

  // In a real application, you might also want to generate a JWT here
  // and return it along with the user.
  // const token = jwt.sign({ id: newUser._id, tenantId: newUser.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return newUser; // Or { user: newUser, token } if generating JWT
};

/**
 * @desc Login a user
 * @param {string} email
 * @param {string} password
 * @returns {Object} - User object and JWT token
 */
exports.login = async (email, password) => {
  const user = await User.findOne({ email, deleted: false }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Remove password before returning user object
  user.password = undefined;

  return { user, token };
};

/**
 * @desc Placeholder for getting user details, assuming JWT is validated by middleware
 * @param {string} userId
 * @param {string} tenantId
 * @returns {Object} - User object
 */
exports.getUserProfile = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId, deleted: false }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
