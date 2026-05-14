const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contributorName: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  roundType: { type: String, required: true },
  questionsAsked: { type: String, required: true },
  suggestions: { type: String },
  importantTopics: { type: [String] },
  difficulty: { type: String, default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
