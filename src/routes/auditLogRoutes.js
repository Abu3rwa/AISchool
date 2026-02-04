// AuditLog Routes - CRUD for audit logs
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('users.update'), auditLogController.createAuditLog);
router.get('/', requirePermission('audit.read'), auditLogController.getAllAuditLogs);
router.get('/by-entity', requirePermission('audit.read'), auditLogController.getAuditLogsByEntity);
router.get('/by-date-range', requirePermission('audit.read'), auditLogController.getAuditLogsByDateRange);
router.get('/user/:userId', requirePermission('audit.read'), auditLogController.getAuditLogsByUser);
router.get('/:id', requirePermission('audit.read'), auditLogController.getAuditLogById);
router.put('/:id', requirePermission('users.update'), auditLogController.updateAuditLog);
router.delete('/:id', requirePermission('users.update'), auditLogController.deleteAuditLog);

module.exports = router;
