const TestQuestion = require('../models/TestQuestion');
const User = require('../models/User');

const OFFICIAL_LEARNING_LINKS = {
  "Web Development": [
    { title: "MDN Web Docs - JavaScript & HTML/CSS", url: "https://developer.mozilla.org", source: "MDN" },
    { title: "Frontend Developer Roadmap", url: "https://roadmap.sh/frontend", source: "Roadmap.sh" },
    { title: "GeeksforGeeks Web Development", url: "https://www.geeksforgeeks.org/web-development/", source: "GeeksforGeeks" }
  ],
  "Java": [
    { title: "Oracle Java Documentation", url: "https://docs.oracle.com/en/java/", source: "Oracle" },
    { title: "GeeksforGeeks Java Programming Language", url: "https://www.geeksforgeeks.org/java/", source: "GeeksforGeeks" },
    { title: "Java Developer Roadmap", url: "https://roadmap.sh/java", source: "Roadmap.sh" }
  ],
  "Backend Engineer": [
    { title: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/", source: "NodeJS.org" },
    { title: "Backend Developer Roadmap", url: "https://roadmap.sh/backend", source: "Roadmap.sh" },
    { title: "AWS Skill Builder - Cloud Architecture", url: "https://skillbuilder.aws", source: "AWS" },
    { title: "Microsoft Learn - Azure Fundamentals", url: "https://learn.microsoft.com", source: "Microsoft Learn" }
  ]
};

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

exports.getQuestions = async (req, res) => {
  try {
    const domain = req.query.domain || "Web Development";
    const difficulty = req.query.difficulty;
    const company = req.query.company;

    let query = {};
    
    if (company) {
      query.companyName = new RegExp(company, 'i');
    } else {
      query.domain = new RegExp(domain, 'i');
    }

    if (difficulty) query.difficulty = difficulty;

    let questions = await TestQuestion.find(query);
    
    if (questions.length === 0) {
      questions = await TestQuestion.find({ domain: new RegExp(domain, 'i') });
    }

    if (questions.length === 0) {
      questions = await TestQuestion.find({ domain: { $in: ["Web Development", "Java"] } });
    }
    
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    // Dynamic official reference links for this domain
    const referenceLinks = OFFICIAL_LEARNING_LINKS[domain] || OFFICIAL_LEARNING_LINKS["Web Development"];

    res.status(200).json({
      success: true,
      domain,
      referenceLinks,
      questions: selected.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        type: q.type,
        explanation: q.explanation || `Core concept evaluation for ${domain}.`
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Neural Assessment Fetch Failed" });
  }
};

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
        question: q.question,
        userAnswer,
        correctAnswer: q.answer,
        explanation: q.explanation || "Correct answer based on technical specification.",
        isCorrect 
      };
    });

    const testScore = Math.round((correct / total) * 100);

    const user = await User.findById(userId);
    if (user) {
      user.performanceScore = testScore;
      user.solvedQuestionsCount += total;
      
      const resumeScore = user.matchPercentage || 0;
      const combinedReadiness = Math.round((resumeScore * 0.6) + (testScore * 0.4));
      
      user.recentActivity.push(`Skill Test: ${testScore}% in Assessment`);
      await user.save();

      res.status(200).json({
        success: true,
        score: testScore,
        correct: correct,
        total: total,
        readiness: combinedReadiness,
        results
      });
    } else {
      res.status(404).json({ error: "Identity not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Sync Failed" });
  }
};

exports.getCompanyQuestions = async (req, res) => {
  try {
    const { company } = req.params;
    const questions = await TestQuestion.find({ companyName: new RegExp(company, 'i') }).limit(10);
    
    res.status(200).json({
      success: true,
      company: company,
      questions: questions.map(q => ({
        id: q._id,
        title: q.question,
        round: q.type === 'MCQ' ? 'Technical Round 1' : q.type,
        category: q.domain,
        difficulty: q.difficulty,
        tags: q.tags || []
      }))
    });
  } catch (err) {
    console.error("Error in getCompanyQuestions:", err);
    res.status(500).json({ error: "Failed to fetch company questions" });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const domains = await TestQuestion.distinct('domain');
    res.status(200).json({ success: true, topics: domains });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};
