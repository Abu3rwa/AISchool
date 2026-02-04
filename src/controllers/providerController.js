// Provider Controller - handles SaaS provider CRUD operations
const providerService = require('../services/providerService');

// Create a new provider
exports.createProvider = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const newProvider = await providerService.createProvider(req.body);
    res.status(201).json(newProvider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all providers
exports.getAllProviders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const providers = await providerService.getAllProviders();
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a provider by ID
exports.getProviderById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const provider = await providerService.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a provider
exports.updateProvider = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedProvider = await providerService.updateProvider(req.params.id, req.body);
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(updatedProvider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a provider
exports.deleteProvider = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const deletedProvider = await providerService.deleteProvider(req.params.id);
    if (!deletedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
