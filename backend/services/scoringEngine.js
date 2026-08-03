/**
 * scoringEngine.js
 * ─────────────────────────────────────────────────────────────────────
 * Validates, normalizes, and enriches the AI analysis result.
 * Acts as a safety layer between Gemini output and the database/frontend.
 */

/**
 * Validates a career analysis result from Gemini.
 * Returns { valid: boolean, errors: string[] }
 */
const validateAnalysisResult = (result) => {
  const errors = [];

  if (typeof result.atsScore !== 'number' || result.atsScore < 0 || result.atsScore > 100) {
    errors.push('atsScore out of range');
  }
  if (typeof result.careerReadiness !== 'number' || result.careerReadiness < 0 || result.careerReadiness > 100) {
    errors.push('careerReadiness out of range');
  }
  const subTotal = (result.interestScore || 0) + (result.projectScore || 0) +
    (result.internshipScore || 0) + (result.certificationScore || 0);
  if (Math.abs(subTotal - result.careerReadiness) > 2) {
    // Auto-correct rather than error
    result.careerReadiness = subTotal;
  }
  if (!Array.isArray(result.matchedSkills)) errors.push('matchedSkills must be an array');
  if (!Array.isArray(result.missingSkills)) errors.push('missingSkills must be an array');
  if (!result.whyThisScore) errors.push('whyThisScore is required');

  return { valid: errors.length === 0, errors, corrected: result };
};

/**
 * Calculate a career readiness tier/label based on score.
 */
const getReadinessTier = (score) => {
  if (score >= 85) return { tier: 'Industry Ready', color: '#10b981', emoji: '🚀' };
  if (score >= 70) return { tier: 'Strong Candidate', color: '#6366f1', emoji: '⭐' };
  if (score >= 55) return { tier: 'Developing', color: '#f59e0b', emoji: '📈' };
  if (score >= 40) return { tier: 'Early Stage', color: '#f97316', emoji: '🌱' };
  return { tier: 'Needs Improvement', color: '#f43f5e', emoji: '🔧' };
};

/**
 * Calculate keyword match percentage from matched/missing arrays.
 * Used as a secondary validation.
 */
const computeKeywordMatchFromArrays = (matched, missing) => {
  const total = (matched?.length || 0) + (missing?.length || 0);
  if (total === 0) return 0;
  return Math.round(((matched?.length || 0) / total) * 100);
};

/**
 * Enriches the analysis result with computed display fields.
 */
const enrichAnalysisResult = (result, company, role) => {
  const tier = getReadinessTier(result.careerReadiness);

  // Verify keyword match is reasonable
  const computedKW = computeKeywordMatchFromArrays(result.matchedSkills, result.missingSkills);
  if (result.keywordMatch === 0 && computedKW > 0) {
    result.keywordMatch = computedKW;
  }

  return {
    ...result,
    readinessTier: tier.tier,
    readinessColor: tier.color,
    readinessEmoji: tier.emoji,
    targetCompany: company,
    targetRole: role,
    // Ensure sub-score explanations have defaults if Gemini skipped them
    interestExplanation: result.interestExplanation ||
      `Interest alignment with ${role} at ${company} was evaluated based on stated areas of interest and relevant project domains.`,
    projectExplanation: result.projectExplanation ||
      `Projects were evaluated for relevance, technical depth, and alignment with ${role} requirements.`,
    internshipExplanation: result.internshipExplanation ||
      `Internship experience was assessed for industry exposure and role relevance.`,
    certificationExplanation: result.certificationExplanation ||
      `Professional certifications and verified credentials were evaluated for role relevance.`,
  };
};

module.exports = {
  validateAnalysisResult,
  enrichAnalysisResult,
  getReadinessTier,
  computeKeywordMatchFromArrays
};
