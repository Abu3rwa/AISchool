// Payment Service - business logic for payments
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

/**
 * @desc Get all payments for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of payment objects
 */
exports.getAllPayments = async (tenantId) => {
  return await Payment.find({ tenantId, deleted: false })
    .populate('fee')
    .sort({ paymentDate: -1 });
};

/**
 * @desc Get single payment by ID
 * @param {string} id - Payment ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Payment object
 */
exports.getPaymentById = async (id, tenantId) => {
  return await Payment.findOne({ _id: id, tenantId, deleted: false })
    .populate('fee');
};

/**
 * @desc Create a new payment
 * @param {Object} paymentData - Data for the new payment, including tenantId
 * @returns {Object} - Newly created payment object
 */
exports.createPayment = async (paymentData) => {
  // Validate fee belongs to tenant
  const fee = await Fee.findOne({ 
    _id: paymentData.fee, 
    tenantId: paymentData.tenantId, 
    deleted: false 
  });
  if (!fee) {
    throw new Error('Fee not found or does not belong to tenant');
  }

  // Validate payment amount doesn't exceed fee amount
  if (paymentData.amount > fee.amount) {
    throw new Error('Payment amount cannot exceed fee amount');
  }

  // Calculate total payments for this fee
  const existingPayments = await Payment.find({ 
    fee: paymentData.fee, 
    tenantId: paymentData.tenantId, 
    deleted: false 
  });
  const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
  const newTotal = totalPaid + paymentData.amount;

  if (newTotal > fee.amount) {
    throw new Error(`Total payments (${newTotal}) would exceed fee amount (${fee.amount})`);
  }

  // Set payment date if not provided
  if (!paymentData.paymentDate) {
    paymentData.paymentDate = new Date();
  }

  // Create payment
  const newPayment = new Payment(paymentData);
  await newPayment.save();

  // Update fee status if fully paid
  if (newTotal >= fee.amount) {
    await Fee.findOneAndUpdate(
      { _id: fee._id },
      { status: 'paid' },
      { new: true }
    );
  } else if (fee.status === 'overdue' && newTotal > 0) {
    // If partially paid and was overdue, keep as overdue
    await Fee.findOneAndUpdate(
      { _id: fee._id },
      { status: 'overdue' },
      { new: true }
    );
  }

  return await Payment.findById(newPayment._id).populate('fee');
};

/**
 * @desc Update a payment by ID
 * @param {string} id - Payment ID
 * @param {Object} updateData - Data to update the payment
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated payment object
 */
exports.updatePayment = async (id, updateData, tenantId) => {
  // Get existing payment
  const existingPayment = await Payment.findById(id);
  if (!existingPayment) {
    throw new Error('Payment not found');
  }

  // Validate fee if provided
  if (updateData.fee) {
    const fee = await Fee.findOne({ 
      _id: updateData.fee, 
      tenantId, 
      deleted: false 
    });
    if (!fee) {
      throw new Error('Fee not found or does not belong to tenant');
    }
  }

  // Validate amount if provided
  if (updateData.amount !== undefined) {
    const feeId = updateData.fee || existingPayment.fee;
    const fee = await Fee.findById(feeId);
    
    // Calculate total payments excluding this one
    const otherPayments = await Payment.find({ 
      fee: feeId, 
      tenantId, 
      _id: { $ne: id },
      deleted: false 
    });
    const totalOtherPayments = otherPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = totalOtherPayments + updateData.amount;

    if (newTotal > fee.amount) {
      throw new Error(`Total payments (${newTotal}) would exceed fee amount (${fee.amount})`);
    }
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('fee');

  // Update fee status
  if (updatedPayment) {
    const feeId = updatedPayment.fee._id || updatedPayment.fee;
    const fee = await Fee.findById(feeId);
    const allPayments = await Payment.find({ fee: feeId, tenantId, deleted: false });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= fee.amount) {
      await Fee.findByIdAndUpdate(feeId, { status: 'paid' });
    } else if (totalPaid > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(fee.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      await Fee.findByIdAndUpdate(feeId, { 
        status: dueDate < today ? 'overdue' : 'unpaid' 
      });
    }
  }

  return updatedPayment;
};

/**
 * @desc Soft delete a payment by ID
 * @param {string} id - Payment ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted payment object
 */
exports.deletePayment = async (id, tenantId) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new Error('Payment not found');
  }

  const deletedPayment = await Payment.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );

  // Update fee status after deletion
  if (deletedPayment) {
    const feeId = payment.fee;
    const fee = await Fee.findById(feeId);
    const allPayments = await Payment.find({ fee: feeId, tenantId, deleted: false });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= fee.amount) {
      await Fee.findByIdAndUpdate(feeId, { status: 'paid' });
    } else if (totalPaid > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(fee.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      await Fee.findByIdAndUpdate(feeId, { 
        status: dueDate < today ? 'overdue' : 'unpaid' 
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(fee.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      await Fee.findByIdAndUpdate(feeId, { 
        status: dueDate < today ? 'overdue' : 'unpaid' 
      });
    }
  }

  return deletedPayment;
};

/**
 * @desc Get payments by student
 * @param {string} studentId - Student ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of payment objects
 */
exports.getPaymentsByStudent = async (studentId, tenantId) => {
  // Get fees for the student
  const fees = await Fee.find({ student: studentId, tenantId, deleted: false });
  const feeIds = fees.map(f => f._id);

  return await Payment.find({ 
    fee: { $in: feeIds }, 
    tenantId, 
    deleted: false 
  })
    .populate('fee')
    .sort({ paymentDate: -1 });
};

/**
 * @desc Get payments by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of payment objects
 */
exports.getPaymentsByDateRange = async (startDate, endDate, tenantId) => {
  return await Payment.find({ 
    paymentDate: { $gte: startDate, $lte: endDate },
    tenantId, 
    deleted: false 
  })
    .populate('fee')
    .sort({ paymentDate: -1 });
};
