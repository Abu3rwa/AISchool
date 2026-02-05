/**
 * Portal Subject Controller
 * Handles subject CRUD within school portal
 * ADMIN: full access
 * TEACHER: read-only for assigned subjects
 */
const Subject = require('../models/Subject');
const ClassSubject = require('../models/ClassSubject');
const { isAdmin, getTeacherSubjectIds } = require('../helpers/teacherScoping');

/**
 * @desc Get all subjects
 */
exports.getSubjects = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { isActive, classId } = req.query;

        // Build query
        const query = { tenantId, deleted: false };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // If teacher, restrict to assigned subjects
        if (!(await isAdmin(req.user))) {
            const allowedSubjectIds = await getTeacherSubjectIds(tenantId, req.user._id, classId);
            query._id = { $in: allowedSubjectIds };
        }

        const subjects = await Subject.find(query).sort({ name: 1 });

        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get single subject by ID
 */
exports.getSubjectById = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const subject = await Subject.findOne({ _id: id, tenantId, deleted: false });

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // If teacher, verify they have access
        if (!(await isAdmin(req.user))) {
            const allowedSubjectIds = await getTeacherSubjectIds(tenantId, req.user._id);
            if (!allowedSubjectIds.some(sid => sid.toString() === id)) {
                return res.status(403).json({ message: 'Not assigned to this subject' });
            }
        }

        // Get class assignments for this subject
        const assignments = await ClassSubject.find({ tenantId, subjectId: id })
            .populate('classId', 'name gradeLevel section')
            .populate('teacherId', 'firstName lastName email');

        res.status(200).json({
            ...subject.toObject(),
            assignments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new subject (ADMIN only)
 */
exports.createSubject = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can create subjects
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create subjects' });
        }

        const { name, code } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Subject name is required' });
        }

        const subject = new Subject({
            tenantId,
            name,
            code: code || null
        });

        await subject.save();

        res.status(201).json(subject);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Subject code already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a subject by ID (ADMIN only)
 */
exports.updateSubject = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can update subjects
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update subjects' });
        }

        const subject = await Subject.findOne({ _id: id, tenantId, deleted: false });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const { name, code } = req.body;

        if (name !== undefined) subject.name = name;
        if (code !== undefined) subject.code = code || null;

        await subject.save();

        res.status(200).json(subject);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Subject code already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Set subject active/inactive status (ADMIN only)
 */
exports.setSubjectStatus = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { isActive } = req.body;

        // Only ADMIN can change status
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can change subject status' });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const subject = await Subject.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { isActive },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Soft delete a subject (ADMIN only)
 */
exports.deleteSubject = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can delete subjects
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete subjects' });
        }

        const subject = await Subject.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { deleted: true, deletedAt: new Date(), isActive: false },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Remove class-subject assignments
        await ClassSubject.deleteMany({ tenantId, subjectId: id });

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
