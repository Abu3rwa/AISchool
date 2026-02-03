const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    grade: { type: String, required: true },
    comments: { type: String },
    date: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', GradeSchema);
