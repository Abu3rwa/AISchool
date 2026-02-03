const mongoose = require('mongoose');
const { Schema } = mongoose;

const BehaviorRecordSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    incidentDate: { type: Date, default: Date.now },
    description: { type: String, required: true },
    actionTaken: { type: String },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BehaviorRecord', BehaviorRecordSchema);
