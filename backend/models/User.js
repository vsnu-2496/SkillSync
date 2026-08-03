const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String },
  yearLevel: { type: String },
  interestMatrix: { type: [String], default: [] },
  department: { type: String },
  skills: { type: [String], default: [] },
  topRole: { type: String, default: 'Not Analyzed' },
  matchPercentage: { type: Number, default: 0 },
  skillGaps: { type: [String], default: [] },
  solvedQuestionsCount: { type: Number, default: 0 },
  performanceScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  techScore: { type: Number, default: 0 },
  profileCompleteness: { type: Number, default: 0 },
  resumeQuality: { type: String, default: 'Average' },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  education: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  projectsCount: { type: Number, default: 0 },
  internshipsCount: { type: Number, default: 0 },
  recentActivity: { type: [String], default: [] },
  role: { type: String, enum: ['student', 'senior', 'admin'], default: 'student' },

  // ─── Career Readiness Platform Fields ────────────────────────────────
  careerReadiness: { type: Number, default: 0 },
  interestScore: { type: Number, default: 0 },
  projectScore: { type: Number, default: 0 },
  internshipScore: { type: Number, default: 0 },
  certificationScore: { type: Number, default: 0 },
  keywordMatch: { type: Number, default: 0 },
  targetCompany: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  lastAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeAnalysis', default: null },
  analysisCount: { type: Number, default: 0 },
  profileImage: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  settings: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    privacyMode: { type: Boolean, default: false }
  },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
UserSchema.index({ refreshToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', UserSchema);
