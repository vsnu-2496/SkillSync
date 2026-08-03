const SKILL_DB = {
  "Programming Languages": ["Python", "Java", "C++", "C", "C#", "Javascript", "TypeScript", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "CSS"],
  "Frameworks": ["React", "Angular", "Vue", "Next.js", "Express", "Django", "Flask", "Spring", "Bootstrap", "Tailwind", "FastAPI"],
  "Libraries": ["Redux", "Pandas", "NumPy", "Tensorflow", "PyTorch", "Axios", "Multer", "Lodash", "JQuery"],
  "Databases": ["MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Cassandra", "DynamoDB", "Firebase"],
  "Cloud": ["AWS", "Azure", "GCP", "Vercel", "Heroku", "Netlify"],
  "Tools": ["Git", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "Linux", "Jira", "Postman", "Figma", "Webpack", "Vite"],
  "Soft Skills": ["Problem Solving", "Leadership", "Communication", "Teamwork", "Agility", "Management", "Critical Thinking", "Creativity"]
};

const EDUCATION_KEYWORDS = [
  { keyword: "B.Tech", value: "Bachelor of Technology" },
  { keyword: "M.Tech", value: "Master of Technology" },
  { keyword: "B.E", value: "Bachelor of Engineering" },
  { keyword: "B.S", value: "Bachelor of Science" },
  { keyword: "M.S", value: "Master of Science" },
  { keyword: "B.C.A", value: "Bachelor of Computer Applications" },
  { keyword: "M.C.A", value: "Master of Computer Applications" },
  { keyword: "PhD", value: "Doctor of Philosophy" }
];

const CERTIFICATION_KEYWORDS = [
  "AWS Certified", "Azure Certified", "Google Cloud Certified", "PMP", "Certified Scrum Master", "CompTIA", "Cisco Certified", "Udemy Certified", "Coursera Certified"
];

/**
 * Extracts sections, categorizes skills, and calculates dynamic metrics.
 */
const extractSkills = (text = '') => {
  console.log("Analyzing Resume Text with Production Intelligence...");
  const normalizedText = text.toLowerCase();
  
  const extractedCategories = {
    "Programming Languages": [],
    "Frameworks": [],
    "Libraries": [],
    "Databases": [],
    "Cloud": [],
    "Tools": [],
    "Soft Skills": []
  };

  const flatSkills = [];

  // 1. Extract Categorized Skills
  Object.keys(SKILL_DB).forEach(category => {
    SKILL_DB[category].forEach(skill => {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        let score = Math.min(matches.length * 2 + 5, 20);
        extractedCategories[category].push({ skill, score });
        flatSkills.push({ skill, score });
      }
    });
  });

  // Fallbacks if no skills detected
  if (flatSkills.length === 0) {
    extractedCategories["Soft Skills"].push({ skill: "Communication", score: 10 });
    extractedCategories["Soft Skills"].push({ skill: "Problem Solving", score: 10 });
    flatSkills.push({ skill: "Communication", score: 10 });
    flatSkills.push({ skill: "Problem Solving", score: 10 });
  }

  // 2. Extract Education
  const educations = [];
  EDUCATION_KEYWORDS.forEach(edu => {
    if (normalizedText.includes(edu.keyword.toLowerCase())) {
      educations.push(edu.value);
    }
  });
  if (educations.length === 0) educations.push("Undergraduate Degree Candidate");

  // 3. Extract Certifications
  const certifications = [];
  CERTIFICATION_KEYWORDS.forEach(cert => {
    const regex = new RegExp(cert, 'gi');
    if (regex.test(text)) {
      certifications.push(cert);
    }
  });

  // 4. Experience Level
  let experienceLevel = "Entry Level";
  const yearsMatch = normalizedText.match(/(\d+)\+?\s*years?\s*of?\s*experience/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 5) experienceLevel = "Senior Level";
    else if (years >= 2) experienceLevel = "Mid Level";
  } else if (normalizedText.includes("senior") || normalizedText.includes("architect") || normalizedText.includes("lead")) {
    experienceLevel = "Senior Level";
  } else if (normalizedText.includes("intern") || normalizedText.includes("trainee")) {
    experienceLevel = "Internship Level";
  }

  // 5. Detect Projects & Internships count
  const projectMatches = (normalizedText.match(/project/g) || []).length;
  const internshipMatches = (normalizedText.match(/internship|intern\b/g) || []).length;

  // 6. Calculate Dynamic Metrics
  const uniqueSkillCount = flatSkills.length;
  const sectionsFound = 
    (normalizedText.includes("education") ? 1 : 0) +
    (normalizedText.includes("experience") || normalizedText.includes("employment") || normalizedText.includes("history") ? 1 : 0) +
    (normalizedText.includes("skill") ? 1 : 0) +
    (normalizedText.includes("project") ? 1 : 0) +
    (normalizedText.includes("certification") || normalizedText.includes("award") ? 1 : 0);

  // Dynamic ATS Score Formula
  let atsScore = Math.round((uniqueSkillCount * 3.5) + (sectionsFound * 8) + (certifications.length * 5) + Math.min(text.length / 80, 15));
  atsScore = Math.max(35, Math.min(atsScore, 98));

  // Profile Completeness
  const completeness = Math.min(100, Math.round((sectionsFound / 5) * 50 + (uniqueSkillCount > 5 ? 30 : 15) + (certifications.length > 0 ? 20 : 0)));

  // Resume Quality
  let resumeQuality = "Average";
  if (atsScore >= 85) resumeQuality = "Excellent";
  else if (atsScore >= 70) resumeQuality = "Good";

  // Technical Score
  const techScore = Math.round(Math.min(100, (flatSkills.filter(s => s.score > 8).length * 8) + 40));

  // Strengths & Weaknesses
  const strengths = [];
  const weaknesses = [];

  if (flatSkills.length > 8) strengths.push("Strong Technical Vocabulary");
  if (sectionsFound >= 4) strengths.push("Well-structured Sections");
  if (certifications.length > 0) strengths.push("Verified Industry Certifications");
  if (projectMatches > 2) strengths.push("Hands-on Project Portfolio");
  if (strengths.length === 0) strengths.push("Clear Professional Layout");

  if (!normalizedText.includes("docker") && !normalizedText.includes("kubernetes")) weaknesses.push("Missing DevOps / Containerization Skills");
  if (!normalizedText.includes("aws") && !normalizedText.includes("azure") && !normalizedText.includes("gcp")) weaknesses.push("Cloud Infrastructure Competency Deficit");
  if (certifications.length === 0) weaknesses.push("No Formal Industry Certifications Found");
  if (projectMatches <= 1) weaknesses.push("Limited Project Showcase Section");
  if (weaknesses.length === 0) weaknesses.push("Consider adding more quantified impact metrics in bullet points");

  return {
    categorizedSkills: extractedCategories,
    skills: flatSkills,
    educations,
    certifications,
    experienceLevel,
    atsScore,
    techScore,
    profileCompleteness: completeness,
    resumeQuality,
    strengths,
    weaknesses,
    projectsCount: Math.max(1, Math.min(projectMatches, 5)),
    internshipsCount: Math.min(internshipMatches, 3)
  };
};

module.exports = { extractSkills, SKILL_DB };
