const User = require('../models/User');
const InterviewExperience = require('../models/InterviewExperience');
const TestQuestion = require('../models/TestQuestion');
const MockSession = require('../models/MockSession');
const Notification = require('../models/Notification');

// ==========================================
// 1. Analytics & Statistics
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const usersWithResumes = await User.countDocuments({ topRole: { $ne: 'Not Analyzed' }, role: { $ne: 'admin' } });
    const totalVaultItems = await InterviewExperience.countDocuments();
    const pendingVaultItems = await InterviewExperience.countDocuments({ isApproved: false });
    const totalQuestions = await TestQuestion.countDocuments();
    const totalMockSessions = await MockSession.countDocuments();

    // Aggregating average readiness/performance score
    const avgScoreAggregation = await User.aggregate([
      { $match: { role: { $ne: 'admin' }, performanceScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$performanceScore' } } }
    ]);
    const avgPerformance = avgScoreAggregation.length > 0 ? Math.round(avgScoreAggregation[0].avgScore) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersWithResumes,
        totalVaultItems,
        pendingVaultItems,
        totalQuestions,
        totalMockSessions,
        avgPerformance
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message });
  }
};

// ==========================================
// 2. User Management
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed from system.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ==========================================
// 3. Vault Moderation
// ==========================================
exports.getAllVaultItems = async (req, res) => {
  try {
    const items = await InterviewExperience.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vault items' });
  }
};

exports.approveVaultItem = async (req, res) => {
  try {
    const item = await InterviewExperience.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true },
      { new: true }
    );
    res.json({ success: true, message: 'Vault item approved.', item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve vault item' });
  }
};

exports.deleteVaultItem = async (req, res) => {
  try {
    await InterviewExperience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vault item deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
};

// ==========================================
// 4. Content (Question Bank) Management
// ==========================================
exports.getQuestions = async (req, res) => {
  try {
    const questions = await TestQuestion.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { domain, type, difficulty, question, options, answer } = req.body;
    if (!domain || !question || !answer) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }
    const newQ = new TestQuestion({ domain, type, difficulty, question, options, answer });
    await newQ.save();
    res.status(201).json({ success: true, message: 'Question added successfully', question: newQ });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question', details: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await TestQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// ==========================================
// 5. Notifications
// ==========================================
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, audience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    const newNotif = new Notification({ title, message, type, audience });
    await newNotif.save();
    res.status(201).json({ success: true, message: 'Notification broadcasted successfully.', notification: newNotif });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification', details: err.message });
  }
};
