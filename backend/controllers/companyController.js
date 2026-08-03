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
 *   1. Company model (MongoDB) — auto-seeded if empty/incomplete
 *   2. jobFetchService.js JD_DATABASE (curated fallback — 10 major companies)
 *   3. ResumeAnalysis (for match enrichment when user has analyzed this company)
 */

const Company = require('../models/Company');
const TestQuestion = require('../models/TestQuestion');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { getAvailableCompanies, getRolesForCompany, fetchJobDescription, JD_DATABASE } = require('../services/jobFetchService');

// ─── Company Metadata & Seed Master Records ─────────────────────────────────
const SEED_COMPANIES = [
  {
    name: 'Google',
    logo: 'https://www.google.com/favicon.ico',
    description: 'Global technology leader specializing in search, cloud computing, artificial intelligence, and consumer hardware.',
    color: '#4285F4',
    domain: 'Cloud, AI, Search',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Expert',
    avgSalary: '₹25L – ₹65L',
    roles: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Frontend Developer', 'DevOps Engineer'],
    requiredSkills: ['Java', 'C++', 'Python', 'Go', 'Distributed Systems', 'GCP', 'System Design', 'React'],
    founded: 1998,
    hq: 'Mountain View, CA',
    size: '190,000+'
  },
  {
    name: 'Microsoft',
    logo: 'https://www.microsoft.com/favicon.ico',
    description: 'Pioneer in operating systems, cloud solutions (Azure), productivity software, and enterprise AI innovation.',
    color: '#00A4EF',
    domain: 'Cloud, Enterprise, AI',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Hard',
    avgSalary: '₹20L – ₹55L',
    roles: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cloud Architect', 'Product Manager'],
    requiredSkills: ['C#', '.NET', 'Azure', 'Python', 'System Design', 'Microservices', 'SQL'],
    founded: 1975,
    hq: 'Redmond, WA',
    size: '220,000+'
  },
  {
    name: 'Amazon',
    logo: 'https://www.amazon.com/favicon.ico',
    description: 'E-commerce giant and cloud computing pioneer powering global retail logistics and AWS infrastructure.',
    color: '#FF9900',
    domain: 'E-commerce, Cloud, Logistics',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Hard',
    avgSalary: '₹18L – ₹50L',
    roles: ['Software Development Engineer', 'Data Engineer', 'ML Engineer', 'DevOps/SRE', 'Frontend Engineer'],
    requiredSkills: ['Java', 'AWS', 'Distributed Systems', 'Data Structures', 'Python', 'React', 'Kafka'],
    founded: 1994,
    hq: 'Seattle, WA',
    size: '1,500,000+'
  },
  {
    name: 'Infosys',
    logo: 'https://www.infosys.com/favicon.ico',
    description: 'Global leader in next-generation digital services, enterprise consulting, and cloud transformation.',
    color: '#007CC3',
    domain: 'IT Services, Consulting, BPO',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Medium',
    avgSalary: '₹4L – ₹12L',
    roles: ['Software Engineer', 'Data Analyst', 'Full Stack Developer', 'Testing Engineer', 'Cloud Engineer'],
    requiredSkills: ['Java', 'Spring Boot', 'Python', 'SQL', 'React', 'Selenium', 'AWS'],
    founded: 1981,
    hq: 'Bengaluru, IN',
    size: '330,000+'
  },
  {
    name: 'TCS',
    logo: 'https://www.tcs.com/favicon.ico',
    description: 'Tata Consultancy Services is an IT services, consulting, and business solutions organization partnering with enterprises.',
    color: '#003087',
    domain: 'IT Services, BPO, Analytics',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Easy',
    avgSalary: '₹3.5L – ₹10L',
    roles: ['Software Engineer', 'Data Scientist', 'Cyber Security Analyst', 'DevOps Engineer', 'Business Analyst'],
    requiredSkills: ['Java', 'Python', 'C++', 'SQL', 'Cybersecurity', 'DevOps', 'Data Structures'],
    founded: 1968,
    hq: 'Mumbai, IN',
    size: '600,000+'
  },
  {
    name: 'Wipro',
    logo: 'https://www.wipro.com/favicon.ico',
    description: 'Leading technology services and consulting company focused on building innovative solutions across enterprise tech.',
    color: '#341C4F',
    domain: 'IT, Consulting, BPO',
    hiringStatus: 'Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Easy',
    avgSalary: '₹3.5L – ₹9L',
    roles: ['Software Developer', 'Data Engineer', 'ML Engineer', 'Full Stack Developer', 'Cloud Consultant'],
    requiredSkills: ['Java', 'Python', 'SQL', 'PySpark', 'Node.js', 'React', 'Cloud Migration'],
    founded: 1945,
    hq: 'Bengaluru, IN',
    size: '250,000+'
  },
  {
    name: 'Zoho',
    logo: 'https://www.zoho.com/favicon.ico',
    description: 'Bootstrapped SaaS powerhouse building over 45+ suite productivity applications for business operations globally.',
    color: '#E42527',
    domain: 'SaaS, CRM, Productivity',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Medium',
    avgSalary: '₹7L – ₹18L',
    roles: ['Software Engineer', 'Frontend Developer', 'Data Analyst', 'Backend Developer', 'Mobile Developer'],
    requiredSkills: ['Java', 'C++', 'JavaScript', 'SQL', 'PostgreSQL', 'Swift', 'Kotlin'],
    founded: 1996,
    hq: 'Chennai, IN',
    size: '15,000+'
  },
  {
    name: 'Freshworks',
    logo: 'https://www.freshworks.com/favicon.ico',
    description: 'Modern customer engagement software suite designed to empower sales, support, and IT operations.',
    color: '#00D084',
    domain: 'SaaS, Customer Experience, AI',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Medium',
    avgSalary: '₹12L – ₹28L',
    roles: ['Software Engineer', 'Frontend Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager'],
    requiredSkills: ['Ruby on Rails', 'Java', 'React', 'TypeScript', 'AWS', 'MySQL', 'Python'],
    founded: 2010,
    hq: 'San Mateo, CA / Chennai, IN',
    size: '5,000+'
  },
  {
    name: 'Flipkart',
    logo: 'https://www.flipkart.com/favicon.ico',
    description: 'India’s premier e-commerce ecosystem processing scale logistics, digital payments, and retail AI.',
    color: '#2874F0',
    domain: 'E-commerce, Supply Chain, FinTech',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Hard',
    avgSalary: '₹18L – ₹45L',
    roles: ['Software Development Engineer', 'Data Engineer', 'ML Engineer', 'Frontend Engineer', 'Cloud/Infrastructure Engineer'],
    requiredSkills: ['Java', 'Scala', 'PySpark', 'Kafka', 'React', 'Cassandra', 'Kubernetes'],
    founded: 2007,
    hq: 'Bengaluru, IN',
    size: '30,000+'
  },
  {
    name: 'Swiggy',
    logo: 'https://www.swiggy.com/favicon.ico',
    description: 'Hyperlocal convenience and food delivery network leveraging real-time geospatial ML and instant logistics.',
    color: '#FC8019',
    domain: 'Hyperlocal Delivery, Logistics, AI',
    hiringStatus: 'Actively Hiring',
    internship: true,
    internshipAvailability: true,
    difficulty: 'Hard',
    avgSalary: '₹16L – ₹40L',
    roles: ['Backend Engineer', 'Data Scientist', 'Mobile Engineer', 'DevOps/SRE', 'Frontend Engineer'],
    requiredSkills: ['Go', 'Python', 'Java', 'Kotlin', 'Swift', 'PostgreSQL', 'Redis', 'Kafka'],
    founded: 2014,
    hq: 'Bengaluru, IN',
    size: '5,000+'
  }
];

