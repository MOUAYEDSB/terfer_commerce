const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(v) {
                // Password must contain: uppercase, lowercase, number, special char
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        },
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer'
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=random'
    },
    addresses: [{
        fullName: String,
        phone: String,
        address: String,
        city: String,
        postalCode: String,
        country: {
            type: String,
            default: 'Tunisia'
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Seller specific fields
    shopName: {
        type: String,
        trim: true
    },
    shopDescription: {
        type: String
    },
    shopLogo: {
        type: String
    },
    isVerifiedSeller: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpiry: {
        type: Date,
        select: false
    },
    // Email verification fields
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Index for search (email already indexed via unique: true)
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
