const ROLE_DB = [
  {
    role: "Web Development",
    requiredSkills: ["HTML", "CSS", "Javascript", "React", "Node.js", "SQL", "Git"]
  },
  {
    role: "Frontend Developer",
    requiredSkills: ["Javascript", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Vite", "Git"]
  },
  {
    role: "Backend Engineer",
    requiredSkills: ["Python", "Node.js", "Express", "Java", "SQL", "MongoDB", "Docker", "Git"]
  },
  {
    role: "Full Stack Developer",
    requiredSkills: ["Javascript", "React", "Node.js", "Express", "HTML", "CSS", "SQL", "Git", "Docker"]
  },
  {
    role: "AI/ML Engineer",
    requiredSkills: ["Python", "Machine Learning", "AI", "Tensorflow", "PyTorch", "NumPy", "Deep Learning"]
  },
  {
    role: "Data Scientist",
    requiredSkills: ["Python", "Machine Learning", "Pandas", "SQL", "Data Analysis", "Tensorflow", "AI", "PowerBI"]
  },
  {
    role: "Cyber Security Analyst",
    requiredSkills: ["Linux", "Python", "SQL", "Git", "Security Audits", "Networking", "Cryptography"]
  },
  {
    role: "Cloud Computing Architect",
    requiredSkills: ["AWS", "Azure", "GCP", "Kubernetes", "Docker", "Linux", "Terraform"]
  },
  {
    role: "DevOps Engineer",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Git", "Jenkins", "Terraform", "Linux", "Ansible"]
  },
  {
    role: "Software Testing Engineer",
    requiredSkills: ["Java", "Python", "Selenium", "Git", "Unit Testing", "Jira", "Postman"]
  },
  {
    role: "Mobile Development Engineer",
    requiredSkills: ["Kotlin", "Swift", "React", "Javascript", "Git", "Firebase", "TypeScript"]
  },
  {
    role: "UI UX Designer",
    requiredSkills: ["Figma", "HTML", "CSS", "Bootstrap", "Tailwind", "Creativity", "Communication"]
  },
  {
    role: "Business Analyst",
    requiredSkills: ["SQL", "Tableau", "PowerBI", "Data Analysis", "Communication", "Management", "Jira"]
  },
  {
    role: "Product Manager",
    requiredSkills: ["Product Management", "Figma", "Jira", "Communication", "Leadership", "Management", "Agility"]
  },
  {
    role: "Software Engineer",
    requiredSkills: ["Java", "Python", "C++", "C#", "SQL", "Git", "Problem Solving", "Linux"]
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

/**
 * Maps skills to roles and calculates match percentage.
 */
const calculateCareerMap = (userSkills) => {
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

/**
 * Identifies gaps between user skills and role requirements.
 */
const getSkillGaps = (userSkills, topRole) => {
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());
  const gaps = topRole.requiredSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
  return gaps;
};

/**
 * Generates learning steps for each missing skill.
 */
const getTrainingPath = (gaps) => {
  return gaps.map(skill => {
    return {
      skill: skill,
      step: TRAINING_PATH_MAP[skill] || `Improve your proficiency in ${skill} through projects and documentation.`
    };
  });
};

module.exports = {
  calculateCareerMap,
  getSkillGaps,
  getTrainingPath
};
