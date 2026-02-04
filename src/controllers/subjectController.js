// Subject Controller - handles subject CRUD operations
const subjectService = require('../services/subjectService');

/**
 * @desc Get all subjects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllSubjects = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const subjects = await subjectService.getAllSubjects(req.user.tenantId);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single subject by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSubjectById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const subject = await subjectService.getSubjectById(req.params.id, req.user.tenantId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new subject
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createSubject = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const subjectData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newSubject = await subjectService.createSubject(subjectData);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a subject by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateSubject = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedSubject = await subjectService.updateSubject(req.params.id, req.body, req.user.tenantId);
    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a subject by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteSubject = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedSubject = await subjectService.deleteSubject(req.params.id, req.user.tenantId);
    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ message: 'Subject soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
