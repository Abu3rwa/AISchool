const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProviderUserSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    permissions: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderUser', ProviderUserSchema);
