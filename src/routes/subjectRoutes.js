// Subject Routes - CRUD for subjects
const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('subjects.create'), subjectController.createSubject);
router.get('/', requirePermission('subjects.read'), subjectController.getAllSubjects);
router.get('/:id', requirePermission('subjects.read'), subjectController.getSubjectById);
router.put('/:id', requirePermission('subjects.update'), subjectController.updateSubject);
router.delete('/:id', requirePermission('subjects.delete'), subjectController.deleteSubject);

module.exports = router;
