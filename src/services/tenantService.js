const Tenant = require('../models/Tenant'); // Ensure this matches your model file name

/**
 * @desc Get all tenants
 * @returns {Array} - Array of tenant objects
 */
exports.getAllTenants = async () => {
  return await Tenant.find({ deleted: false });
};

/**
 * @desc Get single tenant by ID
 * @param {string} id - Tenant ID
 * @returns {Object} - Tenant object
 */
exports.getTenantById = async (id) => {
  return await Tenant.findOne({ _id: id, deleted: false });
};

/**
 * @desc Create a new tenant
 * @param {Object} tenantData - Data for the new tenant
 * @returns {Object} - Newly created tenant object
 */
exports.createTenant = async (tenantData) => {
  const newTenant = new Tenant(tenantData);
  return await newTenant.save();
};

/**
 * @desc Update a tenant by ID
 * @param {string} id - Tenant ID
 * @param {Object} updateData - Data to update the tenant
 * @returns {Object} - Updated tenant object
 */
exports.updateTenant = async (id, updateData) => {
  return await Tenant.findOneAndUpdate({ _id: id, deleted: false }, updateData, { new: true });
};

/**
 * @desc Soft delete a tenant by ID
 * @param {string} id - Tenant ID
 * @returns {Object} - Soft deleted tenant object
 */
exports.deleteTenant = async (id) => {
  return await Tenant.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true, deletedAt: new Date() }, { new: true });
};
