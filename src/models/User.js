const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role', required: true }],
    phoneNumber: { type: String, trim: true },
    profileImageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Global uniqueness for email (One email = One User in the entire system)
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1 });

module.exports = mongoose.model('User', UserSchema);
