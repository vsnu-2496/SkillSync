const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { generateTest, submitTest } = require('../controllers/testController');

router.get('/generate', authMiddleware, generateTest);
router.post('/submit', authMiddleware, submitTest);

module.exports = router;
