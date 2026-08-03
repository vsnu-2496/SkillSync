/**
 * geminiService.js
 * ─────────────────────────────────────────────────────────────────────
 * Handles all Gemini AI interactions for career analysis.
 * Uses the @google/generative-ai SDK with a highly engineered prompt
 * that returns STRICT JSON — never plain text.
 *
 * MODELS (confirmed working via ListModels on 2026-08-02):
 *   Primary  : gemini-flash-latest
 *   Fallback1: gemini-pro-latest
 *   Fallback2: gemini-2.0-flash-lite
 *
 * NOTE: gemini-1.5-flash and gemini-2.0-flash are NOT available on this
 * API key. They return 404. The model list was queried directly from the
 * API to confirm what is available.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Model priority chain (live-tested 2026-08-02) ────────────────────
// Both confirmed working via ListModels + generateContent calls.
// gemini-2.0-flash, gemini-2.5-flash, gemini-1.5-flash, gemini-pro-latest,
// gemini-2.0-flash-lite ALL return 404 on this API key.
const MODEL_CHAIN = [
  'gemini-flash-latest',      // ✅ confirmed working — primary
  'gemini-flash-lite-latest', // ✅ confirmed working — fallback
];

// ─── Initialize Gemini Client ──────────────────────────────────────────
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

/**
 * Build the master career analysis prompt.
 * This prompt instructs Gemini to act as an expert career counselor and
 * return a strict, parseable JSON object with all required fields.
 *
 * NOTE: Prompt content and JSON schema are UNCHANGED from original.
 */
// ─── Prompt size limits (keep small for fast responses) ─────────────
const RESUME_CHAR_LIMIT = 4000;  // ~1000 tokens — enough for full analysis
const JD_CHAR_LIMIT     = 1800;  // ~450 tokens

const buildCareerAnalysisPrompt = ({
  resumeText,
  jobDescription,
  company,
  jobRole,
}) => {
  return `
You are an expert Career Readiness Analyst and AI Career Coach with 15+ years of experience in technical recruitment, HR analytics, and career development for software engineers and IT professionals in India and globally.

Your task is to perform a COMPREHENSIVE and HIGHLY PERSONALIZED career readiness analysis by comparing the candidate's resume against the target job description.

═══════════════════════════════════════════════════════
CANDIDATE RESUME TEXT:
═══════════════════════════════════════════════════════
${resumeText.substring(0, RESUME_CHAR_LIMIT)}

═══════════════════════════════════════════════════════
TARGET COMPANY: ${company}
TARGET ROLE: ${jobRole}
JOB DESCRIPTION / REQUIREMENTS:
═══════════════════════════════════════════════════════
${jobDescription.substring(0, JD_CHAR_LIMIT)}

═══════════════════════════════════════════════════════
ANALYSIS INSTRUCTIONS:
═══════════════════════════════════════════════════════

1. KEYWORD MATCH: Compare skills, tools, technologies, and keywords from the resume against the job description. Calculate keywordMatch as a percentage (0-100).

2. CAREER READINESS SCORE (100 points = 4 × 25):
   - interestScore (0-25): Does the candidate's area of interest, projects, and domain experience align with ${jobRole} at ${company}? Score based on relevance and depth.
   - projectScore (0-25): Evaluate project quality, quantity, relevance to the role, technologies used, and demonstrated outcomes. More industry-relevant projects = higher score.
   - internshipScore (0-25): Evaluate internship experience, relevance to the role, number of internships, and skills gained. Fresh graduates with no internship get 5-10 only if projects compensate.
   - certificationScore (0-25): Evaluate professional certifications, online course completions, hackathon wins, and verified credentials relevant to the role.
   - careerReadiness: SUM of all four scores above (max 100).

3. ATS SCORE (0-100): How well does this resume pass standard ATS systems for this specific job? Consider: keyword density, section completeness, formatting signals, skill alignment.

4. EXPLAIN WHY: Write 3-5 sentences in whyThisScore explaining EXACTLY why the candidate received this careerReadiness score. Be specific — mention actual skills, projects, and gaps found. Use a conversational, coaching tone.

5. EXPLANATIONS FOR EACH CATEGORY (write 2-3 sentences each):
   - interestExplanation: Why this interest score? What domain alignment was found or missing?
   - projectExplanation: Why this project score? Which projects helped or hurt?
   - internshipExplanation: Why this internship score? What was found or missing?
   - certificationExplanation: Why this certification score? What certs helped or what is missing?

6. STRENGTHS & WEAKNESSES: Identify 3-5 specific, actionable strengths and weaknesses based on this specific job context.

7. RECOMMENDATIONS: Provide highly specific, actionable recommendations:
   - projects: 3-4 specific project ideas the candidate should build to improve their profile for ${jobRole}
   - internships: 3-4 specific types of internships or platforms where they should apply (e.g., "Apply for ML internships via Internshala, LinkedIn for companies like Zoho, Freshworks")
   - certifications: 3-4 specific certifications that would directly improve their score (e.g., "AWS Certified Developer Associate", "Google Professional ML Engineer")
   - skills: 4-6 specific skills/technologies they must learn immediately

8. CAREER ROADMAP: Create a realistic 6-step actionable roadmap (Week/Month timeline) for this candidate to become fully ready for ${jobRole} at ${company}.

9. ESTIMATED SCORE AFTER IMPROVEMENTS: If the candidate completes ALL recommendations, what careerReadiness score would they realistically achieve? Be honest (typically 85-95 if currently 60-80).

═══════════════════════════════════════════════════════
OUTPUT FORMAT — CRITICAL INSTRUCTIONS:
═══════════════════════════════════════════════════════

You MUST return ONLY a valid JSON object. No markdown, no explanation, no code fences.
Start with { and end with }.

The JSON must strictly follow this schema:

{
  "atsScore": <integer 0-100>,
  "careerReadiness": <integer 0-100, must equal interestScore+projectScore+internshipScore+certificationScore>,
  "keywordMatch": <integer 0-100>,
  "matchedSkills": [<array of strings — skills found in both resume and JD>],
  "missingSkills": [<array of strings — important skills in JD but missing from resume>],
  "interestScore": <integer 0-25>,
  "projectScore": <integer 0-25>,
  "internshipScore": <integer 0-25>,
  "certificationScore": <integer 0-25>,
  "strengths": [<array of 3-5 specific strength strings>],
  "weaknesses": [<array of 3-5 specific weakness strings>],
  "whyThisScore": "<3-5 sentence explanation of the overall career readiness score>",
  "interestExplanation": "<2-3 sentences on interest score>",
  "projectExplanation": "<2-3 sentences on project score>",
  "internshipExplanation": "<2-3 sentences on internship score>",
  "certificationExplanation": "<2-3 sentences on certification score>",
  "recommendations": {
    "projects": [<array of 3-4 specific project suggestions>],
    "internships": [<array of 3-4 specific internship suggestions with platforms>],
    "certifications": [<array of 3-4 specific certification names>],
    "skills": [<array of 4-6 specific skill/technology names>]
  },
  "roadmap": [<array of 6 timeline steps as strings, e.g., "Week 1-2: Complete Python advanced course on Coursera">],
  "estimatedScoreAfterImprovements": <integer 0-100>
}
`;
};

