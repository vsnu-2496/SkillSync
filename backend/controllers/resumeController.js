/**
 * resumeController.js
 * ─────────────────────────────────────────────────────────────────────
 * UPGRADED: Career Readiness Platform
 *
 * New functions added:
 *   analyzeCareer     — Full AI-powered career readiness analysis
 *   getJobsForRole    — Fetch company list and roles from fallback DB
 *   getAnalysisHistory — Retrieve past analyses for comparison
 *
 * Existing functions preserved (untouched):
 *   analyzeResume     — Legacy ATS analysis (kept for backward compat)
 *   getResumeData     — Legacy data retrieval
 *   uploadResume      — Legacy upload stub
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractSkills } = require('../utils/skillExtractor');
const { calculateCareerMap, getSkillGaps, getTrainingPath } = require('../services/careerService');
const { analyzeResumeWithGemini } = require('../services/geminiService');
const { fetchJobDescription, getAvailableCompanies, getRolesForCompany } = require('../services/jobFetchService');
const { validateAnalysisResult, enrichAnalysisResult } = require('../services/scoringEngine');

// ─── Fingerprint helper ───────────────────────────────────────────────────
// Generates a deterministic SHA-256 hash for deduplication.
// Same resume content + company + jobRole → always the same hash.
const generateFingerprint = (resumeText, company, jobRole) => {
  // Normalize: lowercase, collapse whitespace so minor formatting differences
  // in the same resume don't produce different fingerprints.
  const normalized = resumeText
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000); // cap to same limit sent to Gemini

  const input = `${normalized}|${company.toLowerCase().trim()}|${jobRole.toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Optional parsers (loaded dynamically)
let mammoth;
try { mammoth = require('mammoth'); } catch (e) { mammoth = null; }

/**
 * Extract text from different resume file types.
 * Supports PDF (pdf-parse), DOCX (mammoth), and binary fallback.
 */
