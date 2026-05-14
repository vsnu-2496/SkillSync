const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TestQuestion = require('./models/TestQuestion');

dotenv.config();

const questions = [
  // Web Development
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Main Language"], answer: "Hyper Text Markup Language" },
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "Which CSS property is used to change the background color?", options: ["color", "background-color", "bgcolor"], answer: "background-color" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "Which of the following is NOT a JavaScript framework?", options: ["React", "Angular", "Django", "Vue"], answer: "Django" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "What is the purpose of the 'alt' attribute in an image tag?", options: ["To define the image source", "To provide alternative text for screen readers", "To set the image width", "To create a link"], answer: "To provide alternative text for screen readers" },
  { domain: "Web Development", type: "MCQ", difficulty: "hard", question: "What is the Big O complexity of a binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: "O(log n)" },
  
  // Java
  { domain: "Java", type: "MCQ", difficulty: "easy", question: "Which of these is a valid declaration of a String in Java?", options: ["String s = 'hello';", "string s = \"hello\";", "String s = \"hello\";", "s = \"hello\";"], answer: "String s = \"hello\";" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "What is the default value of an int variable in Java?", options: ["null", "0", "undefined", "-1"], answer: "0" },
  { domain: "Java", type: "MCQ", difficulty: "hard", question: "Which of the following is NOT a feature of Java?", options: ["Platform independence", "Object-oriented", "Pointers", "Robustness"], answer: "Pointers" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "Which collection class allows duplicate elements?", options: ["HashSet", "TreeSet", "ArrayList", "None"], answer: "ArrayList" },
  
  // Backend Engineer
  { domain: "Backend Engineer", type: "MCQ", difficulty: "medium", question: "Which of the following is a key advantage of using a microservices architecture?", options: ["Simplified deployment", "Independent scalability", "Reduced network latency", "Single point of failure"], answer: "Independent scalability" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "hard", question: "What is the primary purpose of a database index?", options: ["To encrypt data", "To reduce storage space", "To speed up data retrieval", "To ensure data consistency"], answer: "To speed up data retrieval" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "medium", question: "In Node.js, what does the Event Loop do?", options: ["Executes CPU-intensive tasks", "Handles asynchronous I/O callbacks", "Manages database connections", "Compresses HTTP responses"], answer: "Handles asynchronous I/O callbacks" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "hard", question: "What is horizontal scaling?", options: ["Adding more RAM to a single server", "Adding more servers to a pool", "Optimizing code performance", "Changing the database schema"], answer: "Adding more servers to a pool" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "medium", question: "What is the role of a Load Balancer?", options: ["To backup the database", "To distribute incoming traffic across multiple servers", "To monitor server health", "To encrypt user passwords"], answer: "To distribute incoming traffic across multiple servers" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "easy", question: "What does REST stand for?", options: ["Representational State Transfer", "Relational State Transfer", "Remote State Transfer", "Real-time State Transfer"], answer: "Representational State Transfer" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "medium", question: "What is a deadlock in a database?", options: ["When a query takes too long", "When two processes wait for each other to release locks", "When the database crashes", "When data is corrupted"], answer: "When two processes wait for each other to release locks" },
  { domain: "Backend Engineer", type: "MCQ", difficulty: "hard", question: "What is the purpose of Redis in a backend stack?", options: ["Primary persistent database", "In-memory caching and message brokerage", "Frontend template rendering", "Network firewall"], answer: "In-memory caching and message brokerage" }
];

const masterSeed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync';
    console.log(`Connecting to: ${uri}`);
    await mongoose.connect(uri);
    await TestQuestion.deleteMany({});
    await TestQuestion.insertMany(questions);
    console.log(`Successfully seeded ${questions.length} questions into the PRODUCTION database.`);
    process.exit();
  } catch (err) {
    console.error("Seed Failed:", err);
    process.exit(1);
  }
};

masterSeed();
