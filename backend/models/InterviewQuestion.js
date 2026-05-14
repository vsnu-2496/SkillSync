const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true }, // Aptitude, Technical, HR, Coding
  question: { type: String, required: true },
  difficulty: { type: String, default: 'Medium' },
  tags: { type: [String] }
});

module.exports = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
