/**
 * Term Controller
 * ADMIN only - manage academic terms/semesters
 */
const Term = require('../models/Term');
const { isAdmin } = require('../helpers/teacherScoping');

/**
 * @desc Get all terms for tenant
 */
exports.getTerms = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { academicYear, isActive } = req.query;

        const query = { tenantId };
        if (academicYear) query.academicYear = academicYear;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const terms = await Term.find(query).sort({ startDate: -1 });
        res.status(200).json(terms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get current term
 */
exports.getCurrentTerm = async (req, res) => {
    try {
        const { tenantId } = req.user;

        const term = await Term.findOne({ tenantId, isCurrent: true, isActive: true });
        if (!term) {
            return res.status(404).json({ message: 'No current term set' });
        }

        res.status(200).json(term);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Create a new term (ADMIN only)
 */
exports.createTerm = async (req, res) => {
    try {
        const { tenantId } = req.user;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can create terms' });
        }

        const { name, startDate, endDate, academicYear, isCurrent } = req.body;

        if (!name || !startDate || !endDate || !academicYear) {
            return res.status(400).json({ message: 'Name, start date, end date, and academic year are required' });
        }

        const term = new Term({
            tenantId,
            name,
            startDate,
            endDate,
            academicYear,
            isCurrent: isCurrent || false,
        });

        await term.save();
        res.status(201).json(term);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Term with this name already exists for this academic year' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Update a term (ADMIN only)
 */
exports.updateTerm = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update terms' });
        }

        const term = await Term.findOne({ _id: id, tenantId });
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }

        const { name, startDate, endDate, academicYear, isActive } = req.body;

        if (name !== undefined) term.name = name;
        if (startDate !== undefined) term.startDate = startDate;
        if (endDate !== undefined) term.endDate = endDate;
        if (academicYear !== undefined) term.academicYear = academicYear;
        if (isActive !== undefined) term.isActive = isActive;

        await term.save();
        res.status(200).json(term);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Term with this name already exists for this academic year' });
        }
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Set a term as current (ADMIN only)
 */
exports.setCurrentTerm = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can set current term' });
        }

        const term = await Term.findOne({ _id: id, tenantId, isActive: true });
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }

        term.isCurrent = true;
        await term.save();

        res.status(200).json(term);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