const INTERVIEW_PROCESS = {
  Google:    ['Online Assessment', 'Phone Screen', '4-5 Technical Rounds (LeetCode-style)', 'System Design Round', 'Googleyness + Leadership Round'],
  Microsoft: ['Online Assessment', 'Technical Phone Screen', '4-5 On-site Interviews (Coding + System Design)', 'As-Appropriate Interview'],
  Amazon:    ['Online Assessment', 'Phone Screen (LP + Technical)', '4-6 On-site Loops (LP + Coding + System Design)', 'Bar Raiser Round'],
  Infosys:   ['Online Test (Aptitude + Coding)', 'Technical Interview', 'HR Interview'],
  TCS:       ['TCS National Qualifier Test (NQT)', 'Technical Interview', 'Managerial Round', 'HR Round'],
  Wipro:     ['Online Assessment (AMCAT)', 'Technical Interview', 'HR Interview'],
  Zoho:      ['Written Programming Round', 'Advanced Programming Round', 'Design Round', 'HR Round'],
  Freshworks:['Online Assessment', 'Technical Phone Screen', 'System Design & Coding Rounds', 'HR Round'],
  Flipkart:  ['Online Coding Assessment', 'Machine Coding Round', 'System Design Round', 'HM Round'],
  Swiggy:    ['Online Assessment', 'Machine Coding Round', 'Problem Solving & Architecture', 'HM Round'],
  default:   ['Online Assessment', 'Technical Interview', 'HR Interview']
};

