const express = require('express');
const router = express.Router();
const gradingScaleController = require('../controllers/gradingScaleController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', gradingScaleController.getGradingScale);
router.put('/', gradingScaleController.updateGradingScale);
router.post('/reset', gradingScaleController.resetGradingScale);

module.exports = router;
