const express = require('express');
const router = express.Router();
const providerAuthController = require('../controllers/providerAuthController');
const providerAuthMiddleware = require('../middleware/providerAuthMiddleware');

router.post('/login', providerAuthController.loginProviderUser);
router.get('/me', providerAuthMiddleware, providerAuthController.getProviderMe);

// Public signup: creates Provider + first ProviderUser (manager) and returns JWT
router.post('/signup', providerAuthController.signupProviderWithManager);

// One-time setup endpoint (protected by PROVIDER_SETUP_SECRET)
router.post('/register', providerAuthController.registerProviderUser);

module.exports = router;
