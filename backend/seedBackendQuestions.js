const mongoose = require('mongoose');
const TestQuestion = require('./models/TestQuestion');
const dotenv = require('dotenv');

dotenv.config();

const questions = [
  // Backend Engineer
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "medium",
    question: "Which of the following is a key advantage of using a microservices architecture?",
    options: ["Simplified deployment", "Independent scalability", "Reduced network latency", "Single point of failure"],
    answer: "Independent scalability"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "hard",
    question: "What is the primary purpose of a database index?",
    options: ["To encrypt data", "To reduce storage space", "To speed up data retrieval", "To ensure data consistency"],
    answer: "To speed up data retrieval"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "medium",
    question: "In Node.js, what does the Event Loop do?",
    options: ["Executes CPU-intensive tasks", "Handles asynchronous I/O callbacks", "Manages database connections", "Compresses HTTP responses"],
    answer: "Handles asynchronous I/O callbacks"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "hard",
    question: "What is horizontal scaling?",
    options: ["Adding more RAM to a single server", "Adding more servers to a pool", "Optimizing code performance", "Changing the database schema"],
    answer: "Adding more servers to a pool"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "medium",
    question: "What is the role of a Load Balancer?",
    options: ["To backup the database", "To distribute incoming traffic across multiple servers", "To monitor server health", "To encrypt user passwords"],
    answer: "To distribute incoming traffic across multiple servers"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "easy",
    question: "What does REST stand for?",
    options: ["Representational State Transfer", "Relational State Transfer", "Remote State Transfer", "Real-time State Transfer"],
    answer: "Representational State Transfer"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "medium",
    question: "What is a deadlock in a database?",
    options: ["When a query takes too long", "When two processes wait for each other to release locks", "When the database crashes", "When data is corrupted"],
    answer: "When two processes wait for each other to release locks"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "hard",
    question: "What is the purpose of Redis in a backend stack?",
    options: ["Primary persistent database", "In-memory caching and message brokerage", "Frontend template rendering", "Network firewall"],
    answer: "In-memory caching and message brokerage"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "medium",
    question: "Which HTTP method is idempotent?",
    options: ["POST", "PATCH", "GET", "All of the above"],
    answer: "GET"
  },
  {
    domain: "Backend Engineer",
    type: "MCQ",
    difficulty: "easy",
    question: "What is the default port for MongoDB?",
    options: ["3306", "5432", "27017", "6379"],
    answer: "27017"
  }
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/EasyPrep');
    
    // Only add if not already present
    for (const q of questions) {
      const exists = await TestQuestion.findOne({ question: q.question });
      if (!exists) {
        await TestQuestion.create(q);
      }
    }
    
    console.log(`Successfully indexed ${questions.length} neural nodes for Backend Engineer.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedQuestions();
