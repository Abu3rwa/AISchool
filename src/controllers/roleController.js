// Role Controller - handles role CRUD operations
const roleService = require('../services/roleService');

/**
 * @desc Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllRoles = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const roles = await roleService.getAllRoles(req.user.tenantId);
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoleById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await roleService.getRoleById(req.params.id, req.user.tenantId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createRole = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const roleData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newRole = await roleService.createRole(roleData);
    res.status(201).json(newRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateRole = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedRole = await roleService.updateRole(req.params.id, req.body, req.user.tenantId);
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteRole = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedRole = await roleService.deleteRole(req.params.id, req.user.tenantId);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role soft deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
