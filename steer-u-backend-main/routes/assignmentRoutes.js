// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const { submitAssignment } = require('../controllers/assignmentController');
const { jwtProtect } = require('../middleware/jwtMiddleware');

router.post('/submit', jwtProtect, submitAssignment);

module.exports = router;
