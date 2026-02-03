const tenantService = require('../services/tenantService');

/**
 * @desc Get all tenants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await tenantService.getAllTenants();
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single tenant by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTenantById = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new tenant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTenant = async (req, res) => {
  try {
    const newTenant = await tenantService.createTenant(req.body);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a tenant by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTenant = async (req, res) => {
  try {
    const updatedTenant = await tenantService.updateTenant(req.params.id, req.body);
    if (!updatedTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json(updatedTenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a tenant by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTenant = async (req, res) => {
  try {
    const deletedTenant = await tenantService.deleteTenant(req.params.id);
    if (!deletedTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json({ message: 'Tenant soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
