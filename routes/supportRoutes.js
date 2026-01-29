const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/SupportController');

router.post('/submit', submitFeedback);

module.exports = router;