/**
 * Ensures MongoDB is populated with all seed companies.
 */
const seedDatabaseIfEmpty = async () => {
  try {
    let dbCount = await Company.countDocuments();
    if (dbCount < SEED_COMPANIES.length) {
      console.log(`[Seed] Database has ${dbCount} companies, seeding up to ${SEED_COMPANIES.length}...`);
      for (const comp of SEED_COMPANIES) {
        await Company.updateOne(
          { name: comp.name },
          { $set: comp },
          { upsert: true }
        );
      }
      dbCount = await Company.countDocuments();
    }
    return dbCount;
  } catch (err) {
    console.warn('[Seed] Company auto-seed warning:', err.message);
    return 0;
  }
};

/**
 * GET /api/companies
 * Returns all companies. Always populated — uses DB + Fallback Database.
 */
exports.getAllCompanies = async (req, res) => {
  try {
    console.log('[Companies] GET /api/companies called.');

    // 1. Ensure DB is populated
    const dbCount = await seedDatabaseIfEmpty();

    // 2. Fetch from DB first
    let dbCompanies = [];
    try {
      dbCompanies = await Company.find().lean();
    } catch (e) {
      console.warn('[Companies] DB fetch failed, using memory fallback:', e.message);
    }

    const fallbackCount = SEED_COMPANIES.length;
    let finalCompanies = [];

    if (dbCompanies && dbCompanies.length > 0) {
      finalCompanies = dbCompanies.map(c => ({
        ...c,
        color:        c.color || '#6366f1',
        domain:       c.domain || 'Technology',
        hiringStatus: c.hiringStatus || 'Actively Hiring',
        internship:   c.internship ?? true,
        rolesCount:   (c.roles || []).length,
        popularRoles: (c.roles || []).slice(0, 3),
        salary:       c.avgSalary || '₹10L – ₹25L'
      }));
    } else {
      finalCompanies = SEED_COMPANIES.map(c => ({
        ...c,
        rolesCount:   c.roles.length,
        popularRoles: c.roles.slice(0, 3),
        salary:       c.avgSalary
      }));
    }

    console.log(`Fetched companies:
Database count: ${dbCompanies.length}
Fallback count: ${fallbackCount}
Response count: ${finalCompanies.length}`);

    return res.status(200).json({
      success: true,
      companies: finalCompanies, // for backward compatibility
      data: finalCompanies,      // standard payload
      total: finalCompanies.length
    });
  } catch (error) {
    console.error('[Companies] Error in getAllCompanies:', error.message);

    // Emergency Fallback — NEVER return empty response
    const emergencyList = SEED_COMPANIES.map(c => ({
      ...c,
      rolesCount: c.roles.length,
      popularRoles: c.roles.slice(0, 3),
      salary: c.avgSalary
    }));

    return res.status(200).json({
      success: true,
      companies: emergencyList,
      data: emergencyList,
      total: emergencyList.length
    });
  }
};

/**
 * GET /api/companies/search?q=text
 */
