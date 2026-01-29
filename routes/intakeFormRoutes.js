// routes/intakeFormRoutes.js
const express = require('express');
const router = express.Router();
const { saveIntakeForm } = require('../controllers/intakeFormController');
const { jwtProtect } = require('../middleware/jwtMiddleware');

router.post('/submit', jwtProtect, saveIntakeForm);

module.exports = router;
