// AIReportRequest Routes - CRUD for AI report requests
const express = require('express');
const router = express.Router();
const aiReportRequestController = require('../controllers/aiReportRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('ai-report-requests.create'), aiReportRequestController.createAIReportRequest);
router.get('/', requirePermission('ai-report-requests.read'), aiReportRequestController.getAllAIReportRequests);
router.get('/pending', requirePermission('ai-report-requests.read'), aiReportRequestController.getPendingRequests);
router.get('/by-status', requirePermission('ai-report-requests.read'), aiReportRequestController.getAIReportRequestsByStatus);
router.get('/student/:studentId', requirePermission('ai-report-requests.read'), aiReportRequestController.getAIReportRequestsByStudent);
router.get('/:id', requirePermission('ai-report-requests.read'), aiReportRequestController.getAIReportRequestById);
router.put('/:id', requirePermission('ai-report-requests.update'), aiReportRequestController.updateAIReportRequest);
router.put('/:id/status', requirePermission('ai-report-requests.update'), aiReportRequestController.updateStatus);
router.delete('/:id', requirePermission('ai-report-requests.delete'), aiReportRequestController.deleteAIReportRequest);

module.exports = router;
