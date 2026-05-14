const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/upload', authMiddleware, upload.single('file'), resumeController.uploadResume);
router.get('/analysis', authMiddleware, resumeController.getAnalysis);
router.get('/recommendations', authMiddleware, resumeController.getRecommendations);

module.exports = router;
