const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible cross-origin resources in dev
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting (Prevent DDoS / Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Core Middleware
// Configure CORS with explicit origin and allow credentials (cookies)
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_API_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── ROUTES REGISTRATION ──
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/mock', require('./routes/mockInterviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vault', require('./routes/vaultRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));

// Heartbeat & Root
app.get('/api/heartbeat', (req, res) => res.json({ status: "SkillSync AI Neural Cluster Online", time: new Date() }));

app.get('/', (req, res) => {
  res.send('SkillSync AI Production API Cluster is online...');
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[SYSTEM ERROR] ${err.stack || err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SkillSync AI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Allowed frontend origin: ${FRONTEND_URL}`);
});
