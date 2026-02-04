// Asset Controller - handles asset CRUD operations
const assetService = require('../services/assetService');

/**
 * @desc Get all assets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllAssets = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const assets = await assetService.getAllAssets(req.user.tenantId);
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single asset by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAssetById = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const asset = await assetService.getAssetById(req.params.id, req.user.tenantId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAsset = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const assetData = Object.assign({}, req.body, { 
      tenantId: req.user.tenantId,
      uploadedBy: req.user.id
    });
    const newAsset = await assetService.createAsset(assetData);
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update an asset by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAsset = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedAsset = await assetService.updateAsset(req.params.id, req.body, req.user.tenantId);
    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Soft delete an asset by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAsset = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedAsset = await assetService.deleteAsset(req.params.id, req.user.tenantId);
    if (!deletedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(200).json({ message: 'Asset soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get assets by file type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAssetsByFileType = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { fileType } = req.query;
    if (!fileType) {
      return res.status(400).json({ message: 'fileType query parameter is required' });
    }
    const assets = await assetService.getAssetsByFileType(fileType, req.user.tenantId);
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get assets uploaded by current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyAssets = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const assets = await assetService.getAssetsByUser(req.user.id, req.user.tenantId);
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
