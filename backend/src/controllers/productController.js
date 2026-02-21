const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, search, minPrice, maxPrice, seller, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by seller
    if (seller) {
        query.seller = seller;
    }

    // Filter by price range - utiliser le prix de base du vendeur pour le filtre
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search) {
        query.$text = { $search: search };
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else sortOption = { createdAt: -1 }; // newest first

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .populate('seller', 'name shopName')
        .sort(sortOption)
        .limit(Number(limit))
        .skip(skip);

    // Ajouter le prix final (avec commission) pour chaque produit
    const productsWithFinalPrice = products.map(product => {
        const productObj = product.toObject();
        const commissionRate = product.platformCommissionRate || 20;
        productObj.finalPrice = product.price * (1 + commissionRate / 100);
        if (product.wholesalePrice) {
            productObj.finalWholesalePrice = product.wholesalePrice * (1 + commissionRate / 100);
        }
        productObj.displayPrice = productObj.finalPrice; // Alias pour faciliter l'affichage
        return productObj;
    });

    const total = await Product.countDocuments(query);

    res.json({
        products: productsWithFinalPrice,
        page: Number(page),
        pages: Math.ceil(total / limit),
        total
    });
});

// Calcule stock par couleur et par taille à partir des variantes
const computeStockByColorAndSize = (variants) => {
    if (!variants || variants.length === 0) return { stockByColor: {}, stockBySize: {} };
    const stockByColor = {};
    const stockBySize = {};
    variants.forEach((v) => {
        if (v.color) {
            stockByColor[v.color] = (stockByColor[v.color] || 0) + (v.quantity || 0);
        }
        if (v.size) {
            stockBySize[v.size] = (stockBySize[v.size] || 0) + (v.quantity || 0);
        }
    });
    return { stockByColor, stockBySize };
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('seller', 'name shopName shopDescription email phone')
        .populate('reviews.user', 'name avatar');

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const productObj = product.toObject();
    
    // Ajouter le prix final avec commission
    const commissionRate = product.platformCommissionRate || 20;
    productObj.finalPrice = product.price * (1 + commissionRate / 100);
    productObj.displayPrice = productObj.finalPrice;
    productObj.platformCommission = product.price * (commissionRate / 100);
    if (product.wholesalePrice) {
        productObj.finalWholesalePrice = product.wholesalePrice * (1 + commissionRate / 100);
    }
    
    if (product.variants && product.variants.length > 0) {
        const { stockByColor, stockBySize } = computeStockByColorAndSize(product.variants);
        productObj.stockByColor = stockByColor;
        productObj.stockBySize = stockBySize;
        // Total stock = somme des variantes (cohérence)
        productObj.stock = product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    } else {
        productObj.stockByColor = {};
        productObj.stockBySize = {};
    }
    res.json(productObj);
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        oldPrice,
        wholesalePrice,
        images,
        category,
        subcategory,
        brand,
        stock,
        shop,
        colors,
        sizes,
        variants,
        platformCommissionRate
    } = req.body;

    let finalStock = Number(stock) || 0;
    let finalVariants = variants || [];
    if (finalVariants.length > 0) {
        finalStock = finalVariants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
    }

    const product = await Product.create({
        name,
        description,
        price,
        oldPrice,
        wholesalePrice,
        images,
        category,
        subcategory,
        brand,
        stock: finalStock,
        shop,
        seller: req.user._id,
        colors: colors || [],
        sizes: sizes || [],
        variants: finalVariants,
        platformCommissionRate: platformCommissionRate || 20
    });

    const productObj = product.toObject();
    
    // Ajouter le prix final avec commission
    const commissionRate = product.platformCommissionRate || 20;
    productObj.finalPrice = product.price * (1 + commissionRate / 100);
    productObj.displayPrice = productObj.finalPrice;
    productObj.platformCommission = product.price * (commissionRate / 100);
    
    if (product.variants && product.variants.length > 0) {
        const { stockByColor, stockBySize } = computeStockByColorAndSize(product.variants);
        productObj.stockByColor = stockByColor;
        productObj.stockBySize = stockBySize;
    } else {
        productObj.stockByColor = {};
        productObj.stockBySize = {};
    }
    res.status(201).json(productObj);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }

    const updateData = { ...req.body };
    if (updateData.variants && Array.isArray(updateData.variants) && updateData.variants.length > 0) {
        updateData.stock = updateData.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    const productObj = updatedProduct.toObject();
    
    // Ajouter le prix final avec commission
    const commissionRate = updatedProduct.platformCommissionRate || 20;
    productObj.finalPrice = updatedProduct.price * (1 + commissionRate / 100);
    productObj.displayPrice = productObj.finalPrice;
    productObj.platformCommission = updatedProduct.price * (commissionRate / 100);
    
    if (updatedProduct.variants && updatedProduct.variants.length > 0) {
        const { stockByColor, stockBySize } = computeStockByColorAndSize(updatedProduct.variants);
        productObj.stockByColor = stockByColor;
        productObj.stockBySize = stockBySize;
        productObj.stock = updatedProduct.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    } else {
        productObj.stockByColor = {};
        productObj.stockBySize = {};
    }
    res.json(productObj);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
    const products = await Product.find({
        category: req.params.category,
        isActive: true
    })
        .populate('seller', 'name shopName')
        .sort({ createdAt: -1 });

    res.json(products);
});

const toggleLikeProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const userId = req.user._id;

    const alreadyLiked = product.likes.includes(userId);

    if (alreadyLiked) {
        // Unlike
        await Product.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likes: userId },
                $inc: { likesCount: -1 }
            },
            { new: true }
        );
    } else {
        // Like
        await Product.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likes: userId },
                $inc: { likesCount: 1 }
            },
            { new: true }
        );
    }

    const updatedProduct = await Product.findById(req.params.id);

    res.json({
        success: true,
        liked: !alreadyLiked,
        likesCount: updatedProduct.likesCount
    });
});




module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsByCategory,
    toggleLikeProduct
};
