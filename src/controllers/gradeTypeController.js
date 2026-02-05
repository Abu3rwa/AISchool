/**
 * GradeType Controller
 * ADMIN only - manage grade types (Classwork, Test, Exam, etc.)
 */
const GradeType = require('../models/GradeType');
const { isAdmin } = require('../helpers/teacherScoping');

/**
 * @desc Get all grade types for tenant
 */
exports.getGradeTypes = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { isActive } = req.query;

        const query = { tenantId };
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const gradeTypes = await GradeType.find(query).sort({ name: 1 });
        res.status(200).json(gradeTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new grade type (ADMIN only)
 */
exports.createGradeType = async (req, res) => {
    try {
        const { tenantId } = req.user;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create grade types' });
        }

        const { name, weight, maxScore } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const gradeType = new GradeType({
            tenantId,
            name,
            weight: weight || null,
            maxScore: maxScore || 100,
        });

        await gradeType.save();
        res.status(201).json(gradeType);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Grade type with this name already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a grade type (ADMIN only)
 */
exports.updateGradeType = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update grade types' });
        }

        const gradeType = await GradeType.findOne({ _id: id, tenantId });
        if (!gradeType) {
            return res.status(404).json({ message: 'Grade type not found' });
        }

        const { name, weight, maxScore, isActive } = req.body;

        if (name !== undefined) gradeType.name = name;
        if (weight !== undefined) gradeType.weight = weight;
        if (maxScore !== undefined) gradeType.maxScore = maxScore;
        if (isActive !== undefined) gradeType.isActive = isActive;

        await gradeType.save();
        res.status(200).json(gradeType);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Grade type with this name already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Deactivate a grade type (ADMIN only)
 */
exports.deleteGradeType = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can delete grade types' });
        }

        const gradeType = await GradeType.findOneAndUpdate(
            { _id: id, tenantId },
            { isActive: false },
            { new: true }
        );

        if (!gradeType) {
            return res.status(404).json({ message: 'Grade type not found' });
        }

        res.status(200).json({ message: 'Grade type deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
