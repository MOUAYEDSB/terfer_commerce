const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    updateNotifications,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getSellerInfo,
    getSellerStatistics,
    toggleFollowSeller,
    getSellerReviews
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middleware/rateLimitMiddleware');
const { forgotPassword, resetPassword, verifyResetToken } = require('../controllers/passwordResetController');

// Public routes
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);

// Seller public routes
router.get('/seller/:id', getSellerInfo);
router.get('/seller/:id/statistics', getSellerStatistics);
router.get('/seller/:id/reviews', getSellerReviews);

// Password reset routes
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.get('/reset-password/:resetToken', verifyResetToken);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);
router.put('/notifications', protect, updateNotifications);

router.post('/addresses', protect, addAddress);
router.route('/addresses/:addressId')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.post('/wishlist/:productId', protect, toggleWishlist);

// Seller follow route (protected)
router.post('/seller/:id/follow', protect, toggleFollowSeller);

module.exports = router;
