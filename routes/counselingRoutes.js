const express = require('express');
const router = express.Router();
const { saveSymptoms } = require('../controllers/counselingController');
const { jwtProtect } = require('../middleware/jwtMiddleware');

router.post('/save', jwtProtect, saveSymptoms);

module.exports = router;
