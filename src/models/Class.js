const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    room: { type: String },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

ClassSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
