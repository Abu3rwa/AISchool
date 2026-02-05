// Provider Routes - CRUD for SaaS providers
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /api/providers - create provider
router.post('/', requirePermission('providers.create'), providerController.createProvider);
// GET /api/providers - list providers
router.get('/', requirePermission('providers.read'), providerController.getAllProviders);
// GET /api/providers/:id - get provider by id
router.get('/:id', requirePermission('providers.read'), providerController.getProviderById);
// PUT /api/providers/:id - update provider
router.put('/:id', requirePermission('providers.update'), providerController.updateProvider);
// DELETE /api/providers/:id - delete provider
router.delete('/:id', requirePermission('providers.delete'), providerController.deleteProvider);

module.exports = router;
