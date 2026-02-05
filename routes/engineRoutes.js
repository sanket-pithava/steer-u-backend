const express = require('express');
const router = express.Router();
const { analyzeAstro, getPrediction } = require('../controllers/engineController');
const { jwtProtect } = require('../middleware/jwtMiddleware'); // JWT middleware for security

/**
 * POST /api/engine/analyze_astro
 * Analyzes a single birth chart and answers questions
 * Requires: Bearer token authentication
 */
router.post('/analyze_astro', jwtProtect, analyzeAstro);

/**
 * POST /api/engine/get-prediction
 * Legacy endpoint - maintained for backwards compatibility
 */
router.post('/get-prediction', jwtProtect, getPrediction);

module.exports = router;

