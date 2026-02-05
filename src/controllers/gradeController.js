/**
 * Grade Controller
 * Handles grade CRUD with teacher scoping and RBAC
 * ADMIN: full access within tenant
 * TEACHER: only assigned class+subject grades
 */
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const GradeType = require('../models/GradeType');
const ClassSubject = require('../models/ClassSubject');
const GradingScale = require('../models/GradingScale');
const { isAdmin, getTeacherClassSubjectPairs } = require('../helpers/teacherScoping');

/**
 * Validate all grade references belong to the same tenant
 */
const validateGradeReferences = async (tenantId, { studentId, classId, subjectId, gradeTypeId, termId }) => {
    const [student, classDoc, subject, gradeType] = await Promise.all([
        Student.findOne({ _id: studentId, tenantId, deleted: false }),
        Class.findOne({ _id: classId, tenantId, deleted: false }),
        Subject.findOne({ _id: subjectId, tenantId, deleted: false }),
        GradeType.findOne({ _id: gradeTypeId, tenantId, isActive: true }),
    ]);

    if (!student) throw new Error('Student not found');
    if (!classDoc) throw new Error('Class not found');
    if (!subject) throw new Error('Subject not found');
    if (!gradeType) throw new Error('Grade type not found');

    // Verify student belongs to the class
    if (student.classId?.toString() !== classId.toString()) {
        throw new Error('Student does not belong to this class');
    }

    return { student, classDoc, subject, gradeType };
};

/**
 * Check if teacher can grade this class+subject
 */
const canTeacherGrade = async (tenantId, teacherId, classId, subjectId) => {
    const assignment = await ClassSubject.findOne({
        tenantId,
        classId,
        subjectId,
        teacherId,
    });
    return !!assignment;
};

/**
 * @desc Get all grades with filters (teacher-scoped)
 */
exports.getGrades = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId, subjectId, studentId, gradeTypeId, termId, isPublished, startDate, endDate } = req.query;

        const query = { tenantId, deleted: false };

        // Apply filters
        if (classId) query.classId = classId;
        if (subjectId) query.subjectId = subjectId;
        if (studentId) query.studentId = studentId;
        if (gradeTypeId) query.gradeTypeId = gradeTypeId;
        if (termId) query.termId = termId;
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';
        if (startDate || endDate) {
            query.assessmentDate = {};
            if (startDate) query.assessmentDate.$gte = new Date(startDate);
            if (endDate) query.assessmentDate.$lte = new Date(endDate);
        }

        // Teacher scoping: only see grades for assigned class+subject pairs
        if (!(await isAdmin(req.user))) {
            const pairs = await getTeacherClassSubjectPairs(tenantId, req.user._id);
            if (pairs.length === 0) {
                return res.status(200).json([]);
            }
            query.$or = pairs.map(p => ({ classId: p.classId, subjectId: p.subjectId }));
        }

        const grades = await Grade.find(query)
            .populate('studentId', 'firstName lastName studentIdNumber')
            .populate('classId', 'name')
            .populate('subjectId', 'name')
            .populate('gradeTypeId', 'name weight')
            .populate('teacherId', 'firstName lastName')
            .sort({ assessmentDate: -1, createdAt: -1 });

        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get single grade by ID
 */
exports.getGradeById = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const grade = await Grade.findOne({ _id: id, tenantId, deleted: false })
            .populate('studentId', 'firstName lastName studentIdNumber')
            .populate('classId', 'name')
            .populate('subjectId', 'name')
            .populate('gradeTypeId', 'name weight')
            .populate('teacherId', 'firstName lastName');

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Teacher can only see their assigned class+subject grades
        if (!(await isAdmin(req.user))) {
            const canAccess = await canTeacherGrade(tenantId, req.user._id, grade.classId._id, grade.subjectId._id);
            if (!canAccess) {
                return res.status(403).json({ message: 'Not authorized to view this grade' });
            }
        }

        res.status(200).json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new grade
 */
