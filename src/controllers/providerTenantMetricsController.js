const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// Helper to verify tenant belongs to provider
const verifyTenant = async (tenantId, providerId) => {
    const tenant = await Tenant.findOne({ _id: tenantId, providerId, deleted: false });
    if (!tenant) {
        throw new Error('Tenant not found or access denied');
    }
    return tenant;
};

exports.getTenantMetrics = async (req, res) => {
    try {
        // Step 1: auth context
        const providerId = req.providerId;
        const { tenantId } = req.params;

        // Step 3: verify tenant belongs to provider
        try {
            await verifyTenant(tenantId, providerId);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // Step 4: do the operation
        const [usersCount, studentsCount, classesCount, subjectsCount] = await Promise.all([
            User.countDocuments({ tenantId, deleted: false }),
            Student.countDocuments({ tenantId, deleted: false }),
            Class.countDocuments({ tenantId, deleted: false }),
            Subject.countDocuments({ tenantId, deleted: false })
        ]);

        // Step 5: return response
        res.status(200).json({
            usersCount,
            studentsCount,
            classesCount,
            subjectsCount,
        });
    } catch (error) {
        // Step 6: catch errors
        res.status(500).json({ message: error.message });
    }
};
