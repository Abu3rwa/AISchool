const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const roleService = require('./roleService');

/**
 * @desc Register a new user and potentially a new tenant (Provider Logic mostly)
 * ... (existing register code) ...
 */
exports.register = async (email, password, firstName, lastName, tenantName) => {
  email = email.toLowerCase().trim();
  let tenantId;

  // Check if user with email already exists (Global check for registration convenience, 
  // though schema allows duplicates across tenants. For SaaS registration, usually expect unique email for the account owner)
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
    roles: [adminRole._id]
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
 * @param {string} [slug] - Tenant slug (School Code) to identify which school context
 * @returns {Object} - User object and JWT token
 */
exports.login = async (email, password, slug) => {
  email = email.toLowerCase();
  let tenantId;

  if (slug) {
    // 1. Find the tenant by slug first
    const tenant = await Tenant.findOne({ slug, deleted: false });
    if (!tenant) {
      throw new Error('School not found with this code');
    }
    if (tenant.status !== 'active') {
      throw new Error(`School account is ${tenant.status}`);
    }
    tenantId = tenant._id;
  }

  // 2. Build query
  const query = { email, deleted: false };
  if (tenantId) {
    query.tenantId = tenantId;
  }

  // 3. Find user
  const user = await User.findOne(query).select('+password').populate('roles', 'name permissions');

  if (!user) {
    throw new Error('Invalid credentials'); // Generic message for security
  }

  // If no slug was provided, we must check if this user implies a specific tenant status check
  // (This handles the Provider login case where they might not supply a slug, 
  // OR if we assume email uniqueness for Providers)
  if (!tenantId) {
    const tenant = await Tenant.findOne({ _id: user.tenantId, deleted: false });
    if (!tenant || tenant.status !== 'active') {
      throw new Error('Tenant access denied');
    }
  }

  // 4. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // 5. Generate Token
  const token = jwt.sign(
    { id: user._id, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

exports.getUserProfile = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId, deleted: false })
    .select('-password')
    .populate('roles', 'name permissions');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
