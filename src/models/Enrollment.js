const mongoose = require('mongoose');
const { Schema } = mongoose;

const EnrollmentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ tenantId: 1, student: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
