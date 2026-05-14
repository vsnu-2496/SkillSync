const User = require('../models/User');
const InterviewExperience = require('../models/InterviewExperience');

/**
 * Fetches data-driven metrics for the dashboard.
 * Optimized to use pre-calculated analysis results from the User document.
 */
exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Target Companies Count (Dynamic)
    const companiesCount = await InterviewExperience.distinct('companyName').then(list => list.length);

    // 2. Prep Readiness (Based on formula: resumeScore * 0.6 + testScore * 0.4)
    const resumeScore = user.matchPercentage || 0;
    const testScore = user.performanceScore || 0;
    const prepReadiness = Math.round((resumeScore * 0.6) + (testScore * 0.4));

    // 3. Recent Guidance (Interview Vault)
    const recentExperiences = await InterviewExperience.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('companyName contributorName roundType createdAt');

    res.status(200).json({
      success: true,
      data: {
        userName: user.name,
        metrics: {
          careerSynergy: user.matchPercentage,
          prepReadiness: prepReadiness,
          performanceScore: user.performanceScore,
          criticalDeficits: user.skillGaps.length,
          targetCompanies: companiesCount
        },
        skills: user.skills,
        topRole: user.topRole,
        skillGaps: user.skillGaps.length > 0 ? user.skillGaps.slice(0, 5) : ["System Design", "Cloud Architecture", "Unit Testing"],
        recentActivity: user.recentActivity.slice(-5).reverse(),
        recentVault: recentExperiences,
        companyMatches: [
          { name: "Google", match: Math.min(user.matchPercentage + 5, 100), color: "#4285F4" },
          { name: "Amazon", match: user.matchPercentage, color: "#FF9900" },
          { name: "Microsoft", match: Math.max(user.matchPercentage - 10, 60), color: "#00A4EF" }
        ]
      }
    });

  } catch (error) {
    console.error('Dashboard Data Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
