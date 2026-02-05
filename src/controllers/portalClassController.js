/**
 * Portal Class Controller
 * Handles class CRUD within school portal
 * ADMIN: full access
 * TEACHER: read-only for assigned classes
 */
const Class = require('../models/Class');
const Student = require('../models/Student');
const ClassSubject = require('../models/ClassSubject');
const { isAdmin, getTeacherClassIds } = require('../helpers/teacherScoping');

/**
 * @desc Get all classes
 */
exports.getClasses = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { isActive } = req.query;

        // Build query
        const query = { tenantId, deleted: false };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // If teacher, restrict to assigned classes
        if (!(await isAdmin(req.user))) {
            const allowedClassIds = await getTeacherClassIds(tenantId, req.user._id);
            query._id = { $in: allowedClassIds };
        }

        const classes = await Class.find(query).sort({ name: 1 });

        // Get student counts per class
        const classIds = classes.map(c => c._id);
        const studentCounts = await Student.aggregate([
            { $match: { tenantId, classId: { $in: classIds }, deleted: false, isActive: true } },
            { $group: { _id: '$classId', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        studentCounts.forEach(sc => {
            countMap[sc._id.toString()] = sc.count;
        });

        const classesWithCounts = classes.map(c => ({
            ...c.toObject(),
            studentCount: countMap[c._id.toString()] || 0
        }));

        res.status(200).json(classesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get single class by ID with students
 */
exports.getClassById = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const classDoc = await Class.findOne({ _id: id, tenantId, deleted: false });

        if (!classDoc) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // If teacher, verify they have access
        if (!(await isAdmin(req.user))) {
            const allowedClassIds = await getTeacherClassIds(tenantId, req.user._id);
            if (!allowedClassIds.some(cid => cid.toString() === id)) {
                return res.status(403).json({ message: 'Not assigned to this class' });
            }
        }

        // Get students in this class
        const students = await Student.find({ tenantId, classId: id, deleted: false })
            .sort({ lastName: 1, firstName: 1 });

        // Get subject assignments for this class
        const assignments = await ClassSubject.find({ tenantId, classId: id })
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName email');

        res.status(200).json({
            ...classDoc.toObject(),
            students,
            assignments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new class (ADMIN only)
 */
exports.createClass = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can create classes
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create classes' });
        }

        const { name, gradeLevel, section, academicYear, room } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Class name is required' });
        }

        const classDoc = new Class({
            tenantId,
            name,
            gradeLevel: gradeLevel || null,
            section: section || null,
            academicYear: academicYear || null,
            room: room || null
        });

        await classDoc.save();

        res.status(201).json({ ...classDoc.toObject(), studentCount: 0 });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Class name already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a class by ID (ADMIN only)
 */
exports.updateClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can update classes
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update classes' });
        }

        const classDoc = await Class.findOne({ _id: id, tenantId, deleted: false });
        if (!classDoc) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const { name, gradeLevel, section, academicYear, room } = req.body;

        if (name !== undefined) classDoc.name = name;
        if (gradeLevel !== undefined) classDoc.gradeLevel = gradeLevel || null;
        if (section !== undefined) classDoc.section = section || null;
        if (academicYear !== undefined) classDoc.academicYear = academicYear || null;
        if (room !== undefined) classDoc.room = room || null;

        await classDoc.save();

        res.status(200).json(classDoc);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Class name already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Set class active/inactive status (ADMIN only)
 */
exports.setClassStatus = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { isActive } = req.body;

        // Only ADMIN can change status
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can change class status' });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const classDoc = await Class.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { isActive },
            { new: true }
        );

        if (!classDoc) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json(classDoc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Soft delete a class (ADMIN only)
 */
exports.deleteClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can delete classes
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete classes' });
        }

        const classDoc = await Class.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { deleted: true, deletedAt: new Date(), isActive: false },
            { new: true }
        );

        if (!classDoc) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Remove student class associations
        await Student.updateMany(
            { tenantId, classId: id },
            { $set: { classId: null } }
        );

        // Remove class-subject assignments
        await ClassSubject.deleteMany({ tenantId, classId: id });

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
