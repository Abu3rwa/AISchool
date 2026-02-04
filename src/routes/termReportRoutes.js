// TermReport Routes - CRUD for term reports
const express = require('express');
const router = express.Router();
const termReportController = require('../controllers/termReportController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', termReportController.createTermReport);
router.post('/generate', termReportController.generateTermReport);
router.get('/', termReportController.getAllTermReports);
router.get('/by-term-year', termReportController.getTermReportsByTermYear);
router.get('/student/:studentId', termReportController.getTermReportsByStudent);
router.get('/:id', termReportController.getTermReportById);
router.put('/:id', termReportController.updateTermReport);
router.delete('/:id', termReportController.deleteTermReport);

module.exports = router;
