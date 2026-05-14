const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [String],
  targetRole: String,
  gapSkills: [String],
  analysisResult: Object
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
