const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

SubjectSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
