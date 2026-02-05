// Role Routes - CRUD for roles
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication and admin permission
router.use(authMiddleware);
router.post('/', requirePermission('roles.create'), roleController.createRole);
router.get('/', requirePermission('roles.read'), roleController.getAllRoles);
router.get('/:id', requirePermission('roles.read'), roleController.getRoleById);
router.put('/:id', requirePermission('roles.update'), roleController.updateRole);
router.delete('/:id', requirePermission('roles.delete'), roleController.deleteRole);

module.exports = router;
