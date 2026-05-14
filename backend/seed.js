const mongoose = require('mongoose');
const InterviewQuestion = require('./models/InterviewQuestion');
const dotenv = require('dotenv');

dotenv.config();

const QUESTION_BANK = [
  { companyName: "Google", role: "Backend Developer", category: "Technical", question: "Implement a thread-safe singleton pattern in Java", difficulty: "Medium", tags: ["Java", "Concurrency"] },
  { companyName: "Amazon", role: "Full Stack Engineer", category: "System Design", question: "Design a rate limiter for an API gateway", difficulty: "Hard", tags: ["System Design", "Scalability"] },
  { companyName: "Microsoft", role: "Software Engineer", category: "Behavioral", question: "Tell me about a time you had to learn a new technology quickly", difficulty: "Easy", tags: ["Soft Skills"] },
  { companyName: "Meta", role: "Data Engineer", category: "Database", question: "Optimize this SQL query for better performance", difficulty: "Medium", tags: ["SQL", "Optimization"] },
  { companyName: "Accenture", role: "Frontend Developer", category: "Technical", question: "How would you handle state management in a large React app?", difficulty: "Medium", tags: ["React", "Frontend"] }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27000/skillsync');
    await InterviewQuestion.deleteMany({});
    await InterviewQuestion.insertMany(QUESTION_BANK);
    console.log('EasyPrep Hub Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seed();
