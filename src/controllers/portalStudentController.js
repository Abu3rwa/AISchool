/**
 * Portal Student Controller
 * Handles student CRUD within school portal
 * ADMIN: full access
 * TEACHER: read-only for assigned classes
 */
const Student = require('../models/Student');
const Class = require('../models/Class');
const { isAdmin, getTeacherClassIds, requireTeacherClassAccess } = require('../helpers/teacherScoping');

/**
 * @desc Get all students (with optional classId filter)
 */
exports.getStudents = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId, isActive } = req.query;

        // Build query
        const query = { tenantId, deleted: false };

        // Filter by active status if provided
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // If teacher, restrict to assigned classes
        if (!(await isAdmin(req.user))) {
            const allowedClassIds = await getTeacherClassIds(tenantId, req.user._id);
            if (classId) {
                // Verify teacher has access to requested class
                if (!allowedClassIds.some(id => id.toString() === classId)) {
                    return res.status(403).json({ message: 'Not assigned to this class' });
                }
                query.classId = classId;
            } else {
                query.classId = { $in: allowedClassIds };
            }
        } else if (classId) {
            query.classId = classId;
        }

        const students = await Student.find(query)
            .populate('classId', 'name gradeLevel section')
            .sort({ lastName: 1, firstName: 1 });

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get single student by ID
 */
exports.getStudentById = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const student = await Student.findOne({ _id: id, tenantId, deleted: false })
            .populate('classId', 'name gradeLevel section');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // If teacher, verify access to student's class
        if (!(await isAdmin(req.user)) && student.classId) {
            await requireTeacherClassAccess(req.user, student.classId._id || student.classId);
        }

        res.status(200).json(student);
    } catch (error) {
        if (error.status === 403) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new student (ADMIN only)
 */
exports.createStudent = async (req, res) => {
    try {
        const { tenantId } = req.user;

        // Only ADMIN can create students
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create students' });
        }

        const {
            firstName,
            lastName,
            classId,
            studentIdNumber,
            email,
            gender,
            dateOfBirth,
            guardianName,
            guardianEmail,
            guardianPhone,
            secondaryGuardianName,
            secondaryGuardianEmail,
            secondaryGuardianPhone,
            notificationPreferences
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First name and last name are required' });
        }

        // Validate class exists if provided
        if (classId) {
            const classExists = await Class.findOne({ _id: classId, tenantId, deleted: false });
            if (!classExists) {
                return res.status(400).json({ message: 'Class not found' });
            }
        }

        const student = new Student({
            tenantId,
            firstName,
            lastName,
            classId: classId || null,
            studentIdNumber: studentIdNumber || null,
            email: email || null,
            gender: gender || null,
            dateOfBirth: dateOfBirth || null,
            guardianName: guardianName || null,
            guardianEmail: guardianEmail || null,
            guardianPhone: guardianPhone || null,
            secondaryGuardianName: secondaryGuardianName || null,
            secondaryGuardianEmail: secondaryGuardianEmail || null,
            secondaryGuardianPhone: secondaryGuardianPhone || null,
            notificationPreferences: notificationPreferences || { gradeUpdates: true, attendance: true, reports: true }
        });

        await student.save();

        // Populate class info before returning
        await student.populate('classId', 'name gradeLevel section');

        res.status(201).json(student);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Student ID number already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a student by ID (ADMIN only)
 */
exports.updateStudent = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can update students
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update students' });
        }

        const student = await Student.findOne({ _id: id, tenantId, deleted: false });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const allowedFields = [
            'firstName', 'lastName', 'classId', 'studentIdNumber', 'email',
            'gender', 'dateOfBirth', 'guardianName', 'guardianEmail', 'guardianPhone',
            'secondaryGuardianName', 'secondaryGuardianEmail', 'secondaryGuardianPhone',
            'notificationPreferences'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                student[field] = req.body[field] || null;
            }
        }

        // Validate class if being updated
        if (req.body.classId) {
            const classExists = await Class.findOne({ _id: req.body.classId, tenantId, deleted: false });
            if (!classExists) {
                return res.status(400).json({ message: 'Class not found' });
            }
        }

        await student.save();
        await student.populate('classId', 'name gradeLevel section');

        res.status(200).json(student);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Student ID number already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Set student active/inactive status (ADMIN only)
 */
exports.setStudentStatus = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { isActive } = req.body;

        // Only ADMIN can change status
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can change student status' });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const student = await Student.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { isActive },
            { new: true }
        ).populate('classId', 'name gradeLevel section');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Soft delete a student (ADMIN only)
 */
exports.deleteStudent = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Only ADMIN can delete students
        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete students' });
        }

        const student = await Student.findOneAndUpdate(
            { _id: id, tenantId, deleted: false },
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
