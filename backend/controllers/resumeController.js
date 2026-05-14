const pdf = require('pdf-parse');
const fs = require('fs');
const User = require('../models/User');
const { extractSkills } = require('../utils/skillExtractor');
const { calculateCareerMap, getSkillGaps, getTrainingPath } = require('../services/careerService');

/**
 * Handles PDF upload and dynamic analysis.
 */
exports.analyzeResume = async (req, res) => {
  try {
    console.log("Analyze Resume Request Received.");
    
    if (!req.file) {
      console.log("No file uploaded.");
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume' });
    }

    console.log(`File received: ${req.file.filename}`);
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // 1. Extract Text
    const data = await pdf(dataBuffer);
    const resumeText = data.text;
    console.log("Text extracted from PDF.");

    // 2. Extract Skills (Dynamic)
    const userSkills = extractSkills(resumeText);


    // 3. Career Mapping
    const recommendedRoles = calculateCareerMap(userSkills);

    // 4. Gap & Training Path
    let skillGaps = [];
    let trainingPath = [];

    if (recommendedRoles.length > 0) {
      const topRole = recommendedRoles[0];
      skillGaps = getSkillGaps(userSkills, topRole);
      trainingPath = getTrainingPath(skillGaps);

      // Save results to User document if authenticated
      if (req.user) {
        const skillNames = userSkills.slice(0, 15).map(s => s.skill);
        await User.findByIdAndUpdate(req.user.id, { 
          skills: skillNames,
          topRole: topRole.role,
          matchPercentage: topRole.matchPercentage,
          skillGaps: skillGaps,
          $push: { recentActivity: `Analyzed resume: ${topRole.role} (${topRole.matchPercentage}%)` }
        });
        console.log(`Saved analysis results for user ${req.user.id}`);
      }
    }

    // Cleanup (with error handling for Windows locked files)
    try {
      fs.unlinkSync(filePath);
      console.log("Uploaded file cleaned up.");
    } catch (unlinkError) {
      console.warn("Deferred cleanup: File locked by process. It will be cleared by the OS temp reaper.", unlinkError.message);
    }

    // Final Response (No Static Data)
    res.status(200).json({
      success: true,
      data: {
        skills: userSkills,
        recommendedRoles: recommendedRoles.map(r => ({
          role: r.role,
          matchPercentage: r.matchPercentage
        })),
        skillGaps: skillGaps,
        trainingPath: trainingPath
      }
    });

  } catch (error) {
    console.error('Resume Analysis Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal System Error during analysis',
      error: error.message 
    });
  }
};

// Existing placeholders
exports.uploadResume = async (req, res) => {
  res.status(200).json({ success: true, message: 'Resume uploaded successfully' });
};

exports.getResumeData = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get resume data' });
};
