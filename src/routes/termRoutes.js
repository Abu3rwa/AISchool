const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', termController.getTerms);
router.get('/current', termController.getCurrentTerm);
router.post('/', termController.createTerm);
router.put('/:id', termController.updateTerm);
router.patch('/:id/current', termController.setCurrentTerm);

module.exports = router;
