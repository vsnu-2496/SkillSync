const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No identity token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'skillsync_secret_2026');
    req.user = verified;
    
    // Update lastActive timestamp in background
    const User = require('../models/User');
    User.findByIdAndUpdate(verified.id, { lastActive: new Date() }).catch(e => console.error("lastActive sync failed"));
    
    next();
  } catch (err) {
    res.status(400).json({ error: 'Identity token verification failed.' });
  }
};
