// Payment Routes - CRUD for payments
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/by-date-range', paymentController.getPaymentsByDateRange);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
