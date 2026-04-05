const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendSellerRegistrationPendingEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const getAuthCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
    };
};

const setAuthCookie = (res, token) => {
    res.cookie('auth_token', token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
    const options = getAuthCookieOptions();
    res.clearCookie('auth_token', {
        httpOnly: options.httpOnly,
        secure: options.secure,
        sameSite: options.sameSite,
        path: options.path
    });
};

const isValidPhone = (value) => {
    if (!value) return true;
    const normalized = String(value).replace(/\s+/g, '');
    return /^(\+216)?\d{8,12}$/.test(normalized);
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, shopName, shopDescription } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        if (!normalizedEmail || !password || !name) {
            res.status(400);
            throw new Error('Name, email and password are required');
        }

        // Check if user exists
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const userRole = role || 'customer';

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: userRole,
            shopName: userRole === 'seller' ? shopName : undefined,
            shopDescription: userRole === 'seller' ? shopDescription : undefined,
            isVerifiedSeller: userRole === 'seller' ? false : undefined
        });

        if (user) {
            if (user.role === 'seller') {
                let emailSent = false;
                let emailError = null;

                try {
                    await sendSellerRegistrationPendingEmail({
                        sellerEmail: user.email,
                        sellerName: user.name,
                        shopName: user.shopName
                    });
                    emailSent = true;
                } catch (err) {
                    emailError = err.message;
                    console.error('Seller pending email error:', err.message);
                }

                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    shopName: user.shopName,
                    isVerifiedSeller: user.isVerifiedSeller,
                    emailSent,
                    emailError: emailSent ? null : emailError,
                    message: 'Inscription vendeur reçue. Votre compte est en attente de validation par l’administrateur.'
                });
                return;
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            res.status(400);
            throw new Error('Email and password are required');
        }

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (user && user.isActive !== false && (await user.matchPassword(password))) {
            if (user.role === 'seller' && !user.isVerifiedSeller) {
                res.status(403);
                throw new Error('Votre compte vendeur est en attente de validation par l’administrateur.');
            }
            const token = generateToken(user._id);
            setAuthCookie(res, token);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                shopDescription: user.shopDescription,
                shopLogo: user.shopLogo,
                shopBanner: user.shopBanner,
                phone: user.phone,
                businessType: user.businessType,
                shopAddress: user.shopAddress,
                shopCity: user.shopCity,
                shopPostalCode: user.shopPostalCode,
                location: user.location,
                bankAccount: user.bankAccount,
                bankName: user.bankName,
                accountHolder: user.accountHolder,
                notifications: user.notifications,
                avatar: user.avatar,
                isVerifiedSeller: user.isVerifiedSeller,
                token
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('wishlist', 'name price images rating');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            addresses: user.addresses,
            wishlist: user.wishlist,
            shopName: user.shopName,
            shopDescription: user.shopDescription,
            shopLogo: user.shopLogo,
            shopBanner: user.shopBanner,
            businessType: user.businessType,
            shopAddress: user.shopAddress,
            shopCity: user.shopCity,
            shopPostalCode: user.shopPostalCode,
            location: user.location,
            bankAccount: user.bankAccount,
            bankName: user.bankName,
            accountHolder: user.accountHolder,
            notifications: user.notifications,
            isVerifiedSeller: user.isVerifiedSeller
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (req.body.phone !== undefined && !isValidPhone(req.body.phone)) {
            res.status(400);
            throw new Error('Numéro de téléphone invalide');
        }

        if (req.body.name !== undefined) {
            const normalizedName = String(req.body.name || '').trim();
            if (!normalizedName) {
                res.status(400);
                throw new Error('Nom invalide');
            }
            user.name = normalizedName;
        }
        if (req.body.phone !== undefined) user.phone = String(req.body.phone || '').trim();
        if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

        if (req.body.email !== undefined) {
            const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

            if (!normalizedEmail) {
                res.status(400);
                throw new Error('Email invalide');
            }

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                res.status(400);
                throw new Error('Email déjà utilisé');
            }

            user.email = normalizedEmail;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Update seller info if seller
        if (user.role === 'seller') {
            user.shopName = req.body.shopName || user.shopName;
            user.shopDescription = req.body.shopDescription || user.shopDescription;
            user.shopLogo = req.body.shopLogo || user.shopLogo;
            user.shopBanner = req.body.shopBanner || user.shopBanner;

            user.businessType = req.body.businessType || user.businessType;

            // Accept both "shop*" fields and generic form fields from the frontend settings page.
            user.shopAddress = req.body.shopAddress || req.body.address || user.shopAddress;
            user.shopCity = req.body.shopCity || req.body.city || user.shopCity;
            user.shopPostalCode = req.body.shopPostalCode || req.body.postalCode || user.shopPostalCode;
            user.location = req.body.location || req.body.country || user.location;

            user.bankAccount = req.body.bankAccount || user.bankAccount;
            user.bankName = req.body.bankName || user.bankName;
            user.accountHolder = req.body.accountHolder || user.accountHolder;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            shopName: updatedUser.shopName,
            shopDescription: updatedUser.shopDescription,
            shopLogo: updatedUser.shopLogo,
            shopBanner: updatedUser.shopBanner,
            businessType: updatedUser.businessType,
            shopAddress: updatedUser.shopAddress,
            shopCity: updatedUser.shopCity,
            shopPostalCode: updatedUser.shopPostalCode,
            location: updatedUser.location,
            bankAccount: updatedUser.bankAccount,
            bankName: updatedUser.bankName,
            accountHolder: updatedUser.accountHolder,
            notifications: updatedUser.notifications,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change current user's password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Current password and new password are required');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
const updateNotifications = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const body = req.body || {};

    // Accept both API shape {orders, products, emails} and frontend shape
    // {orderNotifications, productNotifications, emailUpdates}.
    const orders = body.orders ?? body.orderNotifications;
    const products = body.products ?? body.productNotifications;
    const emails = body.emails ?? body.emailUpdates;

    if (typeof orders === 'boolean') user.notifications.orders = orders;
    if (typeof products === 'boolean') user.notifications.products = products;
    if (typeof emails === 'boolean') user.notifications.emails = emails;

    await user.save();

    res.json({ success: true, notifications: user.notifications });
});

