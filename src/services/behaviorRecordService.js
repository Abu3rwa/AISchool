// BehaviorRecord Service - business logic for behavior records
const BehaviorRecord = require('../models/BehaviorRecord');
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * @desc Get all behavior records for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of behavior record objects
 */
exports.getAllBehaviorRecords = async (tenantId) => {
  return await BehaviorRecord.find({ tenantId, deleted: false })
    .populate('student')
    .populate('reportedBy', 'name email')
    .sort({ incidentDate: -1 });
};

/**
 * @desc Get single behavior record by ID
 * @param {string} id - Behavior Record ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Behavior record object
 */
exports.getBehaviorRecordById = async (id, tenantId) => {
  return await BehaviorRecord.findOne({ _id: id, tenantId, deleted: false })
    .populate('student')
    .populate('reportedBy', 'name email');
};

/**
 * @desc Create a new behavior record
 * @param {Object} recordData - Data for the new behavior record, including tenantId
 * @returns {Object} - Newly created behavior record object
 */
exports.createBehaviorRecord = async (recordData) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: recordData.student, 
    tenantId: recordData.tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Validate reportedBy user belongs to tenant
  if (recordData.reportedBy) {
    const user = await User.findOne({ 
      _id: recordData.reportedBy, 
      tenantId: recordData.tenantId 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  // Set incident date if not provided
  if (!recordData.incidentDate) {
    recordData.incidentDate = new Date();
  }

  const newRecord = new BehaviorRecord(recordData);
  await newRecord.save();

  return await BehaviorRecord.findById(newRecord._id)
    .populate('student')
    .populate('reportedBy', 'name email');
};

/**
 * @desc Update a behavior record by ID
 * @param {string} id - Behavior Record ID
 * @param {Object} updateData - Data to update the behavior record
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated behavior record object
 */
exports.updateBehaviorRecord = async (id, updateData, tenantId) => {
  // Validate student if provided
  if (updateData.student) {
    const student = await Student.findOne({ 
      _id: updateData.student, 
      tenantId, 
      deleted: false 
    });
    if (!student) {
      throw new Error('Student not found or does not belong to tenant');
    }
  }

  return await BehaviorRecord.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('student')
    .populate('reportedBy', 'name email');
};

/**
 * @desc Soft delete a behavior record by ID
 * @param {string} id - Behavior Record ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted behavior record object
 */
exports.deleteBehaviorRecord = async (id, tenantId) => {
  return await BehaviorRecord.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get behavior records by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of behavior record objects
 */
exports.getBehaviorRecordsByStudentId = async (studentId, tenantId) => {
  return await BehaviorRecord.find({ 
    student: studentId, 
    tenantId, 
    deleted: false 
  })
    .populate('student')
    .populate('reportedBy', 'name email')
    .sort({ incidentDate: -1 });
};

/**
 * @desc Get behavior records by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of behavior record objects
 */
exports.getBehaviorRecordsByDateRange = async (startDate, endDate, tenantId) => {
  return await BehaviorRecord.find({ 
    incidentDate: { $gte: startDate, $lte: endDate },
    tenantId, 
    deleted: false 
  })
    .populate('student')
    .populate('reportedBy', 'name email')
    .sort({ incidentDate: -1 });
};