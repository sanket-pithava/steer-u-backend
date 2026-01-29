const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// UPDATED: Ab hum Firebase waale 'protect' ke bajaye, naye JWT middleware ko import karenge
const { jwtProtect } = require('../middleware/jwtMiddleware');

// UPDATED: Ab hum 'protect' ke bajaye 'jwtProtect' ka istemaal karenge
router.post('/create-order', jwtProtect, createOrder);
router.post('/verify', jwtProtect, verifyPayment);

module.exports = router;

