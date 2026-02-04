// Student Controller - handles student CRUD operations
const studentService = require('../services/studentService');

/**
 * @desc Get all students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllStudents = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const students = await studentService.getAllStudents(req.user.tenantId);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStudentById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const student = await studentService.getStudentById(req.params.id, req.user.tenantId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const studentData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newStudent = await studentService.createStudent(studentData);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedStudent = await studentService.updateStudent(req.params.id, req.body, req.user.tenantId);
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete a student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteStudent = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedStudent = await studentService.deleteStudent(req.params.id, req.user.tenantId);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
