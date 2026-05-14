const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  aptitudeQuestions: [{
    question: String,
    answer: String
  }],
  technicalQuestions: [{
    question: String,
    answer: String,
    topic: String
  }],
  hrQuestions: [{
    question: String,
    answer: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
