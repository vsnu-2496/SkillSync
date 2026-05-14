const TestQuestion = require('../models/TestQuestion');
const User = require('../models/User');

/**
 * Initializes a test session.
 * POST /api/interview/start-test
 */
exports.startTest = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Neural session initialized",
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: "Session Initialization Failed" });
  }
};

/**
 * Fetches questions based on domain.
 * GET /api/interview/questions?domain=...
 */
exports.getQuestions = async (req, res) => {
  try {
    const domain = req.query.domain || "Web Development";
    const difficulty = req.query.difficulty;

    let query = { domain: new RegExp(domain, 'i') };
    if (difficulty) query.difficulty = difficulty;

    let questions = await TestQuestion.find(query);
    
    if (questions.length === 0) {
      questions = await TestQuestion.find({ domain: { $in: ["Web Development", "Java"] } });
    }
    
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    res.status(200).json({
      success: true,
      questions: selected.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        type: q.type
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Neural Assessment Fetch Failed" });
  }
};

/**
 * Submits test results.
 * POST /api/interview/submit
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
      return { questionId: q._id, isCorrect };
    });

    const testScore = Math.round((correct / total) * 100);

    const user = await User.findById(userId);
    if (user) {
      user.performanceScore = testScore;
      user.solvedQuestionsCount += total;
      
      const resumeScore = user.matchPercentage || 0;
      const combinedReadiness = Math.round((resumeScore * 0.6) + (testScore * 0.4));
      
      user.recentActivity.push(`Neural Test: ${testScore}% in Assessment`);
      await user.save();

      res.status(200).json({
        success: true,
        score: testScore,
        correct: correct,
        total: total,
        readiness: combinedReadiness
      });
    } else {
      res.status(404).json({ error: "Identity not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Sync Failed" });
  }
};
