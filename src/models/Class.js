const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: String, trim: true },
    section: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    room: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

ClassSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
