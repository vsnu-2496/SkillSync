const User = require('../models/User');
const { calculateCareerMap, getSkillGaps } = require('../services/careerService');

// Mock Course Database (Real-world curriculum nodes)
const COURSE_DB = [
  { id: 1, title: "Modern Javascript Mastery", platform: "Udemy", level: "Intermediate", skill_covered: "Javascript", url: "#", type: "course" },
  { id: 2, title: "React Architecture: Patterns & Performance", platform: "Coursera", level: "Advanced", skill_covered: "React", url: "#", type: "course" },
  { id: 3, title: "Node.js Microservices Strategy", platform: "LinkedIn Learning", level: "Expert", skill_covered: "Node.js", url: "#", type: "certification" },
  { id: 4, title: "Python for Data Science & ML", platform: "IBM", level: "Beginner", skill_covered: "Python", url: "#", type: "certification" },
  { id: 5, title: "AWS Solutions Architect Associate", platform: "AWS Training", level: "Intermediate", skill_covered: "AWS", url: "#", type: "certification" },
  { id: 6, title: "Docker & Kubernetes: The Practical Guide", platform: "Udemy", level: "Advanced", skill_covered: "Docker", url: "#", type: "course" },
  { id: 7, title: "SQL for Backend Engineering", platform: "Khan Academy", level: "Intermediate", skill_covered: "SQL", url: "#", type: "course" },
  { id: 8, title: "Generative AI Fundamentals", platform: "Google Cloud", level: "Beginner", skill_covered: "AI", url: "#", type: "certification" }
];

/**
 * Generates dynamic course recommendations based on user skill gaps.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const domain = req.query.domain || user.topRole;
    let gaps = [];

    if (user.topRole === 'Not Analyzed') {
      // Fallback: If not analyzed, use registration interests to suggest introductory nodes
      gaps = user.interestMatrix.length > 0 ? user.interestMatrix : ["Javascript", "Python"];
    } else {
      // Real gaps from analyzed resume
      const skillObjects = user.skills.map(s => ({ skill: s, score: 10 }));
      const matches = calculateCareerMap(skillObjects);
      const targetMatch = matches.find(m => m.role === domain) || matches[0];
      gaps = getSkillGaps(skillObjects, targetMatch);
    }

    // Match gaps to COURSE_DB
    const recommendations = COURSE_DB.filter(course => 
      gaps.some(gap => course.skill_covered.toLowerCase().includes(gap.toLowerCase()) || 
                      gap.toLowerCase().includes(course.skill_covered.toLowerCase()))
    );

    // If no matches, return top trending courses as fallback
    const finalRecs = recommendations.length > 0 ? recommendations : COURSE_DB.slice(0, 4);

    res.status(200).json({
      success: true,
      domain: domain === 'Not Analyzed' ? 'Global Technology' : domain,
      missing_skills: gaps,
      recommendations: finalRecs
    });

  } catch (err) {
    console.error('Course Recommendation Error:', err);
    res.status(500).json({ error: "Learning node retrieval failed." });
  }
};
