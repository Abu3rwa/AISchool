// Schedule Service - business logic for schedules
const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

/**
 * @desc Get all schedules for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of schedule objects
 */
exports.getAllSchedules = async (tenantId) => {
  return await Schedule.find({ tenantId, deleted: false })
    .populate('class')
    .populate('subject')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

/**
 * @desc Get single schedule by ID
 * @param {string} id - Schedule ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Schedule object
 */
exports.getScheduleById = async (id, tenantId) => {
  return await Schedule.findOne({ _id: id, tenantId, deleted: false })
    .populate('class')
    .populate('subject');
};

/**
 * @desc Create a new schedule
 * @param {Object} scheduleData - Data for the new schedule, including tenantId
 * @returns {Object} - Newly created schedule object
 */
exports.createSchedule = async (scheduleData) => {
  // Validate class belongs to tenant
  const classObj = await Class.findOne({ 
    _id: scheduleData.class, 
    tenantId: scheduleData.tenantId, 
    deleted: false 
  });
  if (!classObj) {
    throw new Error('Class not found or does not belong to tenant');
  }

  // Validate subject belongs to tenant
  const subject = await Subject.findOne({ 
    _id: scheduleData.subject, 
    tenantId: scheduleData.tenantId, 
    deleted: false 
  });
  if (!subject) {
    throw new Error('Subject not found or does not belong to tenant');
  }

  // Check for schedule conflicts (same class, same day, overlapping times)
  const conflictingSchedule = await Schedule.findOne({
    tenantId: scheduleData.tenantId,
    class: scheduleData.class,
    dayOfWeek: scheduleData.dayOfWeek,
    deleted: false,
    $or: [
      {
        startTime: { $lte: scheduleData.startTime },
        endTime: { $gt: scheduleData.startTime }
      },
      {
        startTime: { $lt: scheduleData.endTime },
        endTime: { $gte: scheduleData.endTime }
      },
      {
        startTime: { $gte: scheduleData.startTime },
        endTime: { $lte: scheduleData.endTime }
      }
    ]
  });

  if (conflictingSchedule) {
    throw new Error('Schedule conflict: Another class is scheduled at this time');
  }

  const newSchedule = new Schedule(scheduleData);
  return await newSchedule.save();
};

/**
 * @desc Update a schedule by ID
 * @param {string} id - Schedule ID
 * @param {Object} updateData - Data to update the schedule
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated schedule object
 */
exports.updateSchedule = async (id, updateData, tenantId) => {
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

  // Check for conflicts if time-related fields are being updated
  if (updateData.dayOfWeek || updateData.startTime || updateData.endTime) {
    const schedule = await Schedule.findById(id);
    const classId = updateData.class || schedule.class;
    const dayOfWeek = updateData.dayOfWeek || schedule.dayOfWeek;
    const startTime = updateData.startTime || schedule.startTime;
    const endTime = updateData.endTime || schedule.endTime;

    const conflictingSchedule = await Schedule.findOne({
      tenantId,
      class: classId,
      dayOfWeek: dayOfWeek,
      _id: { $ne: id },
      deleted: false,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });

    if (conflictingSchedule) {
      throw new Error('Schedule conflict: Another class is scheduled at this time');
    }
  }

  return await Schedule.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('class').populate('subject');
};

/**
 * @desc Soft delete a schedule by ID
 * @param {string} id - Schedule ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted schedule object
 */
exports.deleteSchedule = async (id, tenantId) => {
  return await Schedule.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get schedules by class
 * @param {string} classId - Class ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of schedule objects
 */
exports.getSchedulesByClass = async (classId, tenantId) => {
  return await Schedule.find({ class: classId, tenantId, deleted: false })
    .populate('class')
    .populate('subject')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

/**
 * @desc Get schedules by day
 * @param {string} dayOfWeek - Day of week
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of schedule objects
 */
exports.getSchedulesByDay = async (dayOfWeek, tenantId) => {
  return await Schedule.find({ dayOfWeek, tenantId, deleted: false })
    .populate('class')
    .populate('subject')
    .sort({ startTime: 1 });
};

/**
 * @desc Get schedules by teacher (via subject)
 * @param {string} teacherId - Teacher user ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of schedule objects
 */
exports.getSchedulesByTeacher = async (teacherId, tenantId) => {
  // Get subjects taught by this teacher
  const subjects = await Subject.find({ teacher: teacherId, tenantId, deleted: false });
  const subjectIds = subjects.map(s => s._id);

  return await Schedule.find({ 
    subject: { $in: subjectIds }, 
    tenantId, 
    deleted: false 
  })
    .populate('class')
    .populate('subject')
    .sort({ dayOfWeek: 1, startTime: 1 });
};
