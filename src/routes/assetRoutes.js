// Asset Routes - CRUD for assets
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', requirePermission('assets.create'), assetController.createAsset);
router.get('/', requirePermission('assets.read'), assetController.getAllAssets);
router.get('/my', requirePermission('assets.read'), assetController.getMyAssets);
router.get('/by-file-type', requirePermission('assets.read'), assetController.getAssetsByFileType);
router.get('/:id', requirePermission('assets.read'), assetController.getAssetById);
router.put('/:id', requirePermission('assets.update'), assetController.updateAsset);
router.delete('/:id', requirePermission('assets.delete'), assetController.deleteAsset);

module.exports = router;
