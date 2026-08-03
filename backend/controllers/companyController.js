/**
 * companyController.js
 * ─────────────────────────────────────────────────────────────────────
 * Dynamic Job Portal APIs for Company Explorer.
 *
 * Endpoints:
 *   GET /api/companies                  — list all companies with metadata
 *   GET /api/companies/search?q=        — text search
 *   GET /api/companies/:name            — full company detail + roles
 *   GET /api/companies/:name/roles      — list of available roles
 *   GET /api/companies/:name/roles/:role — full JD + requirements
 *
 * Data sources (in priority order):
 *   1. jobFetchService.js JD_DATABASE (curated fallback — always available)
 *   2. Company model (MongoDB, for metadata: difficulty, salary, hiring status)
 *   3. ResumeAnalysis (for match enrichment when user has analyzed this company)
 *
 * Never fails — falls back gracefully at every level.
 */

const Company   = require('../models/Company');
const TestQuestion = require('../models/TestQuestion');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { getAvailableCompanies, getRolesForCompany, fetchJobDescription } = require('../services/jobFetchService');

// ─── Static enrichment data per company ──────────────────────────────────
// Provides logos (initials fallback), hiring info, internship data
const COMPANY_META = {
  Google:    { color: '#4285F4', domain: 'Cloud, AI, Search', hiringStatus: 'Actively Hiring', internship: true,  founded: 1998, hq: 'Mountain View, CA', size: '190,000+' },
  Microsoft: { color: '#00A4EF', domain: 'Cloud, Enterprise, AI', hiringStatus: 'Actively Hiring', internship: true,  founded: 1975, hq: 'Redmond, WA', size: '220,000+' },
  Amazon:    { color: '#FF9900', domain: 'E-commerce, Cloud, Logistics', hiringStatus: 'Actively Hiring', internship: true,  founded: 1994, hq: 'Seattle, WA', size: '1,500,000+' },
  Infosys:   { color: '#007CC3', domain: 'IT Services, Consulting, BPO', hiringStatus: 'Actively Hiring', internship: true,  founded: 1981, hq: 'Bengaluru, IN', size: '330,000+' },
  TCS:       { color: '#003087', domain: 'IT Services, BPO, Analytics', hiringStatus: 'Actively Hiring', internship: true,  founded: 1968, hq: 'Mumbai, IN', size: '600,000+' },
  Wipro:     { color: '#341C4F', domain: 'IT, Consulting, BPO', hiringStatus: 'Hiring',          internship: true,  founded: 1945, hq: 'Bengaluru, IN', size: '250,000+' },
  Meta:      { color: '#1877F2', domain: 'Social Media, VR, AI', hiringStatus: 'Selective',       internship: true,  founded: 2004, hq: 'Menlo Park, CA', size: '86,000+' },
  Apple:     { color: '#555555', domain: 'Hardware, Software, Services', hiringStatus: 'Selective',       internship: true,  founded: 1976, hq: 'Cupertino, CA', size: '164,000+' },
  Netflix:   { color: '#E50914', domain: 'Streaming, Content, Tech', hiringStatus: 'Selective',       internship: false, founded: 1997, hq: 'Los Gatos, CA', size: '13,000+' },
  Zoho:      { color: '#E42527', domain: 'SaaS, CRM, Productivity', hiringStatus: 'Actively Hiring', internship: true,  founded: 1996, hq: 'Chennai, IN', size: '15,000+' }
};

