// AIReportRequest Controller - handles AI report request CRUD operations
const aiReportRequestService = require('../services/aiReportRequestService');

/**
 * @desc Get all AI report requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllAIReportRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const requests = await aiReportRequestService.getAllAIReportRequests(req.user.tenantId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single AI report request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAIReportRequestById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const request = await aiReportRequestService.getAIReportRequestById(req.params.id, req.user.tenantId);
    if (!request) {
      return res.status(404).json({ message: 'AI report request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new AI report request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAIReportRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const requestData = Object.assign({}, req.body, { 
      tenantId: req.user.tenantId,
      requestedBy: req.user.id
    });
    const newRequest = await aiReportRequestService.createAIReportRequest(requestData);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update an AI report request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAIReportRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedRequest = await aiReportRequestService.updateAIReportRequest(req.params.id, req.body, req.user.tenantId);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'AI report request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete an AI report request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAIReportRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedRequest = await aiReportRequestService.deleteAIReportRequest(req.params.id, req.user.tenantId);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'AI report request not found' });
    }
    res.status(200).json({ message: 'AI report request soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get AI report requests by student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAIReportRequestsByStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const requests = await aiReportRequestService.getAIReportRequestsByStudent(req.params.studentId, req.user.tenantId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get AI report requests by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAIReportRequestsByStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ message: 'status query parameter is required' });
    }
    const requests = await aiReportRequestService.getAIReportRequestsByStatus(status, req.user.tenantId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update AI report request status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { status, generatedReport } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }
    const updatedRequest = await aiReportRequestService.updateStatus(
      req.params.id, 
      status, 
      generatedReport, 
      req.user.tenantId
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'AI report request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Get pending AI report requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const requests = await aiReportRequestService.getPendingRequests(req.user.tenantId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
