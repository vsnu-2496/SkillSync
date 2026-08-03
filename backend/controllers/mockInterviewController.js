/**
 * controllers/mockInterviewController.js
 * Handles AI Mock Interview session lifecycle:
 *   startSession → submitAnswer → finishSession → getHistory
 */
const MockSession = require('../models/MockSession');
const TestQuestion = require('../models/TestQuestion');
const { scoreAnswer } = require('../utils/scoreAnswer');

// ─────────────────────────────────────────────
// POST /api/mock/start
// Body: { domain, difficulty }
// ─────────────────────────────────────────────
exports.startSession = async (req, res) => {
  try {
    const { domain, difficulty = 'medium' } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required.' });

    // Pull questions - try domain match first, fall back to any
    let questions = await TestQuestion.find({
      domain: { $regex: new RegExp(domain, 'i') },
      difficulty
    }).limit(7).lean();

    // If not enough domain-specific questions, supplement with general pool
    if (questions.length < 5) {
      const extra = await TestQuestion.find({
        _id: { $nin: questions.map(q => q._id) }
      }).limit(7 - questions.length).lean();
      questions = [...questions, ...extra];
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available for this domain. Please seed the database.' });
    }

    // Pre-fill answer slots
    const answers = questions.map(q => ({
      questionId: q._id,
      questionText: q.question,
      correctAnswer: q.answer,
      userAnswer: '',
      score: 0,
      tier: 'Not Answered',
      missedKeywords: [],
      matchedKeywords: [],
      timeTaken: 0
    }));

    const session = await MockSession.create({
      userId: req.user.id,
      domain,
      difficulty,
      status: 'active',
      currentIndex: 0,
      questionCount: questions.length,
      answers
    });

    // Return session + first question only (no peeking ahead)
    res.json({
      sessionId: session._id,
      domain,
      difficulty,
      totalQuestions: questions.length,
      currentIndex: 0,
      question: {
        index: 0,
        text: answers[0].questionText,
        type: questions[0].type || 'Technical',
      }
    });
  } catch (err) {
    console.error('startSession Error:', err);
    res.status(500).json({ error: 'Failed to start interview session.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/mock/answer
// Body: { sessionId, userAnswer, timeTaken }
// ─────────────────────────────────────────────
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, userAnswer = '', timeTaken = 0 } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

    const session = await MockSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session is already completed.' });

    const idx = session.currentIndex;
    if (idx >= session.answers.length) return res.status(400).json({ error: 'All questions already answered.' });

    // Score this answer
    const correct = session.answers[idx].correctAnswer || '';
    const result = scoreAnswer(userAnswer, correct);

    // Persist the scored answer
    session.answers[idx].userAnswer     = userAnswer;
    session.answers[idx].score          = result.score;
    session.answers[idx].tier           = result.tier;
    session.answers[idx].matchedKeywords = result.matchedKeywords;
    session.answers[idx].missedKeywords  = result.missedKeywords;
    session.answers[idx].timeTaken       = timeTaken;
    session.currentIndex = idx + 1;
    await session.save();

    const isLast = session.currentIndex >= session.answers.length;

    res.json({
      answered: idx,
      score: result.score,
      tier: result.tier,
      matchedKeywords: result.matchedKeywords,
      missedKeywords: result.missedKeywords,
      isLast,
      // Provide next question if not finished
      next: isLast ? null : {
        index: session.currentIndex,
        text: session.answers[session.currentIndex].questionText
      }
    });
  } catch (err) {
    console.error('submitAnswer Error:', err);
    res.status(500).json({ error: 'Failed to submit answer.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/mock/finish
// Body: { sessionId }
// ─────────────────────────────────────────────
exports.finishSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await MockSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // Compute final aggregate score
    const answered = session.answers.filter(a => a.userAnswer && a.userAnswer.trim().length > 0);
    const totalScore = answered.length > 0
      ? Math.round(answered.reduce((sum, a) => sum + a.score, 0) / session.answers.length)
      : 0;
    const totalTimeTaken = session.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    session.totalScore   = totalScore;
    session.totalTimeTaken = totalTimeTaken;
    session.status       = 'completed';
    session.completedAt  = new Date();
    await session.save();

    // Tier breakdown
    const breakdown = { Excellent: 0, Good: 0, 'Needs Work': 0, Poor: 0, 'Not Answered': 0 };
    session.answers.forEach(a => { breakdown[a.tier] = (breakdown[a.tier] || 0) + 1; });

    res.json({
      sessionId: session._id,
      domain: session.domain,
      totalScore,
      totalTimeTaken,
      totalQuestions: session.answers.length,
      answeredCount: answered.length,
      breakdown,
      answers: session.answers.map((a, i) => ({
        index: i,
        question: a.questionText,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        score: a.score,
        tier: a.tier,
        matchedKeywords: a.matchedKeywords,
        missedKeywords: a.missedKeywords,
        timeTaken: a.timeTaken
      }))
    });
  } catch (err) {
    console.error('finishSession Error:', err);
    res.status(500).json({ error: 'Failed to finalize session.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/mock/history
// ─────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const sessions = await MockSession.find({
      userId: req.user.id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('domain difficulty totalScore questionCount answeredCount completedAt totalTimeTaken');

    res.json({ sessions });
  } catch (err) {
    console.error('getHistory Error:', err);
    res.status(500).json({ error: 'Failed to load history.' });
  }
};
