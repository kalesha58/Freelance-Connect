require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin1234';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
            existingAdmin.role = 'admin';
            existingAdmin.password = adminPassword; // This will trigger the pre-save hook
            await existingAdmin.save();
            console.log('Admin user updated successfully');
        } else {
            const adminUser = new User({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isProfileComplete: true
            });

            await adminUser.save();
            console.log('Admin user created successfully');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
