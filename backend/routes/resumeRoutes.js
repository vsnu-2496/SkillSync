/**
 * resumeRoutes.js
 * ─────────────────────────────────────────────────────────────────────
 * Career Readiness Platform routes.
 * All existing routes preserved — no breaking changes.
 */
const express = require('express');
const router = express.Router();
const {
  // Legacy (unchanged)
  analyzeResume,
  getResumeData,
  uploadResume,
  // Career Readiness
  analyzeCareer,
  getCompaniesAndRoles,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis
} = require('../controllers/resumeController');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// ─── Server-side timeout middleware (AI routes only) ──────────────────
// Returns clean 504 if Gemini doesn't respond — prevents hanging forever.
const aiTimeout = (ms) => (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`[Route Timeout] /analyze-career exceeded ${ms / 1000}s`);
      res.status(504).json({
        success: false,
        message: `AI analysis timed out after ${ms / 1000}s. The AI service is busy — please try again.`
      });
    }
  }, ms);
  res.on('finish', () => clearTimeout(timer));
  res.on('close',  () => clearTimeout(timer));
  next();
};

// ─── Legacy Routes (Unchanged) ────────────────────────────────────────
router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);
router.get('/data',     authMiddleware, getResumeData);

// ─── Career Readiness Routes ──────────────────────────────────────────
// POST  /api/resume/analyze-career   — Gemini AI analysis (150s timeout)
// GET   /api/resume/companies        — Company + role dropdowns
// GET   /api/resume/history          — Paginated history (search/filter/sort)
// GET   /api/resume/history/:id      — Full analysis by ID
// DELETE /api/resume/history/:id     — Delete one analysis
router.post('/analyze-career', authMiddleware, aiTimeout(150000), upload.single('resume'), analyzeCareer);
router.get('/companies',       authMiddleware, getCompaniesAndRoles);
router.get('/history',         authMiddleware, getAnalysisHistory);
router.get('/history/:id',     authMiddleware, getAnalysisById);
router.delete('/history/:id',  authMiddleware, deleteAnalysis);

module.exports = router;
