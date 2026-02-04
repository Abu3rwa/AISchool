const Tenant = require('../models/Tenant');

/**
 * @desc Middleware to ensure tenant isolation and validate tenant status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized: No tenant context' });
    }

    // Check tenant status
    const tenant = await Tenant.findOne({ 
      _id: req.user.tenantId, 
      deleted: false 
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({ 
        message: `Tenant account is ${tenant.status}`,
        status: tenant.status
      });
    }

    // Prevent tenantId override in request body
    if (req.body && req.body.tenantId) {
      delete req.body.tenantId;
    }

    // Attach tenant info to request
    req.tenant = tenant;
    req.tenantId = req.user.tenantId;

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Tenant validation failed', error: error.message });
  }
};


