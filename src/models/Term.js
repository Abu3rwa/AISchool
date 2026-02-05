const mongoose = require('mongoose');
const { Schema } = mongoose;

const TermSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    academicYear: { type: String, required: true, trim: true },
    isCurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique name per tenant per academic year
TermSchema.index({ tenantId: 1, name: 1, academicYear: 1 }, { unique: true });

// Only one current term per tenant
TermSchema.pre('save', async function (next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    await this.constructor.updateMany(
      { tenantId: this.tenantId, _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

module.exports = mongoose.model('Term', TermSchema);
