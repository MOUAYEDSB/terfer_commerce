const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DEFAULT_ADMIN_EMAIL = 'adminterfer@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'AdminTerfer@123';

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });

        if (adminExists) {
            console.log('Super admin already exists');
            console.log('Email:', adminExists.email);
            console.log('Role:', adminExists.role);
            console.log('Active:', adminExists.isActive);
            console.log('\nYou can login with:');
            console.log('Email:', DEFAULT_ADMIN_EMAIL);
            console.log('Password:', DEFAULT_ADMIN_PASSWORD);
            process.exit(0);
        }

        // Create super admin
        const admin = await User.create({
            name: 'TerFer Admin',
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD,
            role: 'admin',
            isActive: true
        });

        console.log('Super admin created successfully:');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('\nLogin credentials:');
        console.log('Email:', DEFAULT_ADMIN_EMAIL);
        console.log('Password:', DEFAULT_ADMIN_PASSWORD);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();
