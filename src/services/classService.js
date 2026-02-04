// Class Service - business logic for classes
const Class = require('../models/Class');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

/**
 * @desc Get all classes for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of class objects
 */
exports.getAllClasses = async (tenantId) => {
  return await Class.find({ tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email')
    .sort({ name: 1 });
};

/**
 * @desc Get single class by ID
 * @param {string} id - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Class object
 */
exports.getClassById = async (id, tenantId) => {
  return await Class.findOne({ _id: id, tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email');
};

/**
 * @desc Create a new class
 * @param {Object} classData - Data for the new class, including tenantId
 * @returns {Object} - Newly created class object
 */
exports.createClass = async (classData) => {
  // Validate teacher belongs to tenant if provided
  if (classData.teacher) {
    const teacher = await User.findOne({ 
      _id: classData.teacher, 
      tenantId: classData.tenantId, 
      deleted: false 
    });
    if (!teacher) {
      throw new Error('Teacher not found or does not belong to tenant');
    }
  }

  // Validate class name uniqueness within tenant
  const existingClass = await Class.findOne({ 
    tenantId: classData.tenantId, 
    name: classData.name, 
    deleted: false 
  });
  if (existingClass) {
    throw new Error('Class name already exists in this tenant');
  }

  const newClass = new Class(classData);
  return await newClass.save();
};

/**
 * @desc Update a class by ID
 * @param {string} id - Class ID
 * @param {Object} updateData - Data to update the class
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated class object
 */
exports.updateClass = async (id, updateData, tenantId) => {
  // If name is being updated, check uniqueness
  if (updateData.name) {
    const existingClass = await Class.findOne({ 
      tenantId, 
      name: updateData.name, 
      _id: { $ne: id },
      deleted: false 
    });
    if (existingClass) {
      throw new Error('Class name already exists in this tenant');
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

  return await Class.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('teacher', 'firstName lastName email');
};

/**
 * @desc Soft delete a class by ID
 * @param {string} id - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted class object
 */
exports.deleteClass = async (id, tenantId) => {
  return await Class.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get classes by teacher
 * @param {string} teacherId - Teacher user ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of class objects
 */
exports.getClassesByTeacher = async (teacherId, tenantId) => {
  return await Class.find({ teacher: teacherId, tenantId, deleted: false })
    .populate('teacher', 'firstName lastName email')
    .sort({ name: 1 });
};

/**
 * @desc Get students enrolled in a class
 * @param {string} classId - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of enrollment objects with student data
 */
exports.getStudentsInClass = async (classId, tenantId) => {
  return await Enrollment.find({ class: classId, tenantId, deleted: false })
    .populate('student')
    .populate('class')
    .sort({ enrollmentDate: -1 });
};
