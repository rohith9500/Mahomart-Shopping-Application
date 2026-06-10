const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  addSavedAddress,
  toggleWishlist,
} = require('../controllers/authController');

const {
  getProducts,
  getProductSuggestions,
  getProductById,
  createProductReview,
} = require('../controllers/productController');

const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
const Category = require('../models/Category');

// Category routes (inline list for simplicity)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auth routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/profile', protect, getUserProfile);
router.post('/auth/address', protect, addSavedAddress);
router.post('/auth/wishlist', protect, toggleWishlist);

// Product routes
router.get('/products', getProducts);
router.get('/products/suggest', getProductSuggestions);
router.get('/products/:id', getProductById);
router.post('/products/:id/reviews', protect, createProductReview);

// Order routes
router.post('/orders', protect, addOrderItems);
router.get('/orders/myorders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/status', protect, updateOrderStatus);

module.exports = router;
