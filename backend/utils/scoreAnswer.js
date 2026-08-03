/**
 * utils/scoreAnswer.js
 * Keyword-match scoring engine for the AI Mock Interviewer.
 * Scores a user's answer against the correct answer without any external API.
 */

// Common English stopwords to exclude from keyword matching
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should',
  'may','might','shall','can','need','dare','ought','used','to','of',
  'in','on','at','by','for','with','about','against','between','into',
  'through','during','before','after','above','below','from','up','down',
  'out','off','over','under','again','further','then','once','and','but',
  'or','nor','so','yet','both','either','not','only','own','same','than',
  'too','very','just','because','as','until','while','this','that','these',
  'those','it','its','itself','they','them','their','what','which','who',
  'whom','when','where','why','how','all','each','few','more','most','other',
  'some','such','no','any','i','we','you','he','she','they','me','him','her',
  'us','my','your','his','our','your','if','also'
]);

/**
 * Tokenize a string into lowercase keywords, removing stopwords and punctuation.
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Score a user's answer against the correct answer.
 * Returns:
 *   score (0-100), tier, matchedKeywords[], missedKeywords[]
 */
function scoreAnswer(userAnswer, correctAnswer) {
  const correctTokens = tokenize(correctAnswer);
  const userTokens = tokenize(userAnswer);

  const userSet = new Set(userTokens);
  const matchedKeywords = correctTokens.filter(k => userSet.has(k));
  const missedKeywords  = correctTokens.filter(k => !userSet.has(k)).slice(0, 5); // top 5 missed

  // ── Component 1: Keyword Coverage (60 pts) ──
  const keywordScore = correctTokens.length > 0
    ? (matchedKeywords.length / correctTokens.length) * 60
    : 30; // no keywords to match → neutral

  // ── Component 2: Answer Depth (25 pts) ──
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const depthScore = Math.min(wordCount / 40, 1) * 25;

  // ── Component 3: Structure Bonus (15 pts) ──
  const hasMultipleSentences = (userAnswer.match(/[.!?]/g) || []).length >= 2;
  const hasExample = /example|for instance|such as|e\.g\.|like/i.test(userAnswer);
  const hasExplanation = /because|therefore|since|due to|result|thus|means/i.test(userAnswer);
  const structureScore = (hasMultipleSentences ? 5 : 0)
                       + (hasExample ? 5 : 0)
                       + (hasExplanation ? 5 : 0);

  const rawScore = keywordScore + depthScore + structureScore;
  const score = Math.min(Math.round(rawScore), 100);

  // ── Tier Assignment ──
  let tier;
  if (score >= 80)      tier = 'Excellent';
  else if (score >= 60) tier = 'Good';
  else if (score >= 35) tier = 'Needs Work';
  else                  tier = 'Poor';

  return {
    score,
    tier,
    matchedKeywords: [...new Set(matchedKeywords)],
    missedKeywords
  };
}

module.exports = { scoreAnswer };
