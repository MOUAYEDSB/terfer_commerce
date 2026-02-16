const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getSellerInfo
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/seller/:id', getSellerInfo);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/addresses', protect, addAddress);
router.route('/addresses/:addressId')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
