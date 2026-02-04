const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const roleService = require('./roleService');

/**
 * @desc Register a new user and potentially a new tenant
 * @param {string} email
 * @param {string} password
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} [tenantName] - Optional: if provided, a new tenant is created
 * @returns {Object} - Created user object with token
 */
exports.register = async (email, password, firstName, lastName, tenantName) => {
  let tenantId;

  // Check if user with email already exists
  const existingUser = await User.findOne({ email, deleted: false });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // If tenantName is provided, create a new tenant
  if (tenantName) {
    // Check if tenant slug already exists
    const slug = tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existingTenant = await Tenant.findOne({ slug, deleted: false });
    if (existingTenant) {
      throw new Error('Tenant with this name already exists');
    }

    const newTenant = new Tenant({ 
      name: tenantName, 
      slug: slug 
    });
    await newTenant.save();
    tenantId = newTenant._id;

    // Create default roles for the new tenant
    await roleService.createDefaultRoles(tenantId);
  } else {
    throw new Error('Tenant name is required for registration.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Get ADMIN role for the first user
  const adminRole = await roleService.getRoleByName('ADMIN', tenantId);
  if (!adminRole) {
    throw new Error('Default roles not found. Please contact support.');
  }

  const newUser = new User({
    tenantId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    roles: [adminRole._id] // Assign ADMIN role as ObjectId reference
  });

  await newUser.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser._id, tenantId: newUser.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Remove password before returning
  const userObj = newUser.toObject();
  delete userObj.password;

  return { user: userObj, token };
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

  // Check if tenant is active
  const tenant = await Tenant.findOne({ _id: user.tenantId, deleted: false });
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  if (tenant.status !== 'active') {
    throw new Error(`Tenant account is ${tenant.status}`);
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

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
