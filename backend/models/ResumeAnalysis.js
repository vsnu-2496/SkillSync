/**
 * ResumeAnalysis Model
 * Stores the full career readiness analysis result per user per session.
 * Single Source of Truth for the Career Intelligence Platform.
 */
const mongoose = require('mongoose');

const RankedRoleSchema = new mongoose.Schema({
  role: { type: String, required: true },
  matchPercentage: { type: Number, default: 0 },
  whyRecommended: { type: String, default: '' },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  growthPotential: { type: String, default: 'High' },
  avgSalary: { type: String, default: '₹10L – ₹25L' },
  hiringDemand: { type: String, default: 'High' },
  companiesHiring: { type: [String], default: [] },
  roadmap: { type: [String], default: [] },
  requiredProjects: { type: [String], default: [] },
  requiredCertifications: { type: [String], default: [] },
  interviewDifficulty: { type: String, default: 'Medium' }
}, { _id: false });

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  fingerprint: {
    type: String,
    default: '',
    index: true
  },

  resumeFilename: { type: String, default: 'resume' },

  // Target Job Context (Selected by user)
  company: { type: String, required: true, trim: true },
  jobRole: { type: String, required: true, trim: true },
  jobDescription: { type: String, default: '' },
  jobDescriptionSource: {
    type: String,
    enum: ['jsearch', 'adzuna', 'arbeitnow', 'fallback_db'],
    default: 'fallback_db'
  },

  resumeTextSnippet: { type: String, default: '' },

  // ─── Evidence-Based Career Recommendations (AI Output) ─────────────
  bestCareerRole: { type: String, default: 'Full Stack Developer' },
  bestCareerMatchPercentage: { type: Number, default: 88 },
  rankedCareerRoles: { type: [RankedRoleSchema], default: [] },

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
  fromCache:   { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
