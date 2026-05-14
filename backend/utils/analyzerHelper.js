const SKILL_DB = {
  "Programming": ["Python", "Java", "C++", "Javascript", "TypeScript", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin"],
  "Web": ["React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "HTML", "CSS", "Tailwind", "Bootstrap"],
  "Data": ["Machine Learning", "AI", "Pandas", "NumPy", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Tableau", "Tensorflow", "PyTorch", "Data Analysis", "Deep Learning"],
  "Tools": ["Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Jenkins", "Terraform", "Ansible", "Linux", "Jira"]
};

const ROLE_DB = [
  {
    role: "Full Stack Developer",
    requiredSkills: ["Javascript", "React", "Node.js", "Express", "HTML", "CSS", "SQL", "Git"]
  },
  {
    role: "Backend Engineer",
    requiredSkills: ["Python", "Node.js", "Java", "SQL", "MongoDB", "Docker", "AWS", "Git"]
  },
  {
    role: "Frontend Developer",
    requiredSkills: ["Javascript", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Git"]
  },
  {
    role: "Data Scientist",
    requiredSkills: ["Python", "Machine Learning", "Pandas", "SQL", "Data Analysis", "Tensorflow", "AI"]
  },
  {
    role: "DevOps Engineer",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Git", "Jenkins", "Terraform", "Linux"]
  }
];

const TRAINING_PATH_MAP = {
  "Python": "Master advanced data structures and asynchronous programming in Python.",
  "Javascript": "Deep dive into ES6+ features and asynchronous JS patterns.",
  "React": "Learn state management with Redux/Context API and performance optimization.",
  "Node.js": "Understand event-driven architecture and microservices with Node.",
  "Docker": "Master containerization, image optimization, and multi-stage builds.",
  "Kubernetes": "Learn orchestration, scaling, and deployment strategies in K8s.",
  "AWS": "Get certified as an AWS Solutions Architect or Developer.",
  "Machine Learning": "Build and deploy predictive models using Scikit-Learn and TensorFlow.",
  "SQL": "Learn complex query optimization and database design patterns.",
  "MongoDB": "Master NoSQL modeling and aggregation pipelines.",
  "Git": "Learn advanced branching strategies and GitHub Actions for CI/CD.",
  "TypeScript": "Migrate JavaScript projects to TypeScript for type safety.",
  "Tailwind": "Build highly custom UI components using Tailwind utility classes."
};

const extractSkills = (text) => {
  const extracted = [];
  const normalizedText = text.toLowerCase();
  const allSkills = Object.values(SKILL_DB).flat();

  allSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      // Frequency score
      let score = matches.length * 2;

      // Context bonus: check if it's in the first part of the resume (summary/skills section)
      const firstPart = text.substring(0, Math.floor(text.length * 0.3)).toLowerCase();
      if (firstPart.includes(skill.toLowerCase())) {
        score += 5;
      }

      extracted.push({
        skill: skill,
        score: score
      });
    }
  });

  // Remove duplicates (just in case) and sort by score
  return extracted
    .filter((v, i, a) => a.findIndex(t => t.skill === v.skill) === i)
    .sort((a, b) => b.score - a.score);
};

const calculateRoleMatch = (userSkills) => {
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());
  
  const matches = ROLE_DB.map(roleObj => {
    const requiredLower = roleObj.requiredSkills.map(s => s.toLowerCase());
    const common = requiredLower.filter(s => userSkillNames.includes(s));
    const percentage = Math.round((common.length / requiredLower.length) * 100);
    
    return {
      role: roleObj.role,
      matchPercentage: percentage,
      requiredSkills: roleObj.requiredSkills
    };
  });

  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
};

const identifyGaps = (userSkills, topRole) => {
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());
  const gaps = topRole.requiredSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
  return gaps;
};

const generateRoadmap = (gaps) => {
  return gaps.map(skill => {
    return {
      skill: skill,
      step: TRAINING_PATH_MAP[skill] || `Improve your proficiency in ${skill} through projects and documentation.`
    };
  });
};

module.exports = {
  extractSkills,
  calculateRoleMatch,
  identifyGaps,
  generateRoadmap
};