const INTERVIEW_PROCESS = {
  Google:    ['Online Assessment', 'Phone Screen', '4-5 Technical Rounds (LeetCode-style)', 'System Design Round', 'Googleyness + Leadership Round', 'Hiring Committee Review'],
  Microsoft: ['Online Assessment', 'Technical Phone Screen', '4-5 On-site Interviews (Coding + System Design)', 'As-Appropriate Interview', 'Hire Decision'],
  Amazon:    ['Online Assessment', 'Phone Screen (LP + Technical)', '4-6 On-site Loops (LP + Coding + System Design)', 'Bar Raiser Round', 'Debrief + Offer'],
  Infosys:   ['Online Test (Aptitude + Coding)', 'Technical Interview', 'HR Interview'],
  TCS:       ['TCS National Qualifier Test (NQT)', 'Technical Interview', 'Managerial Round', 'HR Round'],
  Wipro:     ['Online Assessment (AMCAT)', 'Technical Interview', 'HR Interview'],
  Meta:      ['Recruiter Screen', 'Technical Phone Screen', '3-5 On-site Rounds (Coding + System Design + Behavioral)', 'Offer Review'],
  default:   ['Online Assessment', 'Technical Interview', 'HR Interview']
};

const getDifficulty = (company) => {
  const d = { Google: 'Expert', Microsoft: 'Hard', Amazon: 'Hard', Meta: 'Expert', Netflix: 'Expert', Apple: 'Hard', Infosys: 'Medium', TCS: 'Easy', Wipro: 'Easy', Zoho: 'Medium' };
  return d[company] || 'Medium';
};

const getSalary = (company, role) => {
  const salaries = {
    Google:    { default: '₹25L – ₹60L', 'Software Engineer': '₹30L – ₹65L', 'AI/ML Engineer': '₹35L – ₹80L' },
    Microsoft: { default: '₹20L – ₹50L', 'Software Engineer': '₹22L – ₹55L' },
    Amazon:    { default: '₹18L – ₹45L', 'Software Development Engineer': '₹20L – ₹50L' },
    Infosys:   { default: '₹3.6L – ₹8L' },
    TCS:       { default: '₹3.36L – ₹7L' },
    Wipro:     { default: '₹3.5L – ₹7L' },
    Meta:      { default: '₹30L – ₹70L' },
    default:   { default: '₹5L – ₹20L' }
  };
  const co = salaries[company] || salaries.default;
  return co[role] || co.default || '₹5L – ₹20L';
};

/**
 * GET /api/companies
 * Returns all companies with metadata, roles count, hiring status.
 */
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = getAvailableCompanies();

    const data = companies.map(name => {
      const meta = COMPANY_META[name] || {};
      const roles = getRolesForCompany(name);
      return {
        name,
        color:         meta.color || '#6366f1',
        domain:        meta.domain || 'Technology',
        hiringStatus:  meta.hiringStatus || 'Hiring',
        internship:    meta.internship ?? true,
        difficulty:    getDifficulty(name),
        rolesCount:    roles.length,
        popularRoles:  roles.slice(0, 3),
        salary:        getSalary(name),
        founded:       meta.founded,
        hq:            meta.hq,
        size:          meta.size
      };
    });

    return res.status(200).json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('[Companies] getAllCompanies error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch companies.' });
  }
};

/**
 * GET /api/companies/search?q=text
 * Fuzzy text search across company names and domains.
 */
exports.searchCompanies = async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    const companies = getAvailableCompanies();

    const filtered = companies.filter(name => {
      const meta = COMPANY_META[name] || {};
      return (
        name.toLowerCase().includes(q) ||
        (meta.domain || '').toLowerCase().includes(q)
      );
    }).map(name => {
      const meta = COMPANY_META[name] || {};
      const roles = getRolesForCompany(name);
      return {
        name,
        color:        meta.color || '#6366f1',
        domain:       meta.domain || 'Technology',
        hiringStatus: meta.hiringStatus || 'Hiring',
        roles:        roles,
        difficulty:   getDifficulty(name),
        salary:       getSalary(name)
      };
    });

    return res.status(200).json({ success: true, data: filtered, total: filtered.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Search failed.' });
  }
};

/**
 * GET /api/companies/:name
 * Full company profile: metadata + roles + interview process.
 * If user has an analysis for this company → enrich with match data.
 */
