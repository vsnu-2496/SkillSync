const User = require('../models/User');
const { calculateCareerMap, getSkillGaps } = require('../services/careerService');

/**
 * Calculates real-time career recommendations based on user skills.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.topRole === 'Not Analyzed') {
      return res.status(200).json({ 
        success: true, 
        recommendations: [],
        message: "Neural matrix incomplete. Please upload a resume first."
      });
    }

    // Convert string skills to objects for the service
    const skillObjects = user.skills.map(s => ({ skill: s, score: 10 }));
    
    // Calculate mapping
    const rawMatches = calculateCareerMap(skillObjects);
    
    // Enrich with gaps
    const recommendations = rawMatches.map(match => {
      const gaps = getSkillGaps(skillObjects, match);
      return {
        domain: match.role,
        confidence_score: match.matchPercentage,
        matched_skills: match.requiredSkills.filter(s => user.skills.includes(s)),
        missing_skills: gaps
      };
    });

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (err) {
    console.error('Career Mapping Error:', err);
    res.status(500).json({ error: "Career mapping synchronization failed." });
  }
};
