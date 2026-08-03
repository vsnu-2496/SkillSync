const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const TestQuestion = require('./models/TestQuestion');
const Company = require('./models/Company');
const User = require('./models/User');

dotenv.config();

const companies = [
  { name: "Google", difficulty: "Hard", questionsCount: 45, avgSalary: "$140k - $220k", hiringStatus: "Actively Hiring", tags: ["Distributed Systems", "Algorithms", "System Design"], popularRoles: ["Software Engineer", "AI/ML Engineer"] },
  { name: "Amazon", difficulty: "Hard", questionsCount: 52, avgSalary: "$130k - $190k", hiringStatus: "Actively Hiring", tags: ["AWS", "Leadership Principles", "OOP"], popularRoles: ["SDE I", "SDE II", "Cloud Architect"] },
  { name: "Microsoft", difficulty: "Medium", questionsCount: 38, avgSalary: "$125k - $180k", hiringStatus: "Actively Hiring", tags: ["Azure", "Data Structures", "System Design"], popularRoles: ["Software Engineer", "Frontend Dev"] },
  { name: "Zoho", difficulty: "Medium", questionsCount: 30, avgSalary: "$70k - $110k", hiringStatus: "Actively Hiring", tags: ["Java", "Problem Solving", "Full Stack"], popularRoles: ["Software Developer", "QA Engineer"] },
  { name: "TCS", difficulty: "Easy", questionsCount: 60, avgSalary: "$50k - $80k", hiringStatus: "Hiring", tags: ["Aptitude", "C/C++", "Java"], popularRoles: ["System Engineer", "Assistant System Engineer"] },
  { name: "Meta", difficulty: "Hard", questionsCount: 40, avgSalary: "$150k - $230k", hiringStatus: "Selective", tags: ["React", "Algorithms", "System Design"], popularRoles: ["Frontend Engineer", "Full Stack Engineer"] }
];

const questions = [
  // Web Development
  { domain: "Web Development", companyName: "Meta", type: "MCQ", difficulty: "easy", question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Main Language"], answer: "Hyper Text Markup Language" },
  { domain: "Web Development", companyName: "Microsoft", type: "MCQ", difficulty: "easy", question: "Which CSS property is used to change the background color?", options: ["color", "background-color", "bgcolor"], answer: "background-color" },
  { domain: "Web Development", companyName: "Google", type: "MCQ", difficulty: "medium", question: "Which of the following is NOT a JavaScript framework?", options: ["React", "Angular", "Django", "Vue"], answer: "Django" },
  { domain: "Web Development", companyName: "Meta", type: "MCQ", difficulty: "medium", question: "What is the purpose of the 'alt' attribute in an image tag?", options: ["To define the image source", "To provide alternative text for screen readers", "To set the image width", "To create a link"], answer: "To provide alternative text for screen readers" },
  { domain: "Web Development", companyName: "Google", type: "MCQ", difficulty: "hard", question: "What is the Big O complexity of a binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: "O(log n)" },
  
  // Java
  { domain: "Java", companyName: "Zoho", type: "MCQ", difficulty: "easy", question: "Which of these is a valid declaration of a String in Java?", options: ["String s = 'hello';", "string s = \"hello\";", "String s = \"hello\";", "s = \"hello\";"], answer: "String s = \"hello\";" },
  { domain: "Java", companyName: "TCS", type: "MCQ", difficulty: "medium", question: "What is the default value of an int variable in Java?", options: ["null", "0", "undefined", "-1"], answer: "0" },
  { domain: "Java", companyName: "Zoho", type: "MCQ", difficulty: "hard", question: "Which of the following is NOT a feature of Java?", options: ["Platform independence", "Object-oriented", "Pointers", "Robustness"], answer: "Pointers" },
  { domain: "Java", companyName: "TCS", type: "MCQ", difficulty: "medium", question: "Which collection class allows duplicate elements?", options: ["HashSet", "TreeSet", "ArrayList", "None"], answer: "ArrayList" },
  
  // Backend Engineer
  { domain: "Backend Engineer", companyName: "Amazon", type: "MCQ", difficulty: "medium", question: "Which of the following is a key advantage of using a microservices architecture?", options: ["Simplified deployment", "Independent scalability", "Reduced network latency", "Single point of failure"], answer: "Independent scalability" },
  { domain: "Backend Engineer", companyName: "Amazon", type: "MCQ", difficulty: "hard", question: "What is the primary purpose of a database index?", options: ["To encrypt data", "To reduce storage space", "To speed up data retrieval", "To ensure data consistency"], answer: "To speed up data retrieval" },
  { domain: "Backend Engineer", companyName: "Google", type: "MCQ", difficulty: "medium", question: "In Node.js, what does the Event Loop do?", options: ["Executes CPU-intensive tasks", "Handles asynchronous I/O callbacks", "Manages database connections", "Compresses HTTP responses"], answer: "Handles asynchronous I/O callbacks" },
  { domain: "Backend Engineer", companyName: "Microsoft", type: "MCQ", difficulty: "hard", question: "What is horizontal scaling?", options: ["Adding more RAM to a single server", "Adding more servers to a pool", "Optimizing code performance", "Changing the database schema"], answer: "Adding more servers to a pool" },
  { domain: "Backend Engineer", companyName: "Amazon", type: "MCQ", difficulty: "medium", question: "What is the role of a Load Balancer?", options: ["To backup the database", "To distribute incoming traffic across multiple servers", "To monitor server health", "To encrypt user passwords"], answer: "To distribute incoming traffic across multiple servers" },
  { domain: "Backend Engineer", companyName: "Meta", type: "MCQ", difficulty: "easy", question: "What does REST stand for?", options: ["Representational State Transfer", "Relational State Transfer", "Remote State Transfer", "Real-time State Transfer"], answer: "Representational State Transfer" },
  { domain: "Backend Engineer", companyName: "Google", type: "MCQ", difficulty: "hard", question: "What is a deadlock in a database?", options: ["When a query takes too long", "When two processes wait for each other to release locks", "When the database crashes", "When data is corrupted"], answer: "When two processes wait for each other to release locks" },
  { domain: "Backend Engineer", companyName: "Amazon", type: "MCQ", difficulty: "hard", question: "What is the purpose of Redis in a backend stack?", options: ["Primary persistent database", "In-memory caching and message brokerage", "Frontend template rendering", "Network firewall"], answer: "In-memory caching and message brokerage" }
];

const masterSeed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27000/skillsync_ai';
    console.log(`Connecting to: ${uri}`);
    await mongoose.connect(uri);
    
    await TestQuestion.deleteMany({});
    await TestQuestion.insertMany(questions);
    console.log(`Seeded ${questions.length} questions.`);

    await Company.deleteMany({});
    await Company.insertMany(companies);
    console.log(`Seeded ${companies.length} companies.`);

    // Seed Admin Account if not exists
    const adminEmail = 'admin@skillsync.ai';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);
      admin = new User({
        name: 'SkillSync System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        university: 'SkillSync AI Headquarters',
        yearLevel: 'Staff'
      });
      await admin.save();
      console.log('Seeded default Admin account (admin@skillsync.ai / Admin@12345).');
    }

    console.log("PRODUCTION DATABASE MASTER SEED COMPLETED SUCCESSFULLY.");
    process.exit();
  } catch (err) {
    console.error("Master Seed Failed:", err);
    process.exit(1);
  }
};

masterSeed();
