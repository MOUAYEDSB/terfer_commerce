const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const generatePassword = require('../utils/generatePassword');
const { sendSellerInviteEmail, sendSellerApprovedEmail, assertEmailConfigured } = require('../services/emailService');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculer les gains de la plateforme (commission de 20%)
    let platformEarnings = 0;
    let sellerEarnings = 0;
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const commission = item.platformCommission || (itemTotal * 0.20); // 20% par défaut
            platformEarnings += commission;
            sellerEarnings += (itemTotal - commission);
        });
    });
    
    const recentOrders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);

    const topSellers = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.seller',
                totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 }
    ]);

    // Populate seller info
    const populatedTopSellers = await User.populate(topSellers, {
        path: '_id',
        select: 'name email shopName'
    });

    res.json({
        totalUsers,
        totalSellers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        platformEarnings,
        sellerEarnings,
        platformCommissionRate: 20,
        recentOrders,
        topSellers: populatedTopSellers
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let query = {};
    
    if (role) {
        query.role = role;
    }
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { shopName: { $regex: search, $options: 'i' } }
        ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        users,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get user's products if seller
    let products = [];
    if (user.role === 'seller') {
        products = await Product.find({ seller: user._id });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .limit(10);

    res.json({
        user,
        products,
        orders
    });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const {
        name,
        email,
        role,
        isActive,
        isVerifiedSeller,
        phone,
        shopName,
        shopDescription,
        shopPhone,
        shopEmail,
        shopAddress,
        shopCity
    } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    const wasSellerVerified = !!user.isVerifiedSeller;

    if (user.role === 'seller') {
        if (isVerifiedSeller !== undefined) user.isVerifiedSeller = isVerifiedSeller;
        if (shopName !== undefined) user.shopName = shopName;
        if (shopDescription !== undefined) user.shopDescription = shopDescription;
        if (shopPhone !== undefined) user.shopPhone = shopPhone;
        if (shopEmail !== undefined) user.shopEmail = shopEmail;
        if (shopAddress !== undefined) user.shopAddress = shopAddress;
        if (shopCity !== undefined) user.shopCity = shopCity;
    }

    const updatedUser = await user.save();

    let approvalEmailSent = false;
    let approvalEmailError = null;
    const isNowSellerVerified = updatedUser.role === 'seller' && !!updatedUser.isVerifiedSeller;

    if (updatedUser.role === 'seller' && !wasSellerVerified && isNowSellerVerified) {
        try {
            await sendSellerApprovedEmail({
                sellerEmail: updatedUser.email,
                sellerName: updatedUser.name
            });
            approvalEmailSent = true;
        } catch (err) {
            approvalEmailError = err.message;
            console.error('Seller approval email error:', err.message);
        }
    }

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isVerifiedSeller: updatedUser.isVerifiedSeller,
        shopName: updatedUser.shopName,
        approvalEmailSent,
        approvalEmailError
    });
});

