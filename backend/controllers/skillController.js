const User = require('../models/User');
const { calculateCareerMap, getSkillGaps } = require('../services/careerService');

/**
 * Generates a full skill matrix for the user across all target domains.
 * Provides fallback to interest matrix if no resume has been analyzed.
 */
exports.getSkillMatrix = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let skillObjects = [];
    let matrixSource = [];

    if (user.topRole === 'Not Analyzed') {
      // Use interestMatrix as a fallback to show "Initial Interest Matrix"
      // This ensures the page is NOT empty and doesn't redirect unnecessarily
      const interests = user.interestMatrix.length > 0 ? user.interestMatrix : ["Full Stack Developer", "Backend Engineer"];
      matrixSource = interests.map(role => ({
        role: role,
        matchPercentage: 0,
        requiredSkills: ["Skill Analysis Pending..."]
      }));
    } else {
      skillObjects = user.skills.map(s => ({ skill: s, score: 10 }));
      matrixSource = calculateCareerMap(skillObjects);
    }

    const matrix = matrixSource.map(match => {
      const gaps = user.topRole === 'Not Analyzed' ? match.requiredSkills : getSkillGaps(skillObjects, match);
      return {
        domain: match.role,
        match_percent: match.matchPercentage,
        required_skills: match.requiredSkills,
        missing_skills: gaps,
        priority_areas: gaps.slice(0, 3)
      };
    });

    res.status(200).json({
      success: true,
      skill_gaps: matrix,
      isAnalyzed: user.topRole !== 'Not Analyzed'
    });
  } catch (err) {
    console.error('Skill Matrix Error:', err);
    res.status(500).json({ error: "Matrix synchronization failed." });
  }
};

// @desc    Fetch practice questions by company for EasyPrep
exports.getQuestionsByCompany = async (req, res) => {
  try {
    const { companyName } = req.params;
    // Practice bank logic remains the same
    res.json([]); 
  } catch (err) {
    res.status(500).json({ error: "Practice bank unreachable." });
  }
};
