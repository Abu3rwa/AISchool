const Role = require('../models/Role');
const Tenant = require('../models/Tenant');

// Helper to verify tenant belongs to provider
const verifyTenant = async (tenantId, providerId) => {
    const tenant = await Tenant.findOne({ _id: tenantId, providerId, deleted: false });
    if (!tenant) {
        throw new Error('Tenant not found or access denied');
    }
    return tenant;
};

exports.listTenantRoles = async (req, res) => {
    try {
        // Step 1: auth context
        const providerId = req.providerId;
        const { tenantId } = req.params;

        // Step 3: verify tenant belongs to provider
        try {
            await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // Step 4: do the operation
        const roles = await Role.find({ tenantId, deleted: false }).sort({ name: 1 });

        // Step 5: return response
        res.status(200).json(roles);
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};

exports.updateTenantRolePermissions = async (req, res) => {
    try {
        // Step 1: auth context
        const providerId = req.providerId;
        const { tenantId, roleId } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Permissions must be an array' });
        }

        // Step 3: verify tenant belongs to provider
        try {
            await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // Step 4: do the operation
        const role = await Role.findOne({ _id: roleId, tenantId, deleted: false });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.permissions = permissions;
        await role.save();

        // Step 5: return response
        res.status(200).json(role);
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};
