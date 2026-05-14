const TestQuestion = require('../models/TestQuestion');
const User = require('../models/User');

/**
 * Fetches questions based on domain and optional difficulty.
 * Returns 5-10 random questions.
 */
exports.getQuestionsByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    const { difficulty } = req.query;

    let query = { domain: new RegExp(domain, 'i') };
    if (difficulty) query.difficulty = difficulty;

    let questions = await TestQuestion.find(query);
    
    // Fallback: If no questions found for specific domain, return Web Development or Java as general tech
    if (questions.length === 0) {
      console.log(`No questions for ${domain}, falling back to general bank.`);
      questions = await TestQuestion.find({ domain: { $in: ["Web Development", "Java"] } });
    }
    
    // Shuffle and pick 10 (or all if less than 10)
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    res.status(200).json({
      success: true,
      domain: domain,
      count: selected.length,
      questions: selected.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        type: q.type
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch neural questions." });
  }
};

/**
 * Submits test answers and calculates score.
 * Updates user performance score using the formula:
 * Prep Readiness = (resumeScore * 0.6 + testScore * 0.4)
 */
exports.submitTest = async (req, res) => {
  try {
    const { answers, questionIds } = req.body;
    const userId = req.user.id;

    const questions = await TestQuestion.find({ _id: { $in: questionIds } });
    
    let correct = 0;
    const total = questions.length;

    const results = questions.map(q => {
      const userAnswer = answers[q._id];
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) correct++;
      return {
        questionId: q._id,
        correctAnswer: q.answer,
        userAnswer: userAnswer,
        isCorrect: isCorrect
      };
    });

    const testScore = Math.round((correct / total) * 100);

    // Update User Profile
    const user = await User.findById(userId);
    if (user) {
      user.performanceScore = testScore; // Latest test score
      user.solvedQuestionsCount += total;
      
      // Dynamic Prep Readiness formula: (resumeScore * 0.6 + testScore * 0.4)
      // Note: matchPercentage is used as resumeScore
      const resumeScore = user.matchPercentage || 0;
      const combinedReadiness = Math.round((resumeScore * 0.6) + (testScore * 0.4));
      
      // Store this in a virtual or direct field if needed, for now we update activity
      user.recentActivity.push(`Skill Test Completed: ${testScore}% in ${questions[0]?.domain || 'General'}`);
      
      await user.save();

      res.status(200).json({
        success: true,
        score: testScore,
        correct: correct,
        total: total,
        readiness: combinedReadiness,
        results: results
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Test submission failed." });
  }
};
