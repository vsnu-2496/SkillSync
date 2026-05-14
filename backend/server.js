const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── ROUTES REGISTRATION ──

// Auth
app.use('/api/auth', require('./routes/authRoutes'));

// Resume Intelligence
app.use('/api/resume', require('./routes/resumeRoutes'));

// Interview Assessment (EasyPrep Execution)
app.use('/api/interview', require('./routes/interviewRoutes'));

// Senior Guidance Vault
app.use('/api/vault', require('./routes/vaultRoutes'));

// Notifications & Engagement
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Telemetry & Discovery
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));

// Heartbeat
app.get('/api/heartbeat', (req, res) => res.json({ status: "Neural Cluster Online", time: new Date() }));

app.get('/', (req, res) => {
  res.send('SkillSync AI API Cluster is online...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
