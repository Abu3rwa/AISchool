const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    emergencyContact: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

StudentSchema.index({ tenantId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Student', StudentSchema);
