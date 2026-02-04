// Schedule Controller - handles schedule CRUD operations
const scheduleService = require('../services/scheduleService');

/**
 * @desc Get all schedules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllSchedules = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const schedules = await scheduleService.getAllSchedules(req.user.tenantId);
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single schedule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScheduleById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const schedule = await scheduleService.getScheduleById(req.params.id, req.user.tenantId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createSchedule = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const scheduleData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newSchedule = await scheduleService.createSchedule(scheduleData);
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a schedule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateSchedule = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedSchedule = await scheduleService.updateSchedule(req.params.id, req.body, req.user.tenantId);
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a schedule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteSchedule = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedSchedule = await scheduleService.deleteSchedule(req.params.id, req.user.tenantId);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
