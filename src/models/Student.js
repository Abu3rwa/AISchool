const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    studentIdNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], trim: true },
    dateOfBirth: { type: Date },
    // Primary guardian
    guardianName: { type: String, trim: true },
    guardianEmail: { type: String, trim: true, lowercase: true },
    guardianPhone: { type: String, trim: true },
    // Secondary guardian (optional)
    secondaryGuardianName: { type: String, trim: true },
    secondaryGuardianEmail: { type: String, trim: true, lowercase: true },
    secondaryGuardianPhone: { type: String, trim: true },
    // Notification preferences
    notificationPreferences: {
      gradeUpdates: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Tenant-scoped unique studentIdNumber (only if provided)
StudentSchema.index(
  { tenantId: 1, studentIdNumber: 1 },
  { unique: true, partialFilterExpression: { studentIdNumber: { $type: 'string' } } }
);

module.exports = mongoose.model('Student', StudentSchema);
