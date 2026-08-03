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
    
    // Enrich with gaps and professional trajectory specs
    const recommendations = rawMatches.map(match => {
      const gaps = getSkillGaps(skillObjects, match);
      const matched = match.requiredSkills.filter(s => user.skills.includes(s));
      
      // Dynamic details based on role type
      let salaryRange = "$95k - $145k";
      let futureScope = "Steady expansion, 18% projected job role increase.";
      if (match.role.includes("AI/ML") || match.role.includes("Data")) {
        salaryRange = "$120k - $185k";
        futureScope = "Hyper-growth segment, massive industrial demand (+35%).";
      } else if (match.role.includes("Cloud") || match.role.includes("DevOps")) {
        salaryRange = "$115k - $170k";
        futureScope = "Critical infrastructure segment, continuous growth trajectory.";
      } else if (match.role.includes("Product") || match.role.includes("Manager") || match.role.includes("Analyst")) {
        salaryRange = "$100k - $155k";
        futureScope = "High corporate demand for cross-functional facilitators.";
      }

      return {
        domain: match.role,
        confidence_score: match.matchPercentage,
        matched_skills: matched,
        missing_skills: gaps,
        reason: matched.length > 0 
          ? `Your demonstrated competence in ${matched.slice(0, 3).join(', ')} aligns well with core guidelines for this domain.`
          : `A strong base profile in programming makes this a prospective transition field.`,
        future_scope: futureScope,
        salary_range: salaryRange,
        estimated_time: "5-7 Months",
        market_demand: match.matchPercentage > 75 ? "Extremely High" : "High",
        job_roles: [`Junior ${match.role}`, `${match.role} Lead`, "Solutions Consultant"],
        roadmap: [
          { phase: "Phase 1: Foundations", topics: matched.length > 0 ? matched.slice(0, 3) : ["Core Fundamentals", "Git Controls"] },
          { phase: "Phase 2: Optimization Nodes", topics: gaps.length > 0 ? gaps.slice(0, 3) : ["Advanced Architectures", "System Sync"] },
          { phase: "Phase 3: Practical Integration", topics: ["Real-world deployments", "Production Pipelines"] }
        ],
        priority_steps: [
          `Deep-dive into ${gaps[0] || "advanced techniques"} tutorials and build a demo.`,
          `Integrate ${gaps[1] || "testing paradigms"} to validate system operations.`,
          `Validate your understanding in mock tests.`
        ]
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
