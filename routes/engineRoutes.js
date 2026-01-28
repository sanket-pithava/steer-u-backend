const express = require('express');
const router = express.Router();
const { getPrediction } = require('../controllers/engineController');
const { jwtProtect } = require('../middleware/jwtMiddleware'); // JWT middleware for security

// Yeh route prediction laane ke liye use hoga.
// jwtProtect middleware yeh sunishchit karega ki sirf logged-in user hi iska istemaal kar sake.
router.post('/get-prediction', jwtProtect, getPrediction);

module.exports = router;

