/**
 * geminiService.js
 * ─────────────────────────────────────────────────────────────────────
 * Handles all Gemini AI interactions for career analysis.
 * Uses the @google/generative-ai SDK with a highly engineered prompt
 * that returns STRICT JSON — never plain text.
 *
 * Primary Model : gemini-flash-latest
 * Fallback Model: gemini-flash-lite-latest
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_CHAIN = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
];

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const RESUME_CHAR_LIMIT = 4000;
const JD_CHAR_LIMIT     = 1800;

const buildCareerAnalysisPrompt = ({
  resumeText,
  jobDescription,
  company,
  jobRole,
}) => {
  return `
You are an expert Career Readiness Analyst and AI Career Counselor with 15+ years of experience in technical recruitment, HR analytics, and placement engineering.

Your primary mission: Perform an EVIDENCE-BASED career analysis of the candidate's resume.

CRITICAL DIRECTIVE ON CAREER RECOMMENDATIONS:
Do NOT simply echo the user's selected target role (${jobRole}).
Carefully examine the actual technologies, projects, internships, and skills inside the resume.
Determine the candidate's TRUE BEST MATCH CAREER ROLE based on their actual background, and provide a RANKED list of 5 suitable career roles with match percentages and explicit EVIDENCE explanations.

For example, if the candidate selected "AI Engineer" but their resume shows React, Node.js, MongoDB, JavaScript, Express, HTML, and CSS, their BEST match is "Full Stack Developer" or "Frontend Developer".

═══════════════════════════════════════════════════════
CANDIDATE RESUME TEXT:
═══════════════════════════════════════════════════════
${resumeText.substring(0, RESUME_CHAR_LIMIT)}

═══════════════════════════════════════════════════════
TARGET COMPANY: ${company}
SELECTED TARGET ROLE: ${jobRole}
JOB DESCRIPTION / REQUIREMENTS:
═══════════════════════════════════════════════════════
${jobDescription.substring(0, JD_CHAR_LIMIT)}

═══════════════════════════════════════════════════════
ANALYSIS & EVALUATION STEPS:
═══════════════════════════════════════════════════════

1. EVIDENCE-BASED CAREER RECOMMENDATIONS:
   - Identify bestCareerRole: The single best fitting career role for this student.
   - Calculate bestCareerMatchPercentage (0-100).
   - Provide rankedCareerRoles: Array of 5 ranked career roles (e.g. 1. Full Stack Developer 92%, 2. Backend Engineer 88%, 3. Frontend Developer 84%, 4. Software Engineer 80%, 5. Cloud/DevOps 72%).
     Each role entry MUST contain:
     - role: string
     - matchPercentage: integer (0-100)
     - whyRecommended: 2-3 sentences explaining why this role matches their actual resume evidence
     - matchedSkills: array of strings
     - missingSkills: array of strings
     - growthPotential: string (e.g. "Extremely High")
     - avgSalary: string (e.g. "₹12L – ₹28L")
     - hiringDemand: string (e.g. "High")
     - companiesHiring: array of strings (e.g. ["Google", "Microsoft", "Swiggy", "Zoho"])
     - roadmap: array of 3 actionable steps for this role
     - requiredProjects: array of 2 project ideas
     - requiredCertifications: array of 2 cert ideas
     - interviewDifficulty: string ("Easy", "Medium", "Hard", "Expert")

2. KEYWORD MATCH (0-100): Skills match against the specified job description.
3. CAREER READINESS SCORE (100 pts = 4 × 25):
   - interestScore (0-25)
   - projectScore (0-25)
   - internshipScore (0-25)
   - certificationScore (0-25)
   - careerReadiness = SUM (max 100)
4. ATS SCORE (0-100): ATS format compatibility and keyword density.
5. EXPLAIN WHY: 3-5 sentences in whyThisScore explaining the overall score with specific evidence.
6. STRENGTHS & WEAKNESSES: 3-5 specific bullet points each.
7. RECOMMENDATIONS: Actionable lists for projects, internships, certifications, skills.
8. CAREER ROADMAP: 6 step-by-step timeline actions.

═══════════════════════════════════════════════════════
OUTPUT FORMAT — RETURN STRICT JSON ONLY:
═══════════════════════════════════════════════════════

Return ONLY a valid JSON object without markdown fences:

{
  "bestCareerDomain": "Web & Cloud Engineering",
  "bestCareerRole": "Full Stack Developer",
  "bestCareerMatchPercentage": 92,
  "rankedCareerRoles": [
    {
      "role": "Full Stack Developer",
      "matchPercentage": 92,
      "whyRecommended": "Your resume demonstrates strong proficiency in React, Node.js, and MongoDB with deployed full-stack web applications.",
      "matchedSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "missingSkills": ["TypeScript", "Docker"],
      "growthPotential": "Extremely High",
      "avgSalary": "₹12L – ₹30L",
      "hiringDemand": "Very High",
      "companiesHiring": ["Google", "Zoho", "Swiggy", "Freshworks"],
      "roadmap": ["Learn TypeScript", "Master Microservices", "Build CI/CD pipeline"],
      "requiredProjects": ["E-Commerce Microservices Platform", "Realtime AI Chat Application"],
      "requiredCertifications": ["AWS Certified Developer Associate"],
      "interviewDifficulty": "Hard"
    }
  ],
  "atsScore": 85,
  "careerReadiness": 78,
  "keywordMatch": 80,
  "interestScore": 20,
  "projectScore": 22,
  "internshipScore": 18,
  "certificationScore": 18,
  "matchedSkills": ["React", "Node.js", "JavaScript", "MongoDB"],
  "missingSkills": ["Docker", "Kubernetes", "TypeScript"],
  "extractedSkills": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "Git"],
  "strengths": ["Strong MERN stack project portfolio", "Solid understanding of REST APIs"],
  "weaknesses": ["Lack of cloud containerization experience (Docker/K8s)"],
  "whyThisScore": "You possess excellent full-stack JavaScript foundations, but need cloud DevOps experience to hit peak readiness for senior roles.",
  "interestExplanation": "High alignment with Web & Full Stack Engineering.",
  "projectExplanation": "Great practical web projects built with MERN stack.",
  "internshipExplanation": "Moderate internship experience; additional industry exposure recommended.",
  "certificationExplanation": "Basic certifications present; adding AWS or Azure credentials will boost score.",
  "recommendations": {
    "projects": ["Build a Serverless SaaS Platform on AWS", "Develop a Micro-Frontend Architecture"],
    "internships": ["Apply for Full-Stack Developer Internships via LinkedIn and Internshala"],
    "certifications": ["AWS Certified Developer - Associate", "Meta Front-End Developer Certificate"],
    "skills": ["TypeScript", "Docker", "AWS Lambda", "Redis"]
  },
  "roadmap": [
    "Week 1-2: Master TypeScript and migrate an existing project",
    "Week 3-4: Learn Docker containerization and Docker Compose",
    "Week 5-6: Deploy microservices to AWS ECS / Lambda",
    "Week 7-8: Implement CI/CD using GitHub Actions",
    "Week 9-10: Practice LeetCode Medium algorithms",
    "Week 11-12: Mock interviews and final portfolio polish"
  ],
  "estimatedScoreAfterImprovements": 94
}
`;
};

const ATTEMPT_TIMEOUT_MS = 70000;

const attemptWithModel = async (modelName, prompt) => {
  console.log(`[Gemini] → Trying model: ${modelName}`);
  const t0 = Date.now();
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 3000,
      }
    });

    const generatePromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini model ${modelName} timed out after ${ATTEMPT_TIMEOUT_MS / 1000}s`)), ATTEMPT_TIMEOUT_MS)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const rawText = result.response.text();
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[Gemini] ✓ Response from ${modelName}: ${rawText.length} chars in ${elapsed}s`);
    return { success: true, rawText, modelUsed: modelName };
  } catch (err) {
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const isRetryable = err.message.includes('404') || err.message.includes('429') ||
                        err.message.includes('not found') || err.message.includes('timed out');
    console.error(`[Gemini] ✗ ${modelName} failed after ${elapsed}s: ${err.message.substring(0, 120)}`);
    return { success: false, error: err.message, isRetryable, modelUsed: modelName };
  }
};

const parseGeminiResponse = (rawText) => {
  console.log(`[Gemini] Parsing response (${rawText.length} chars)...`);

  let cleanText = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleanText.indexOf('{');
  const lastBrace  = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleanText);
  } catch (parseError) {
    console.error('[Gemini] JSON.parse error:', parseError.message);
    throw new Error('AI returned malformed JSON response.');
  }

  // Validate and supply fallbacks
  const clamped = (val, min, max, fallback) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  };

  const interestScore     = clamped(parsed.interestScore, 0, 25, 18);
  const projectScore      = clamped(parsed.projectScore, 0, 25, 18);
  const internshipScore   = clamped(parsed.internshipScore, 0, 25, 15);
  const certificationScore= clamped(parsed.certificationScore, 0, 25, 15);
  const careerReadiness   = interestScore + projectScore + internshipScore + certificationScore;

  const bestDomain = parsed.bestCareerDomain || (parsed.extractedSkills?.some(s => s.toLowerCase().includes('python')) ? 'Data Science & AI' : 'Web & Cloud Engineering');
  const bestRole = parsed.bestCareerRole || parsed.jobRole || 'Full Stack Developer';
  const bestMatch = clamped(parsed.bestCareerMatchPercentage, 50, 100, 88);

  const fallbackRanked = [
    {
      role: bestRole,
      matchPercentage: bestMatch,
      whyRecommended: `Based on your resume skills and projects, ${bestRole} is your highest alignment role.`,
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : ['JavaScript', 'React', 'Problem Solving'],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : ['TypeScript', 'Docker'],
      growthPotential: 'Extremely High',
      avgSalary: '₹12L – ₹30L',
      hiringDemand: 'High',
      companiesHiring: ['Google', 'Microsoft', 'Swiggy', 'Zoho', 'Infosys'],
      roadmap: ['Learn Advanced TypeScript', 'Build Microservices Architecture', 'Practice System Design'],
      requiredProjects: ['Full Stack Cloud Platform', 'Distributed System Service'],
      requiredCertifications: ['AWS Certified Developer - Associate'],
      interviewDifficulty: 'Hard'
    },
    {
      role: 'Software Development Engineer',
      matchPercentage: Math.max(60, bestMatch - 5),
      whyRecommended: 'Strong programming fundamentals and data structure knowledge found in resume.',
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : ['Java', 'Algorithms'],
      missingSkills: ['System Design', 'Kafka'],
      growthPotential: 'High',
      avgSalary: '₹14L – ₹32L',
      hiringDemand: 'Extremely High',
      companiesHiring: ['Amazon', 'Flipkart', 'TCS'],
      roadmap: ['Master Data Structures & Algorithms', 'Study System Design Patterns'],
      requiredProjects: ['Distributed Cache Engine', 'High Throughput Message Queue'],
      requiredCertifications: ['Oracle Certified Professional Java Developer'],
      interviewDifficulty: 'Hard'
    },
    {
      role: 'Frontend Engineer',
      matchPercentage: Math.max(55, bestMatch - 8),
      whyRecommended: 'Demonstrated experience in responsive web UI development and modern frameworks.',
      matchedSkills: ['JavaScript', 'React', 'HTML/CSS'],
      missingSkills: ['Next.js', 'Web Performance Tuning'],
      growthPotential: 'High',
      avgSalary: '₹10L – ₹24L',
      hiringDemand: 'High',
      companiesHiring: ['Freshworks', 'Swiggy', 'Zoho'],
      roadmap: ['Master Next.js & SSR', 'Learn Core Web Vitals optimization'],
      requiredProjects: ['Responsive SaaS Dashboard', 'UI Design System Library'],
      requiredCertifications: ['Meta Front-End Developer Professional Certificate'],
      interviewDifficulty: 'Medium'
    }
  ];

  const rankedCareerRoles = Array.isArray(parsed.rankedCareerRoles) && parsed.rankedCareerRoles.length > 0
    ? parsed.rankedCareerRoles
    : fallbackRanked;

  return {
    bestCareerDomain: bestDomain,
    bestCareerRole: bestRole,
    bestCareerMatchPercentage: bestMatch,
    rankedCareerRoles,
    atsScore:        clamped(parsed.atsScore, 0, 100, 75),
    careerReadiness: Math.min(100, careerReadiness),
    keywordMatch:    clamped(parsed.keywordMatch, 0, 100, 70),
    interestScore,
    projectScore,
    internshipScore,
    certificationScore,
    matchedSkills:   Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills:   Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    extractedSkills: Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [],
    strengths:       Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses:      Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    whyThisScore:    parsed.whyThisScore || 'Score calculated based on resume skill alignment and project portfolio.',
    interestExplanation:      parsed.interestExplanation || 'Domain alignment evaluated based on resume project topics.',
    projectExplanation:       parsed.projectExplanation || 'Project portfolio evaluated for technology stack depth.',
    internshipExplanation:    parsed.internshipExplanation || 'Internship score calculated from practical work experience.',
    certificationExplanation: parsed.certificationExplanation || 'Certification score based on verified industry credentials.',
    recommendations: {
      projects:       Array.isArray(parsed.recommendations?.projects) ? parsed.recommendations.projects : [],
      internships:    Array.isArray(parsed.recommendations?.internships) ? parsed.recommendations.internships : [],
      certifications: Array.isArray(parsed.recommendations?.certifications) ? parsed.recommendations.certifications : [],
      skills:         Array.isArray(parsed.recommendations?.skills) ? parsed.recommendations.skills : []
    },
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
    estimatedScoreAfterImprovements: clamped(parsed.estimatedScoreAfterImprovements, 0, 100, 90)
  };
};

const generateCareerAnalysis = async ({ resumeText, jobDescription, company, jobRole }) => {
  const prompt = buildCareerAnalysisPrompt({ resumeText, jobDescription, company, jobRole });

  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    const result = await attemptWithModel(modelName, prompt);

    if (result.success) {
      try {
        const parsed = parseGeminiResponse(result.rawText);
        return {
          ...parsed,
          modelUsed: result.modelUsed
        };
      } catch (parseErr) {
        console.error(`[Gemini] Parsing failed for ${modelName}:`, parseErr.message);
        lastError = parseErr;
      }
    } else {
      lastError = new Error(result.error);
    }
  }

  throw new Error(`AI Analysis failed across all models: ${lastError?.message || 'Unknown error'}`);
};

module.exports = {
  generateCareerAnalysis
};
