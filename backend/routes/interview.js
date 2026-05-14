const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const InterviewQuestion = require('../models/InterviewQuestion');

// Search by company
router.get('/company/:companyName', authMiddleware, async (req, res) => {
  try {
    const questions = await InterviewQuestion.find({ 
      companyName: { $regex: req.params.companyName, $options: 'i' } 
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All companies list
router.get('/companies', authMiddleware, async (req, res) => {
  try {
    const companies = await InterviewQuestion.distinct('companyName');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
