const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('./src/models/Tenant');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gradebooking');
        console.log('Connected to DB');

        const tenants = await Tenant.find({ deleted: false });
        console.log('\n--- TENANTS ---');
        for (const t of tenants) {
            console.log(`Name: ${t.name}, Slug: ${t.slug}, ID: ${t._id}`);

            const users = await User.find({ tenantId: t._id, deleted: false }).populate('roles');
            console.log(`  Users (${users.length}):`);
            users.forEach(u => {
                const roles = u.roles.map(r => r.name).join(', ');
                console.log(`    - ${u.firstName} ${u.lastName} (${u.email}) | Roles: [${roles}]`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
