/**
 * ResumeAnalysis Model
 * Stores the full career readiness analysis result per user per session.
 * Enables comparison across multiple resume uploads and tracks history.
 *
 * v2 additions:
 *   - fingerprint: SHA-256 hash of (resumeText + company + jobRole) for deduplication
 *   - resumeFilename: original uploaded filename for display in history
 *   - fromCache: flag indicating if this was served from a cached result
 */
const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ─── Deduplication fingerprint ────────────────────────────────────────
  // SHA-256(normalizedResumeText + "|" + company.lower + "|" + jobRole.lower)
  // Allows instant cache lookup without re-running Gemini.
  fingerprint: {
    type: String,
    default: '',
    index: true   // fast lookup before calling AI
  },

  // Original filename for display in history
  resumeFilename: { type: String, default: 'resume' },

  // Target Job Context
  company: { type: String, required: true, trim: true },
  jobRole: { type: String, required: true, trim: true },
  jobDescription: { type: String, default: '' },
  jobDescriptionSource: {
    type: String,
    enum: ['jsearch', 'adzuna', 'arbeitnow', 'fallback_db'],
    default: 'fallback_db'
  },

  // Raw resume text (truncated for storage)
  resumeTextSnippet: { type: String, default: '' },

  // ─── Core AI Scores ───────────────────────────────────────────────
  atsScore:            { type: Number, default: 0, min: 0, max: 100 },
  careerReadiness:     { type: Number, default: 0, min: 0, max: 100 },
  keywordMatch:        { type: Number, default: 0, min: 0, max: 100 },

  // ─── Career Readiness Sub-scores (each /25) ───────────────────────
  interestScore:       { type: Number, default: 0, min: 0, max: 25 },
  projectScore:        { type: Number, default: 0, min: 0, max: 25 },
  internshipScore:     { type: Number, default: 0, min: 0, max: 25 },
  certificationScore:  { type: Number, default: 0, min: 0, max: 25 },

  // ─── Skill Analysis ───────────────────────────────────────────────
  matchedSkills:  { type: [String], default: [] },
  missingSkills:  { type: [String], default: [] },
  extractedSkills:{ type: [String], default: [] },

  // ─── Explainable AI ───────────────────────────────────────────────
  strengths:      { type: [String], default: [] },
  weaknesses:     { type: [String], default: [] },
  whyThisScore:   { type: String, default: '' },

  // Sub-score explanations (for expandable cards)
  interestExplanation:      { type: String, default: '' },
  projectExplanation:       { type: String, default: '' },
  internshipExplanation:    { type: String, default: '' },
  certificationExplanation: { type: String, default: '' },

  // ─── Recommendations ─────────────────────────────────────────────
  recommendations: {
    projects:       { type: [String], default: [] },
    internships:    { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    skills:         { type: [String], default: [] }
  },

  // ─── Career Roadmap ──────────────────────────────────────────────
  roadmap: { type: [String], default: [] },

  // ─── Future Score Projection ─────────────────────────────────────
  estimatedScoreAfterImprovements: { type: Number, default: 0, min: 0, max: 100 },

  // ─── Metadata ────────────────────────────────────────────────────
  analysisStatus: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  aiProvider:  { type: String, default: 'gemini' },
  fromCache:   { type: Boolean, default: false },  // true = served from dedup cache

  createdAt: { type: Date, default: Date.now }
});

// ─── Indexes ─────────────────────────────────────────────────────────────
// Fast user history lookups (newest first)
ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

// Fast deduplication lookup
ResumeAnalysisSchema.index({ userId: 1, fingerprint: 1 });

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
