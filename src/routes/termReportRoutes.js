// TermReport Routes - CRUD for term reports
const express = require('express');
const router = express.Router();
const termReportController = require('../controllers/termReportController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('term-reports.create'), termReportController.createTermReport);
router.post('/generate', requirePermission('term-reports.create'), termReportController.generateTermReport);
router.get('/', requirePermission('term-reports.read'), termReportController.getAllTermReports);
router.get('/by-term-year', requirePermission('term-reports.read'), termReportController.getTermReportsByTermYear);
router.get('/student/:studentId', requirePermission('term-reports.read'), termReportController.getTermReportsByStudent);
router.get('/:id', requirePermission('term-reports.read'), termReportController.getTermReportById);
router.put('/:id', requirePermission('term-reports.update'), termReportController.updateTermReport);
router.delete('/:id', requirePermission('term-reports.delete'), termReportController.deleteTermReport);

module.exports = router;