exports.searchCompanies = async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    await seedDatabaseIfEmpty();

    let allCompanies = await Company.find().lean();
    if (!allCompanies || allCompanies.length === 0) {
      allCompanies = SEED_COMPANIES;
    }

    const filtered = allCompanies.filter(comp => {
      const nameMatch   = (comp.name || '').toLowerCase().includes(q);
      const domainMatch = (comp.domain || '').toLowerCase().includes(q);
      const tagsMatch   = (comp.tags || []).some(t => t.toLowerCase().includes(q));
      return nameMatch || domainMatch || tagsMatch;
    });

    return res.status(200).json({
      success: true,
      companies: filtered,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    return res.status(200).json({ success: true, companies: SEED_COMPANIES, data: SEED_COMPANIES, total: SEED_COMPANIES.length });
  }
};

/**
 * GET /api/companies/:name
 * Full company detail + user analysis match enrichment if available.
 */
exports.getCompanyDetail = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);

    let company = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
    if (!company) {
      company = SEED_COMPANIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || {
        name,
        color: '#6366f1',
        domain: 'Technology',
        hiringStatus: 'Actively Hiring',
        internship: true,
        difficulty: 'Medium',
        roles: getRolesForCompany(name),
        avgSalary: '₹10L – ₹25L'
      };
    }

    const process = INTERVIEW_PROCESS[company.name] || INTERVIEW_PROCESS.default;

    // Check if user has an analysis for this company
    let matchData = null;
    if (req.user) {
      const analysis = await ResumeAnalysis.findOne({
        userId: req.user.id,
        company: new RegExp(`^${name}$`, 'i'),
        analysisStatus: 'completed'
      }).sort({ createdAt: -1 });

      if (analysis) {
        matchData = {
          jobRole:         analysis.jobRole,
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

    const fullData = {
      ...company,
      roles: company.roles && company.roles.length > 0 ? company.roles : getRolesForCompany(name),
      interviewProcess: process,
      matchData
    };

    return res.status(200).json({
      success: true,
      company: fullData,
      data: fullData
    });
  } catch (error) {
    console.error('[Companies] Error in getCompanyDetail:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch company details.' });
  }
};

/**
 * GET /api/companies/:name/roles
 */
exports.getCompanyRoles = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    let company = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') }).select('roles name difficulty avgSalary').lean();

    let roles = company?.roles;
    if (!roles || roles.length === 0) {
      roles = getRolesForCompany(name);
    }

    const data = roles.map(role => ({
      role,
      salary: company?.avgSalary || '₹10L – ₹25L',
      difficulty: company?.difficulty || 'Medium'
    }));

    return res.status(200).json({
      success: true,
      roles: data,
      data,
      company: name
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch company roles.' });
  }
};

/**
 * GET /api/companies/:name/roles/:role
 * Full Job Description for a specific role at a company + match data.
 */
exports.getRoleDetail = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const role = decodeURIComponent(req.params.role);

    // Fetch JD from jobFetchService (uses curated DB or live API)
    const { description: jd, source } = await fetchJobDescription(name, role);

    // Fetch company info
    let company = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
    const process = INTERVIEW_PROCESS[name] || INTERVIEW_PROCESS.default;

    // Check if user has analyzed this exact company + role
    let matchData = null;
    if (req.user) {
      const analysis = await ResumeAnalysis.findOne({
        userId:  req.user.id,
        company: new RegExp(`^${name}$`, 'i'),
        jobRole: new RegExp(`^${role}$`, 'i'),
        analysisStatus: 'completed'
      }).sort({ createdAt: -1 });

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

    const roleData = {
      company:          name,
      role:             role,
      description:      jd,
      jdSource:         source,
      salary:           company?.avgSalary || '₹10L – ₹25L',
      difficulty:       company?.difficulty || 'Medium',
      requiredSkills:   company?.requiredSkills || company?.tags || [],
      interviewProcess: process,
      matchData
    };

    return res.status(200).json({
      success: true,
      role: roleData,
      data: roleData
    });
  } catch (error) {
    console.error('[Companies] Error in getRoleDetail:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch role detail.' });
  }
};
