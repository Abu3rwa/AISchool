// Grade Controller - handles grade CRUD operations
const gradeService = require('../services/gradeService');

/**
 * @desc Get all grades
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllGrades = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const grades = await gradeService.getAllGrades(req.user.tenantId);
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single grade by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getGradeById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const grade = await gradeService.getGradeById(req.params.id, req.user.tenantId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createGrade = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const gradeData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newGrade = await gradeService.createGrade(gradeData);
    res.status(201).json(newGrade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a grade by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateGrade = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedGrade = await gradeService.updateGrade(req.params.id, req.body, req.user.tenantId);
    if (!updatedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.status(200).json(updatedGrade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a grade by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteGrade = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedGrade = await gradeService.deleteGrade(req.params.id, req.user.tenantId);
    if (!deletedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.status(200).json({ message: 'Grade soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
