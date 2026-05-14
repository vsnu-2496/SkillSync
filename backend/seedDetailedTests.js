const mongoose = require('mongoose');
const TestQuestion = require('./models/TestQuestion');
const dotenv = require('dotenv');

dotenv.config();

const questions = [
  // WEB DEVELOPMENT (10)
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Main Language"], answer: "Hyper Text Markup Language" },
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "Which CSS property is used to change the background color?", options: ["color", "background-color", "bgcolor"], answer: "background-color" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "What is the purpose of the 'useEffect' hook in React?", options: ["To handle side effects", "To update state only", "To create a new component"], answer: "To handle side effects" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "What does DOM stand for?", options: ["Data Object Model", "Document Object Model", "Dynamic Object Mode"], answer: "Document Object Model" },
  { domain: "Web Development", type: "MCQ", difficulty: "hard", question: "What is a Closure in Javascript?", options: ["A function with access to its outer scope", "A way to close the browser tab", "A private variable that cannot be accessed"], answer: "A function with access to its outer scope" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "Which HTTP method is used to update an existing resource?", options: ["GET", "POST", "PUT"], answer: "PUT" },
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "What is the default port for Node.js servers?", options: ["80", "3000", "8080"], answer: "3000" },
  { domain: "Web Development", type: "MCQ", difficulty: "medium", question: "What is Flexbox used for?", options: ["Database management", "Layout alignment", "API documentation"], answer: "Layout alignment" },
  { domain: "Web Development", type: "MCQ", difficulty: "hard", question: "What is the difference between '==' and '===' in JS?", options: ["None", "Type checking", "Speed"], answer: "Type checking" },
  { domain: "Web Development", type: "MCQ", difficulty: "easy", question: "Which tag is used for images in HTML?", options: ["<img>", "<pic>", "<src>"], answer: "<img>" },

  // DATA SCIENCE (10)
  { domain: "Data Science", type: "MCQ", difficulty: "easy", question: "Which language is most commonly used for Data Science?", options: ["Java", "Python", "C++"], answer: "Python" },
  { domain: "Data Science", type: "MCQ", difficulty: "easy", question: "What does CSV stand for?", options: ["Comma Separated Values", "Common Serial Variable", "Control State Volume"], answer: "Comma Separated Values" },
  { domain: "Data Science", type: "MCQ", difficulty: "medium", question: "What is the main purpose of Pandas library?", options: ["Game development", "Data manipulation", "Web scraping"], answer: "Data manipulation" },
  { domain: "Data Science", type: "MCQ", difficulty: "medium", question: "Which of these is a supervised learning algorithm?", options: ["K-Means", "Linear Regression", "PCA"], answer: "Linear Regression" },
  { domain: "Data Science", type: "MCQ", difficulty: "hard", question: "What is 'Overfitting'?", options: ["Model performing well on training but poorly on test data", "Model performing poorly on both", "Model being too small"], answer: "Model performing well on training but poorly on test data" },
  { domain: "Data Science", type: "MCQ", difficulty: "easy", question: "What is 'Mean' in statistics?", options: ["Middle value", "Most frequent", "Average"], answer: "Average" },
  { domain: "Data Science", type: "MCQ", difficulty: "medium", question: "Which library is used for visualization?", options: ["Scikit-Learn", "Matplotlib", "Requests"], answer: "Matplotlib" },
  { domain: "Data Science", type: "MCQ", difficulty: "hard", question: "What is a Confusion Matrix?", options: ["A matrix of confused numbers", "A tool to evaluate classification performance", "A type of neural network"], answer: "A tool to evaluate classification performance" },
  { domain: "Data Science", type: "MCQ", difficulty: "medium", question: "What is an Outlier?", options: ["A normal data point", "An extreme deviation from the mean", "A missing value"], answer: "An extreme deviation from the mean" },
  { domain: "Data Science", type: "MCQ", difficulty: "easy", question: "What is the command to install a python package?", options: ["npm install", "pip install", "get install"], answer: "pip install" },

  // JAVA (10)
  { domain: "Java", type: "MCQ", difficulty: "easy", question: "What is the entry point of a Java program?", options: ["start()", "main()", "run()"], answer: "main()" },
  { domain: "Java", type: "MCQ", difficulty: "easy", question: "Which keyword is used to create a class?", options: ["create", "class", "new"], answer: "class" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "What is JVM?", options: ["Java Virtual Machine", "Java Variable Manager", "Java Visual Modeler"], answer: "Java Virtual Machine" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "Which collection allows duplicate elements?", options: ["Set", "List", "Map"], answer: "List" },
  { domain: "Java", type: "MCQ", difficulty: "hard", question: "What is the difference between Abstract Class and Interface?", options: ["Abstract class can have state", "Interface can have constructors", "None"], answer: "Abstract class can have state" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "What is Polymorphism?", options: ["One name many forms", "Hiding data", "Code reusability"], answer: "One name many forms" },
  { domain: "Java", type: "MCQ", difficulty: "easy", question: "Which data type is used for a single character?", options: ["String", "char", "bool"], answer: "char" },
  { domain: "Java", type: "MCQ", difficulty: "medium", question: "What is the default value of a boolean in Java?", options: ["true", "false", "null"], answer: "false" },
  { domain: "Java", type: "MCQ", difficulty: "hard", question: "What is the purpose of the 'finally' block?", options: ["To handle errors", "To execute code regardless of exception", "To stop the program"], answer: "To execute code regardless of exception" },
  { domain: "Java", type: "MCQ", difficulty: "easy", question: "What is the extension of a compiled Java file?", options: [".java", ".class", ".exe"], answer: ".class" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/EasyPrep');
    await TestQuestion.deleteMany({});
    await TestQuestion.insertMany(questions);
    console.log("Detailed Skill-Based Question Bank Seeded (30 Questions).");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
