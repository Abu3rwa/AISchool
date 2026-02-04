// Fee Service - business logic for fees
const Fee = require('../models/Fee');
const Student = require('../models/Student');

/**
 * @desc Get all fees for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of fee objects
 */
exports.getAllFees = async (tenantId) => {
  return await Fee.find({ tenantId, deleted: false })
    .populate('student')
    .sort({ dueDate: 1 });
};

/**
 * @desc Get single fee by ID
 * @param {string} id - Fee ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Fee object
 */
exports.getFeeById = async (id, tenantId) => {
  return await Fee.findOne({ _id: id, tenantId, deleted: false })
    .populate('student');
};

/**
 * @desc Create a new fee
 * @param {Object} feeData - Data for the new fee, including tenantId
 * @returns {Object} - Newly created fee object
 */
exports.createFee = async (feeData) => {
  // Validate student belongs to tenant
  const student = await Student.findOne({ 
    _id: feeData.student, 
    tenantId: feeData.tenantId, 
    deleted: false 
  });
  if (!student) {
    throw new Error('Student not found or does not belong to tenant');
  }

  // Validate amount
  if (!feeData.amount || feeData.amount <= 0) {
    throw new Error('Fee amount must be greater than 0');
  }

  // Auto-update status based on dueDate
  if (feeData.dueDate) {
    const dueDate = new Date(feeData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today && !feeData.status) {
      feeData.status = 'overdue';
    } else if (!feeData.status) {
      feeData.status = 'unpaid';
    }
  } else if (!feeData.status) {
    feeData.status = 'unpaid';
  }

  const newFee = new Fee(feeData);
  return await newFee.save();
};

/**
 * @desc Update a fee by ID
 * @param {string} id - Fee ID
 * @param {Object} updateData - Data to update the fee
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated fee object
 */
exports.updateFee = async (id, updateData, tenantId) => {
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

  // Validate amount if provided
  if (updateData.amount !== undefined && updateData.amount <= 0) {
    throw new Error('Fee amount must be greater than 0');
  }

  // Auto-update status based on dueDate if dueDate is updated
  if (updateData.dueDate) {
    const dueDate = new Date(updateData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today && updateData.status !== 'paid') {
      updateData.status = 'overdue';
    }
  }

  return await Fee.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('student');
};

/**
 * @desc Soft delete a fee by ID
 * @param {string} id - Fee ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted fee object
 */
exports.deleteFee = async (id, tenantId) => {
  return await Fee.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get fees by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of fee objects
 */
exports.getFeesByStudent = async (studentId, tenantId) => {
  return await Fee.find({ student: studentId, tenantId, deleted: false })
    .populate('student')
    .sort({ dueDate: 1 });
};

/**
 * @desc Get fees by status
 * @param {string} status - Fee status (paid, unpaid, overdue)
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of fee objects
 */
exports.getFeesByStatus = async (status, tenantId) => {
  return await Fee.find({ status, tenantId, deleted: false })
    .populate('student')
    .sort({ dueDate: 1 });
};

/**
 * @desc Calculate total fees by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Total fee information
 */
exports.calculateTotalFeesByStudent = async (studentId, tenantId) => {
  const fees = await exports.getFeesByStudent(studentId, tenantId);
  
  const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paid = fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const unpaid = fees.filter(f => f.status === 'unpaid').reduce((sum, fee) => sum + fee.amount, 0);
  const overdue = fees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  return {
    total,
    paid,
    unpaid,
    overdue,
    count: fees.length
  };
};

/**
 * @desc Bulk create fees
 * @param {Array} feesData - Array of fee data objects
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Object with created fees and errors
 */
exports.bulkCreateFees = async (feesData, tenantId) => {
  const createdFees = [];
  const errors = [];

  for (const feeData of feesData) {
    try {
      feeData.tenantId = tenantId;
      const fee = await exports.createFee(feeData);
      createdFees.push(fee);
    } catch (error) {
      errors.push({ data: feeData, error: error.message });
    }
  }

  if (errors.length > 0) {
    return { fees: createdFees, errors };
  }

  return { fees: createdFees };
};
