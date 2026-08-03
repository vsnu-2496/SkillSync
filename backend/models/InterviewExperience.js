const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contributorName: { type: String, required: false, default: 'Anonymous User' },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  roundType: { type: String, required: true },
  questionsAsked: { type: [String], required: true },
  suggestions: { type: String },
  importantTopics: { type: [String] },
  difficulty: { type: String, default: 'Medium' },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
