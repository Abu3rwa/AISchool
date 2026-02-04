const User = require('../models/User');
const Role = require('../models/Role');

/**
 * @desc Middleware to check if user has required permission
 * @param {string|Array} requiredPermission - Permission string or array of permissions (OR logic)
 * @returns {Function} - Express middleware function
 */
exports.requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Populate user roles if not already populated
      let user = req.user;
      if (!user.roles || (user.roles.length > 0 && typeof user.roles[0] === 'object' && !user.roles[0].permissions)) {
        user = await User.findById(req.user._id).populate('roles');
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
      }

      // Get all permissions from user's roles
      const userPermissions = new Set();
      const roleNames = [];

      for (const roleRef of user.roles) {
        let role;
        if (typeof roleRef === 'object' && roleRef.permissions) {
          role = roleRef;
        } else {
          role = await Role.findById(roleRef);
        }

        if (role && !role.deleted) {
          role.permissions.forEach(perm => userPermissions.add(perm));
          roleNames.push(role.name);
        }
      }

      // Check if user has required permission(s)
      const permissionsToCheck = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];

      const hasPermission = permissionsToCheck.some(perm => userPermissions.has(perm));

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Forbidden: Insufficient permissions',
          required: permissionsToCheck,
          userRoles: roleNames
        });
      }

      // Attach user permissions to request for use in controllers
      req.userPermissions = Array.from(userPermissions);
      req.userRoleNames = roleNames;

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization check failed', error: error.message });
    }
  };
};

/**
 * @desc Middleware to check if user has required role
 * @param {string|Array} requiredRole - Role name or array of role names (OR logic)
 * @returns {Function} - Express middleware function
 */
exports.requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Populate user roles if not already populated
      let user = req.user;
      if (!user.roles || (user.roles.length > 0 && typeof user.roles[0] === 'object' && !user.roles[0].name)) {
        user = await User.findById(req.user._id).populate('roles');
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
      }

      // Get user role names
      const userRoleNames = [];
      for (const roleRef of user.roles) {
        let role;
        if (typeof roleRef === 'object' && roleRef.name) {
          role = roleRef;
        } else {
          role = await Role.findById(roleRef);
        }

        if (role && !role.deleted) {
          userRoleNames.push(role.name);
        }
      }

      // Check if user has required role(s)
      const rolesToCheck = Array.isArray(requiredRole) 
        ? requiredRole 
        : [requiredRole];

      const hasRole = rolesToCheck.some(roleName => 
        userRoleNames.some(userRole => userRole.toUpperCase() === roleName.toUpperCase())
      );

      if (!hasRole) {
        return res.status(403).json({ 
          message: 'Forbidden: Insufficient role privileges',
          required: rolesToCheck,
          userRoles: userRoleNames
        });
      }

      // Attach user roles to request
      req.userRoleNames = userRoleNames;

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Role check failed', error: error.message });
    }
  };
};


