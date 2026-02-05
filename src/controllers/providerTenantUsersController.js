const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Role = require('../models/Role');

// Helper to verify tenant belongs to provider
const verifyTenant = async (tenantId, providerId) => {
    const tenant = await Tenant.findOne({ _id: tenantId, providerId, deleted: false });
    if (!tenant) {
        throw new Error('Tenant not found or access denied');
    }
    return tenant;
};

const generateTempPassword = (length = 12) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
};

exports.listTenantUsers = async (req, res) => {
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
        const users = await User.find({ tenantId, deleted: false })
            .populate('roles', 'name')
            .sort({ createdAt: -1 });

        // Step 5: return sanitized response
        // Remove password and sanitize if necessary
        const sanitizedUsers = users.map(u => {
            const obj = u.toObject();
            delete obj.password;
            return obj;
        });

        res.status(200).json(sanitizedUsers);
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};

exports.resetTenantAdminPassword = async (req, res) => {
    try {
        const providerId = req.providerId;
        const { tenantId } = req.params;

        let tenant;
        try {
            tenant = await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        let adminUser = null;

        if (tenant.primaryAdminUserId) {
            adminUser = await User.findOne({
                _id: tenant.primaryAdminUserId,
                tenantId,
                deleted: false,
            }).select('+password');
        }

        if (!adminUser) {
            const adminRole = await Role.findOne({ tenantId, name: 'ADMIN', deleted: false });
            if (adminRole) {
                adminUser = await User.findOne({ tenantId, roles: adminRole._id, deleted: false }).select('+password');
            }
        }

        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found for this tenant' });
        }

        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        adminUser.password = hashedPassword;
        await adminUser.save();

        res.status(200).json({ tempPassword });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTenantUser = async (req, res) => {
    try {
        // Step 1: auth context
        const providerId = req.providerId;
        const { tenantId } = req.params;
        const { firstName, lastName, email, password, roleIds } = req.body;

        // Step 2: validate params/body
        if (!firstName || !lastName || !email || !password || !roleIds || !roleIds.length) {
            return res.status(400).json({ message: 'Missing required fields: firstName, lastName, email, password, roleIds' });
        }

        // Step 3: verify tenant belongs to provider
        try {
            await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // Step 4: do the operation
        // Check email uniqueness within tenant
        const existingUser = await User.findOne({ tenantId, email, deleted: false });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists in this tenant' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Verify roles exist and belong to tenant
        const countRoles = await Role.countDocuments({
            _id: { $in: roleIds },
            tenantId: tenantId,
            deleted: false
        });
        if (countRoles !== roleIds.length) {
            return res.status(400).json({ message: 'One or more roles differ from tenant context' });
        }

        const newUser = new User({
            tenantId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: roleIds,
        });
        await newUser.save();

        // Step 5: return sanitized response
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json(userObj);
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};

exports.setTenantUserStatus = async (req, res) => {
    try {
        // Step 1: auth context
        const providerId = req.providerId;
        const { tenantId, userId } = req.params;
        const { isActive } = req.body; // Expecting boolean or string 'active'/'inactive'

        if (typeof isActive === 'undefined') {
            return res.status(400).json({ message: 'isActive status is required' });
        }

        // Step 3: verify tenant belongs to provider
        try {
            await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // Step 4: do the operation
        // Find user ensure it belongs to tenant
        const user = await User.findOne({ _id: userId, tenantId, deleted: false });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        // Step 5: return sanitized response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json(userObj);
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};
