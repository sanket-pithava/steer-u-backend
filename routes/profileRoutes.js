// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, checkIntakeStatus } = require('../controllers/profileController.js'); 
const { jwtProtect } = require('../middleware/jwtMiddleware');
router.get('/', jwtProtect, getProfile); 
router.get('/me', jwtProtect, getProfile);
router.put('/update', jwtProtect, updateProfile);
router.get('/check-intake-status', jwtProtect, checkIntakeStatus); 

module.exports = router;