// @desc    Get admin stats with breakdowns (seller + weekly)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStatsDetailed = asyncHandler(async (req, res) => {
    const platformCommissionRate = 20;
    const platformCommissionFactor = platformCommissionRate / 100;

    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    const earningsAgg = await Order.aggregate([
        { $unwind: '$items' },
        {
            $addFields: {
                itemTotal: { $multiply: ['$items.price', '$items.quantity'] },
                commission: {
                    $ifNull: [
                        '$items.platformCommission',
                        { $multiply: [{ $multiply: ['$items.price', '$items.quantity'] }, platformCommissionFactor] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                platformEarnings: { $sum: '$commission' },
                sellerEarnings: { $sum: { $subtract: ['$itemTotal', '$commission'] } }
            }
        }
    ]);

    const platformEarnings = earningsAgg[0]?.platformEarnings || 0;
    const sellerEarnings = earningsAgg[0]?.sellerEarnings || 0;

    const recentOrders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);

    const sellerBreakdown = await Order.aggregate([
        { $unwind: '$items' },
        {
            $addFields: {
                itemTotal: { $multiply: ['$items.price', '$items.quantity'] },
                commission: {
                    $ifNull: [
                        '$items.platformCommission',
                        { $multiply: [{ $multiply: ['$items.price', '$items.quantity'] }, platformCommissionFactor] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$items.seller',
                grossSales: { $sum: '$itemTotal' },
                platformEarnings: { $sum: '$commission' },
                sellerEarnings: { $sum: { $subtract: ['$itemTotal', '$commission'] } },
                orders: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                grossSales: 1,
                platformEarnings: 1,
                sellerEarnings: 1,
                totalOrders: { $size: '$orders' }
            }
        },
        { $sort: { platformEarnings: -1 } }
    ]);

    const populatedSellerBreakdown = await User.populate(sellerBreakdown, {
        path: '_id',
        select: 'name email shopName'
    });

    const weeks = Math.max(1, Math.min(parseInt(req.query.weeks, 10) || 12, 104));
    const fromDate = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

    const weeklyBreakdown = await Order.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $unwind: '$items' },
        {
            $addFields: {
                itemTotal: { $multiply: ['$items.price', '$items.quantity'] },
                commission: {
                    $ifNull: [
                        '$items.platformCommission',
                        { $multiply: [{ $multiply: ['$items.price', '$items.quantity'] }, platformCommissionFactor] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $isoWeekYear: '$createdAt' },
                    week: { $isoWeek: '$createdAt' }
                },
                grossSales: { $sum: '$itemTotal' },
                platformEarnings: { $sum: '$commission' },
                sellerEarnings: { $sum: { $subtract: ['$itemTotal', '$commission'] } },
                orders: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                week: '$_id.week',
                grossSales: 1,
                platformEarnings: 1,
                sellerEarnings: 1,
                totalOrders: { $size: '$orders' }
            }
        },
        { $sort: { year: -1, week: -1 } }
    ]);

    const topSellers = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.seller',
                totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orders: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                totalSales: 1,
                totalOrders: { $size: '$orders' }
            }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 }
    ]);

    const populatedTopSellers = await User.populate(topSellers, {
        path: '_id',
        select: 'name email shopName'
    });

    res.json({
        totalUsers,
        totalSellers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        platformEarnings,
        sellerEarnings,
        platformCommissionRate,
        recentOrders,
        topSellers: populatedTopSellers,
        sellerBreakdown: populatedSellerBreakdown,
        weeklyBreakdown,
        weeklyFrom: fromDate,
        weeklyWeeks: weeks
    });
});

