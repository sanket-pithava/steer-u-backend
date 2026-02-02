// routes/pricingRoutes.js
const express = require('express');
const { getPricing } = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/pricing - Get pricing based on user's country
router.get('/', protect, getPricing);

module.exports = router;