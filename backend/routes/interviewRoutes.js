const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { startTest, getQuestions, submitTest, getCompanyQuestions, getTopics } = require('../controllers/interviewController');

// POST /api/interview/start-test
router.post('/start-test', authMiddleware, startTest);

// GET /api/interview/questions
router.get('/questions', authMiddleware, getQuestions);

// GET /api/interview/topics
router.get('/topics', authMiddleware, getTopics);

// GET /api/interview/company-questions/:company
router.get('/company-questions/:company', authMiddleware, getCompanyQuestions);

// POST /api/interview/submit
router.post('/submit', authMiddleware, submitTest);

module.exports = router;