exports.createGrade = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const {
            studentId, classId, subjectId, gradeTypeId, termId,
            title, score, maxScore, teacherNotes, studentFeedback, assessmentDate
        } = req.body;

        // Validate required fields
        if (!studentId || !classId || !subjectId || !gradeTypeId || score === undefined || !assessmentDate) {
            return res.status(400).json({ message: 'studentId, classId, subjectId, gradeTypeId, score, and assessmentDate are required' });
        }

        // Validate references
        await validateGradeReferences(tenantId, { studentId, classId, subjectId, gradeTypeId, termId });

        // Teacher scoping: verify assignment
        if (!(await isAdmin(req.user))) {
            const canGrade = await canTeacherGrade(tenantId, req.user._id, classId, subjectId);
            if (!canGrade) {
                return res.status(403).json({ message: 'Not assigned to this class/subject' });
            }
        }

        // Get grading scale for letter grade
        let letterGrade = null;
        const percentage = (score / (maxScore || 100)) * 100;
        const scale = await GradingScale.findOne({ tenantId });
        if (scale) {
            letterGrade = scale.getLetterGrade(percentage);
        }

        const grade = new Grade({
            tenantId,
            studentId,
            classId,
            subjectId,
            teacherId: req.user._id,
            gradeTypeId,
            termId: termId || null,
            title: title || null,
            score,
            maxScore: maxScore || 100,
            letterGrade,
            teacherNotes: teacherNotes || null,
            studentFeedback: studentFeedback || null,
            assessmentDate: new Date(assessmentDate),
        });

        await grade.save();

        // Populate for response
        await grade.populate([
            { path: 'studentId', select: 'firstName lastName studentIdNumber' },
            { path: 'classId', select: 'name' },
            { path: 'subjectId', select: 'name' },
            { path: 'gradeTypeId', select: 'name weight' },
        ]);

        res.status(201).json(grade);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Bulk create grades (same assessment, multiple students)
 */
exports.bulkCreateGrades = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId, subjectId, gradeTypeId, termId, title, assessmentDate, maxScore, grades } = req.body;

        if (!classId || !subjectId || !gradeTypeId || !assessmentDate || !grades || !Array.isArray(grades)) {
            return res.status(400).json({ message: 'classId, subjectId, gradeTypeId, assessmentDate, and grades array are required' });
        }

        // Teacher scoping
        if (!(await isAdmin(req.user))) {
            const canGrade = await canTeacherGrade(tenantId, req.user._id, classId, subjectId);
            if (!canGrade) {
                return res.status(403).json({ message: 'Not assigned to this class/subject' });
            }
        }

        // Validate class, subject, gradeType
        const [classDoc, subject, gradeType] = await Promise.all([
            Class.findOne({ _id: classId, tenantId, deleted: false }),
            Subject.findOne({ _id: subjectId, tenantId, deleted: false }),
            GradeType.findOne({ _id: gradeTypeId, tenantId, isActive: true }),
        ]);

        if (!classDoc) return res.status(400).json({ message: 'Class not found' });
        if (!subject) return res.status(400).json({ message: 'Subject not found' });
        if (!gradeType) return res.status(400).json({ message: 'Grade type not found' });

        // Get grading scale
        const scale = await GradingScale.findOne({ tenantId });

        // Validate all students belong to this class
        const studentIds = grades.map(g => g.studentId);
        const students = await Student.find({ _id: { $in: studentIds }, tenantId, classId, deleted: false });
        const validStudentIds = new Set(students.map(s => s._id.toString()));

        const gradeDocs = [];
        for (const g of grades) {
            if (!validStudentIds.has(g.studentId)) {
                return res.status(400).json({ message: `Student ${g.studentId} not found in this class` });
            }

            const percentage = (g.score / (maxScore || 100)) * 100;
            const letterGrade = scale ? scale.getLetterGrade(percentage) : null;

            gradeDocs.push({
                tenantId,
                studentId: g.studentId,
                classId,
                subjectId,
                teacherId: req.user._id,
                gradeTypeId,
                termId: termId || null,
                title: title || null,
                score: g.score,
                maxScore: maxScore || 100,
                letterGrade,
                teacherNotes: g.teacherNotes || null,
                studentFeedback: g.studentFeedback || null,
                assessmentDate: new Date(assessmentDate),
            });
        }

        const created = await Grade.insertMany(gradeDocs);
        res.status(201).json({ message: `${created.length} grades created`, count: created.length });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a grade by ID
 */
