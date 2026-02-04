// Fee Controller - handles fee CRUD operations
const feeService = require('../services/feeService');

/**
 * @desc Get all fees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllFees = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const fees = await feeService.getAllFees(req.user.tenantId);
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single fee by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFeeById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const fee = await feeService.getFeeById(req.params.id, req.user.tenantId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new fee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createFee = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const feeData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newFee = await feeService.createFee(feeData);
    res.status(201).json(newFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a fee by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateFee = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedFee = await feeService.updateFee(req.params.id, req.body, req.user.tenantId);
    if (!updatedFee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(200).json(updatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a fee by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteFee = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedFee = await feeService.deleteFee(req.params.id, req.user.tenantId);
    if (!deletedFee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(200).json({ message: 'Fee soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
