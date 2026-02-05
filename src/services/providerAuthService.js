const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ProviderUser = require('../models/ProviderUser');
const Provider = require('../models/Provider');

exports.login = async (email, password) => {
  const providerUser = await ProviderUser.findOne({ email, deleted: false }).select('+password');
  if (!providerUser) {
    throw new Error('Invalid credentials');
  }

  if (!providerUser.isActive) {
    throw new Error('Provider user account is inactive');
  }

  const isMatch = await bcrypt.compare(password, providerUser.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: providerUser._id, type: 'provider' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  providerUser.password = undefined;
  return { token, providerUser };
};

exports.createProviderUser = async (providerUserData) => {
  const existing = await ProviderUser.findOne({ email: providerUserData.email, deleted: false });
  if (existing) {
    throw new Error('Provider user with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(providerUserData.password, salt);

  const newProviderUser = new ProviderUser({
    ...providerUserData,
    password: hashedPassword,
  });

  await newProviderUser.save();

  const providerUserObj = newProviderUser.toObject();
  delete providerUserObj.password;

  return providerUserObj;
};

exports.signupProviderWithManager = async ({ provider, manager }) => {
  if (!provider || !provider.name) {
    throw new Error('Provider name is required');
  }
  if (!manager || !manager.firstName || !manager.lastName || !manager.email || !manager.password) {
    throw new Error('Manager firstName, lastName, email, and password are required');
  }

  const existing = await ProviderUser.findOne({ email: manager.email, deleted: false });
  if (existing) {
    throw new Error('Provider user with this email already exists');
  }

  const newProvider = new Provider({
    name: provider.name,
    legalName: provider.legalName,
    email: provider.email,
    domain: provider.domain,
  });
  await newProvider.save();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(manager.password, salt);

  const permissions = Array.isArray(manager.permissions) && manager.permissions.length
    ? manager.permissions
    : ['tenants.create', 'tenants.read', 'tenants.update', 'tenants.delete'];

  const newProviderUser = new ProviderUser({
    providerId: newProvider._id,
    firstName: manager.firstName,
    lastName: manager.lastName,
    email: manager.email,
    password: hashedPassword,
    permissions,
  });
  await newProviderUser.save();

  const token = jwt.sign(
    { id: newProviderUser._id, type: 'provider' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const providerUserObj = newProviderUser.toObject();
  delete providerUserObj.password;

  return { token, provider: newProvider, providerUser: providerUserObj };
};
