// Provider Service - business logic for SaaS provider
const Provider = require('../models/Provider');

exports.createProvider = async (providerData) => {
  const newProvider = new Provider(providerData);
  return await newProvider.save();
};

exports.getAllProviders = async () => {
  return await Provider.find({ deleted: false }).sort({ createdAt: -1 });
};

exports.getProviderById = async (id) => {
  return await Provider.findOne({ _id: id, deleted: false });
};

exports.updateProvider = async (id, updateData) => {
  return await Provider.findOneAndUpdate(
    { _id: id, deleted: false },
    updateData,
    { new: true, runValidators: true }
  );
};

exports.deleteProvider = async (id) => {
  return await Provider.findOneAndUpdate(
    { _id: id, deleted: false },
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
};
