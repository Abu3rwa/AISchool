const express = require('express');
const router = express.Router();
const providerTenantMetricsController = require('../controllers/providerTenantMetricsController');
const providerAuthMiddleware = require('../middleware/providerAuthMiddleware');
const requireProviderPermission = require('../middleware/providerPermissionMiddleware');

router.use(providerAuthMiddleware);

// Routes for tenant metrics
router.get('/:tenantId/metrics', requireProviderPermission('tenants.read'), providerTenantMetricsController.getTenantMetrics);

module.exports = router;
