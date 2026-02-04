// Enrollment Controller - handles enrollment CRUD operations
const enrollmentService = require('../services/enrollmentService');

/**
 * @desc Get all enrollments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const enrollments = await enrollmentService.getAllEnrollments(req.user.tenantId);
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single enrollment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEnrollmentById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id, req.user.tenantId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new enrollment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createEnrollment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const enrollmentData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newEnrollment = await enrollmentService.createEnrollment(enrollmentData);
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update an enrollment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateEnrollment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedEnrollment = await enrollmentService.updateEnrollment(req.params.id, req.body, req.user.tenantId);
    if (!updatedEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json(updatedEnrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete an enrollment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteEnrollment = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedEnrollment = await enrollmentService.deleteEnrollment(req.params.id, req.user.tenantId);
    if (!deletedEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(200).json({ message: 'Enrollment soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
