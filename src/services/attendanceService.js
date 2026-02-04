// Attendance Service - business logic for attendance
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');

/**
 * @desc Get all attendance records for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of attendance objects
 */
exports.getAllAttendances = async (tenantId) => {
  return await Attendance.find({ tenantId, deleted: false })
    .populate('enrollment')
    .sort({ date: -1 });
};

/**
 * @desc Get single attendance by ID
 * @param {string} id - Attendance ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Attendance object
 */
exports.getAttendanceById = async (id, tenantId) => {
  return await Attendance.findOne({ _id: id, tenantId, deleted: false })
    .populate('enrollment');
};

/**
 * @desc Create a new attendance record
 * @param {Object} attendanceData - Data for the new attendance, including tenantId
 * @returns {Object} - Newly created attendance object
 */
exports.createAttendance = async (attendanceData) => {
  // Validate enrollment belongs to tenant
  const enrollment = await Enrollment.findOne({ 
    _id: attendanceData.enrollment, 
    tenantId: attendanceData.tenantId, 
    deleted: false 
  });
  if (!enrollment) {
    throw new Error('Enrollment not found or does not belong to tenant');
  }

  // Prevent duplicate attendance records (enrollment + date)
  const existingAttendance = await Attendance.findOne({ 
    enrollment: attendanceData.enrollment,
    date: attendanceData.date,
    deleted: false 
  });
  if (existingAttendance) {
    throw new Error('Attendance record already exists for this enrollment and date');
  }

  const newAttendance = new Attendance(attendanceData);
  return await newAttendance.save();
};

/**
 * @desc Update an attendance record by ID
 * @param {string} id - Attendance ID
 * @param {Object} updateData - Data to update the attendance
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated attendance object
 */
exports.updateAttendance = async (id, updateData, tenantId) => {
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

  // Check for duplicate if enrollment or date is being updated
  if (updateData.enrollment || updateData.date) {
    const attendance = await Attendance.findById(id);
    const enrollmentId = updateData.enrollment || attendance.enrollment;
    const date = updateData.date || attendance.date;
    
    const existingAttendance = await Attendance.findOne({ 
      enrollment: enrollmentId,
      date: date,
      _id: { $ne: id },
      deleted: false 
    });
    if (existingAttendance) {
      throw new Error('Attendance record already exists for this enrollment and date');
    }
  }

  return await Attendance.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('enrollment');
};

/**
 * @desc Soft delete an attendance record by ID
 * @param {string} id - Attendance ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted attendance object
 */
exports.deleteAttendance = async (id, tenantId) => {
  return await Attendance.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get attendance by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of attendance objects
 */
exports.getAttendanceByStudent = async (studentId, tenantId) => {
  const enrollments = await Enrollment.find({ student: studentId, tenantId, deleted: false });
  const enrollmentIds = enrollments.map(e => e._id);

  return await Attendance.find({ 
    enrollment: { $in: enrollmentIds }, 
    tenantId, 
    deleted: false 
  })
    .populate('enrollment')
    .sort({ date: -1 });
};

/**
 * @desc Get attendance by class
 * @param {string} classId - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of attendance objects
 */
exports.getAttendanceByClass = async (classId, tenantId) => {
  const enrollments = await Enrollment.find({ class: classId, tenantId, deleted: false });
  const enrollmentIds = enrollments.map(e => e._id);

  return await Attendance.find({ 
    enrollment: { $in: enrollmentIds }, 
    tenantId, 
    deleted: false 
  })
    .populate('enrollment')
    .sort({ date: -1 });
};

/**
 * @desc Bulk create attendance records
 * @param {Array} attendancesData - Array of attendance data objects
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Object with created attendances and errors
 */
exports.bulkCreateAttendances = async (attendancesData, tenantId) => {
  const createdAttendances = [];
  const errors = [];

  for (const attendanceData of attendancesData) {
    try {
      attendanceData.tenantId = tenantId;
      const attendance = await exports.createAttendance(attendanceData);
      createdAttendances.push(attendance);
    } catch (error) {
      errors.push({ data: attendanceData, error: error.message });
    }
  }

  if (errors.length > 0) {
    return { attendances: createdAttendances, errors };
  }

  return { attendances: createdAttendances };
};

/**
 * @desc Calculate attendance statistics for a student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Attendance statistics
 */
exports.calculateAttendanceStats = async (studentId, tenantId) => {
  const attendances = await exports.getAttendanceByStudent(studentId, tenantId);
  
  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'present').length;
  const absent = attendances.filter(a => a.status === 'absent').length;
  const late = attendances.filter(a => a.status === 'late').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

  return {
    total,
    present,
    absent,
    late,
    percentage: parseFloat(percentage)
  };
};
