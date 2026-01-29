// routes/customQuestionRoutes.js
const express = require('express');
const router = express.Router();
const { saveCustomQuestions } = require('../controllers/customQuestionController');
const { jwtProtect } = require('../middleware/jwtMiddleware');

router.post('/save', jwtProtect, saveCustomQuestions);

module.exports = router;
