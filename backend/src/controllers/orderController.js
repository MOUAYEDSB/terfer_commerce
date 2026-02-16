const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Calculate totals
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = 7; // Fixed shipping cost
    const total = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        status: 'confirmed',
        tracking: [{
            status: 'Commande confirmée',
            date: new Date()
        }]
    });

    // Update product stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock -= item.quantity;
            await product.save();
        }
    }

    const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images');

    res.status(201).json(populatedOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images')
        .populate('items.seller', 'name shopName');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json(order);
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
const getOrderByNumber = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
        .populate('user', 'name email phone')
        .populate('items.product', 'name images')
        .populate('items.seller', 'name shopName');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });

    res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Update status
    order.status = status;

    // Add tracking entry
    const trackingEntry = {
        status: getStatusLabel(status),
        date: new Date()
    };

    if (note) {
        trackingEntry.note = note;
    }

    order.tracking.push(trackingEntry);

    // Update delivered/cancelled dates
    if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'paid';
    } else if (status === 'cancelled') {
        order.cancelledAt = new Date();
        order.cancellationReason = note;
    }

    await order.save();

    res.json(order);
});

// Helper function to get status label
const getStatusLabel = (status) => {
    const labels = {
        'pending': 'En attente',
        'confirmed': 'Commande confirmée',
        'processing': 'En préparation',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
    };
    return labels[status] || status;
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to cancel this order');
    }

    // Can only cancel if not shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
        res.status(400);
        throw new Error('Cannot cancel order that has been shipped or delivered');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';

    order.tracking.push({
        status: 'Annulée',
        date: new Date(),
        note: order.cancellationReason
    });

    // Restore product stock
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    await order.save();

    res.json(order);
});

// @desc    Get seller orders
// @route   GET /api/orders/seller/myorders
// @access  Private/Seller
const getSellerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        'items.seller': req.user._id
    })
        .populate('user', 'name email phone')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });

    res.json(orders);
});

module.exports = {
    createOrder,
    getOrderById,
    getOrderByNumber,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getSellerOrders
};
