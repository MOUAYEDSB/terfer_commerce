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
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middleware/rateLimitMiddleware');
const { forgotPassword, resetPassword, verifyResetToken } = require('../controllers/passwordResetController');

// Public routes
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/seller/:id', getSellerInfo);

// Password reset routes
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.get('/reset-password/:resetToken', verifyResetToken);

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
