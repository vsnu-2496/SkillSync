const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const { authMiddleware } = require('../middleware/auth');

router.post('/create', authMiddleware, vaultController.createExperience);
router.get('/all', authMiddleware, vaultController.getAllExperiences);
router.get('/company/:companyName', authMiddleware, vaultController.getByCompany);
router.put('/:id', authMiddleware, vaultController.updateExperience);
router.delete('/:id', authMiddleware, vaultController.deleteExperience);

module.exports = router;
