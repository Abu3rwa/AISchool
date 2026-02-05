const jwt = require('jsonwebtoken');
const ProviderUser = require('../models/ProviderUser');
const Provider = require('../models/Provider');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || decoded.type !== 'provider') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const providerUser = await ProviderUser.findOne({ _id: decoded.id, deleted: false }).select('-password');
    if (!providerUser) {
      return res.status(401).json({ message: 'Provider user not found or deleted' });
    }

    if (!providerUser.isActive) {
      return res.status(403).json({ message: 'Provider user account is inactive' });
    }

    const provider = await Provider.findOne({ _id: providerUser.providerId, deleted: false });
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (!provider.isActive) {
      return res.status(403).json({ message: 'Provider account is inactive' });
    }

    req.providerUser = providerUser;
    req.providerId = providerUser.providerId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};
