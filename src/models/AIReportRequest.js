const mongoose = require('mongoose');
const { Schema } = mongoose;

const AIReportRequestSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    reportType: { type: String, enum: ['performance_summary', 'behavioral_analysis'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    generatedReport: { type: String },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIReportRequest', AIReportRequestSchema);
