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
    platformCommissionRate: {
        type: Number,
        default: 20, // 20% commission pour l'admin
        min: 0,
        max: 100
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

// Virtual pour le prix final avec commission (prix affiché au client)
productSchema.virtual('finalPrice').get(function() {
    return this.price * (1 + this.platformCommissionRate / 100);
});

// Virtual pour la commission de la plateforme
productSchema.virtual('platformCommission').get(function() {
    return this.price * (this.platformCommissionRate / 100);
});

// Virtual pour le prix que reçoit le vendeur
productSchema.virtual('sellerEarnings').get(function() {
    return this.price;
});

// Recalculer stock total a partir des variantes avant sauvegarde
productSchema.pre('save', function () {
    if (this.variants && this.variants.length > 0) {
        this.stock = this.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }
});

// Inclure les virtuals dans toJSON et toObject
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index pour la recherche
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
