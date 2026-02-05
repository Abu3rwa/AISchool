const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gradeTypeId: { type: Schema.Types.ObjectId, ref: 'GradeType', required: true },
    termId: { type: Schema.Types.ObjectId, ref: 'Term' },
    title: { type: String, trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1, default: 100 },
    percentage: { type: Number },
    letterGrade: { type: String, trim: true },
    teacherNotes: { type: String, trim: true },
    studentFeedback: { type: String, trim: true },
    assessmentDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Compute percentage before save
GradeSchema.pre('save', function (next) {
  if (this.score !== undefined && this.maxScore) {
    this.percentage = Math.round((this.score / this.maxScore) * 100 * 100) / 100;
  }
  next();
});

// Indexes for efficient tenant-scoped queries
GradeSchema.index({ tenantId: 1, studentId: 1, subjectId: 1 });
GradeSchema.index({ tenantId: 1, classId: 1, subjectId: 1, gradeTypeId: 1 });
GradeSchema.index({ tenantId: 1, teacherId: 1 });
GradeSchema.index({ tenantId: 1, assessmentDate: 1 });
GradeSchema.index({ tenantId: 1, isPublished: 1 });

module.exports = mongoose.model('Grade', GradeSchema);
