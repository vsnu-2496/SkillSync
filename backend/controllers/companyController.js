const Company = require('../models/Company');
const TestQuestion = require('../models/TestQuestion');

/**
 * Get all target companies with live statistics.
 * GET /api/companies
 */
exports.getAllCompanies = async (req, res) => {
  try {
    let companies = await Company.find().sort({ name: 1 });

    // Seed default companies if collection is empty
    if (companies.length === 0) {
      const defaultCompanies = [
        { name: "Google", difficulty: "Hard", questionsCount: 45, avgSalary: "$140k - $220k", hiringStatus: "Actively Hiring", tags: ["Distributed Systems", "Algorithms", "System Design"], popularRoles: ["Software Engineer", "AI/ML Engineer"] },
        { name: "Amazon", difficulty: "Hard", questionsCount: 52, avgSalary: "$130k - $190k", hiringStatus: "Actively Hiring", tags: ["AWS", "Leadership Principles", "OOP"], popularRoles: ["SDE I", "SDE II", "Cloud Architect"] },
        { name: "Microsoft", difficulty: "Medium", questionsCount: 38, avgSalary: "$125k - $180k", hiringStatus: "Actively Hiring", tags: ["Azure", "Data Structures", "System Design"], popularRoles: ["Software Engineer", "Frontend Dev"] },
        { name: "Zoho", difficulty: "Medium", questionsCount: 30, avgSalary: "$70k - $110k", hiringStatus: "Actively Hiring", tags: ["Java", "Problem Solving", "Full Stack"], popularRoles: ["Software Developer", "QA Engineer"] },
        { name: "TCS", difficulty: "Easy", questionsCount: 60, avgSalary: "$50k - $80k", hiringStatus: "Hiring", tags: ["Aptitude", "C/C++", "Java"], popularRoles: ["System Engineer", "Assistant System Engineer"] },
        { name: "Meta", difficulty: "Hard", questionsCount: 40, avgSalary: "$150k - $230k", hiringStatus: "Selective", tags: ["React", "Algorithms", "System Design"], popularRoles: ["Frontend Engineer", "Full Stack Engineer"] }
      ];
      companies = await Company.insertMany(defaultCompanies);
    }

    res.status(200).json({
      success: true,
      companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, error: "Failed to fetch companies list" });
  }
};

/**
 * Get detailed company info & questions count
 * GET /api/companies/:name
 */
exports.getCompanyByName = async (req, res) => {
  try {
    const { name } = req.params;
    const company = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') });

    const questions = await TestQuestion.find({ companyName: new RegExp(name, 'i') });

    res.status(200).json({
      success: true,
      company: company || { name, difficulty: "Medium", questionsCount: questions.length, avgSalary: "$90k - $140k" },
      questions
    });
  } catch (error) {
    console.error("Error fetching company detail:", error);
    res.status(500).json({ success: false, error: "Failed to fetch company details" });
  }
};
