// AIReportRequest Service - business logic for AI report requests
const AIReportRequest = require('../models/AIReportRequest');
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * @desc Get all AI report requests for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of AI report request objects
 */
exports.getAllAIReportRequests = async (tenantId) => {
  return await AIReportRequest.find({ tenantId, deleted: false })
    .populate('requestedBy', 'name email')
    .populate('student')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get single AI report request by ID
 * @param {string} id - AI Report Request ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - AI report request object
 */
exports.getAIReportRequestById = async (id, tenantId) => {
  return await AIReportRequest.findOne({ _id: id, tenantId, deleted: false })
    .populate('requestedBy', 'name email')
    .populate('student');
};

/**
 * @desc Create a new AI report request
 * @param {Object} requestData - Data for the new AI report request, including tenantId
 * @returns {Object} - Newly created AI report request object
 */
exports.createAIReportRequest = async (requestData) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: requestData.student, 
    tenantId: requestData.tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Validate requestedBy user belongs to tenant
  if (requestData.requestedBy) {
    const user = await User.findOne({ 
      _id: requestData.requestedBy, 
      tenantId: requestData.tenantId 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  // Validate report type
  const validReportTypes = ['performance_summary', 'behavioral_analysis'];
  if (!validReportTypes.includes(requestData.reportType)) {
    throw new Error(`Invalid report type. Must be one of: ${validReportTypes.join(', ')}`);
  }

  // Set initial status
  requestData.status = 'pending';

  const newRequest = new AIReportRequest(requestData);
  await newRequest.save();

  return await AIReportRequest.findById(newRequest._id)
    .populate('requestedBy', 'name email')
    .populate('student');
};

/**
 * @desc Update an AI report request by ID
 * @param {string} id - AI Report Request ID
 * @param {Object} updateData - Data to update the AI report request
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated AI report request object
 */
exports.updateAIReportRequest = async (id, updateData, tenantId) => {
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

  // Validate status transition
  if (updateData.status) {
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(updateData.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return await AIReportRequest.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('requestedBy', 'name email')
    .populate('student');
};

/**
 * @desc Soft delete an AI report request by ID
 * @param {string} id - AI Report Request ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted AI report request object
 */
exports.deleteAIReportRequest = async (id, tenantId) => {
  return await AIReportRequest.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get AI report requests by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of AI report request objects
 */
exports.getAIReportRequestsByStudent = async (studentId, tenantId) => {
  return await AIReportRequest.find({ 
    student: studentId, 
    tenantId, 
    deleted: false 
  })
    .populate('requestedBy', 'name email')
    .populate('student')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get AI report requests by status
 * @param {string} status - Status to filter by
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of AI report request objects
 */
exports.getAIReportRequestsByStatus = async (status, tenantId) => {
  return await AIReportRequest.find({ 
    status, 
    tenantId, 
    deleted: false 
  })
    .populate('requestedBy', 'name email')
    .populate('student')
    .sort({ createdAt: -1 });
};

/**
 * @desc Update AI report request status
 * @param {string} id - AI Report Request ID
 * @param {string} status - New status
 * @param {string} generatedReport - Generated report content (optional)
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated AI report request object
 */
exports.updateStatus = async (id, status, generatedReport, tenantId) => {
  const validStatuses = ['pending', 'processing', 'completed', 'failed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updateData = { status };
  if (generatedReport !== undefined) {
    updateData.generatedReport = generatedReport;
  }

  return await AIReportRequest.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('requestedBy', 'name email')
    .populate('student');
};

/**
 * @desc Get pending AI report requests for processing
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of pending AI report request objects
 */
exports.getPendingRequests = async (tenantId) => {
  return await AIReportRequest.find({ 
    status: 'pending', 
    tenantId, 
    deleted: false 
  })
    .populate('requestedBy', 'name email')
    .populate('student')
    .sort({ createdAt: 1 });
};
