// Asset Service - business logic for assets
const Asset = require('../models/Asset');
const User = require('../models/User');

/**
 * @desc Get all assets for a tenant
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of asset objects
 */
exports.getAllAssets = async (tenantId) => {
  return await Asset.find({ tenantId, deleted: false })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get single asset by ID
 * @param {string} id - Asset ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Asset object
 */
exports.getAssetById = async (id, tenantId) => {
  return await Asset.findOne({ _id: id, tenantId, deleted: false })
    .populate('uploadedBy', 'name email');
};

/**
 * @desc Create a new asset
 * @param {Object} assetData - Data for the new asset, including tenantId
 * @returns {Object} - Newly created asset object
 */
exports.createAsset = async (assetData) => {
  // Validate uploadedBy user belongs to tenant
  if (assetData.uploadedBy) {
    const user = await User.findOne({ 
      _id: assetData.uploadedBy, 
      tenantId: assetData.tenantId 
    });
    if (!user) {
      throw new Error('User not found or does not belong to tenant');
    }
  }

  // Validate required fields
  if (!assetData.fileName) {
    throw new Error('fileName is required');
  }
  if (!assetData.fileType) {
    throw new Error('fileType is required');
  }
  if (!assetData.fileSize) {
    throw new Error('fileSize is required');
  }
  if (!assetData.storageUrl) {
    throw new Error('storageUrl is required');
  }

  const newAsset = new Asset(assetData);
  await newAsset.save();

  return await Asset.findById(newAsset._id)
    .populate('uploadedBy', 'name email');
};

/**
 * @desc Update an asset by ID
 * @param {string} id - Asset ID
 * @param {Object} updateData - Data to update the asset
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Updated asset object
 */
exports.updateAsset = async (id, updateData, tenantId) => {
  return await Asset.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate('uploadedBy', 'name email');
};

/**
 * @desc Soft delete an asset by ID
 * @param {string} id - Asset ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Object} - Soft deleted asset object
 */
exports.deleteAsset = async (id, tenantId) => {
  return await Asset.findOneAndUpdate(
    { _id: id, tenantId, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};

/**
 * @desc Get assets by file type
 * @param {string} fileType - File type to filter by
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of asset objects
 */
exports.getAssetsByFileType = async (fileType, tenantId) => {
  return await Asset.find({ 
    fileType, 
    tenantId, 
    deleted: false 
  })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * @desc Get assets uploaded by a specific user
 * @param {string} userId - User ID
 * @param {string} tenantId - The ID of the tenant
 * @returns {Array} - Array of asset objects
 */
exports.getAssetsByUser = async (userId, tenantId) => {
  return await Asset.find({ 
    uploadedBy: userId, 
    tenantId, 
    deleted: false 
  })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};
