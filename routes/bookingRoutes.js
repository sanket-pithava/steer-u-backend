// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const { jwtProtect } = require('../middleware/jwtMiddleware'); // Aapka auth middleware
router.post('/create', jwtProtect, createBooking);

router.get('/my-bookings', jwtProtect, getMyBookings);

module.exports = router;
