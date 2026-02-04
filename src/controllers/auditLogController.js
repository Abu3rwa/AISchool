// AuditLog Controller - handles audit log CRUD operations
const auditLogService = require('../services/auditLogService');

exports.createAuditLog = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const auditData = Object.assign({}, req.body, {
      tenantId: req.user.tenantId,
      user: req.user.id,
      ipAddress: req.ip,
    });
    const newAuditLog = await auditLogService.createAuditLog(auditData);
    res.status(201).json(newAuditLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllAuditLogs = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const auditLogs = await auditLogService.getAllAuditLogs(req.user.tenantId);
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const auditLog = await auditLogService.getAuditLogById(req.params.id, req.user.tenantId);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.status(200).json(auditLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAuditLog = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedAuditLog = await auditLogService.updateAuditLog(req.params.id, req.body, req.user.tenantId);
    if (!updatedAuditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.status(200).json(updatedAuditLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAuditLog = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedAuditLog = await auditLogService.deleteAuditLog(req.params.id, req.user.tenantId);
    if (!deletedAuditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.status(200).json({ message: 'Audit log soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogsByEntity = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { entity } = req.query;
    if (!entity) {
      return res.status(400).json({ message: 'entity query parameter is required' });
    }
    const auditLogs = await auditLogService.getAuditLogsByEntity(entity, req.user.tenantId);
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogsByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const auditLogs = await auditLogService.getAuditLogsByUser(req.params.userId, req.user.tenantId);
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogsByDateRange = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate query parameters are required' });
    }
    const auditLogs = await auditLogService.getAuditLogsByDateRange(
      new Date(startDate),
      new Date(endDate),
      req.user.tenantId
    );
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
