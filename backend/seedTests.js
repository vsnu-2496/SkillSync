const mongoose = require('mongoose');
const InterviewQuestion = require('./models/InterviewQuestion');
const dotenv = require('dotenv');

dotenv.config();

const questions = [
  { companyName: "Google", role: "Software Engineer", category: "Technical", question: "Explain the difference between a process and a thread.", difficulty: "Beginner", tags: ["OS", "Java", "C++"] },
  { companyName: "Amazon", role: "Backend Developer", category: "Technical", question: "How does a hash map work internally?", difficulty: "Intermediate", tags: ["Data Structures", "Java", "Python"] },
  { companyName: "Microsoft", role: "Full Stack", category: "Technical", question: "What is the event loop in JavaScript?", difficulty: "Beginner", tags: ["Javascript", "Web Development"] },
  { companyName: "Meta", role: "Frontend Engineer", category: "Technical", question: "Explain the Virtual DOM in React.", difficulty: "Intermediate", tags: ["React", "Javascript"] },
  { companyName: "General", role: "DevOps", category: "Technical", question: "What is CI/CD and why is it important?", difficulty: "Beginner", tags: ["Docker", "Jenkins", "AWS"] },
  { companyName: "General", role: "Data Scientist", category: "Technical", question: "Difference between Supervised and Unsupervised learning.", difficulty: "Beginner", tags: ["Machine Learning", "AI", "Python"] },
  { companyName: "Google", role: "Software Engineer", category: "Technical", question: "How would you find the middle element of a linked list?", difficulty: "Intermediate", tags: ["Data Structures", "C++", "Java"] },
  { companyName: "TCS", role: "Assistant System Engineer", category: "Technical", question: "What are the ACID properties in a database?", difficulty: "Beginner", tags: ["SQL", "Database"] }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/EasyPrep');
    await InterviewQuestion.deleteMany({});
    await InterviewQuestion.insertMany(questions);
    console.log("Skill-based Interview Bank Seeded.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
