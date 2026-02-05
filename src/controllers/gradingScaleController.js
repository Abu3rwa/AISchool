/**
 * GradingScale Controller
 * ADMIN only - manage grading scale (letter grade boundaries)
 */
const GradingScale = require('../models/GradingScale');
const { isAdmin } = require('../helpers/teacherScoping');

/**
 * @desc Get tenant's grading scale
 */
exports.getGradingScale = async (req, res) => {
    try {
        const { tenantId } = req.user;

        let scale = await GradingScale.findOne({ tenantId });

        // If no scale exists, seed defaults
        if (!scale) {
            scale = await GradingScale.seedDefaults(tenantId);
        }

        res.status(200).json(scale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Update tenant's grading scale (ADMIN only)
 */
exports.updateGradingScale = async (req, res) => {
    try {
        const { tenantId } = req.user;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can update grading scale' });
        }

        const { scales } = req.body;

        if (!scales || !Array.isArray(scales) || scales.length === 0) {
            return res.status(400).json({ message: 'Scales array is required' });
        }

        // Validate scale entries
        for (const entry of scales) {
            if (!entry.letter || entry.minPercentage === undefined || entry.maxPercentage === undefined) {
                return res.status(400).json({ message: 'Each scale entry must have letter, minPercentage, and maxPercentage' });
            }
            if (entry.minPercentage > entry.maxPercentage) {
                return res.status(400).json({ message: 'minPercentage cannot be greater than maxPercentage' });
            }
        }

        const scale = await GradingScale.findOneAndUpdate(
            { tenantId },
            { scales },
            { new: true, upsert: true }
        );

        res.status(200).json(scale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc Reset grading scale to defaults (ADMIN only)
 */
exports.resetGradingScale = async (req, res) => {
    try {
        const { tenantId } = req.user;

        if (!(await isAdmin(req.user))) {
            return res.status(403).json({ message: 'Only admins can reset grading scale' });
        }

        // Delete existing and reseed
        await GradingScale.deleteOne({ tenantId });
        const scale = await GradingScale.seedDefaults(tenantId);

        res.status(200).json(scale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
