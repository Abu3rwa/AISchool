// TermReport Service - business logic for term reports
const TermReport = require('../models/TermReport');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/**
 * @desc Get all term reports for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of term report objects
 */
exports.getAllTermReports = async (tenantId) => {
  return await TermReport.find({ tenantId, deleted: false })
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email')
    .sort({ year: -1, term: -1 });
};

/**
 * @desc Get single term report by ID
 * @param {string} id - Term Report ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Term report object
 */
exports.getTermReportById = async (id, tenantId) => {
  return await TermReport.findOne({ _id: id, tenantId, deleted: false })
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email');
};

/**
 * @desc Create a new term report
 * @param {Object} reportData - Data for the new term report, including tenantId
 * @returns {Object} - Newly created term report object
 */
exports.createTermReport = async (reportData) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: reportData.student, 
    tenantId: reportData.tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Validate generatedBy user belongs to tenant
  if (reportData.generatedBy) {
    const user = await User.findOne({ 
      _id: reportData.generatedBy, 
      tenantId: reportData.tenantId 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  // Validate all subjects in grades belong to tenant
  if (reportData.grades && reportData.grades.length > 0) {
    for (const gradeEntry of reportData.grades) {
      if (gradeEntry.subject) {
        const subject = await Subject.findOne({ 
          _id: gradeEntry.subject, 
          tenantId: reportData.tenantId, 
          deleted: false 
        });
        if (!subject) {
          throw new Error(`Subject ${gradeEntry.subject} not found or does not belong to tenant`);
        }
      }
    }
  }

  // Check for duplicate term report for same student/term/year
  const existingReport = await TermReport.findOne({
    student: reportData.student,
    term: reportData.term,
    year: reportData.year,
    tenantId: reportData.tenantId,
    deleted: false
  });
  if (existingReport) {
    throw new Error(`Term report already exists for this student in ${reportData.term} ${reportData.year}`);
  }

  const newReport = new TermReport(reportData);
  await newReport.save();

  return await TermReport.findById(newReport._id)
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email');
};

/**
 * @desc Update a term report by ID
 * @param {string} id - Term Report ID
 * @param {Object} updateData - Data to update the term report
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated term report object
 */
exports.updateTermReport = async (id, updateData, tenantId) => {
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

  // Validate subjects in grades if provided
  if (updateData.grades && updateData.grades.length > 0) {
    for (const gradeEntry of updateData.grades) {
      if (gradeEntry.subject) {
        const subject = await Subject.findOne({ 
          _id: gradeEntry.subject, 
          tenantId, 
          deleted: false 
        });
        if (!subject) {
          throw new Error(`Subject ${gradeEntry.subject} not found or does not belong to tenant`);
        }
      }
    }
  }

  return await TermReport.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email');
};

/**
 * @desc Soft delete a term report by ID
 * @param {string} id - Term Report ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted term report object
 */
exports.deleteTermReport = async (id, tenantId) => {
  return await TermReport.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get term reports by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of term report objects
 */
exports.getTermReportsByStudent = async (studentId, tenantId) => {
  return await TermReport.find({ 
    student: studentId, 
    tenantId, 
    deleted: false 
  })
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email')
    .sort({ year: -1, term: -1 });
};

/**
 * @desc Get term reports by term and year
 * @param {string} term - Term name
 * @param {number} year - Year
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of term report objects
 */
exports.getTermReportsByTermYear = async (term, year, tenantId) => {
  return await TermReport.find({ 
    term, 
    year, 
    tenantId, 
    deleted: false 
  })
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Generate term report from existing grades
 * @param {string} studentId - Student ID
 * @param {string} term - Term name
 * @param {number} year - Year
 * @param {string} generatedBy - User ID who generated the report
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Generated term report object
 */
exports.generateTermReport = async (studentId, term, year, generatedBy, tenantId) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: studentId, 
    tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Check for existing report
  const existingReport = await TermReport.findOne({
    student: studentId,
    term,
    year,
    tenantId,
    deleted: false
  });
  if (existingReport) {
    throw new Error(`Term report already exists for this student in ${term} ${year}`);
  }

  // Get student's enrollments
  const enrollments = await Enrollment.find({ 
    student: studentId, 
    tenantId, 
    deleted: false 
  });
  const enrollmentIds = enrollments.map(e => e._id);

  // Get all grades for this student
  const grades = await Grade.find({ 
    enrollment: { $in: enrollmentIds }, 
    tenantId, 
    deleted: false 
  }).populate('subject');

  // Aggregate grades by subject (get latest grade per subject)
  const subjectGrades = {};
  for (const grade of grades) {
    const subjectId = grade.subject._id.toString();
    if (!subjectGrades[subjectId] || new Date(grade.date) > new Date(subjectGrades[subjectId].date)) {
      subjectGrades[subjectId] = {
        subject: grade.subject._id,
        grade: grade.grade,
        comments: grade.comments || ''
      };
    }
  }

  const gradesArray = Object.values(subjectGrades);

  // Create the term report
  const reportData = {
    tenantId,
    student: studentId,
    term,
    year,
    grades: gradesArray,
    generatedBy,
    overallComments: ''
  };

  const newReport = new TermReport(reportData);
  await newReport.save();

  return await TermReport.findById(newReport._id)
    .populate('student')
    .populate('grades.subject')
    .populate('generatedBy', 'name email');
};
