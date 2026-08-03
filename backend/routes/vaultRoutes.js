const express = require('express');
const router = express.Router();
const { getAllExperiences, createExperience, getByCompany, updateExperience, deleteExperience } = require('../controllers/vaultController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/vault/get
router.get('/get', authMiddleware, getAllExperiences);

// POST /api/vault/save
router.post('/save', authMiddleware, createExperience);

// PUT /api/vault/update/:id
router.put('/update/:id', authMiddleware, updateExperience);

// DELETE /api/vault/delete/:id
router.delete('/delete/:id', authMiddleware, deleteExperience);

// GET /api/vault/company/:companyName
router.get('/company/:companyName', authMiddleware, getByCompany);

module.exports = router;
