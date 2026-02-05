const express = require('express');
const router = express.Router();
const gradeTypeController = require('../controllers/gradeTypeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', gradeTypeController.getGradeTypes);
router.post('/', gradeTypeController.createGradeType);
router.put('/:id', gradeTypeController.updateGradeType);
router.delete('/:id', gradeTypeController.deleteGradeType);

module.exports = router;
