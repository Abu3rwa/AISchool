const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    settings: {
      logoUrl: String,
      primaryColor: String,
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for slug lookups
TenantSchema.index({ slug: 1 });

module.exports = mongoose.model('Tenant', TenantSchema);
