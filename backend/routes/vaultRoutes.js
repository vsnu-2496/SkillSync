const express = require('express');
const router = express.Router();
const { getAllExperiences, createExperience, getByCompany } = require('../controllers/vaultController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/vault/get
router.get('/get', authMiddleware, getAllExperiences);

// POST /api/vault/save
router.post('/save', authMiddleware, createExperience);

// GET /api/vault/company/:companyName
router.get('/company/:companyName', authMiddleware, getByCompany);

module.exports = router;
