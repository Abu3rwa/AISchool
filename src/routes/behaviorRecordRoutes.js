// BehaviorRecord Routes - CRUD for behavior records
const express = require('express');
const router = express.Router();
const behaviorRecordController = require('../controllers/behaviorRecordController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', behaviorRecordController.createBehaviorRecord);
router.get('/', behaviorRecordController.getAllBehaviorRecords);
router.get('/by-date-range', behaviorRecordController.getBehaviorRecordsByDateRange);
router.get('/student/:studentId', behaviorRecordController.getBehaviorRecordsByStudent);
router.get('/:id', behaviorRecordController.getBehaviorRecordById);
router.put('/:id', behaviorRecordController.updateBehaviorRecord);
router.delete('/:id', behaviorRecordController.deleteBehaviorRecord);

module.exports = router;
