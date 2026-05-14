const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { startTest, getQuestions, submitTest } = require('../controllers/interviewController');

// POST /api/interview/start-test
router.post('/start-test', authMiddleware, startTest);

// GET /api/interview/questions
router.get('/questions', authMiddleware, getQuestions);

// POST /api/interview/submit
router.post('/submit', authMiddleware, submitTest);

module.exports = router;
