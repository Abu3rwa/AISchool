// TermReport Controller - handles term report CRUD operations
const termReportService = require('../services/termReportService');

/**
 * @desc Get all term reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTermReports = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const reports = await termReportService.getAllTermReports(req.user.tenantId);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single term report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTermReportById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const report = await termReportService.getTermReportById(req.params.id, req.user.tenantId);
    if (!report) {
      return res.status(404).json({ message: 'Term report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new term report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTermReport = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const reportData = Object.assign({}, req.body, { 
      tenantId: req.user.tenantId,
      generatedBy: req.user.id
    });
    const newReport = await termReportService.createTermReport(reportData);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a term report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTermReport = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedReport = await termReportService.updateTermReport(req.params.id, req.body, req.user.tenantId);
    if (!updatedReport) {
      return res.status(404).json({ message: 'Term report not found' });
    }
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a term report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTermReport = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedReport = await termReportService.deleteTermReport(req.params.id, req.user.tenantId);
    if (!deletedReport) {
      return res.status(404).json({ message: 'Term report not found' });
    }
    res.status(200).json({ message: 'Term report soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get term reports by student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTermReportsByStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const reports = await termReportService.getTermReportsByStudent(req.params.studentId, req.user.tenantId);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get term reports by term and year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTermReportsByTermYear = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { term, year } = req.query;
    if (!term || !year) {
      return res.status(400).json({ message: 'term and year query parameters are required' });
    }
    const reports = await termReportService.getTermReportsByTermYear(term, parseInt(year), req.user.tenantId);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Generate term report from existing grades
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateTermReport = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { studentId, term, year } = req.body;
    if (!studentId || !term || !year) {
      return res.status(400).json({ message: 'studentId, term, and year are required' });
    }
    const report = await termReportService.generateTermReport(
      studentId, 
      term, 
      parseInt(year), 
      req.user.id, 
      req.user.tenantId
    );
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