// @desc    Reset stats (delete all orders)
// @route   POST /api/admin/stats/reset
// @access  Private/Admin
const resetAdminStats = asyncHandler(async (req, res) => {
    const confirm = req.body?.confirm;

    if (confirm !== true) {
        res.status(400);
        throw new Error('Confirmation required');
    }

    const deleteResult = await Order.deleteMany({});
    await User.updateMany({ role: 'seller' }, { $set: { totalSales: 0, totalRevenue: 0 } });

    res.json({
        message: 'Stats reset',
        deletedOrders: deleteResult.deletedCount || 0
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Don't allow deleting admin accounts
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin account');
    }

    // If seller is deleted, also remove their products to avoid orphaned listings
    if (user.role === 'seller') {
        await Product.deleteMany({ seller: user._id });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

// @desc    Create a seller
// @route   POST /api/admin/sellers/create
// @access  Private/Admin
const createSeller = asyncHandler(async (req, res) => {
    const {
        email,
        name,
        shopName,
        shopDescription,
        phone
    } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();

    // Validation
    if (!normalizedEmail) {
        res.status(400);
        throw new Error('Email is required');
    }

    let emailConfigured = true;
    let emailConfigError = null;
    try {
        assertEmailConfigured();
    } catch (err) {
        emailConfigured = false;
        emailConfigError = err.message;

        // In production, do not create accounts if email invite can't be delivered
        if (process.env.NODE_ENV === 'production') {
            res.status(500);
            throw new Error(err.message);
        }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const trimmedName = (name || '').toString().trim();
    const trimmedShopName = (shopName || '').toString().trim();

    // If admin doesn't provide a name, use the input email (not a generated local-part).
    const sellerName = trimmedName || normalizedEmail;
    const sellerShopName = trimmedShopName || undefined;

    const generatedPassword = generatePassword({ length: 12 });

    // Create seller
    const seller = await User.create({
        name: sellerName,
        email: normalizedEmail,
        password: generatedPassword,
        phone,
        role: 'seller',
        shopName: sellerShopName,
        shopDescription,
        isActive: true,
        isVerifiedSeller: true
    });

    let emailSent = false;
    let emailError = emailConfigError;
    let emailResult = null;
    if (emailConfigured) {
        try {
            emailResult = await sendSellerInviteEmail({
                sellerEmail: seller.email,
                sellerName: seller.name,
                generatedPassword
            });
            emailSent = true;
            emailError = null;
        } catch (err) {
            emailError = err.message;
            // In production, keep behavior strict: rollback if email fails
            if (process.env.NODE_ENV === 'production') {
                await seller.deleteOne();
                res.status(500);
                throw new Error('Failed to send invite email. Seller account was not created.');
            }
        }
    }

    res.status(201).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName,
        shopDescription: seller.shopDescription,
        phone: seller.phone,
        isActive: seller.isActive,
        emailSent,
        emailError: emailSent ? null : emailError,
        emailResult: (process.env.NODE_ENV !== 'production') ? emailResult : undefined,
        generatedPassword: (!emailSent && process.env.NODE_ENV !== 'production') ? generatedPassword : null,
        message: emailSent
            ? 'Seller created successfully and invite email sent'
            : 'Seller created successfully, but invite email was not sent'
    });
});

// @desc    Create a customer
// @route   POST /api/admin/customers/create
// @access  Private/Admin
const createCustomer = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Name, email and password are required');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create customer
    const customer = await User.create({
        name,
        email,
        password,
        phone,
        role: 'customer',
        isActive: true
    });

    res.status(201).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        phone: customer.phone,
        isActive: customer.isActive,
        message: 'Customer created successfully'
    });
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const seller = req.query.seller;

    let query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (seller) {
        query.seller = seller;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('seller', 'name shopName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        products,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const seller = req.query.seller;

    let query = {};
    
    if (status) {
        query.status = status;
    }
    
    if (seller) {
        query['items.seller'] = seller;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name')
        .populate('items.seller', 'name shopName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        orders,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get sellers stats
// @route   GET /api/admin/sellers
// @access  Private/Admin
const getSellersStats = asyncHandler(async (req, res) => {
    const sellers = await User.find({ role: 'seller' }).select('-password');

    const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
        const products = await Product.countDocuments({ seller: seller._id });
        const orders = await Order.find({ 'items.seller': seller._id });
        
        const totalSales = orders.reduce((sum, order) => {
            const sellerItems = order.items.filter(item => 
                item.seller && item.seller.toString() === seller._id.toString()
            );
            return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0);
        }, 0);

        return {
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            shopName: seller.shopName,
            shopDescription: seller.shopDescription,
            isActive: seller.isActive,
            isVerifiedSeller: seller.isVerifiedSeller,
            createdAt: seller.createdAt,
            totalProducts: products,
            totalOrders: orders.length,
            totalSales: totalSales
        };
    }));

    res.json(sellersWithStats);
});

module.exports = {
    getAdminStats: getAdminStatsDetailed,
    resetAdminStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createSeller,
    createCustomer,
    getAllProducts,
    deleteProduct,
    getAllOrders,
    getSellersStats
};
