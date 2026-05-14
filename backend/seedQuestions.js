const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  {
    company: "Google",
    aptitudeQuestions: [
      { question: "If a car travels 60 miles in 1 hour, how far does it travel in 15 minutes?", answer: "15 miles" }
    ],
    technicalQuestions: [
      { question: "Explain the difference between a process and a thread.", answer: "A process is a program in execution, while a thread is a subset of a process.", topic: "OS" },
      { question: "What is time complexity of QuickSort?", answer: "O(n log n) average, O(n^2) worst case.", topic: "Algorithms" }
    ],
    hrQuestions: [
      { question: "Why do you want to work at Google?", answer: "I admire Google's innovation and impact on the world." }
    ]
  },
  {
    company: "Amazon",
    aptitudeQuestions: [
      { question: "A shopkeeper sells a product for $120 with a 20% profit. What is the cost price?", answer: "$100" }
    ],
    technicalQuestions: [
      { question: "How does a Hash Map work?", answer: "It uses a hash function to map keys to buckets.", topic: "Data Structures" }
    ],
    hrQuestions: [
      { question: "Tell me about a time you had a conflict with a teammate.", answer: "I once disagreed on a design choice, but we resolved it by testing both approaches." }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync');
    await Question.deleteMany();
    await Question.insertMany(questions);
    console.log('Database Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
