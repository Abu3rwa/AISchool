// Class Routes - CRUD for classes
const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('classes.create'), classController.createClass);
router.get('/', requirePermission('classes.read'), classController.getAllClasses);
router.get('/:id', requirePermission('classes.read'), classController.getClassById);
router.put('/:id', requirePermission('classes.update'), classController.updateClass);
router.delete('/:id', requirePermission('classes.delete'), classController.deleteClass);

module.exports = router;
