const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

    const { name, email, role, isActive, shopName, shopDescription } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    
    if (user.role === 'seller') {
        user.shopName = shopName || user.shopName;
        user.shopDescription = shopDescription || user.shopDescription;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        shopName: updatedUser.shopName
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

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

// @desc    Create a seller
// @route   POST /api/admin/sellers/create
// @access  Private/Admin
const createSeller = asyncHandler(async (req, res) => {
    const { name, email, password, shopName, shopDescription, phone } = req.body;

    // Validation
    if (!name || !email || !password || !shopName) {
        res.status(400);
        throw new Error('Name, email, password and shop name are required');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create seller
    const seller = await User.create({
        name,
        email,
        password,
        phone,
        role: 'seller',
        shopName,
        shopDescription,
        isActive: true,
        isVerifiedSeller: true
    });

    res.status(201).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName,
        shopDescription: seller.shopDescription,
        phone: seller.phone,
        isActive: seller.isActive,
        message: 'Seller created successfully'
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
            createdAt: seller.createdAt,
            totalProducts: products,
            totalOrders: orders.length,
            totalSales: totalSales
        };
    }));

    res.json(sellersWithStats);
});

module.exports = {
    getAdminStats,
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
