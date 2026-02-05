const express = require('express');
const router = express.Router();
const providerTenantUsersController = require('../controllers/providerTenantUsersController');
const providerAuthMiddleware = require('../middleware/providerAuthMiddleware');
const requireProviderPermission = require('../middleware/providerPermissionMiddleware');

router.use(providerAuthMiddleware);

// Routes for tenant users
router.get('/:tenantId/users', requireProviderPermission('tenants.read'), providerTenantUsersController.listTenantUsers);
router.post('/:tenantId/users', requireProviderPermission('tenants.update'), providerTenantUsersController.createTenantUser);
router.patch('/:tenantId/users/:userId/status', requireProviderPermission('tenants.update'), providerTenantUsersController.setTenantUserStatus);

// Reset the school (tenant) primary admin password (returns temp password once)
router.post('/:tenantId/admin/reset-password', requireProviderPermission('tenants.update'), providerTenantUsersController.resetTenantAdminPassword);

module.exports = router;
