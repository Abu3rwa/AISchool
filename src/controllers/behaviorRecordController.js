// BehaviorRecord Controller - handles behavior record CRUD operations
const behaviorRecordService = require('../services/behaviorRecordService');

/**
 * @desc Get all behavior records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBehaviorRecords = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const records = await behaviorRecordService.getAllBehaviorRecords(req.user.tenantId);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single behavior record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBehaviorRecordById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const record = await behaviorRecordService.getBehaviorRecordById(req.params.id, req.user.tenantId);
    if (!record) {
      return res.status(404).json({ message: 'Behavior record not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new behavior record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createBehaviorRecord = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const recordData = Object.assign({}, req.body, { 
      tenantId: req.user.tenantId,
      reportedBy: req.user.id
    });
    const newRecord = await behaviorRecordService.createBehaviorRecord(recordData);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a behavior record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBehaviorRecord = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedRecord = await behaviorRecordService.updateBehaviorRecord(req.params.id, req.body, req.user.tenantId);
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Behavior record not found' });
    }
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a behavior record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteBehaviorRecord = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedRecord = await behaviorRecordService.deleteBehaviorRecord(req.params.id, req.user.tenantId);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Behavior record not found' });
    }
    res.status(200).json({ message: 'Behavior record soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get behavior records by student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBehaviorRecordsByStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const records = await behaviorRecordService.getBehaviorRecordsByStudentId(req.params.studentId, req.user.tenantId);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get behavior records by date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBehaviorRecordsByDateRange = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate query parameters are required' });
    }
    const records = await behaviorRecordService.getBehaviorRecordsByDateRange(
      new Date(startDate), 
      new Date(endDate), 
      req.user.tenantId
    );
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
