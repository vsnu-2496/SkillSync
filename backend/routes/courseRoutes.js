const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getRecommendations } = require('../controllers/courseController');

// GET /api/courses/recommendations
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;