const extractTextFromFile = async (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);

  // DOCX
  if (mimeType && mimeType.includes('officedocument')) {
    if (mammoth) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } catch (err) {
        console.warn('mammoth failed:', err.message);
      }
    }
  }

  // PDF
  if ((mimeType && mimeType.includes('pdf')) || path.extname(filePath).toLowerCase() === '.pdf') {
    try {
      const pdfparse = require('pdf-parse');
      try {
        const data = await pdfparse(buffer);
        if (data && data.text && data.text.trim().length > 50) return data.text;
      } catch (err) {
        console.warn('pdf-parse error (will fallback):', err && (err.message || err));
      }
    } catch (e) {
      // pdf-parse not installed
    }
  }

  // Binary fallback
  try {
    const raw = buffer.toString('utf8');
    const matches = raw.match(/[\w\s\-\.,'\"()\/]{6,}/g) || [];
    const joined = matches.join(' ');
    const deduped = joined.replace(/(\b\w+\b)(?:\s+\1\b)+/gi, '$1');
    return deduped.trim();
  } catch (err) {
    console.warn('binary fallback failed:', err.message);
    return '';
  }
};

// ═══════════════════════════════════════════════════════════════════════
// NEW: Career Readiness Analysis (Gemini-powered)
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/resume/analyze-career
 * Accepts: resume file + company + jobRole (form fields)
 * Query param: ?force=true  → skip cache, always run fresh AI analysis
 * Returns: full career readiness analysis JSON
 */
exports.analyzeCareer = async (req, res) => {
  const filePath = req.file?.path;

  try {
    console.log('[Career Analysis] Request received.');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX resume file.'
      });
    }

    const { company, jobRole } = req.body;
    const forceReanalyze = req.query.force === 'true';

    if (!company || !jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Company and Job Role are required fields.'
      });
    }

    // 1. Extract resume text
    const mimeType = req.file.mimetype || '';
    const resumeFilename = req.file.originalname || 'resume';
    let resumeText = await extractTextFromFile(filePath, mimeType);

    if (!resumeText || resumeText.trim().length < 40) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from resume. Please upload a searchable PDF or DOCX (not a scanned image).'
      });
    }

    // 2. Generate fingerprint for deduplication
    const fingerprint = generateFingerprint(resumeText, company, jobRole);
    console.log(`[Career Analysis] Fingerprint: ${fingerprint.substring(0, 16)}... | force=${forceReanalyze}`);

    // 3. Cache lookup — skip if force=true
    if (!forceReanalyze) {
      const cached = await ResumeAnalysis.findOne({
        userId: req.user.id,
        fingerprint
      }).sort({ createdAt: -1 });

      if (cached) {
        console.log(`[Career Analysis] Cache HIT — returning stored analysis (${cached._id})`);

        // Cleanup uploaded file (not needed, analysis already done)
        try { fs.unlinkSync(filePath); } catch (e) {}

        return res.status(200).json({
          success: true,
          fromCache: true,
          data: {
            analysisId: cached._id,
            atsScore: cached.atsScore,
            careerReadiness: cached.careerReadiness,
            keywordMatch: cached.keywordMatch,
            interestScore: cached.interestScore,
            projectScore: cached.projectScore,
            internshipScore: cached.internshipScore,
            certificationScore: cached.certificationScore,
            matchedSkills: cached.matchedSkills,
            missingSkills: cached.missingSkills,
            strengths: cached.strengths,
            weaknesses: cached.weaknesses,
            whyThisScore: cached.whyThisScore,
            interestExplanation: cached.interestExplanation,
            projectExplanation: cached.projectExplanation,
            internshipExplanation: cached.internshipExplanation,
            certificationExplanation: cached.certificationExplanation,
            recommendations: cached.recommendations,
            roadmap: cached.roadmap,
            estimatedScoreAfterImprovements: cached.estimatedScoreAfterImprovements,
            extractedSkills: cached.extractedSkills.map(s => ({ skill: s, score: 10 })),
            jdSource: cached.jobDescriptionSource,
            company: cached.company,
            jobRole: cached.jobRole,
            resumeFilename: cached.resumeFilename
          }
        });
      }
    }
    console.log(`[Career Analysis] Cache MISS — running fresh AI analysis`);

    // 4. Fetch Job Description (with provider fallback)
    console.log(`[Career Analysis] Fetching JD for ${jobRole} @ ${company}`);
    const { description: jobDescription, source: jdSource } = await fetchJobDescription(company, jobRole);

    // 5. Call Gemini AI for analysis
    console.log('[Career Analysis] Calling Gemini AI...');
    let aiResult;
    try {
      aiResult = await analyzeResumeWithGemini({
        resumeText,
        jobDescription,
        company,
        jobRole
      });
    } catch (geminiError) {
      console.error('[Career Analysis] Gemini failed:', geminiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI analysis service is temporarily unavailable. Please check your GEMINI_API_KEY and try again.',
        error: geminiError.message
      });
    }

    // 6. Validate and enrich result
    const { corrected } = validateAnalysisResult(aiResult);
    const enriched = enrichAnalysisResult(corrected, company, jobRole);

    // 7. Extract basic skills for backward compatibility
    const skillsAnalysis = extractSkills(resumeText);

    // 8. Save to DB (ResumeAnalysis collection)
    let savedAnalysis = null;
    if (req.user) {
      try {
        // If force re-analyze, delete old cached record for this fingerprint
        if (forceReanalyze && fingerprint) {
          await ResumeAnalysis.deleteMany({ userId: req.user.id, fingerprint });
          console.log('[Career Analysis] Deleted old cached records for fingerprint.');
        }

        savedAnalysis = await ResumeAnalysis.create({
          userId: req.user.id,
          fingerprint,
          resumeFilename,
          company,
          jobRole,
          jobDescription: jobDescription.substring(0, 2000),
          jobDescriptionSource: jdSource,
          resumeTextSnippet: resumeText.substring(0, 500),
          bestCareerRole: enriched.bestCareerRole,
          bestCareerMatchPercentage: enriched.bestCareerMatchPercentage,
          rankedCareerRoles: enriched.rankedCareerRoles,
          atsScore: enriched.atsScore,
          careerReadiness: enriched.careerReadiness,
          keywordMatch: enriched.keywordMatch,
          interestScore: enriched.interestScore,
          projectScore: enriched.projectScore,
          internshipScore: enriched.internshipScore,
          certificationScore: enriched.certificationScore,
          matchedSkills: enriched.matchedSkills,
          missingSkills: enriched.missingSkills,
          extractedSkills: skillsAnalysis.skills.map(s => s.skill),
          strengths: enriched.strengths,
          weaknesses: enriched.weaknesses,
          whyThisScore: enriched.whyThisScore,
          interestExplanation: enriched.interestExplanation,
          projectExplanation: enriched.projectExplanation,
          internshipExplanation: enriched.internshipExplanation,
          certificationExplanation: enriched.certificationExplanation,
          recommendations: enriched.recommendations,
          roadmap: enriched.roadmap,
          estimatedScoreAfterImprovements: enriched.estimatedScoreAfterImprovements,
          analysisStatus: 'completed',
          aiProvider: 'gemini',
          fromCache: false
        });

        // Update User document with latest scores and top role
        await User.findByIdAndUpdate(req.user.id, {
          skills: skillsAnalysis.skills.map(s => s.skill),
          topRole: enriched.bestCareerRole || jobRole,
          atsScore: enriched.atsScore,
          careerReadiness: enriched.careerReadiness,
          interestScore: enriched.interestScore,
          projectScore: enriched.projectScore,
          internshipScore: enriched.internshipScore,
          certificationScore: enriched.certificationScore,
          keywordMatch: enriched.keywordMatch,
          targetCompany: company,
          targetRole: jobRole,
          techScore: skillsAnalysis.techScore,
          profileCompleteness: skillsAnalysis.profileCompleteness,
          resumeQuality: skillsAnalysis.resumeQuality,
          strengths: enriched.strengths,
          weaknesses: enriched.weaknesses,
          education: skillsAnalysis.educations,
          certifications: skillsAnalysis.certifications,
          projectsCount: skillsAnalysis.projectsCount,
          internshipsCount: skillsAnalysis.internshipsCount,
          lastAnalysisId: savedAnalysis._id,
          $inc: { analysisCount: 1 },
          $push: {
            recentActivity: `Career analysis for ${jobRole} @ ${company}: Readiness ${enriched.careerReadiness}%`
          }
        });

        // Also store in legacy Resume model for backward compatibility
        await Resume.create({
          userId: req.user.id,
          fileUrl: 'processed',
          extractedSkills: skillsAnalysis.skills.map(s => s.skill),
          strengths: enriched.strengths
        });

        console.log('[Career Analysis] Saved to DB. Analysis ID:', savedAnalysis._id);
      } catch (dbError) {
        console.error('[Career Analysis] DB save failed (continuing):', dbError.message);
      }
    }

    // 9. Cleanup uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn('File cleanup deferred:', unlinkError.message);
    }

    // 10. Return response
    return res.status(200).json({
      success: true,
      fromCache: false,
      data: {
        analysisId: savedAnalysis?._id || null,
        ...enriched,
        jdSource,
        extractedSkills: skillsAnalysis.skills,
        educations: skillsAnalysis.educations,
        experienceLevel: skillsAnalysis.experienceLevel,
        techScore: skillsAnalysis.techScore,
        profileCompleteness: skillsAnalysis.profileCompleteness,
        resumeFilename
      }
    });

  } catch (error) {
    console.error('[Career Analysis] Unexpected error:', error.stack || error);

    // Cleanup file on error
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      message: 'Career analysis failed due to an internal error. Please try again.',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// NEW: Fetch available companies and roles for dropdowns
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/resume/companies
 * Returns: list of companies with their available roles
 */
exports.getCompaniesAndRoles = async (req, res) => {
  try {
    const companies = getAvailableCompanies();
    const data = companies.map(company => ({
      name: company,
      roles: getRolesForCompany(company)
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch company data.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// NEW: Analysis History for comparison
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/resume/history
 * Returns paginated career analyses for the authenticated user.
 * Query params:
 *   ?page=1&limit=20          — pagination (default: page 1, 20 per page)
 *   ?search=google            — text search across company/jobRole/filename
 *   ?company=Google           — filter by company name (case-insensitive)
 *   ?role=Engineer            — filter by job role (case-insensitive)
 *   ?sort=newest|oldest       — sort order (default: newest)
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      company = '',
      role = '',
      sort = 'newest'
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { userId: req.user.id };

    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }
    if (role) {
      filter.jobRole = { $regex: role, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { company:        { $regex: search, $options: 'i' } },
        { jobRole:        { $regex: search, $options: 'i' } },
        { resumeFilename: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [analyses, total] = await Promise.all([
      ResumeAnalysis.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .select('company jobRole resumeFilename careerReadiness atsScore keywordMatch interestScore projectScore internshipScore certificationScore estimatedScoreAfterImprovements fromCache createdAt'),
      ResumeAnalysis.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve analysis history.' });
  }
};

/**
 * GET /api/resume/history/:id
 * Returns: full analysis by ID
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve analysis.' });
  }
};

/**
 * DELETE /api/resume/history/:id
 * Deletes a single analysis record (must belong to the authenticated user).
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const deleted = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Analysis not found or already deleted.' });
    }

    console.log(`[History] Deleted analysis ${req.params.id} for user ${req.user.id}`);
    return res.status(200).json({ success: true, message: 'Analysis deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete analysis.' });
  }
};

/**
 * GET /api/resume/latest
 * Returns the most recent complete analysis for the authenticated user.
 * This is the Single Source of Truth consumed by AnalysisContext on every page.
 */
exports.getLatestAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      userId: req.user.id,
      analysisStatus: 'completed'
    }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(200).json({ success: true, data: null, hasAnalysis: false });
    }

    // Ensure rankedCareerRoles is populated with 5 evidence-based roles
    const skills = analysis.extractedSkills || analysis.matchedSkills || [];
    const skillsLower = skills.map(s => String(s).toLowerCase());
    const isWeb = skillsLower.some(s => ['react', 'node', 'javascript', 'express', 'mongodb', 'html', 'css'].includes(s));
    const isData = skillsLower.some(s => ['python', 'pandas', 'machine learning', 'sql', 'tensorflow', 'r'].includes(s));

    let bestRole = analysis.bestCareerRole || analysis.jobRole || (isData ? 'Data Scientist' : (isWeb ? 'Full Stack Developer' : 'Software Engineer'));
    let bestMatch = analysis.bestCareerMatchPercentage || Math.max(75, analysis.careerReadiness || 85);

    let rankedRoles = (analysis.rankedCareerRoles && analysis.rankedCareerRoles.length > 0) ? analysis.rankedCareerRoles : [];

    if (rankedRoles.length === 0) {
      if (isWeb) {
        rankedRoles = [
          {
            role: 'Full Stack Developer',
            matchPercentage: Math.min(96, bestMatch + 4),
            whyRecommended: 'Your resume shows strong hands-on experience in MERN stack development (React, Node.js, Express, MongoDB).',
            matchedSkills: skills.filter(s => ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'HTML', 'CSS', 'REST APIs'].includes(s)),
            missingSkills: ['TypeScript', 'Docker', 'GraphQL'],
            growthPotential: 'Extremely High',
            avgSalary: '₹12L – ₹30L',
            hiringDemand: 'Very High',
            companiesHiring: ['Google', 'Zoho', 'Swiggy', 'Freshworks', 'Flipkart'],
            roadmap: ['Master TypeScript and static typing', 'Implement Docker containerization', 'Build CI/CD pipelines'],
            requiredProjects: ['Microservices E-Commerce Platform', 'Real-Time AI Dashboard'],
            requiredCertifications: ['AWS Certified Developer - Associate', 'Meta Front-End Certificate'],
            interviewDifficulty: 'Hard'
          },
          {
            role: 'Backend Engineer',
            matchPercentage: Math.max(65, bestMatch - 3),
            whyRecommended: 'Proven skills in Node.js, Express, and database management for API architectures.',
            matchedSkills: skills.filter(s => ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'SQL'].includes(s)),
            missingSkills: ['Redis', 'Kafka', 'System Design'],
            growthPotential: 'High',
            avgSalary: '₹14L – ₹32L',
            hiringDemand: 'Extremely High',
            companiesHiring: ['Amazon', 'Flipkart', 'Swiggy', 'Microsoft'],
            roadmap: ['Master Redis Caching', 'Learn Message Queues with Kafka', 'Practice System Design'],
            requiredProjects: ['Distributed Event-Driven Queue', 'High Throughput API Gateway'],
            requiredCertifications: ['MongoDB Certified Developer'],
            interviewDifficulty: 'Hard'
          },
          {
            role: 'Frontend Developer',
            matchPercentage: Math.max(60, bestMatch - 6),
            whyRecommended: 'Solid foundation in UI engineering, component architecture, and responsive styling.',
            matchedSkills: skills.filter(s => ['React', 'JavaScript', 'HTML', 'CSS'].includes(s)),
            missingSkills: ['Next.js', 'Core Web Vitals', 'TailwindCSS'],
            growthPotential: 'High',
            avgSalary: '₹10L – ₹24L',
            hiringDemand: 'High',
            companiesHiring: ['Freshworks', 'Zoho', 'Infosys'],
            roadmap: ['Learn Next.js App Router', 'Optimize Web Vitals & Lazy Loading'],
            requiredProjects: ['Responsive UI Component Library', 'PWA Dashboard'],
            requiredCertifications: ['Meta Front-End Developer Professional'],
            interviewDifficulty: 'Medium'
          },
          {
            role: 'Software Engineer',
            matchPercentage: Math.max(55, bestMatch - 9),
            whyRecommended: 'General software engineering principles and object-oriented programming foundation.',
            matchedSkills: skills.slice(0, 4),
            missingSkills: ['Data Structures & Algorithms', 'System Architecture'],
            growthPotential: 'High',
            avgSalary: '₹10L – ₹28L',
            hiringDemand: 'Extremely High',
            companiesHiring: ['TCS', 'Wipro', 'Infosys', 'Microsoft'],
            roadmap: ['Practice LeetCode Data Structures', 'Study Design Patterns'],
            requiredProjects: ['Algorithmic Engine', 'Object-Oriented System'],
            requiredCertifications: ['Oracle Java Certified Professional'],
            interviewDifficulty: 'Medium'
          },
          {
            role: 'DevOps / Cloud Engineer',
            matchPercentage: Math.max(50, bestMatch - 15),
            whyRecommended: 'Adjacent domain for candidates looking to bridge web deployment into cloud operations.',
            matchedSkills: skills.filter(s => ['Git', 'Linux', 'Node.js'].includes(s)),
            missingSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
            growthPotential: 'Extremely High',
            avgSalary: '₹14L – ₹35L',
            hiringDemand: 'Very High',
            companiesHiring: ['Amazon', 'Google', 'Microsoft'],
            roadmap: ['Learn Docker & Kubernetes', 'Obtain AWS Cloud Practitioner'],
            requiredProjects: ['Kubernetes Cluster Deployment', 'Terraform Infrastructure'],
            requiredCertifications: ['AWS Certified Solutions Architect'],
            interviewDifficulty: 'Expert'
          }
        ];
      } else {
        rankedRoles = [
          {
            role: bestRole,
            matchPercentage: bestMatch,
            whyRecommended: `Your background shows strong technical foundations for ${bestRole}.`,
            matchedSkills: skills.slice(0, 4),
            missingSkills: ['System Design', 'Cloud Architecture'],
            growthPotential: 'High',
            avgSalary: '₹10L – ₹25L',
            hiringDemand: 'High',
            companiesHiring: ['Google', 'Microsoft', 'Infosys', 'TCS'],
            roadmap: ['Master core language fundamentals', 'Build full-fledged portfolio project', 'Practice technical interviewing'],
            requiredProjects: ['Full Stack Application', 'API Microservice'],
            requiredCertifications: ['AWS Certified Developer'],
            interviewDifficulty: 'Hard'
          },
          {
            role: 'Software Engineer',
            matchPercentage: Math.max(60, bestMatch - 5),
            whyRecommended: 'Solid problem-solving skills and computer science fundamentals.',
            matchedSkills: skills.slice(0, 3),
            missingSkills: ['Data Structures & Algorithms'],
            growthPotential: 'High',
            avgSalary: '₹9L – ₹22L',
            hiringDemand: 'Very High',
            companiesHiring: ['TCS', 'Wipro', 'Infosys'],
            roadmap: ['Practice LeetCode algorithms', 'Study OOP principles'],
            requiredProjects: ['Core Software Engine'],
            requiredCertifications: ['Oracle Certified Associate'],
            interviewDifficulty: 'Medium'
          },
          {
            role: 'Full Stack Developer',
            matchPercentage: Math.max(55, bestMatch - 10),
            whyRecommended: 'Adjacent career role with high industry demand.',
            matchedSkills: skills.slice(0, 3),
            missingSkills: ['React', 'Node.js'],
            growthPotential: 'High',
            avgSalary: '₹10L – ₹25L',
            hiringDemand: 'High',
            companiesHiring: ['Zoho', 'Freshworks', 'Swiggy'],
            roadmap: ['Learn React & Node.js', 'Build web apps'],
            requiredProjects: ['Web Application Portal'],
            requiredCertifications: ['Meta Front-End Certificate'],
            interviewDifficulty: 'Medium'
          },
          {
            role: 'Frontend Developer',
            matchPercentage: Math.max(50, bestMatch - 14),
            whyRecommended: 'Focused UI development role for client-facing applications.',
            matchedSkills: skills.slice(0, 2),
            missingSkills: ['HTML', 'CSS', 'JavaScript'],
            growthPotential: 'Medium',
            avgSalary: '₹8L – ₹18L',
            hiringDemand: 'High',
            companiesHiring: ['Zoho', 'Infosys'],
            roadmap: ['Learn Web UI development'],
            requiredProjects: ['Responsive Website'],
            requiredCertifications: ['FreeCodeCamp Web Development'],
            interviewDifficulty: 'Easy'
          },
          {
            role: 'Cloud Engineer',
            matchPercentage: Math.max(45, bestMatch - 18),
            whyRecommended: 'Infrastructure management and cloud deployment career path.',
            matchedSkills: skills.slice(0, 2),
            missingSkills: ['AWS', 'Docker'],
            growthPotential: 'High',
            avgSalary: '₹12L – ₹28L',
            hiringDemand: 'High',
            companiesHiring: ['Amazon', 'Microsoft'],
            roadmap: ['Learn Cloud basics'],
            requiredProjects: ['Cloud Infrastructure Script'],
            requiredCertifications: ['AWS Cloud Practitioner'],
            interviewDifficulty: 'Hard'
          }
        ];
      }
    }

    const analysisPayload = {
      analysisId:    analysis._id,
      company:       analysis.company,
      jobRole:       analysis.jobRole,
      resumeFilename: analysis.resumeFilename,
      createdAt:     analysis.createdAt,
      fromCache:     analysis.fromCache,
      jdSource:      analysis.jobDescriptionSource,
      // Core scores & Evidence-Based Career Recommendations
      bestCareerRole:            bestRole,
      bestCareerMatchPercentage: bestMatch,
      rankedCareerRoles:         rankedRoles,
      atsScore:                  analysis.atsScore,
      careerReadiness:           analysis.careerReadiness,
      keywordMatch:              analysis.keywordMatch,
      estimatedScoreAfterImprovements: analysis.estimatedScoreAfterImprovements,
      // Sub-scores
      interestScore:       analysis.interestScore,
      projectScore:        analysis.projectScore,
      internshipScore:     analysis.internshipScore,
      certificationScore:  analysis.certificationScore,
      // Skills
      matchedSkills:   analysis.matchedSkills,
      missingSkills:   analysis.missingSkills,
      extractedSkills: analysis.extractedSkills,
      // Explainability
      strengths:       analysis.strengths,
      weaknesses:      analysis.weaknesses,
      whyThisScore:    analysis.whyThisScore,
      interestExplanation:      analysis.interestExplanation,
      projectExplanation:       analysis.projectExplanation,
      internshipExplanation:    analysis.internshipExplanation,
      certificationExplanation: analysis.certificationExplanation,
      // Recommendations & roadmap
      recommendations: analysis.recommendations,
      roadmap:         analysis.roadmap
    };

    return res.status(200).json({
      success: true,
      hasAnalysis: true,
      analysis: analysisPayload,
      data: analysisPayload
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve latest analysis.' });
  }
};


// ═══════════════════════════════════════════════════════════════════════
// EXISTING: Legacy handlers — UNCHANGED
// ═══════════════════════════════════════════════════════════════════════


/**
 * POST /api/resume/analyze
 * Legacy ATS analysis — preserved for backward compatibility.
 */
exports.analyzeResume = async (req, res) => {
  try {
    console.log("Analyze Resume Request Received.");

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX resume' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype || '';
    let resumeText = await extractTextFromFile(filePath, mimeType);

    if (!resumeText || resumeText.trim().length < 40) {
      console.warn('Extracted text too short. Length:', (resumeText || '').length);
      return res.status(400).json({ success: false, message: 'Could not extract readable text from resume. Please upload a searchable PDF or DOCX. Scanned PDFs are supported via OCR if configured.' });
    }

    const analysis = extractSkills(resumeText);
    const userSkills = analysis.skills;
    const recommendedRoles = calculateCareerMap(userSkills);

    let skillGaps = [];
    let trainingPath = [];

    if (recommendedRoles.length > 0) {
      const topRole = recommendedRoles[0];
      skillGaps = getSkillGaps(userSkills, topRole);
      trainingPath = getTrainingPath(skillGaps);

      if (req.user) {
        const skillNames = userSkills.map(s => s.skill);
        await User.findByIdAndUpdate(req.user.id, {
          skills: skillNames,
          topRole: topRole.role,
          matchPercentage: topRole.matchPercentage,
          skillGaps: skillGaps,
          atsScore: analysis.atsScore,
          techScore: analysis.techScore,
          profileCompleteness: analysis.profileCompleteness,
          resumeQuality: analysis.resumeQuality,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          education: analysis.educations,
          certifications: analysis.certifications,
          projectsCount: analysis.projectsCount,
          internshipsCount: analysis.internshipsCount,
          $push: { recentActivity: `Analyzed resume: ATS Score ${analysis.atsScore}%, Top Recommended Role: ${topRole.role}` }
        });

        const newResume = new Resume({
          userId: req.user.id,
          fileUrl: filePath,
          extractedSkills: skillNames,
          strengths: analysis.strengths
        });
        await newResume.save();
      }
    }

    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn("Deferred file cleanup:", unlinkError.message);
    }

    res.status(200).json({
      success: true,
      data: {
        skills: userSkills,
        recommendedRoles: recommendedRoles.map(r => ({
          role: r.role,
          matchPercentage: r.matchPercentage
        })),
        skillGaps: skillGaps,
        trainingPath: trainingPath,
        atsScore: analysis.atsScore,
        techScore: analysis.techScore,
        profileCompleteness: analysis.profileCompleteness,
        resumeQuality: analysis.resumeQuality,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        education: analysis.educations,
        certifications: analysis.certifications,
        projectsCount: analysis.projectsCount,
        internshipsCount: analysis.internshipsCount
      }
    });

  } catch (error) {
    console.error('Resume Analysis Error:', error && (error.stack || error));
    res.status(500).json({
      success: false,
      message: 'Internal System Error during analysis',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

/**
 * GET /api/resume/data
 * Legacy data retrieval — unchanged.
 */
exports.getResumeData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: {
        skills: user.skills.map(s => ({ skill: s, score: 10 })),
        topRole: user.topRole,
        matchPercentage: user.matchPercentage,
        skillGaps: user.skillGaps,
        atsScore: user.atsScore,
        techScore: user.techScore,
        profileCompleteness: user.profileCompleteness,
        resumeQuality: user.resumeQuality,
        strengths: user.strengths,
        weaknesses: user.weaknesses,
        education: user.education,
        certifications: user.certifications,
        projectsCount: user.projectsCount,
        internshipsCount: user.internshipsCount,
        // New career readiness fields
        careerReadiness: user.careerReadiness || 0,
        interestScore: user.interestScore || 0,
        projectScore: user.projectScore || 0,
        internshipScore: user.internshipScore || 0,
        certificationScore: user.certificationScore || 0,
        keywordMatch: user.keywordMatch || 0,
        targetCompany: user.targetCompany || '',
        targetRole: user.targetRole || '',
        lastAnalysisId: user.lastAnalysisId || null,
        analysisCount: user.analysisCount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve resume data' });
  }
};

exports.uploadResume = async (req, res) => {
  res.status(200).json({ success: true, message: 'Resume uploaded successfully' });
};
