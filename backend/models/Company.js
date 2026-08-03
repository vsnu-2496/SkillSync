const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  logo: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  questionsCount: { type: Number, default: 0 },
  avgSalary: { type: String, default: '$100k - $150k' },
  hiringStatus: { type: String, enum: ['Actively Hiring', 'Hiring', 'Selective'], default: 'Actively Hiring' },
  tags: { type: [String], default: [] },
  popularRoles: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
