const mongoose = require('mongoose');
const { Schema } = mongoose;

const TermReportSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    term: { type: String, required: true },
    year: { type: Number, required: true },
    grades: [{
        subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
        grade: String,
        comments: String
    }],
    overallComments: { type: String },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TermReport', TermReportSchema);
