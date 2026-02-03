const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    permissions: [{ type: String, required: true }],
    isDefault: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', RoleSchema);
