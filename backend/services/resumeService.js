const Resume = require('../models/Resume');
const User = require('../models/User');

const SKILL_KEYWORDS = [
  'React', 'JavaScript', 'Node.js', 'Python', 'SQL', 'MongoDB', 
  'Java', 'C++', 'AWS', 'Docker', 'Figma', 'UI/UX', 'Data Science', 'Machine Learning'
];

exports.extractSkills = async (fileContent) => {
  // In a production app, we would use a library like 'pdf-parse' or a Python microservice
  // Mocking identification via keyword matching for the refactor
  const detected = SKILL_KEYWORDS.filter(skill => 
    fileContent.toLowerCase().includes(skill.toLowerCase())
  );
  return detected.length > 0 ? detected : ['Professional Communication', 'Project Management'];
};

exports.calculateCareerMatches = async (skills) => {
  const domains = [
    { name: 'Web Development', required: ['React', 'JavaScript', 'Node.js'], roles: ['Frontend Developer', 'Full Stack Engineer'] },
    { name: 'Data Science', required: ['Python', 'SQL', 'Machine Learning'], roles: ['Data Scientist', 'ML Engineer'] },
    { name: 'UI/UX Design', required: ['Figma', 'UI/UX'], roles: ['Product Designer', 'UX Researcher'] }
  ];

  return domains.map(domain => {
    const matched = domain.required.filter(s => skills.includes(s));
    const missing = domain.required.filter(s => !skills.includes(s));
    const score = Math.round((matched.length / domain.required.length) * 100);
    return {
      domain: domain.name,
      confidence_score: score,
      matched_skills: matched,
      missing_skills: missing,
      suggested_roles: domain.roles
    };
  }).sort((a, b) => b.confidence_score - a.confidence_score);
};
