const mongoose = require('mongoose');

const TestQuestionSchema = new mongoose.Schema({
  domain: { type: String, required: true, index: true }, // e.g., Web Development, Data Science
  companyName: { type: String, index: true }, // Optional: Link question to a specific company
  type: { type: String, enum: ['MCQ', 'Technical', 'HR'], default: 'MCQ' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  question: { type: String, required: true },
  options: { type: [String], required: true }, // For MCQ
  answer: { type: String, required: true },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestQuestion', TestQuestionSchema, 'testquestions');
