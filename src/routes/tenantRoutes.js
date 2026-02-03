const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

/**
 * @route GET /api/tenants
 * @desc Get all tenants
 * @access Public (or Admin only later)
 */
router.get('/', tenantController.getAllTenants);

/**
 * @route GET /api/tenants/:id
 * @desc Get single tenant by ID
 * @access Public (or Admin only later)
 */
router.get('/:id', tenantController.getTenantById);

/**
 * @route POST /api/tenants
 * @desc Create a new tenant
 * @access Public (or Admin only later)
 */
router.post('/', tenantController.createTenant);

/**
 * @route PUT /api/tenants/:id
 * @desc Update a tenant by ID
 * @access Public (or Admin only later)
 */
router.put('/:id', tenantController.updateTenant);

/**
 * @route DELETE /api/tenants/:id
 * @desc Soft delete a tenant by ID
 * @access Public (or Admin only later)
 */
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
