const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

/**
 * Validate stock availability for order items
 * Middleware to check if products have sufficient stock before order creation
 */
const validateOrderStock = asyncHandler(async (req, res, next) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next();
    }

    // Check each item has sufficient stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
            res.status(400);
            throw new Error(
                `Insufficient stock for "${product.name}". ` +
                `Available: ${product.stock} units, Requested: ${item.quantity} units`
            );
        }
    }

    next();
});

module.exports = validateOrderStock;
