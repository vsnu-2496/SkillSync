const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  refreshToken
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const imageUpload = require('../middleware/imageUpload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile/update', authMiddleware, updateProfile);
router.post('/profile/avatar', authMiddleware, imageUpload.single('avatar'), uploadAvatar);

module.exports = router;
