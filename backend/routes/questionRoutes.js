const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getQuestionsByDomain, submitTest } = require('../controllers/questionController');

// GET /api/questions/ping
router.get('/ping', (req, res) => res.json({ status: "Neural Uplink Active" }));

// GET /api/questions/:domain
router.get('/:domain', authMiddleware, getQuestionsByDomain);

// POST /api/questions/submit
router.post('/submit', authMiddleware, submitTest);

module.exports = router;
