const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * Checks if the user has been inactive for more than 20 hours.
 * GET /api/notifications/status
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const lastActive = new Date(user.lastActive);
    const diffHours = (now - lastActive) / (1000 * 60 * 60);

    // Threshold: 20 hours
    const isInactive = diffHours >= 20;

    res.status(200).json({
      success: true,
      isInactive,
      hoursAway: Math.floor(diffHours),
      message: isInactive ? "It's been a while! Time to calibrate your skills." : "Neural sync active."
    });
  } catch (err) {
    res.status(500).json({ error: "Notification check failed" });
  }
});

module.exports = router;
