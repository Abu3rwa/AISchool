const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeTypeSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    weight: { type: Number, min: 0, max: 1 },
    maxScore: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique name per tenant
GradeTypeSchema.index({ tenantId: 1, name: 1 }, { unique: true });

/**
 * Seed default grade types for a new tenant
 * @param {ObjectId} tenantId
 */
GradeTypeSchema.statics.seedDefaults = async function (tenantId) {
  const defaults = [
    { name: 'Classwork', weight: 0.20, maxScore: 100 },
    { name: 'Homework', weight: 0.10, maxScore: 100 },
    { name: 'Quiz', weight: 0.15, maxScore: 100 },
    { name: 'Test', weight: 0.25, maxScore: 100 },
    { name: 'Exam', weight: 0.30, maxScore: 100 },
  ];

  const existing = await this.countDocuments({ tenantId });
  if (existing > 0) return;

  await this.insertMany(defaults.map(d => ({ ...d, tenantId })));
};

module.exports = mongoose.model('GradeType', GradeTypeSchema);
