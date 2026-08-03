/**
 * companyRoutes.js
 * ─────────────────────────────────────────────────────────────────────
 * Company Explorer — Job Portal API routes.
 * All original routes preserved; new RESTful routes added.
 */
const express = require('express');
const router  = express.Router();
const {
  getAllCompanies,
  searchCompanies,
  getCompanyDetail,
  getCompanyRoles,
  getRoleDetail
} = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/companies               — full list with metadata
router.get('/',               authMiddleware, getAllCompanies);

// GET /api/companies/search?q=     — text search (MUST be before /:name)
router.get('/search',         authMiddleware, searchCompanies);

// GET /api/companies/:name         — company detail + roles + match enrichment
router.get('/:name',          authMiddleware, getCompanyDetail);

// GET /api/companies/:name/roles   — list of available roles
router.get('/:name/roles',    authMiddleware, getCompanyRoles);

// GET /api/companies/:name/roles/:role — full JD + requirements + match data
router.get('/:name/roles/:role', authMiddleware, getRoleDetail);

module.exports = router;
