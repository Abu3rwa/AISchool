// AIReportRequest Routes - CRUD for AI report requests
const express = require('express');
const router = express.Router();
const aiReportRequestController = require('../controllers/aiReportRequestController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', aiReportRequestController.createAIReportRequest);
router.get('/', aiReportRequestController.getAllAIReportRequests);
router.get('/pending', aiReportRequestController.getPendingRequests);
router.get('/by-status', aiReportRequestController.getAIReportRequestsByStatus);
router.get('/student/:studentId', aiReportRequestController.getAIReportRequestsByStudent);
router.get('/:id', aiReportRequestController.getAIReportRequestById);
router.put('/:id', aiReportRequestController.updateAIReportRequest);
router.put('/:id/status', aiReportRequestController.updateStatus);
router.delete('/:id', aiReportRequestController.deleteAIReportRequest);

module.exports = router;
