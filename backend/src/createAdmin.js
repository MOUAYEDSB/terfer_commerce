const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'adminterfer@gmail.com' });

        if (adminExists) {
            console.log('Super admin already exists');
            console.log('Email:', adminExists.email);
            console.log('Role:', adminExists.role);
            console.log('Active:', adminExists.isActive);
            console.log('\nYou can login with:');
            console.log('Email: adminterfer@gmail.com');
            console.log('Password: adminterfer123');
            process.exit(0);
        }

        // Create super admin
        const admin = await User.create({
            name: 'TerFer Admin',
            email: 'adminterfer@gmail.com',
            password: 'adminterfer123',
            role: 'admin',
            isActive: true
        });

        console.log('Super admin created successfully:');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('\nLogin credentials:');
        console.log('Email: adminterfer@gmail.com');
        console.log('Password: adminterfer123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();
