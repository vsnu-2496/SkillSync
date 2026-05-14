const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  roundType: {
    type: String,
    required: true,
    enum: ['Technical', 'HR', 'Managerial', 'Group Discussion', 'Online Assessment'],
    default: 'Technical'
  },
  questions: {
    type: [String],
    required: true
  },
  suggestions: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
