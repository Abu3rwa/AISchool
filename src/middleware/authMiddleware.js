const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findOne({ _id: decoded.id, tenantId: decoded.tenantId, deleted: false }).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    // Check tenant status
    const tenant = await Tenant.findOne({ _id: user.tenantId, deleted: false });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    if (tenant.status !== 'active') {
      return res.status(403).json({ message: `Tenant account is ${tenant.status}` });
    }

    req.user = user;
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
