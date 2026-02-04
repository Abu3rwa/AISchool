// Payment Controller - handles payment CRUD operations
const paymentService = require('../services/paymentService');

/**
 * @desc Get all payments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payments = await paymentService.getAllPayments(req.user.tenantId);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payment = await paymentService.getPaymentById(req.params.id, req.user.tenantId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPayment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const paymentData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newPayment = await paymentService.createPayment(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePayment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedPayment = await paymentService.updatePayment(req.params.id, req.body, req.user.tenantId);
    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePayment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedPayment = await paymentService.deletePayment(req.params.id, req.user.tenantId);
    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get payments by student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentsByStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payments = await paymentService.getPaymentsByStudent(req.params.studentId, req.user.tenantId);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get payments by date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentsByDateRange = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate query parameters are required' });
    }
    const payments = await paymentService.getPaymentsByDateRange(
      new Date(startDate), 
      new Date(endDate), 
      req.user.tenantId
    );
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
