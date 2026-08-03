const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  startSession,
  submitAnswer,
  finishSession,
  getHistory
} = require('../controllers/mockInterviewController');

// All routes are JWT-protected
router.post('/start',  authMiddleware, startSession);
router.post('/answer', authMiddleware, submitAnswer);
router.post('/finish', authMiddleware, finishSession);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
