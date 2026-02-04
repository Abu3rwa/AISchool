// BehaviorRecord Routes - CRUD for behavior records
const express = require('express');
const router = express.Router();
const behaviorRecordController = require('../controllers/behaviorRecordController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('behavior-records.create'), behaviorRecordController.createBehaviorRecord);
router.get('/', requirePermission('behavior-records.read'), behaviorRecordController.getAllBehaviorRecords);
router.get('/by-date-range', requirePermission('behavior-records.read'), behaviorRecordController.getBehaviorRecordsByDateRange);
router.get('/student/:studentId', requirePermission('behavior-records.read'), behaviorRecordController.getBehaviorRecordsByStudent);
router.get('/:id', requirePermission('behavior-records.read'), behaviorRecordController.getBehaviorRecordById);
router.put('/:id', requirePermission('behavior-records.update'), behaviorRecordController.updateBehaviorRecord);
router.delete('/:id', requirePermission('behavior-records.delete'), behaviorRecordController.deleteBehaviorRecord);

module.exports = router;
