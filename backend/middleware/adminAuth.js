const jwt = require('jsonwebtoken');

exports.adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No identity token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'skillsync_secret_2026');
    req.user = verified;
    
    // Ensure the role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin clearance required.' });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: 'Identity token verification failed.' });
  }
};
