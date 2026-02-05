const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScaleEntrySchema = new Schema(
  {
    letter: { type: String, required: true, trim: true },
    minPercentage: { type: Number, required: true, min: 0, max: 100 },
    maxPercentage: { type: Number, required: true, min: 0, max: 100 },
    gpa: { type: Number, min: 0, max: 4 },
  },
  { _id: false }
);

const GradingScaleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    scales: [ScaleEntrySchema],
  },
  { timestamps: true }
);

/**
 * Get letter grade for a percentage
 * @param {Number} percentage
 * @returns {String} letter grade
 */
GradingScaleSchema.methods.getLetterGrade = function (percentage) {
  const sorted = [...this.scales].sort((a, b) => b.minPercentage - a.minPercentage);
  for (const scale of sorted) {
    if (percentage >= scale.minPercentage && percentage <= scale.maxPercentage) {
      return scale.letter;
    }
  }
  return 'F';
};

/**
 * Seed default grading scale for a new tenant
 * @param {ObjectId} tenantId
 */
GradingScaleSchema.statics.seedDefaults = async function (tenantId) {
  const existing = await this.findOne({ tenantId });
  if (existing) return existing;

  const defaultScales = [
    { letter: 'A+', minPercentage: 97, maxPercentage: 100, gpa: 4.0 },
    { letter: 'A', minPercentage: 93, maxPercentage: 96, gpa: 4.0 },
    { letter: 'A-', minPercentage: 90, maxPercentage: 92, gpa: 3.7 },
    { letter: 'B+', minPercentage: 87, maxPercentage: 89, gpa: 3.3 },
    { letter: 'B', minPercentage: 83, maxPercentage: 86, gpa: 3.0 },
    { letter: 'B-', minPercentage: 80, maxPercentage: 82, gpa: 2.7 },
    { letter: 'C+', minPercentage: 77, maxPercentage: 79, gpa: 2.3 },
    { letter: 'C', minPercentage: 73, maxPercentage: 76, gpa: 2.0 },
    { letter: 'C-', minPercentage: 70, maxPercentage: 72, gpa: 1.7 },
    { letter: 'D+', minPercentage: 67, maxPercentage: 69, gpa: 1.3 },
    { letter: 'D', minPercentage: 63, maxPercentage: 66, gpa: 1.0 },
    { letter: 'D-', minPercentage: 60, maxPercentage: 62, gpa: 0.7 },
    { letter: 'F', minPercentage: 0, maxPercentage: 59, gpa: 0.0 },
  ];

  return this.create({ tenantId, scales: defaultScales });
};

module.exports = mongoose.model('GradingScale', GradingScaleSchema);
