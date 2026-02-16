const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        shop: {
            type: String,
            required: true
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: String,
        country: {
            type: String,
            default: 'Tunisia'
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Card', 'PayPal'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 7
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    tracking: [{
        status: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${year}-${String(count + 1001).padStart(4, '0')}`;
    }
});

// Index for queries (orderNumber already indexed via unique: true)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
