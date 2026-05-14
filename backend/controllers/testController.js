const User = require('../models/User');
const InterviewQuestion = require('../models/InterviewQuestion');

/**
 * Generates a skill-based interview test.
 */
exports.generateTest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.skills.length === 0) {
      return res.status(200).json({ 
        success: true, 
        questions: [],
        message: "Neural matrix incomplete. Please upload a resume to generate tailored tests." 
      });
    }

    // Fetch questions matching user skills (case-insensitive tags)
    const skillsLower = user.skills.map(s => s.toLowerCase());
    
    let questions = await InterviewQuestion.find({
      $or: [
        { tags: { $in: skillsLower } },
        { category: 'Technical' } // Fallback to general technical questions
      ]
    }).limit(10);

    // If no specific skill questions, use general bank
    if (questions.length === 0) {
      questions = await InterviewQuestion.find({ category: 'Technical' }).limit(5);
    }

    res.status(200).json({
      success: true,
      skills: user.skills,
      questions: questions.map(q => ({
        id: q._id,
        question: q.question,
        difficulty: q.difficulty,
        category: q.category,
        tags: q.tags
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Test generation failed." });
  }
};

/**
 * Handles test submission and updates user performance metrics.
 */
exports.submitTest = async (req, res) => {
  try {
    const { score, questionsSolved } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Update metrics
    user.performanceScore = Math.min(user.performanceScore + score, 100);
    user.solvedQuestionsCount += questionsSolved;
    user.recentActivity.push(`Completed skill-based test. Score: ${score}%`);

    await user.save();

    res.status(200).json({
      success: true,
      newPerformanceScore: user.performanceScore,
      totalSolved: user.solvedQuestionsCount
    });
  } catch (error) {
    res.status(500).json({ error: "Submission sync failed." });
  }
};
