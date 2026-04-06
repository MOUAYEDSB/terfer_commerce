const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

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

        const quantity = Number(item.quantity) || 0;

        if (product.variants && product.variants.length > 0) {
            const variant = findMatchingVariant(product.variants, item.selectedColor, item.selectedSize);

            if (!variant) {
                res.status(400);
                throw new Error(`Please select a valid variant for "${product.name}"`);
            }

            if (variant.quantity < quantity) {
                res.status(400);
                throw new Error(
                    `Insufficient stock for "${product.name}" variant. ` +
                    `Available: ${variant.quantity} units, Requested: ${quantity} units`
                );
            }
        } else if (product.stock < quantity) {
            res.status(400);
            throw new Error(
                `Insufficient stock for "${product.name}". ` +
                `Available: ${product.stock} units, Requested: ${quantity} units`
            );
        }
    }

    next();
});

module.exports = validateOrderStock;
