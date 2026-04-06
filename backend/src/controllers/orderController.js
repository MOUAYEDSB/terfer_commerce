const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const WHOLESALE_QTY_THRESHOLD = 10;

const normalize = (value) => String(value || '').trim().toLowerCase();

const findMatchingVariant = (variants, selectedColor, selectedSize) => {
    if (!Array.isArray(variants) || variants.length === 0) return null;

    const color = normalize(selectedColor);
    const size = normalize(selectedSize);

    return variants.find((variant) => {
        const variantColor = normalize(variant.color);
        const variantSize = normalize(variant.size);

        if (color && size) {
            return variantColor === color && variantSize === size;
        }
        if (color && !size) {
            return variantColor === color && !variantSize;
        }
        if (size && !color) {
            return variantSize === size && !variantColor;
        }
        return false;
    });
};

const resolveBasePrice = (product, quantity) => {
    if (product?.wholesalePrice && Number(quantity) >= WHOLESALE_QTY_THRESHOLD) {
        return Number(product.wholesalePrice);
    }
    return Number(product.price);
};

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

    // Calculer les totaux avec commission de plateforme
    let processedItems = [];
    let subtotal = 0;

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product ${item.product} not found`);
        }

        const quantity = Number(item.quantity) || 0;

        // Validate variant if needed
        if (product.variants && product.variants.length > 0) {
            const selectedVariant = findMatchingVariant(product.variants, item.selectedColor, item.selectedSize);
            if (!selectedVariant) {
                res.status(400);
                throw new Error(`Please select a valid variant for "${product.name}"`);
            }
            if (selectedVariant.quantity < quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for "${product.name}" variant`);
            }
        }

        // Prix de base du vendeur (wholesale si applicable)
        const sellerPrice = resolveBasePrice(product, quantity);

        // Commission de la plateforme (20% par défaut)
        const commissionRate = product.platformCommissionRate || 20;
        const platformCommission = (sellerPrice * commissionRate) / 100;

        // Prix final pour le client (prix vendeur + commission)
        const finalPrice = sellerPrice + platformCommission;

        // Total pour cet item
        const itemTotal = finalPrice * quantity;
        subtotal += itemTotal;

        processedItems.push({
            product: item.product,
            name: product.name,
            quantity: quantity,
            price: finalPrice, // Prix final avec commission
            sellerPrice: sellerPrice, // Prix que reçoit le vendeur
            platformCommission: platformCommission * quantity, // Commission totale
            image: product.images[0] || item.image,
            seller: product.seller,
            shop: product.shop,
            selectedColor: item.selectedColor || '',
            selectedSize: item.selectedSize || ''
        });
    }

    const shippingCost = 7; // Fixed shipping cost
    const total = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: processedItems,
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
    for (const item of processedItems) {
        const product = await Product.findById(item.product);
        if (product) {
            if (product.variants && product.variants.length > 0) {
                const variant = findMatchingVariant(product.variants, item.selectedColor, item.selectedSize);
                if (variant) {
                    variant.quantity = Math.max(0, (variant.quantity || 0) - item.quantity);
                }
                product.stock = product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
            } else {
                product.stock = Math.max(0, (product.stock || 0) - item.quantity);
            }
            await product.save();
        }
    }

    const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images');

    try {
        await sendOrderConfirmationEmail(populatedOrder.user, populatedOrder);
    } catch (error) {
        console.error('Order confirmation email failed:', error.message || error);
    }

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
            if (product.variants && product.variants.length > 0) {
                const variant = findMatchingVariant(product.variants, item.selectedColor, item.selectedSize);
                if (variant) {
                    variant.quantity = (variant.quantity || 0) + item.quantity;
                }
                product.stock = product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
            } else {
                product.stock = (product.stock || 0) + item.quantity;
            }
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
