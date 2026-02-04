// Fee Routes - CRUD for fees
const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('fees.create'), feeController.createFee);
router.get('/', requirePermission('fees.read'), feeController.getAllFees);
router.get('/:id', requirePermission('fees.read'), feeController.getFeeById);
router.put('/:id', requirePermission('fees.update'), feeController.updateFee);
router.delete('/:id', requirePermission('fees.delete'), feeController.deleteFee);

module.exports = router;
