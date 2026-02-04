// Subject Service - business logic for subjects
const Subject = require('../models/Subject');
const User = require('../models/User');

/**
 * @desc Get all subjects for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of subject objects
 */
exports.getAllSubjects = async (tenantId) => {
  return await Subject.find({ tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email')
    .sort({ name: 1 });
};

/**
 * @desc Get single subject by ID
 * @param {string} id - Subject ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Subject object
 */
exports.getSubjectById = async (id, tenantId) => {
  return await Subject.findOne({ _id: id, tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email');
};

/**
 * @desc Create a new subject
 * @param {Object} subjectData - Data for the new subject, including tenantId
 * @returns {Object} - Newly created subject object
 */
exports.createSubject = async (subjectData) => {
  // Validate teacher belongs to tenant if provided
  if (subjectData.teacher) {
    const teacher = await User.findOne({ 
      _id: subjectData.teacher, 
      tenantId: subjectData.tenantId, 
      deleted: false 
    });
    if (!teacher) {
      throw new Error('Teacher not found or does not belong to tenant');
    }
  }

  // Validate subject code uniqueness within tenant
  const existingSubject = await Subject.findOne({ 
    tenantId: subjectData.tenantId, 
    code: subjectData.code, 
    deleted: false 
  });
  if (existingSubject) {
    throw new Error('Subject code already exists in this tenant');
  }

  const newSubject = new Subject(subjectData);
  return await newSubject.save();
};

/**
 * @desc Update a subject by ID
 * @param {string} id - Subject ID
 * @param {Object} updateData - Data to update the subject
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated subject object
 */
exports.updateSubject = async (id, updateData, tenantId) => {
  // If code is being updated, check uniqueness
  if (updateData.code) {
    const existingSubject = await Subject.findOne({ 
      tenantId, 
      code: updateData.code, 
      _id: { $ne: id },
      deleted: false 
    });
    if (existingSubject) {
      throw new Error('Subject code already exists in this tenant');
    }
  }

  // Validate teacher if provided
  if (updateData.teacher) {
    const teacher = await User.findOne({ 
      _id: updateData.teacher, 
      tenantId, 
      deleted: false 
    });
    if (!teacher) {
      throw new Error('Teacher not found or does not belong to tenant');
    }
  }

  return await Subject.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('teacher', 'firstName lastName email');
};

/**
 * @desc Soft delete a subject by ID
 * @param {string} id - Subject ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted subject object
 */
exports.deleteSubject = async (id, tenantId) => {
  return await Subject.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get subjects by teacher
 * @param {string} teacherId - Teacher user ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of subject objects
 */
exports.getSubjectsByTeacher = async (teacherId, tenantId) => {
  return await Subject.find({ teacher: teacherId, tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email')
    .sort({ name: 1 });
};
