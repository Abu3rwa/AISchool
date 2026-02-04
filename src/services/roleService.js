// Role Service - business logic for roles
const Role = require('../models/Role');

/**
 * @desc Get all roles for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of role objects
 */
exports.getAllRoles = async (tenantId) => {
  return await Role.find({ tenantId, deleted: false });
};

/**
 * @desc Get single role by ID
 * @param {string} id - Role ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Role object
 */
exports.getRoleById = async (id, tenantId) => {
  return await Role.findOne({ _id: id, tenantId, deleted: false });
};

/**
 * @desc Create a new role
 * @param {Object} roleData - Data for the new role, including tenantId
 * @returns {Object} - Newly created role object
 */
exports.createRole = async (roleData) => {
  const newRole = new Role(roleData);
  return await newRole.save();
};

/**
 * @desc Update a role by ID
 * @param {string} id - Role ID
 * @param {Object} updateData - Data to update the role
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated role object
 */
exports.updateRole = async (id, updateData, tenantId) => {
  // Prevent updating default roles
  const role = await Role.findOne({ _id: id, tenantId, deleted: false });
  if (!role) {
    throw new Error('Role not found');
  }
  if (role.isDefault) {
    throw new Error('Cannot update default role');
  }
  
  return await Role.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true }
  );
};

/**
 * @desc Soft delete a role by ID
 * @param {string} id - Role ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted role object
 */
exports.deleteRole = async (id, tenantId) => {
  // Prevent deleting default roles
  const role = await Role.findOne({ _id: id, tenantId, deleted: false });
  if (!role) {
    throw new Error('Role not found');
  }
  if (role.isDefault) {
    throw new Error('Cannot delete default role');
  }
  
  return await Role.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Create default roles for a new tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of created role objects
 */
exports.createDefaultRoles = async (tenantId) => {
  const defaultRoles = [
    {
      tenantId,
      name: 'ADMIN',
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'students.create', 'students.read', 'students.update', 'students.delete',
        'classes.create', 'classes.read', 'classes.update', 'classes.delete',
        'subjects.create', 'subjects.read', 'subjects.update', 'subjects.delete',
        'grades.create', 'grades.read', 'grades.update', 'grades.delete',
        'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete',
        'fees.create', 'fees.read', 'fees.update', 'fees.delete',
        'payments.create', 'payments.read', 'payments.update', 'payments.delete',
        'reports.read', 'reports.create',
        'settings.read', 'settings.update',
        'audit.read'
      ],
      isDefault: true
    },
    {
      tenantId,
      name: 'TEACHER',
      permissions: [
        'students.read',
        'classes.read',
        'subjects.read', 'subjects.update',
        'grades.create', 'grades.read', 'grades.update',
        'attendance.create', 'attendance.read', 'attendance.update',
        'reports.read', 'reports.create'
      ],
      isDefault: true
    },
    {
      tenantId,
      name: 'STUDENT',
      permissions: [
        'students.read',
        'grades.read',
        'attendance.read',
        'fees.read',
        'payments.read',
        'reports.read'
      ],
      isDefault: true
    }
  ];

  const createdRoles = [];
  for (const roleData of defaultRoles) {
    try {
      const role = new Role(roleData);
      await role.save();
      createdRoles.push(role);
    } catch (error) {
      // If role already exists, skip
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  return createdRoles;
};

/**
 * @desc Get role by name for a tenant
 * @param {string} name - Role name
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Role object
 */
exports.getRoleByName = async (name, tenantId) => {
  return await Role.findOne({ name, tenantId, deleted: false });
};
