const User = require('../models/User');
const InterviewExperience = require('../models/InterviewExperience');
const Company = require('../models/Company');

/**
 * Fetches data-driven metrics for the user dashboard.
 */
exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Target Companies Count (Dynamic from Company model)
    const dbCompaniesCount = await Company.countDocuments();
    const vaultCompaniesCount = await InterviewExperience.distinct('companyName').then(list => list.length);
    const totalCompanies = Math.max(dbCompaniesCount, vaultCompaniesCount, 6);

    // 2. Prep Readiness Formula: (resumeScore * 0.6 + testScore * 0.4)
    const resumeScore = user.matchPercentage || user.atsScore || 0;
    const testScore = user.performanceScore || 0;
    const prepReadiness = Math.round((resumeScore * 0.6) + (testScore * 0.4));

    // 3. Recent Vault Submissions
    const recentExperiences = await InterviewExperience.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('companyName contributorName roundType createdAt');

    // 4. Dynamic Company Match percentages based on user matchPercentage
    const userBaseMatch = user.matchPercentage || 65;
    const companyMatches = [
      { name: "Google", match: Math.min(100, Math.max(40, userBaseMatch + 5)), color: "#4285F4" },
      { name: "Amazon", match: Math.min(100, Math.max(45, userBaseMatch)), color: "#FF9900" },
      { name: "Microsoft", match: Math.min(100, Math.max(35, userBaseMatch - 5)), color: "#00A4EF" },
      { name: "Zoho", match: Math.min(100, Math.max(50, userBaseMatch + 10)), color: "#E02020" },
      { name: "Meta", match: Math.min(100, Math.max(40, userBaseMatch - 10)), color: "#1877F2" }
    ];

    res.status(200).json({
      success: true,
      data: {
        userName: user.name,
        userRole: user.role,
        metrics: {
          careerSynergy: user.matchPercentage,
          prepReadiness: prepReadiness,
          performanceScore: user.performanceScore,
          criticalDeficits: user.skillGaps.length,
          targetCompanies: totalCompanies,
          atsScore: user.atsScore || user.matchPercentage || 0,
          techScore: user.techScore || 0,
          profileCompleteness: user.profileCompleteness || 0,
          resumeQuality: user.resumeQuality || 'Average',
          projectsCount: user.projectsCount || 0,
          internshipsCount: user.internshipsCount || 0,
          // New Career Readiness fields
          careerReadiness: user.careerReadiness || 0,
          interestScore: user.interestScore || 0,
          projectScore: user.projectScore || 0,
          internshipScore: user.internshipScore || 0,
          certificationScore: user.certificationScore || 0,
          keywordMatch: user.keywordMatch || 0,
          targetCompany: user.targetCompany || '',
          targetRole: user.targetRole || '',
          analysisCount: user.analysisCount || 0
        },
        skills: user.skills || [],
        topRole: user.topRole || 'Not Analyzed',
        skillGaps: user.skillGaps.length > 0 ? user.skillGaps.slice(0, 5) : ["System Design", "Cloud Architecture", "Unit Testing"],
        recentActivity: (user.recentActivity || []).slice(-5).reverse(),
        recentVault: recentExperiences || [],
        companyMatches,
        strengths: user.strengths || [],
        weaknesses: user.weaknesses || [],
        education: user.education || [],
        certifications: user.certifications || []
      }
    });

  } catch (error) {
    console.error('Dashboard Data Error:', error);
    res.status(500).json({ success: false, message: 'Server Error loading dashboard analytics' });
  }
};
