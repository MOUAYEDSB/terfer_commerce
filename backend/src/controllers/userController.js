const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, shopName, shopDescription } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            shopName: role === 'seller' ? shopName : undefined,
            shopDescription: role === 'seller' ? shopDescription : undefined
        });

        if (user) {
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

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                avatar: user.avatar,
                token: generateToken(user._id)
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
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Update seller info if seller
        if (user.role === 'seller') {
            user.shopName = req.body.shopName || user.shopName;
            user.shopDescription = req.body.shopDescription || user.shopDescription;
            user.shopLogo = req.body.shopLogo || user.shopLogo;
            user.shopBanner = req.body.shopBanner || user.shopBanner;
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
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add address to user
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { fullName, phone, address, city, postalCode, isDefault } = req.body;

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
            address.fullName = req.body.fullName || address.fullName;
            address.phone = req.body.phone || address.phone;
            address.address = req.body.address || address.address;
            address.city = req.body.city || address.city;
            address.postalCode = req.body.postalCode || address.postalCode;

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
        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

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

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getSellerInfo,
    getSellerStatistics,
    toggleFollowSeller,
    getSellerReviews
};
