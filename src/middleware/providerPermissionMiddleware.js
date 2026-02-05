/**
 * @desc Middleware to check provider user permissions
 * @param {string|Array} requiredPermission
 */
module.exports = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.providerUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const permissionsToCheck = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const userPermissions = Array.isArray(req.providerUser.permissions)
      ? req.providerUser.permissions
      : [];

    const hasPermission = permissionsToCheck.some((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Forbidden: Insufficient permissions',
        required: permissionsToCheck,
      });
    }

    next();
  };
};