exports.updateGrade = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const grade = await Grade.findOne({ _id: id, tenantId, deleted: false });
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Teacher can only update their own grades
        if (!(await isAdmin(req.user))) {
            if (!grade.teacherId || grade.teacherId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Can only update your own grades' });
            }
        }

        const allowedFields = ['title', 'score', 'maxScore', 'teacherNotes', 'studentFeedback', 'assessmentDate', 'gradeTypeId'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                grade[field] = req.body[field];
            }
        }

        // Recalculate letter grade if score changed
        if (req.body.score !== undefined || req.body.maxScore !== undefined) {
            const scale = await GradingScale.findOne({ tenantId });
            if (scale) {
                grade.letterGrade = scale.getLetterGrade(grade.percentage);
            }
        }

        await grade.save();

        await grade.populate([
            { path: 'studentId', select: 'firstName lastName studentIdNumber' },
            { path: 'classId', select: 'name' },
            { path: 'subjectId', select: 'name' },
            { path: 'gradeTypeId', select: 'name weight' },
        ]);

        res.status(200).json(grade);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Publish/unpublish a grade (make visible to student/parent)
 */
exports.publishGrade = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { isPublished } = req.body;

        const grade = await Grade.findOne({ _id: id, tenantId, deleted: false });
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Only admin or owner teacher can publish
        if (!(await isAdmin(req.user))) {
            if (!grade.teacherId || grade.teacherId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Can only publish your own grades' });
            }
        }

        grade.isPublished = isPublished !== false;
        await grade.save();

        res.status(200).json({ message: `Grade ${grade.isPublished ? 'published' : 'unpublished'}`, grade });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Soft delete a grade by ID
 */
exports.deleteGrade = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const grade = await Grade.findOne({ _id: id, tenantId, deleted: false });
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Teacher can only delete their own grades
        if (!(await isAdmin(req.user))) {
            if (!grade.teacherId || grade.teacherId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Can only delete your own grades' });
            }
        }

        grade.deleted = true;
        grade.deletedAt = new Date();
        await grade.save();

        res.status(200).json({ message: 'Grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get grades by class (for gradebook view)
 */
exports.getGradesByClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId } = req.params;
        const { subjectId, gradeTypeId, termId } = req.query;

        // Teacher scoping
        if (!(await isAdmin(req.user))) {
            const pairs = await getTeacherClassSubjectPairs(tenantId, req.user._id);
            const hasAccess = pairs.some(p => p.classId.toString() === classId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Not assigned to this class' });
            }
        }

        const query = { tenantId, classId, deleted: false };
        if (subjectId) query.subjectId = subjectId;
        if (gradeTypeId) query.gradeTypeId = gradeTypeId;
        if (termId) query.termId = termId;

        const grades = await Grade.find(query)
            .populate('studentId', 'firstName lastName studentIdNumber')
            .populate('subjectId', 'name')
            .populate('gradeTypeId', 'name weight')
            .sort({ 'studentId.lastName': 1, assessmentDate: -1 });

        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get grades by student
 */
exports.getGradesByStudent = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { studentId } = req.params;
        const { subjectId, termId, isPublished } = req.query;

        // Verify student exists and belongs to tenant
        const student = await Student.findOne({ _id: studentId, tenantId, deleted: false });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Teacher scoping: must be assigned to student's class
        if (!(await isAdmin(req.user))) {
            const pairs = await getTeacherClassSubjectPairs(tenantId, req.user._id);
            const hasAccess = pairs.some(p => p.classId.toString() === student.classId?.toString());
            if (!hasAccess) {
                return res.status(403).json({ message: 'Not assigned to this student\'s class' });
            }
        }

        const query = { tenantId, studentId, deleted: false };
        if (subjectId) query.subjectId = subjectId;
        if (termId) query.termId = termId;
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';

        const grades = await Grade.find(query)
            .populate('subjectId', 'name')
            .populate('gradeTypeId', 'name weight')
            .populate('teacherId', 'firstName lastName')
            .sort({ assessmentDate: -1 });

        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
