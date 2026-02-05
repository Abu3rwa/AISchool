const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ProviderUser = require('../models/ProviderUser');
const Provider = require('../models/Provider');

exports.loginProviderUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const providerUser = await ProviderUser.findOne({ email, deleted: false }).select('+password');
    if (!providerUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!providerUser.isActive) {
      return res.status(401).json({ message: 'Provider user account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, providerUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: providerUser._id, type: 'provider' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    providerUser.password = undefined;
    res.status(200).json({ token, providerUser });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.getProviderMe = async (req, res) => {
  try {
    if (!req.providerUser) {
      return res.status(404).json({ message: 'Provider user not found' });
    }
    res.status(200).json(req.providerUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerProviderUser = async (req, res) => {
  try {
    const setupSecret = req.headers['x-setup-secret'];
    if (!process.env.PROVIDER_SETUP_SECRET || setupSecret !== process.env.PROVIDER_SETUP_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const existing = await ProviderUser.findOne({ email: req.body.email, deleted: false });
    if (existing) {
      return res.status(400).json({ message: 'Provider user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newProviderUser = new ProviderUser({
      ...req.body,
      password: hashedPassword,
    });

    await newProviderUser.save();

    const providerUserObj = newProviderUser.toObject();
    delete providerUserObj.password;

    res.status(201).json(providerUserObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.signupProviderWithManager = async (req, res) => {
  try {
    const { provider, manager } = req.body;
    if (!provider || !provider.name) {
      return res.status(400).json({ message: 'Provider name is required' });
    }
    if (!manager || !manager.firstName || !manager.lastName || !manager.email || !manager.password) {
      return res.status(400).json({ message: 'Manager firstName, lastName, email, and password are required' });
    }

    const existing = await ProviderUser.findOne({ email: manager.email, deleted: false });
    if (existing) {
      return res.status(400).json({ message: 'Provider user with this email already exists' });
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

    res.status(201).json({ token, provider: newProvider, providerUser: providerUserObj });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