exports.getCompanyDetail = async (req, res) => {
  try {
    const { name } = req.params;
    const meta  = COMPANY_META[name] || {};
    const roles = getRolesForCompany(name);
    const process = INTERVIEW_PROCESS[name] || INTERVIEW_PROCESS.default;

    // Enrich with user's analysis if available
    let matchData = null;
    if (req.user) {
      const analysis = await ResumeAnalysis.findOne({
        userId: req.user.id,
        company: new RegExp(`^${name}$`, 'i'),
        analysisStatus: 'completed'
      }).sort({ createdAt: -1 }).select(
        'jobRole atsScore careerReadiness keywordMatch matchedSkills missingSkills estimatedScoreAfterImprovements roadmap'
      );

      if (analysis) {
        matchData = {
          jobRole:         analysis.jobRole,
          atsScore:        analysis.atsScore,
          careerReadiness: analysis.careerReadiness,
          keywordMatch:    analysis.keywordMatch,
          matchedSkills:   analysis.matchedSkills,
          missingSkills:   analysis.missingSkills,
          estimatedScore:  analysis.estimatedScoreAfterImprovements,
          roadmap:         analysis.roadmap
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        name,
        color:         meta.color || '#6366f1',
        domain:        meta.domain || 'Technology',
        hiringStatus:  meta.hiringStatus || 'Hiring',
        internship:    meta.internship ?? true,
        difficulty:    getDifficulty(name),
        roles,
        founded:       meta.founded,
        hq:            meta.hq,
        size:          meta.size,
        interviewProcess: process,
        salary:        getSalary(name),
        matchData      // null if no analysis for this company
      }
    });
  } catch (error) {
    console.error('[Companies] getCompanyDetail error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch company detail.' });
  }
};

/**
 * GET /api/companies/:name/roles
 * Lists all available roles for a company.
 */
exports.getCompanyRoles = async (req, res) => {
  try {
    const { name } = req.params;
    const roles = getRolesForCompany(name);

    const data = roles.map(role => ({
      role,
      salary:     getSalary(name, role),
      difficulty: getDifficulty(name)
    }));

    return res.status(200).json({ success: true, data, company: name });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch roles.' });
  }
};

/**
 * GET /api/companies/:name/roles/:role
 * Full Job Description for a specific role at a company.
 * Also returns match data if user has analyzed this company+role.
 */
exports.getRoleDetail = async (req, res) => {
  try {
    const { name, role } = req.params;
    const decodedRole = decodeURIComponent(role);

    // Fetch JD from jobFetchService (uses curated DB)
    const { description: jd, source } = await fetchJobDescription(name, decodedRole);

    // Enrich with analysis if user analyzed this exact company+role
    let matchData = null;
    if (req.user) {
      const analysis = await ResumeAnalysis.findOne({
        userId:  req.user.id,
        company: new RegExp(`^${name}$`, 'i'),
        jobRole: new RegExp(`^${decodedRole}$`, 'i'),
        analysisStatus: 'completed'
      }).sort({ createdAt: -1 }).select(
        'atsScore careerReadiness keywordMatch matchedSkills missingSkills estimatedScoreAfterImprovements roadmap recommendations strengths weaknesses whyThisScore'
      );

      if (analysis) {
        matchData = {
          atsScore:        analysis.atsScore,
          careerReadiness: analysis.careerReadiness,
          keywordMatch:    analysis.keywordMatch,
          matchedSkills:   analysis.matchedSkills,
          missingSkills:   analysis.missingSkills,
          estimatedScore:  analysis.estimatedScoreAfterImprovements,
          roadmap:         analysis.roadmap,
          recommendations: analysis.recommendations,
          strengths:       analysis.strengths,
          weaknesses:      analysis.weaknesses,
          whyThisScore:    analysis.whyThisScore
        };
      }
    }

    const process = INTERVIEW_PROCESS[name] || INTERVIEW_PROCESS.default;

    return res.status(200).json({
      success: true,
      data: {
        company:          name,
        role:             decodedRole,
        description:      jd,
        jdSource:         source,
        salary:           getSalary(name, decodedRole),
        difficulty:       getDifficulty(name),
        interviewProcess: process,
        matchData         // null if no matching analysis
      }
    });
  } catch (error) {
    console.error('[Companies] getRoleDetail error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch role detail.' });
  }
};
