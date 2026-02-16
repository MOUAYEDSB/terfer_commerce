const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsByCategory,
    toggleLikeProduct
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, seller, createProduct);
router.route('/:id')
    .put(protect, seller, updateProduct)
    .delete(protect, seller, deleteProduct);

router.post('/:id/reviews', protect, createProductReview);
router.post('/:id/like', protect, toggleLikeProduct);

module.exports = router;
