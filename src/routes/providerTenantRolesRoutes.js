const express = require('express');
const router = express.Router();
const providerTenantRolesController = require('../controllers/providerTenantRolesController');
const providerAuthMiddleware = require('../middleware/providerAuthMiddleware');
const requireProviderPermission = require('../middleware/providerPermissionMiddleware');

router.use(providerAuthMiddleware);

// Routes for tenant roles
router.get('/:tenantId/roles', requireProviderPermission('tenants.read'), providerTenantRolesController.listTenantRoles);
router.put('/:tenantId/roles/:roleId', requireProviderPermission('tenants.update'), providerTenantRolesController.updateTenantRolePermissions);

module.exports = router;
