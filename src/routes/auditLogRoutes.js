// AuditLog Routes - CRUD for audit logs
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

router.post('/', auditLogController.createAuditLog);
router.get('/', auditLogController.getAllAuditLogs);
router.get('/:id', auditLogController.getAuditLogById);
router.put('/:id', auditLogController.updateAuditLog);
router.delete('/:id', auditLogController.deleteAuditLog);

module.exports = router;
