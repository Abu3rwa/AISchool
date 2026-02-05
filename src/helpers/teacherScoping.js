const ClassSubject = require('../models/ClassSubject');
const Role = require('../models/Role');

/**
 * Check if user has ADMIN role
 */
const isAdmin = async (user) => {
    if (!user || !user.roles) return false;

    for (const roleRef of user.roles) {
        let role;
        if (typeof roleRef === 'object' && roleRef.name) {
            role = roleRef;
        } else {
            role = await Role.findById(roleRef);
        }
        if (role && role.name && role.name.toUpperCase() === 'ADMIN') {
            return true;
        }
    }
    return false;
};

/**
 * Check if user has TEACHER role
 */
const isTeacher = async (user) => {
    if (!user || !user.roles) return false;

    for (const roleRef of user.roles) {
        let role;
        if (typeof roleRef === 'object' && roleRef.name) {
            role = roleRef;
        } else {
            role = await Role.findById(roleRef);
        }
        if (role && role.name && role.name.toUpperCase() === 'TEACHER') {
            return true;
        }
    }
    return false;
};

/**
 * Get all class IDs a teacher is assigned to
 */
const getTeacherClassIds = async (tenantId, teacherId) => {
    return ClassSubject.distinct('classId', { tenantId, teacherId });
};

/**
 * Get all subject IDs a teacher is assigned to for a specific class
 */
const getTeacherSubjectIds = async (tenantId, teacherId, classId) => {
    const query = { tenantId, teacherId };
    if (classId) query.classId = classId;
    return ClassSubject.distinct('subjectId', query);
};

/**
 * Get all class+subject pairs a teacher is assigned to
 * Returns array of { classId, subjectId }
 */
const getTeacherClassSubjectPairs = async (tenantId, teacherId) => {
    const assignments = await ClassSubject.find({ tenantId, teacherId }).select('classId subjectId');
    return assignments.map(a => ({ classId: a.classId, subjectId: a.subjectId }));
};

/**
 * Check if teacher has any assignment in a class
 * Returns true for ADMIN, throws for unauthorized teacher
 */
const requireTeacherClassAccess = async (user, classId) => {
    if (await isAdmin(user)) return true;

    const assigned = await ClassSubject.exists({
        tenantId: user.tenantId,
        classId,
        teacherId: user._id
    });

    if (!assigned) {
        const error = new Error('Not assigned to this class');
        error.status = 403;
        throw error;
    }
    return true;
};

/**
 * Check if teacher is assigned to a specific class+subject
 * Returns true for ADMIN, throws for unauthorized teacher
 */
const requireTeacherAssignment = async (user, classId, subjectId) => {
    if (await isAdmin(user)) return true;

    const assigned = await ClassSubject.exists({
        tenantId: user.tenantId,
        classId,
        subjectId,
        teacherId: user._id
    });

    if (!assigned) {
        const error = new Error('Not assigned to this class/subject');
        error.status = 403;
        throw error;
    }
    return true;
};

module.exports = {
    isAdmin,
    isTeacher,
    getTeacherClassIds,
    getTeacherSubjectIds,
    getTeacherClassSubjectPairs,
    requireTeacherClassAccess,
    requireTeacherAssignment
};
