/**
 * Portal ClassSubject Controller
 * Handles teacher assignments to class+subject combinations
 * ADMIN only
 */
const ClassSubject = require('../models/ClassSubject');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Role = require('../models/Role');
const { isAdmin, isTeacher } = require('../helpers/teacherScoping');

/**
 * @desc Get all class-subject assignments
 */
exports.getAssignments = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId, teacherId, subjectId } = req.query;

        // Only ADMIN can list all assignments
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can view assignments' });
        }

        const query = { tenantId };
        if (classId) query.classId = classId;
        if (teacherId) query.teacherId = teacherId;
        if (subjectId) query.subjectId = subjectId;

        const assignments = await ClassSubject.find(query)
            .populate('classId', 'name gradeLevel section')
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new assignment (assign teacher to class+subject)
 */
exports.createAssignment = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can create assignments
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create assignments' });
        }

        const { classId, subjectId, teacherId } = req.body;

        if (!classId || !subjectId || !teacherId) {
            return res.status(400).json({ message: 'classId, subjectId, and teacherId are required' });
        }

        // Validate class exists
        const classDoc = await Class.findOne({ _id: classId, tenantId, deleted: false });
        if (!classDoc) {
            return res.status(400).json({ message: 'Class not found' });
        }

        // Validate subject exists
        const subject = await Subject.findOne({ _id: subjectId, tenantId, deleted: false });
        if (!subject) {
            return res.status(400).json({ message: 'Subject not found' });
        }

        // Validate teacher exists and has TEACHER role
        const teacherRole = await Role.findOne({ tenantId, name: 'TEACHER', deleted: false });
        if (!teacherRole) {
            return res.status(400).json({ message: 'Teacher role not found in tenant' });
        }

        const teacher = await User.findOne({
            _id: teacherId,
            tenantId,
            roles: teacherRole._id,
            deleted: false
        });
        if (!teacher) {
            return res.status(400).json({ message: 'Teacher not found' });
        }

        // Check if assignment already exists
        const existing = await ClassSubject.findOne({ tenantId, classId, subjectId });
        if (existing) {
            return res.status(400).json({ message: 'This class+subject already has a teacher assigned' });
        }

        const assignment = new ClassSubject({
            tenantId,
            classId,
            subjectId,
            teacherId
        });

        await assignment.save();

        // Populate and return
        await assignment.populate('classId', 'name gradeLevel section');
        await assignment.populate('subjectId', 'name code');
        await assignment.populate('teacherId', 'firstName lastName email');

        res.status(201).json(assignment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This class+subject already has a teacher assigned' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update an assignment (change teacher)
 */
exports.updateAssignment = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can update assignments
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update assignments' });
        }

        const { teacherId } = req.body;

        if (!teacherId) {
            return res.status(400).json({ message: 'teacherId is required' });
        }

        const assignment = await ClassSubject.findOne({ _id: id, tenantId });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Validate teacher exists and has TEACHER role
        const teacherRole = await Role.findOne({ tenantId, name: 'TEACHER', deleted: false });
        const teacher = await User.findOne({
            _id: teacherId,
            tenantId,
            roles: teacherRole._id,
            deleted: false
        });
        if (!teacher) {
            return res.status(400).json({ message: 'Teacher not found' });
        }

        assignment.teacherId = teacherId;
        await assignment.save();

        await assignment.populate('classId', 'name gradeLevel section');
        await assignment.populate('subjectId', 'name code');
        await assignment.populate('teacherId', 'firstName lastName email');

        res.status(200).json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Delete an assignment
 */
exports.deleteAssignment = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can delete assignments
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete assignments' });
        }

        const assignment = await ClassSubject.findOneAndDelete({ _id: id, tenantId });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get teacher's own assignments
 */
exports.getMyAssignments = async (req, res) => {
    try {
        const { tenantId, _id: teacherId } = req.user;

        const assignments = await ClassSubject.find({ tenantId, teacherId })
            .populate('classId', 'name gradeLevel section')
            .populate('subjectId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get teacher's assigned classes
 */
exports.getMyClasses = async (req, res) => {
    try {
        const { tenantId, _id: teacherId } = req.user;

        const classIds = await ClassSubject.distinct('classId', { tenantId, teacherId });

        const classes = await Class.find({
            _id: { $in: classIds },
            tenantId,
            deleted: false
        }).sort({ name: 1 });

        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get teacher's subjects for a specific class
 */
exports.getMySubjects = async (req, res) => {
    try {
        const { tenantId, _id: teacherId } = req.user;
        const { classId } = req.query;

        const query = { tenantId, teacherId };
        if (classId) query.classId = classId;

        const subjectIds = await ClassSubject.distinct('subjectId', query);

        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            tenantId,
            deleted: false
        }).sort({ name: 1 });

        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