/**
 * Attempt generation with a specific model.
 * Returns { success, rawText, modelUsed, error }.
 */
// Per-attempt timeout: abort if Gemini hasn't responded in this many ms
const ATTEMPT_TIMEOUT_MS = 70000; // 70 seconds per model attempt

const attemptWithModel = async (modelName, prompt) => {
  console.log(`[Gemini] → Trying model: ${modelName}`);
  const t0 = Date.now();
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 2048, // reduced from 4096 — faster response, still complete
      }
    });

    console.log(`[Gemini]   Sending request to ${modelName} (timeout: ${ATTEMPT_TIMEOUT_MS / 1000}s)...`);

    // Race the API call against a hard timeout
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

/**
 * Parse raw text response into a JSON object.
 * Handles markdown fences, partial wrapping, and extracts JSON via regex.
 */
const parseGeminiResponse = (rawText) => {
  console.log(`[Gemini] Parsing response (${rawText.length} chars)...`);

  // Step 1: Strip markdown code fences
  let cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Step 2: Try direct parse
  try {
    const parsed = JSON.parse(cleaned);
    console.log('[Gemini] ✓ Direct JSON parse succeeded');
    return parsed;
  } catch (e) {
    console.warn('[Gemini] Direct parse failed, trying regex extraction...');
  }

  // Step 3: Extract JSON object via greedy regex
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[Gemini] ✓ JSON extracted via regex fallback');
      return parsed;
    } catch (e) {
      console.error('[Gemini] Regex extraction also failed. Raw start:', rawText.substring(0, 200));
      throw new Error('Gemini returned malformed JSON that could not be parsed even with regex extraction.');
    }
  }

  console.error('[Gemini] No JSON object found in response. Raw:', rawText.substring(0, 300));
  throw new Error('Gemini response contained no JSON object.');
};

/**
 * Main analysis function.
 * Tries each model in MODEL_CHAIN until one succeeds or all fail.
 * Parses and sanitizes the JSON response before returning.
 */
