// Grade Service - business logic for grades
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const Subject = require('../models/Subject');
const Student = require('../models/Student');

/**
 * @desc Get all grades for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of grade objects
 */
exports.getAllGrades = async (tenantId) => {
  return await Grade.find({ tenantId, deleted: false })
    .populate('enrollment')
    .populate('subject')
    .sort({ date: -1 });
};

/**
 * @desc Get single grade by ID
 * @param {string} id - Grade ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Grade object
 */
exports.getGradeById = async (id, tenantId) => {
  return await Grade.findOne({ _id: id, tenantId, deleted: false })
    .populate('enrollment')
    .populate('subject');
};

/**
 * @desc Create a new grade
 * @param {Object} gradeData - Data for the new grade, including tenantId
 * @returns {Object} - Newly created grade object
 */
exports.createGrade = async (gradeData) => {
  // Validate enrollment belongs to tenant
  const enrollment = await Enrollment.findOne({ 
    _id: gradeData.enrollment, 
    tenantId: gradeData.tenantId, 
    deleted: false 
  });
  if (!enrollment) {
    throw new Error('Enrollment not found or does not belong to tenant');
  }

  // Validate subject belongs to tenant
  const subject = await Subject.findOne({ 
    _id: gradeData.subject, 
    tenantId: gradeData.tenantId, 
    deleted: false 
  });
  if (!subject) {
    throw new Error('Subject not found or does not belong to tenant');
  }

  // Set date if not provided
  if (!gradeData.date) {
    gradeData.date = new Date();
  }

  const newGrade = new Grade(gradeData);
  return await newGrade.save();
};

/**
 * @desc Update a grade by ID
 * @param {string} id - Grade ID
 * @param {Object} updateData - Data to update the grade
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated grade object
 */
exports.updateGrade = async (id, updateData, tenantId) => {
  // Validate enrollment if provided
  if (updateData.enrollment) {
    const enrollment = await Enrollment.findOne({ 
      _id: updateData.enrollment, 
      tenantId, 
      deleted: false 
    });
    if (!enrollment) {
      throw new Error('Enrollment not found or does not belong to tenant');
    }
  }

  // Validate subject if provided
  if (updateData.subject) {
    const subject = await Subject.findOne({ 
      _id: updateData.subject, 
      tenantId, 
      deleted: false 
    });
    if (!subject) {
      throw new Error('Subject not found or does not belong to tenant');
    }
  }

  return await Grade.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('enrollment').populate('subject');
};

/**
 * @desc Soft delete a grade by ID
 * @param {string} id - Grade ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted grade object
 */
exports.deleteGrade = async (id, tenantId) => {
  return await Grade.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get grades by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of grade objects
 */
exports.getGradesByStudent = async (studentId, tenantId) => {
  // Get enrollments for the student
  const enrollments = await Enrollment.find({ student: studentId, tenantId, deleted: false });
  const enrollmentIds = enrollments.map(e => e._id);

  return await Grade.find({ 
    enrollment: { $in: enrollmentIds }, 
    tenantId, 
    deleted: false 
  })
    .populate('enrollment')
    .populate('subject')
    .sort({ date: -1 });
};

/**
 * @desc Get grades by subject
 * @param {string} subjectId - Subject ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of grade objects
 */
exports.getGradesBySubject = async (subjectId, tenantId) => {
  return await Grade.find({ subject: subjectId, tenantId, deleted: false })
    .populate('enrollment')
    .populate('subject')
    .sort({ date: -1 });
};

/**
 * @desc Get grades by enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of grade objects
 */
exports.getGradesByEnrollment = async (enrollmentId, tenantId) => {
  return await Grade.find({ enrollment: enrollmentId, tenantId, deleted: false })
    .populate('enrollment')
    .populate('subject')
    .sort({ date: -1 });
};

/**
 * @desc Calculate average grade for a student in a subject
 * @param {string} studentId - Student ID
 * @param {string} subjectId - Subject ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Average grade information
 */
exports.calculateAverageGrade = async (studentId, subjectId, tenantId) => {
  const grades = await exports.getGradesBySubject(subjectId, tenantId);
  
  // Filter grades for this student
  const enrollments = await Enrollment.find({ student: studentId, tenantId, deleted: false });
  const enrollmentIds = enrollments.map(e => e._id);
  const studentGrades = grades.filter(g => enrollmentIds.includes(g.enrollment._id));

  if (studentGrades.length === 0) {
    return { average: null, count: 0 };
  }

  // Convert letter grades to numbers for calculation (simplified)
  const gradeValues = studentGrades.map(g => {
    const grade = g.grade.toUpperCase();
    if (grade === 'A' || grade === 'A+') return 4.0;
    if (grade === 'A-') return 3.7;
    if (grade === 'B+') return 3.3;
    if (grade === 'B') return 3.0;
    if (grade === 'B-') return 2.7;
    if (grade === 'C+') return 2.3;
    if (grade === 'C') return 2.0;
    if (grade === 'C-') return 1.7;
    if (grade === 'D+') return 1.3;
    if (grade === 'D') return 1.0;
    if (grade === 'F') return 0.0;
    // Try to parse as number
    const num = parseFloat(grade);
    return isNaN(num) ? null : num;
  }).filter(v => v !== null);

  if (gradeValues.length === 0) {
    return { average: null, count: studentGrades.length };
  }

  const sum = gradeValues.reduce((a, b) => a + b, 0);
  const average = sum / gradeValues.length;

  return { average: average.toFixed(2), count: studentGrades.length };
};
