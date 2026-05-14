const express = require('express');
const router = express.Router();
const { analyzeResume, getResumeData } = require('../controllers/resumeController');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// POST /api/resume/analyze
router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);

// GET /api/resume/data
router.get('/data', authMiddleware, getResumeData);

module.exports = router;
