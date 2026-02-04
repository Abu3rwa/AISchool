// Provider Routes - CRUD for SaaS providers
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

// POST /api/providers - create provider
router.post('/', providerController.createProvider);
// GET /api/providers - list providers
router.get('/', providerController.getAllProviders);
// GET /api/providers/:id - get provider by id
router.get('/:id', providerController.getProviderById);
// PUT /api/providers/:id - update provider
router.put('/:id', providerController.updateProvider);
// DELETE /api/providers/:id - delete provider
router.delete('/:id', providerController.deleteProvider);

module.exports = router;
