const mongoose = require('mongoose');
const TestQuestion = require('./models/TestQuestion');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/EasyPrep');
    const count = await TestQuestion.countDocuments({ domain: /Backend Engineer/i });
    const samples = await TestQuestion.find({ domain: /Backend Engineer/i }).limit(2);
    console.log(`Total Backend Engineer Questions: ${count}`);
    console.log(`Samples:`, JSON.stringify(samples, null, 2));
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
