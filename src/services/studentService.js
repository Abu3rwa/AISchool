// Student Service - business logic for students
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * @desc Get all students for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of student objects
 */
exports.getAllStudents = async (tenantId) => {
  return await Student.find({ tenantId, deleted: false })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get single student by ID
 * @param {string} id - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Student object
 */
exports.getStudentById = async (id, tenantId) => {
  return await Student.findOne({ _id: id, tenantId, deleted: false })
    .populate('userId', 'firstName lastName email');
};

/**
 * @desc Create a new student
 * @param {Object} studentData - Data for the new student, including tenantId
 * @returns {Object} - Newly created student object
 */
exports.createStudent = async (studentData) => {
  // Validate userId exists and belongs to tenant
  if (studentData.userId) {
    const user = await User.findOne({ 
      _id: studentData.userId, 
      tenantId: studentData.tenantId, 
      deleted: false 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  // Validate studentId uniqueness within tenant
  const existingStudent = await Student.findOne({ 
    tenantId: studentData.tenantId, 
    studentId: studentData.studentId, 
    deleted: false 
  });
  if (existingStudent) {
    throw new Error('Student ID already exists in this tenant');
  }

  // Validate dateOfBirth
  if (studentData.dateOfBirth && new Date(studentData.dateOfBirth) > new Date()) {
    throw new Error('Date of birth cannot be in the future');
  }

  const newStudent = new Student(studentData);
  return await newStudent.save();
};

/**
 * @desc Update a student by ID
 * @param {string} id - Student ID
 * @param {Object} updateData - Data to update the student
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated student object
 */
exports.updateStudent = async (id, updateData, tenantId) => {
  // If studentId is being updated, check uniqueness
  if (updateData.studentId) {
    const existingStudent = await Student.findOne({ 
      tenantId, 
      studentId: updateData.studentId, 
      _id: { $ne: id },
      deleted: false 
    });
    if (existingStudent) {
      throw new Error('Student ID already exists in this tenant');
    }
  }

  // Validate dateOfBirth if provided
  if (updateData.dateOfBirth && new Date(updateData.dateOfBirth) > new Date()) {
    throw new Error('Date of birth cannot be in the future');
  }

  return await Student.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'firstName lastName email');
};

/**
 * @desc Soft delete a student by ID
 * @param {string} id - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted student object
 */
exports.deleteStudent = async (id, tenantId) => {
  return await Student.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get students by user ID
 * @param {string} userId - User ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Student object
 */
exports.getStudentByUserId = async (userId, tenantId) => {
  return await Student.findOne({ userId, tenantId, deleted: false })
    .populate('userId', 'firstName lastName email');
};
