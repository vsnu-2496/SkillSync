const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const InterviewExperience = require('./models/InterviewExperience');

dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync');
    console.log("Database connected.");

    // 1. Auto-approve existing Vault items
    const updateResult = await InterviewExperience.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } }
    );
    console.log(`Auto-approved ${updateResult.modifiedCount} existing Vault contributions.`);

    // 2. Create default Admin account if it doesn't exist
    const adminEmail = 'admin@skillsync.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin = new User({
        name: 'SkillSync Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        university: 'SkillSync HQ',
        topRole: 'System Administrator'
      });
      await admin.save();
      console.log(`Default Admin account created. Email: ${adminEmail} | Password: admin123`);
    } else {
      // Ensure the role is admin if it was somehow changed
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`Updated existing user ${adminEmail} to admin role.`);
      } else {
        console.log(`Admin account ${adminEmail} already exists.`);
      }
    }

    console.log("Migration and seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
};

runMigration();
