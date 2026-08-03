const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestion' },
  questionText: { type: String },
  userAnswer: { type: String, default: '' },
  correctAnswer: { type: String },
  score: { type: Number, default: 0 },          // 0-100
  tier: { type: String, default: 'Not Answered' }, // Excellent / Good / Needs Work / Poor
  missedKeywords: { type: [String], default: [] },
  matchedKeywords: { type: [String], default: [] },
  timeTaken: { type: Number, default: 0 }        // seconds
}, { _id: false });

const MockSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  currentIndex: { type: Number, default: 0 },
  answers: { type: [AnswerSchema], default: [] },
  totalScore: { type: Number, default: 0 },
  percentile: { type: Number, default: 0 },
  totalTimeTaken: { type: Number, default: 0 },  // seconds
  questionCount: { type: Number, default: 7 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('MockSession', MockSessionSchema);
