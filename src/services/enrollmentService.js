// Enrollment Service - business logic for enrollments
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');

/**
 * @desc Get all enrollments for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of enrollment objects
 */
exports.getAllEnrollments = async (tenantId) => {
  return await Enrollment.find({ tenantId, deleted: false })
    .populate('student')
    .populate('class')
    .sort({ enrollmentDate: -1 });
};

/**
 * @desc Get single enrollment by ID
 * @param {string} id - Enrollment ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Enrollment object
 */
exports.getEnrollmentById = async (id, tenantId) => {
  return await Enrollment.findOne({ _id: id, tenantId, deleted: false })
    .populate('student')
    .populate('class');
};

/**
 * @desc Create a new enrollment
 * @param {Object} enrollmentData - Data for the new enrollment, including tenantId
 * @returns {Object} - Newly created enrollment object
 */
exports.createEnrollment = async (enrollmentData) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: enrollmentData.student, 
    tenantId: enrollmentData.tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Validate class belongs to tenant
  const classObj = await Class.findOne({ 
    _id: enrollmentData.class, 
    tenantId: enrollmentData.tenantId, 
    deleted: false 
  });
  if (!classObj) {
    throw new Error('Class not found or does not belong to tenant');
  }

  // Prevent duplicate enrollments
  const existingEnrollment = await Enrollment.findOne({ 
    tenantId: enrollmentData.tenantId,
    student: enrollmentData.student,
    class: enrollmentData.class,
    deleted: false 
  });
  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this class');
  }

  // Set enrollment date if not provided
  if (!enrollmentData.enrollmentDate) {
    enrollmentData.enrollmentDate = new Date();
  }

  const newEnrollment = new Enrollment(enrollmentData);
  return await newEnrollment.save();
};

/**
 * @desc Update an enrollment by ID
 * @param {string} id - Enrollment ID
 * @param {Object} updateData - Data to update the enrollment
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated enrollment object
 */
exports.updateEnrollment = async (id, updateData, tenantId) => {
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

  // Validate class if provided
  if (updateData.class) {
    const classObj = await Class.findOne({ 
      _id: updateData.class, 
      tenantId, 
      deleted: false 
    });
    if (!classObj) {
      throw new Error('Class not found or does not belong to tenant');
    }
  }

  // Check for duplicate if student or class is being updated
  if (updateData.student || updateData.class) {
    const enrollment = await Enrollment.findById(id);
    const studentId = updateData.student || enrollment.student;
    const classId = updateData.class || enrollment.class;
    
    const existingEnrollment = await Enrollment.findOne({ 
      tenantId,
      student: studentId,
      class: classId,
      _id: { $ne: id },
      deleted: false 
    });
    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this class');
    }
  }

  return await Enrollment.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('student').populate('class');
};

/**
 * @desc Soft delete an enrollment by ID
 * @param {string} id - Enrollment ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted enrollment object
 */
exports.deleteEnrollment = async (id, tenantId) => {
  return await Enrollment.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get enrollments by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of enrollment objects
 */
exports.getEnrollmentsByStudent = async (studentId, tenantId) => {
  return await Enrollment.find({ student: studentId, tenantId, deleted: false })
    .populate('student')
    .populate('class')
    .sort({ enrollmentDate: -1 });
};

/**
 * @desc Get enrollments by class
 * @param {string} classId - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of enrollment objects
 */
exports.getEnrollmentsByClass = async (classId, tenantId) => {
  return await Enrollment.find({ class: classId, tenantId, deleted: false })
    .populate('student')
    .populate('class')
    .sort({ enrollmentDate: -1 });
};

/**
 * @desc Bulk create enrollments
 * @param {Array} enrollmentsData - Array of enrollment data objects
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of created enrollment objects
 */
exports.bulkCreateEnrollments = async (enrollmentsData, tenantId) => {
  const createdEnrollments = [];
  const errors = [];

  for (const enrollmentData of enrollmentsData) {
    try {
      enrollmentData.tenantId = tenantId;
      const enrollment = await exports.createEnrollment(enrollmentData);
      createdEnrollments.push(enrollment);
    } catch (error) {
      errors.push({ data: enrollmentData, error: error.message });
    }
  }

  if (errors.length > 0) {
    return { enrollments: createdEnrollments, errors };
  }

  return { enrollments: createdEnrollments };
};
