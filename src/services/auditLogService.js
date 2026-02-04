// AuditLog Service - business logic for audit logs
const AuditLog = require('../models/AuditLog');

exports.createAuditLog = async (data) => {
  const newAuditLog = new AuditLog(data);
  await newAuditLog.save();
  return await AuditLog.findById(newAuditLog._id).populate('user', 'name email');
};

exports.getAllAuditLogs = async (tenantId) => {
  return await AuditLog.find({ tenantId, deleted: false })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

exports.getAuditLogById = async (id, tenantId) => {
  return await AuditLog.findOne({ _id: id, tenantId, deleted: false })
    .populate('user', 'name email');
};

exports.updateAuditLog = async (id, updateData, tenantId) => {
  return await AuditLog.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email');
};

exports.deleteAuditLog = async (id, tenantId) => {
  return await AuditLog.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

exports.getAuditLogsByEntity = async (entity, tenantId) => {
  return await AuditLog.find({ entity, tenantId, deleted: false })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

exports.getAuditLogsByUser = async (userId, tenantId) => {
  return await AuditLog.find({ user: userId, tenantId, deleted: false })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

exports.getAuditLogsByDateRange = async (startDate, endDate, tenantId) => {
  return await AuditLog.find({
    createdAt: { $gte: startDate, $lte: endDate },
    tenantId,
    deleted: false,
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};
