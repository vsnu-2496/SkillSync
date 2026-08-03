const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  difficulty: { type: String, default: 'Medium' },
  questionsCount: { type: Number, default: 0 },
  avgSalary: { type: String, default: '₹10L – ₹25L' },
  hiringStatus: { type: String, default: 'Actively Hiring' },
  internship: { type: Boolean, default: true },
  internshipAvailability: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  requiredSkills: { type: [String], default: [] },
  roles: { type: [String], default: [] },
  popularRoles: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
