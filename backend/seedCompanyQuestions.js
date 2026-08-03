const mongoose = require('mongoose');
const TestQuestion = require('./models/TestQuestion');
const dotenv = require('dotenv');

dotenv.config();

const questions = [
  {
    companyName: "Google",
    domain: "Software Engineer",
    type: "MCQ",
    difficulty: "hard",
    question: "What is the primary benefit of using a Trie (Prefix Tree)?",
    options: ["Fast retrieval of words based on prefix", "Memory efficiency for all data types", "Better average case than Hash Map", "Stable sorting of integers"],
    answer: "Fast retrieval of words based on prefix",
    tags: ["Algorithms", "Data Structures"]
  },
  {
    companyName: "Google",
    domain: "Site Reliability",
    type: "MCQ",
    difficulty: "medium",
    question: "In SRE, what does SLO stand for?",
    options: ["Service Level Objective", "System Level Operation", "Standard Log Output", "Service Line Optimization"],
    answer: "Service Level Objective",
    tags: ["SRE", "DevOps"]
  },
  {
    companyName: "Amazon",
    domain: "SDE",
    type: "MCQ",
    difficulty: "medium",
    question: "Which Leadership Principle emphasizes 'thinking long term'?",
    options: ["Ownership", "Customer Obsession", "Bias for Action", "Deliver Results"],
    answer: "Ownership",
    tags: ["Behavioral", "Soft Skills"]
  },
  {
    companyName: "Amazon",
    domain: "Cloud Engineer",
    type: "MCQ",
    difficulty: "hard",
    question: "What is the main advantage of AWS Lambda?",
    options: ["Serverless execution with auto-scaling", "Fixed monthly cost", "Access to physical hardware", "Manual server management"],
    answer: "Serverless execution with auto-scaling",
    tags: ["Cloud", "AWS"]
  },
  {
    companyName: "Microsoft",
    domain: "Full Stack",
    type: "MCQ",
    difficulty: "medium",
    question: "Which language is primarily used for cross-platform app development at Microsoft?",
    options: ["C#", "Java", "Python", "Ruby"],
    answer: "C#",
    tags: ["Development", "Microsoft Tech"]
  },
  {
    companyName: "TCS",
    domain: "Assistant Systems Engineer",
    type: "MCQ",
    difficulty: "easy",
    question: "Which of the following is a fundamental pillar of OOP?",
    options: ["Encapsulation", "Compilation", "Execution", "Memory Management"],
    answer: "Encapsulation",
    tags: ["Basic Concepts", "Programming"]
  }
];

const seedCompanyQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync');
    
    for (const q of questions) {
      const exists = await TestQuestion.findOne({ question: q.question, companyName: q.companyName });
      if (!exists) {
        await TestQuestion.create(q);
      }
    }
    
    console.log(`Seeded ${questions.length} company-specific questions.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedCompanyQuestions();
