const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createSeller,
    createCustomer,
    getAllProducts,
    deleteProduct,
    getAllOrders,
    getSellersStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Stats
router.get('/stats', getAdminStats);

// Users Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Create Users
router.post('/sellers/create', createSeller);
router.post('/customers/create', createCustomer);

// Products Management
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

// Orders Management
router.get('/orders', getAllOrders);

// Sellers Management
router.get('/sellers', getSellersStats);

module.exports = router;
