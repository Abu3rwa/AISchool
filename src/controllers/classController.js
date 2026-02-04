// Class Controller - handles class CRUD operations
const classService = require('../services/classService');

/**
 * @desc Get all classes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllClasses = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const classes = await classService.getAllClasses(req.user.tenantId);
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single class by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClassById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const classObj = await classService.getClassById(req.params.id, req.user.tenantId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json(classObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createClass = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const classData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newClass = await classService.createClass(classData);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a class by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateClass = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedClass = await classService.updateClass(req.params.id, req.body, req.user.tenantId);
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a class by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteClass = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedClass = await classService.deleteClass(req.params.id, req.user.tenantId);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ message: 'Class soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
