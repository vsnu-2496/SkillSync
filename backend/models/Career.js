const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendedPaths: [{
    title: String,
    matchScore: Number,
    reasons: [String]
  }],
  learningRoadmap: [{
    step: Number,
    title: String,
    duration: String,
    resources: [String]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Career', careerSchema);
