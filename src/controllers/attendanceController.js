// Attendance Controller - handles attendance CRUD operations
const attendanceService = require('../services/attendanceService');

/**
 * @desc Get all attendance records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllAttendances = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const attendances = await attendanceService.getAllAttendances(req.user.tenantId);
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single attendance by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAttendanceById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const attendance = await attendanceService.getAttendanceById(req.params.id, req.user.tenantId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const attendanceData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newAttendance = await attendanceService.createAttendance(attendanceData);
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update an attendance record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedAttendance = await attendanceService.updateAttendance(req.params.id, req.body, req.user.tenantId);
    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete an attendance record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedAttendance = await attendanceService.deleteAttendance(req.params.id, req.user.tenantId);
    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json({ message: 'Attendance soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
