const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  getSkillMatrix, 
  getQuestionsByCompany 
} = require('../controllers/skillController');

// GET /api/skills/matrix
router.get('/matrix', authMiddleware, getSkillMatrix);
router.get('/questions/:companyName', authMiddleware, getQuestionsByCompany);

module.exports = router;
