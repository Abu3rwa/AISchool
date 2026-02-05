/**
 * Portal Teacher Controller
 * Handles teacher (User with TEACHER role) management
 * ADMIN only - teachers cannot manage other teachers
 */
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const ClassSubject = require('../models/ClassSubject');
const { isAdmin } = require('../helpers/teacherScoping');

/**
 * Generate a random temporary password
 */
const generateTempPassword = (length = 12) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
};

/**
 * Get TEACHER role for tenant
 */
const getTeacherRole = async (tenantId) => {
    return Role.findOne({ tenantId, name: 'TEACHER', deleted: false });
};

/**
 * @desc Get all teachers in tenant
 */
exports.getTeachers = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can list teachers
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can view teachers' });
        }

        // Find TEACHER role
        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(200).json([]);
        }

        // Find all users with TEACHER role
        const teachers = await User.find({
            tenantId,
            roles: teacherRole._id,
            deleted: false
        })
            .select('-password')
            .populate('roles', 'name')
            .sort({ lastName: 1, firstName: 1 });

        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get single teacher by ID
 */
exports.getTeacherById = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can view teacher details
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can view teacher details' });
        }

        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = await User.findOne({
            _id: id,
            tenantId,
            roles: teacherRole._id,
            deleted: false
        })
            .select('-password')
            .populate('roles', 'name');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Get teacher's assignments
        const assignments = await ClassSubject.find({ tenantId, teacherId: id })
            .populate('classId', 'name gradeLevel section')
            .populate('subjectId', 'name code');

        res.status(200).json({ ...teacher.toObject(), assignments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new teacher (returns temp password once)
 */
exports.createTeacher = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can create teachers
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create teachers' });
        }

        const { firstName, lastName, email, phoneNumber } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'First name, last name, and email are required' });
        }

        // Check email uniqueness (globally unique per User model)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Get or create TEACHER role
        let teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            teacherRole = new Role({
                tenantId,
                name: 'TEACHER',
                permissions: ['students.read', 'classes.read', 'subjects.read', 'grades.read', 'grades.write', 'attendance.read', 'attendance.write'],
                isDefault: false
            });
            await teacherRole.save();
        }

        // Generate temp password
        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const teacher = new User({
            tenantId,
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phoneNumber: phoneNumber || null,
            roles: [teacherRole._id],
            isActive: true
        });

        await teacher.save();

        // Return teacher with temp password (shown once)
        const teacherObj = teacher.toObject();
        delete teacherObj.password;

        res.status(201).json({
            ...teacherObj,
            tempPassword // Only returned on create
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update teacher info
 */
exports.updateTeacher = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can update teachers
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update teachers' });
        }

        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = await User.findOne({
            _id: id,
            tenantId,
            roles: teacherRole._id,
            deleted: false
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const { firstName, lastName, phoneNumber } = req.body;

        if (firstName) teacher.firstName = firstName;
        if (lastName) teacher.lastName = lastName;
        if (phoneNumber !== undefined) teacher.phoneNumber = phoneNumber || null;

        await teacher.save();

        const teacherObj = teacher.toObject();
        delete teacherObj.password;

        res.status(200).json(teacherObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Set teacher active/inactive status
 */
exports.setTeacherStatus = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { isActive } = req.body;

        // Only ADMIN can change status
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can change teacher status' });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = await User.findOneAndUpdate(
            { _id: id, tenantId, roles: teacherRole._id, deleted: false },
            { isActive },
            { new: true }
        ).select('-password');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Reset teacher password (returns temp password once)
 */
exports.resetTeacherPassword = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can reset passwords
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can reset passwords' });
        }

        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = await User.findOne({
            _id: id,
            tenantId,
            roles: teacherRole._id,
            deleted: false
        }).select('+password');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Generate new temp password
        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(tempPassword, salt);

        await teacher.save();

        res.status(200).json({ tempPassword });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Soft delete a teacher
 */
exports.deleteTeacher = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can delete teachers
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete teachers' });
        }

        const teacherRole = await getTeacherRole(tenantId);
        if (!teacherRole) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = await User.findOneAndUpdate(
            { _id: id, tenantId, roles: teacherRole._id, deleted: false },
            { deleted: true, deletedAt: new Date(), isActive: false },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Remove teacher's assignments
        await ClassSubject.deleteMany({ tenantId, teacherId: id });

        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
