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
  recentActivity: { type: [String], default: [] },
  role: { type: String, enum: ['student', 'senior'], default: 'student' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
