// Payment Routes - CRUD for payments
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('payments.create'), paymentController.createPayment);
router.get('/', requirePermission('payments.read'), paymentController.getAllPayments);
router.get('/by-date-range', requirePermission('payments.read'), paymentController.getPaymentsByDateRange);
router.get('/student/:studentId', requirePermission('payments.read'), paymentController.getPaymentsByStudent);
router.get('/:id', requirePermission('payments.read'), paymentController.getPaymentById);
router.put('/:id', requirePermission('payments.update'), paymentController.updatePayment);
router.delete('/:id', requirePermission('payments.delete'), paymentController.deletePayment);

module.exports = router;
