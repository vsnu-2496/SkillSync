const express = require('express');
const router = express.Router();
const { getAllCompanies, getCompanyByName } = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/companies
router.get('/', authMiddleware, getAllCompanies);

// GET /api/companies/:name
router.get('/:name', authMiddleware, getCompanyByName);

module.exports = router;
