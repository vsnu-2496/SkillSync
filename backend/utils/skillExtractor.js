const SKILL_DB = {
  "Programming": ["Python", "Java", "C++", "Javascript", "TypeScript", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "C#", "SQL"],
  "Web": ["React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "HTML", "CSS", "Tailwind", "Bootstrap", "Next.js", "Vite"],
  "Data": ["Machine Learning", "AI", "Pandas", "NumPy", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Tableau", "Tensorflow", "PyTorch", "Data Analysis", "Deep Learning", "PowerBI"],
  "Tools": ["Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Jenkins", "Terraform", "Ansible", "Linux", "Jira", "Postman", "Figma"],
  "Soft Skills": ["Problem Solving", "Leadership", "Communication", "Teamwork", "Agility", "Management"]
};

/**
 * Extracts skills from text using keyword matching and frequency scoring.
 */
const extractSkills = (text) => {
  console.log("Starting Skill Extraction...");
  const extracted = [];
  const allSkills = Object.values(SKILL_DB).flat();

  // If text is too short or missing, return defaults to avoid "Empty Matrix"
  if (!text || text.length < 50) {
    return [{ skill: "Communication", score: 10 }, { skill: "Problem Solving", score: 10 }];
  }

  allSkills.forEach(skill => {
    // Escape special characters and create a case-insensitive regex
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      let score = matches.length * 2;
      const firstPart = text.substring(0, Math.floor(text.length * 0.3)).toLowerCase();
      if (firstPart.includes(skill.toLowerCase())) {
        score += 5;
      }

      extracted.push({ skill, score });
    }
  });

  // Default skills if none matched (ensure every user has a base profile)
  if (extracted.length === 0) {
    extracted.push({ skill: "Problem Solving", score: 5 });
    extracted.push({ skill: "Communication", score: 5 });
  }

  const uniqueSkills = extracted
    .filter((v, i, a) => a.findIndex(t => t.skill === v.skill) === i)
    .sort((a, b) => b.score - a.score);

  console.log(`Extracted ${uniqueSkills.length} skills.`);
  return uniqueSkills;
};

module.exports = { extractSkills, SKILL_DB };
