const express = require('express');
const router = express.Router();
const providerTenantController = require('../controllers/providerTenantController');
const providerAuthMiddleware = require('../middleware/providerAuthMiddleware');
const requireProviderPermission = require('../middleware/providerPermissionMiddleware');

router.use(providerAuthMiddleware);

router.post('/', requireProviderPermission('tenants.create'), providerTenantController.createTenantWithAdmin);
router.get('/', requireProviderPermission('tenants.read'), providerTenantController.getMyProviderTenants);
router.get('/:id', requireProviderPermission('tenants.read'), providerTenantController.getTenantById);
router.put('/:id', requireProviderPermission('tenants.update'), providerTenantController.updateTenant);
router.put('/:id/status', requireProviderPermission('tenants.update'), providerTenantController.updateTenantStatus);
router.delete('/:id', requireProviderPermission('tenants.delete'), providerTenantController.deleteTenant);

module.exports = router;
