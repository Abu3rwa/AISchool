const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Role = require('../models/Role');

const defaultRolesForTenant = (tenantId) => [
  {
    tenantId,
    name: 'ADMIN',
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete',
      'providers.create', 'providers.read', 'providers.update', 'providers.delete',
      'students.create', 'students.read', 'students.update', 'students.delete',
      'classes.create', 'classes.read', 'classes.update', 'classes.delete',
      'subjects.create', 'subjects.read', 'subjects.update', 'subjects.delete',
      'grades.create', 'grades.read', 'grades.update', 'grades.delete',
      'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete',
      'schedules.create', 'schedules.read', 'schedules.update', 'schedules.delete',
      'fees.create', 'fees.read', 'fees.update', 'fees.delete',
      'payments.create', 'payments.read', 'payments.update', 'payments.delete',
      'behavior-records.create', 'behavior-records.read', 'behavior-records.update', 'behavior-records.delete',
      'notifications.create', 'notifications.read', 'notifications.update', 'notifications.delete',
      'assets.create', 'assets.read', 'assets.update', 'assets.delete',
      'ai-report-requests.create', 'ai-report-requests.read', 'ai-report-requests.update', 'ai-report-requests.delete',
      'term-reports.create', 'term-reports.read', 'term-reports.update', 'term-reports.delete',
      'reports.read', 'reports.create',
      'settings.read', 'settings.update',
      'audit.read'
    ],
    isDefault: true,
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
      'schedules.read',
      'enrollments.read',
      'behavior-records.create', 'behavior-records.read', 'behavior-records.update',
      'notifications.read',
      'assets.create', 'assets.read',
      'ai-report-requests.create', 'ai-report-requests.read', 'ai-report-requests.update',
      'term-reports.create', 'term-reports.read', 'term-reports.update',
      'reports.read', 'reports.create'
    ],
    isDefault: true,
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
      'notifications.read',
      'term-reports.read',
      'ai-report-requests.read',
      'reports.read'
    ],
    isDefault: true,
  },
  {
    tenantId,
    name: 'PARENT',
    permissions: [
      'students.read',
      'grades.read',
      'attendance.read',
      'fees.read',
      'payments.read',
      'notifications.read',
      'term-reports.read',
      'ai-report-requests.read',
      'reports.read'
    ],
    isDefault: true,
  },
];

const createDefaultRoles = async (tenantId) => {
  const roles = defaultRolesForTenant(tenantId);
  const created = [];

  for (const roleData of roles) {
    try {
      const role = new Role(roleData);
      await role.save();
      created.push(role);
    } catch (error) {
      // If role already exists, skip
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  return created;
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const generateTempPassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

exports.createTenantWithAdmin = async (req, res) => {
  try {
    const { tenant, adminUserData } = req.body;

    if (!tenant || !tenant.name) {
      return res.status(400).json({ message: 'Tenant name is required' });
    }
    if (!adminUserData || !adminUserData.email || !adminUserData.firstName || !adminUserData.lastName) {
      return res.status(400).json({ message: 'Admin user firstName, lastName, and email are required' });
    }

    // User emails are globally unique in this codebase (see User model index).
    // Prevent creating a tenant if the admin email already exists anywhere.
    const existingGlobalUser = await User.findOne({ email: adminUserData.email.toLowerCase(), deleted: false });
    if (existingGlobalUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const slug = tenant.slug ? tenant.slug : generateSlug(tenant.name);
    const existingTenant = await Tenant.findOne({ slug, deleted: false });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant with this slug already exists' });
    }

    const newTenant = new Tenant({
      ...tenant,
      slug,
      providerId: req.providerId,
    });
    await newTenant.save();

    await createDefaultRoles(newTenant._id);
    const adminRole = await Role.findOne({ tenantId: newTenant._id, name: 'ADMIN', deleted: false });
    if (!adminRole) {
      return res.status(500).json({ message: 'Default roles not found for new tenant' });
    }

    const existingUser = await User.findOne({
      email: adminUserData.email,
      tenantId: newTenant._id,
      deleted: false,
    });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists in this tenant' });
    }

    const tempPassword = adminUserData.password || generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    let newUser;
    try {
      newUser = new User({
        tenantId: newTenant._id,
        firstName: adminUserData.firstName,
        lastName: adminUserData.lastName,
        email: adminUserData.email,
        password: hashedPassword,
        roles: [adminRole._id],
      });
      await newUser.save();

      // Persist direct pointer to the tenant's primary admin (avoids relying on role queries)
      await Tenant.findByIdAndUpdate(newTenant._id, { primaryAdminUserId: newUser._id }, { new: true });
    } catch (e) {
      // Roll back tenant if we couldn't create the admin user.
      // This avoids orphan tenants that show "No Admin user found".
      await Tenant.findByIdAndUpdate(newTenant._id, { deleted: true, deletedAt: new Date(), status: 'inactive' });
      await Role.updateMany(
        { tenantId: newTenant._id, deleted: false },
        { deleted: true, deletedAt: new Date() }
      );
      throw e;
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      tenant: newTenant,
      adminUser: userObj,
      tempPassword: adminUserData.password ? undefined : tempPassword,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyProviderTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ providerId: req.providerId, deleted: false }).sort({ createdAt: -1 });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, providerId: req.providerId, deleted: false });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Prefer direct tenant pointer if available
    let adminUser = null;
    if (tenant.primaryAdminUserId) {
      adminUser = await User.findOne({ _id: tenant.primaryAdminUserId, tenantId: tenant._id, deleted: false });
    }

    // Find the admin role for this tenant
    if (!adminUser) {
      const adminRole = await Role.findOne({
        tenantId: tenant._id,
        name: 'ADMIN',
        deleted: false
      });

      if (adminRole) {
        adminUser = await User.findOne({
          tenantId: tenant._id,
          roles: adminRole._id,
          deleted: false
        });
      }
    }

    const tenantObj = tenant.toObject();
    if (adminUser) {
      tenantObj.adminUser = {
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        // We cannot and should NOT return the password here.
        // If they need to reset it, they should use a Reset Password action.
      };
    }

    res.status(200).json(tenantObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.providerId) {
      delete updateData.providerId;
    }

    const updated = await Tenant.findOneAndUpdate(
      { _id: req.params.id, providerId: req.providerId, deleted: false },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTenantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'inactive', 'suspended'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await Tenant.findOneAndUpdate(
      { _id: req.params.id, providerId: req.providerId, deleted: false },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const deleted = await Tenant.findOneAndUpdate(
      { _id: req.params.id, providerId: req.providerId, deleted: false },
      { deleted: true, deletedAt: new Date(), status: 'inactive' },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json({ message: 'Tenant soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
