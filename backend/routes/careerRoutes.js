const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getRecommendations } = require('../controllers/careerController');

// Using / as the base for careers, so this will be GET /api/careers/recommendations
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;
