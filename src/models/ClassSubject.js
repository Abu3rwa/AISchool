const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ClassSubject - Assignment Layer
 * Links a teacher to a specific class+subject combination.
 * This is the critical model for teacher RBAC scoping.
 */
const ClassSubjectSchema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Unique constraint: one teacher per class+subject per tenant
ClassSubjectSchema.index({ tenantId: 1, classId: 1, subjectId: 1 }, { unique: true });

// Fast lookup: "my assignments" for a teacher
ClassSubjectSchema.index({ tenantId: 1, teacherId: 1 });

module.exports = mongoose.model('ClassSubject', ClassSubjectSchema);
