// Asset Routes - CRUD for assets
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.post('/', assetController.createAsset);
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
