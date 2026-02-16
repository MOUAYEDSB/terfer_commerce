const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    oldPrice: {
        type: Number,
        min: 0
    },
    wholesalePrice: {
        type: Number,
        min: 0
    },
    images: [{
        type: String,
        required: true
    }],
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Mode', 'High-Tech', 'Maison', 'Beauté', 'Bijoux', 'Sport', 'Enfants', 'Auto', 'Animaux', 'Accessoires']
    },
    subcategory: {
        type: String
    },
    brand: {
        type: String
    },
    colors: [{
        type: String
    }],
    sizes: [{
        type: String
    }],
    // Stock par variante (couleur + taille). Si vide, on utilise stock global.
    variants: [{
        color: { type: String, default: '' },
        size: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 0, default: 0 }
    }],
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shop: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Recalculer stock total à partir des variantes avant sauvegarde
productSchema.pre('save', function (next) {
    if (this.variants && this.variants.length > 0) {
        this.stock = this.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }
    next();
});

// Index pour la recherche
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