const analyzeResumeWithGemini = async ({ resumeText, jobDescription, company, jobRole }) => {
  const prompt = buildCareerAnalysisPrompt({ resumeText, jobDescription, company, jobRole });

  console.log(`\n[Gemini] ═══════════════════════════════════════`);
  console.log(`[Gemini] Career analysis: ${jobRole} @ ${company}`);
  console.log(`[Gemini] Resume text length: ${resumeText.length} chars`);
  console.log(`[Gemini] JD length: ${jobDescription.length} chars`);
  console.log(`[Gemini] Model chain: ${MODEL_CHAIN.join(' → ')}`);
  console.log(`[Gemini] ═══════════════════════════════════════`);

  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    const attempt = await attemptWithModel(modelName, prompt);

    if (attempt.success) {
      console.log(`[Gemini] ✓ Using model: ${attempt.modelUsed}`);

      // Parse the response
      let parsed;
      try {
        parsed = parseGeminiResponse(attempt.rawText);
      } catch (parseErr) {
        console.error(`[Gemini] Parse failed for ${modelName}:`, parseErr.message);
        lastError = parseErr;
        continue; // try next model
      }

      // Sanitize and return
      const result = sanitizeAnalysisResult(parsed, company, jobRole);
      result._modelUsed = attempt.modelUsed; // attach for logging (stripped before DB save)
      console.log(`[Gemini] ✓ Analysis complete. careerReadiness=${result.careerReadiness}, atsScore=${result.atsScore}`);
      return result;
    }

    lastError = new Error(attempt.error);

    // Don't retry on auth errors (401/403) — no point trying other models
    if (attempt.error && (attempt.error.includes('401') || attempt.error.includes('403') || attempt.error.includes('API_KEY'))) {
      console.error('[Gemini] Auth error — stopping retry chain.');
      break;
    }

    // Small delay before next model attempt
    if (MODEL_CHAIN.indexOf(modelName) < MODEL_CHAIN.length - 1) {
      console.log('[Gemini] Waiting 500ms before next model attempt...');
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.error('[Gemini] ✗ All models in chain failed.');
  throw new Error(`Gemini AI unavailable after trying all models. Last error: ${lastError?.message || 'Unknown'}`);
};

/**
 * Validate and clamp all numeric fields to their expected ranges.
 * Ensures the frontend never receives invalid data.
 * NOTE: Logic and return shape UNCHANGED from original.
 */
const sanitizeAnalysisResult = (data, company, jobRole) => {
  const clamp = (val, min, max) => Math.max(min, Math.min(max, Math.round(Number(val) || 0)));
  const ensureArr = (val) => (Array.isArray(val) ? val : []);
  const ensureStr = (val) => (typeof val === 'string' ? val : '');

  const interestScore      = clamp(data.interestScore, 0, 25);
  const projectScore       = clamp(data.projectScore, 0, 25);
  const internshipScore    = clamp(data.internshipScore, 0, 25);
  const certificationScore = clamp(data.certificationScore, 0, 25);
  const computedReadiness  = interestScore + projectScore + internshipScore + certificationScore;

  return {
    atsScore:            clamp(data.atsScore, 0, 100),
    careerReadiness:     computedReadiness,
    keywordMatch:        clamp(data.keywordMatch, 0, 100),
    matchedSkills:       ensureArr(data.matchedSkills).map(String),
    missingSkills:       ensureArr(data.missingSkills).map(String),
    interestScore,
    projectScore,
    internshipScore,
    certificationScore,
    strengths:           ensureArr(data.strengths).map(String),
    weaknesses:          ensureArr(data.weaknesses).map(String),
    whyThisScore:        ensureStr(data.whyThisScore) || `Career readiness analysis completed for ${jobRole} at ${company}.`,
    interestExplanation:      ensureStr(data.interestExplanation),
    projectExplanation:       ensureStr(data.projectExplanation),
    internshipExplanation:    ensureStr(data.internshipExplanation),
    certificationExplanation: ensureStr(data.certificationExplanation),
    recommendations: {
      projects:       ensureArr(data.recommendations?.projects).map(String),
      internships:    ensureArr(data.recommendations?.internships).map(String),
      certifications: ensureArr(data.recommendations?.certifications).map(String),
      skills:         ensureArr(data.recommendations?.skills).map(String),
    },
    roadmap:           ensureArr(data.roadmap).map(String),
    estimatedScoreAfterImprovements: clamp(data.estimatedScoreAfterImprovements, 0, 100),
  };
};

module.exports = { analyzeResumeWithGemini };
