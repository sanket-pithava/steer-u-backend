const express = require('express');
const router = express.Router();
const { savePrediction, getMyPredictions } = require('../controllers/predictionController');
const { jwtProtect } = require('../middleware/jwtMiddleware');
router.post('/save', jwtProtect, savePrediction);

router.get('/my-predictions', jwtProtect, getMyPredictions);

module.exports = router;
