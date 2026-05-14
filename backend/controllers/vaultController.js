const InterviewExperience = require('../models/InterviewExperience');

/**
 * Saves a new interview experience to MongoDB.
 */
exports.createExperience = async (req, res) => {
  try {
    console.log("Saving Interview Experience...");
    const { companyName, role, roundType, questionsAsked } = req.body;

    // Simple Validation
    if (!companyName || !role || !roundType || !questionsAsked) {
      return res.status(400).json({ error: 'Missing required fields: companyName, role, roundType, questionsAsked' });
    }

    // Handle authentication if available, else use placeholder
    const contributorId = req.user ? req.user.id : null;
    const contributorName = req.user ? req.user.name : "Anonymous User";

    const experience = new InterviewExperience({
      ...req.body,
      contributorId: contributorId || "000000000000000000000000", // Placeholder if no auth
      contributorName: contributorName
    });

    await experience.save();
    console.log(`Experience saved successfully for ${companyName}`);

    res.status(201).json({ 
      success: true,
      message: 'Intelligence Manifest Uploaded', 
      experience 
    });
  } catch (err) {
    console.error('Vault Save Error:', err);
    res.status(500).json({ error: 'Database Synchronization Failed', details: err.message });
  }
};

/**
 * Retrieves all experiences.
 */
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves experiences by company.
 */
exports.getByCompany = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({ 
      companyName: { $regex: req.params.companyName, $options: 'i' } 
    }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
