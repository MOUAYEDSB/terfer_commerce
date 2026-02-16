const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getOrderByNumber,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getSellerOrders
} = require('../controllers/orderController');
const { protect, seller, admin } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller/myorders', protect, seller, getSellerOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/number/:orderNumber', protect, getOrderByNumber);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, seller, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