// @desc    Add address to user
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { fullName, phone, address, city, postalCode, country, label, notes, isDefault } = req.body;

        if (!fullName || !phone || !address || !city || !postalCode) {
            res.status(400);
            throw new Error('fullName, phone, address, city and postalCode are required');
        }

        if (!isValidPhone(phone)) {
            res.status(400);
            throw new Error('Numéro de téléphone invalide');
        }

        // If this is default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            fullName,
            phone,
            address,
            city,
            postalCode,
            country: country || 'Tunisia',
            label: label || 'home',
            notes: notes || '',
            isDefault: isDefault || user.addresses.length === 0
        });

        await user.save();
        res.status(201).json(user.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const address = user.addresses.id(req.params.addressId);

        if (address) {
            if (req.body.phone !== undefined && !isValidPhone(req.body.phone)) {
                res.status(400);
                throw new Error('Numéro de téléphone invalide');
            }

            address.fullName = req.body.fullName || address.fullName;
            address.phone = req.body.phone || address.phone;
            address.address = req.body.address || address.address;
            address.city = req.body.city || address.city;
            address.postalCode = req.body.postalCode || address.postalCode;
            address.country = req.body.country || address.country;
            if (req.body.label !== undefined) address.label = req.body.label;
            if (req.body.notes !== undefined) address.notes = req.body.notes;

            if (req.body.isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
                address.isDefault = true;
            }

            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const addressToDelete = user.addresses.id(req.params.addressId);
        const deletingDefault = !!addressToDelete?.isDefault;

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

        if (deletingDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ message: 'Address deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add/Remove product from wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const productId = req.params.productId;
        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
        } else {
            // Add to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get seller info
// @route   GET /api/users/seller/:id
// @access  Public
const getSellerInfo = asyncHandler(async (req, res) => {
    const seller = await User.findById(req.params.id)
        .select('-password -resetPasswordToken -resetPasswordExpiry -emailVerificationToken')
        .populate('followers', 'name avatar');

    if (seller && seller.role === 'seller') {
        // Get product count
        const Product = require('../models/Product');
        const productCount = await Product.countDocuments({ seller: seller._id, isActive: true });
        
        // Get average rating from products
        const products = await Product.find({ seller: seller._id, isActive: true });
        const avgRating = products.length > 0
            ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
            : 0;
        
        // Get total reviews
        const totalReviews = products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0);

        res.json({
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            shopName: seller.shopName,
            shopDescription: seller.shopDescription,
            shopLogo: seller.shopLogo,
            shopBanner: seller.shopBanner,
            shopPhone: seller.shopPhone,
            shopEmail: seller.shopEmail,
            shopAddress: seller.shopAddress,
            shopCity: seller.shopCity,
            location: seller.location,
            isVerifiedSeller: seller.isVerifiedSeller,
            followersCount: seller.followersCount || 0,
            totalSales: seller.totalSales || 0,
            totalRevenue: seller.totalRevenue || 0,
            // Calculated stats
            productCount,
            avgRating: Number(avgRating.toFixed(1)),
            totalReviews,
            joinedDate: seller.createdAt
        });
    } else {
        res.status(404);
        throw new Error('Seller not found');
    }
});

// @desc    Get seller statistics
// @route   GET /api/users/seller/:id/statistics
// @access  Public
const getSellerStatistics = asyncHandler(async (req, res) => {
    const seller = await User.findById(req.params.id);

    if (!seller || seller.role !== 'seller') {
        res.status(404);
        throw new Error('Seller not found');
    }

    const Product = require('../models/Product');
    const Order = require('../models/Order');

    // Get all seller products
    const products = await Product.find({ seller: seller._id, isActive: true });
    const productIds = products.map(p => p._id);

    // Get orders containing seller products
    const orders = await Order.find({
        'items.product': { $in: productIds },
        status: 'delivered'
    });

    // Calculate statistics
    const stats = {
        totalProducts: products.length,
        totalSales: seller.totalSales || 0,
        totalRevenue: seller.totalRevenue || 0,
        avgRating: 0,
        totalReviews: 0,
        followersCount: seller.followersCount || 0,
        // Category breakdown
        categories: {},
        // Recent sales trend (last 30 days)
        recentOrders: 0
    };

    // Calculate average rating and reviews
    if (products.length > 0) {
        stats.avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length;
        stats.totalReviews = products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0);
    }

    // Calculate category breakdown
    products.forEach(product => {
        stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });

    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    stats.recentOrders = orders.filter(o => o.createdAt >= thirtyDaysAgo).length;

    res.json({
        success: true,
        statistics: stats
    });
});

// @desc    Follow/Unfollow a seller
// @route   POST /api/users/seller/:id/follow
// @access  Private
const toggleFollowSeller = asyncHandler(async (req, res) => {
    const seller = await User.findById(req.params.id);

    if (!seller || seller.role !== 'seller') {
        res.status(404);
        throw new Error('Seller not found');
    }

    const userId = req.user._id;
    const isFollowing = seller.followers.includes(userId);

    if (isFollowing) {
        // Unfollow
        seller.followers = seller.followers.filter(id => id.toString() !== userId.toString());
        seller.followersCount = Math.max(0, (seller.followersCount || 0) - 1);
    } else {
        // Follow
        seller.followers.push(userId);
        seller.followersCount = (seller.followersCount || 0) + 1;
    }

    await seller.save();

    res.json({
        success: true,
        following: !isFollowing,
        followersCount: seller.followersCount
    });
});

// @desc    Get seller reviews (from product reviews)
// @route   GET /api/users/seller/:id/reviews
// @access  Public
const getSellerReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const seller = await User.findById(req.params.id);

    if (!seller || seller.role !== 'seller') {
        res.status(404);
        throw new Error('Seller not found');
    }

    const Product = require('../models/Product');
    
    // Get all seller products with reviews
    const products = await Product.find({ 
        seller: seller._id, 
        isActive: true,
        'reviews.0': { $exists: true } // Only products with at least one review
    }).populate('reviews.user', 'name avatar');

    // Flatten all reviews with product context
    let allReviews = [];
    products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
            product.reviews.forEach(review => {
                allReviews.push({
                    ...review.toObject(),
                    productId: product._id,
                    productName: product.name,
                    productImage: product.images?.[0]
                });
            });
        }
    });

    // Sort by date (newest first)
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedReviews = allReviews.slice(skip, skip + Number(limit));

    res.json({
        success: true,
        count: paginatedReviews.length,
        total: allReviews.length,
        page: Number(page),
        pages: Math.ceil(allReviews.length / limit),
        reviews: paginatedReviews
    });
});

// @desc    Set default address
// @route   PATCH /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const target = user.addresses.id(req.params.addressId);
    if (!target) {
        res.status(404);
        throw new Error('Address not found');
    }

    user.addresses.forEach(addr => addr.isDefault = false);
    target.isDefault = true;

    await user.save();
    res.json(user.addresses);
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true, message: 'Déconnexion réussie' });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    toggleWishlist,
    getSellerInfo,
    getSellerStatistics,
    toggleFollowSeller,
    getSellerReviews,
    changePassword,
    updateNotifications
};
